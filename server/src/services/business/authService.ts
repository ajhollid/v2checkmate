import bcrypt from "bcryptjs";
import {
  User,
  Organization,
  Team,
  Role,
  ITokenizedUser,
  Monitor,
  Check,
} from "../../db/models/index.js";
const DEFAULT_ROLES = [
  {
    name: "Admin",
    description: "Organization administrator with full permissions",
    permissions: ["*"],
    level: "organization" as const,
    isSystem: true,
  },
  {
    name: "Manager",
    description: "Can manage teams and users",
    permissions: [
      "users.create",
      "users.update",
      "teams.manage",
      "teams.create",
      "teams.delete",
      "monitors.*",
    ],
    level: "organization" as const,
    isSystem: true,
  },
  {
    name: "Member",
    description: "Basic team member",
    permissions: [
      "profile.update",
      "teams.view",
      "tasks.view",
      "monitors.create",
      "monitors.view",
      "monitors.update",
    ],
    level: "team" as const,
    isSystem: true,
  },
];

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  organizationName: string;
  organizationDescription?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export type AuthResult = ITokenizedUser;

class AuthService {
  async register(signupData: RegisterData): Promise<ITokenizedUser> {
    const {
      email,
      firstName,
      lastName,
      password,
      organizationName,
      organizationDescription,
    } = signupData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create organization
    const organization = new Organization({
      name: organizationName,
      description: organizationDescription,
    });
    await organization.save();

    // Create default team
    const defaultTeam = new Team({
      name: "General",
      description: "Default team for organization",
      organizationId: organization._id,
    });
    await defaultTeam.save();

    // Create all default roles for the organization
    const rolePromises = DEFAULT_ROLES.map((roleData) =>
      new Role({
        ...roleData,
        organizationId: organization._id,
        teamId: roleData.name === "Member" ? defaultTeam._id : undefined,
      }).save()
    );
    const roles = await Promise.all(rolePromises);

    // Hash password and create user
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Find admin role and assign to first user
    const adminRole = roles.find((role) => role.name === "Admin");

    const user = new User({
      email,
      firstName,
      lastName,
      passwordHash,
      organizationId: organization._id,
      roles: [adminRole!._id],
    });

    const savedUser = await user.save();

    return {
      sub: savedUser._id.toString(),
      organizationId: savedUser.organizationId.toString(),
      roles: savedUser.roles.map((role) => role.toString()),
      teamId: [defaultTeam._id.toString()],
    };
  }

  async login(loginData: LoginData): Promise<ITokenizedUser> {
    const { email, password } = loginData;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Get organization and team information
    const organization = await Organization.findById(user.organizationId);

    if (!organization) {
      throw new Error("Organization not found");
    }

    const teams = await Team.find({
      organizationId: user.organizationId,
      name: "General",
    });

    if (teams.length === 0) {
      throw new Error("Teams not found");
    }

    return {
      sub: user._id.toString(),
      organizationId: user.organizationId.toString(),
      teamId: teams.map((team) => team._id.toString()),
      roles: user.roles.map((role) => role.toString()),
    };
  }

  async cleanup() {
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Team.deleteMany({});
    await Role.deleteMany({});
    await Monitor.deleteMany({});
    await Check.deleteMany({});
  }

  async cleanMonitors() {
    await Monitor.deleteMany({});
    await Check.deleteMany({});
  }
}

export default new AuthService();
