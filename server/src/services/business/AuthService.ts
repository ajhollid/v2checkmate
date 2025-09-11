import bcrypt from "bcryptjs";
import {
  User,
  Team,
  Role,
  ITokenizedUser,
  Monitor,
  Check,
} from "../../db/models/index.js";
const DEFAULT_ROLES = [
  {
    name: "Admin",
    description: "Admin with full permissions",
    permissions: ["*"],
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
    isSystem: true,
  },
  {
    name: "Member",
    description: "Basic team member",
    permissions: [
      "profile.update",
      "teams.view",
      "monitors.create",
      "monitors.view",
      "monitors.update",
    ],
    isSystem: true,
  },
];

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  teamId: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export type AuthResult = ITokenizedUser;

class AuthService {
  async register(signupData: RegisterData): Promise<ITokenizedUser> {
    const { email, firstName, lastName, password } = signupData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create default team
    const defaultTeam = new Team({
      name: "General",
      description: "Default team for organization",
    });
    await defaultTeam.save();

    // Create all default roles for the organization
    const rolePromises = DEFAULT_ROLES.map((roleData) =>
      new Role({
        ...roleData,
        teamId: defaultTeam._id,
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
      teamId: defaultTeam._id,
      passwordHash,
      roles: [adminRole!._id],
    });

    const savedUser = await user.save();

    return {
      sub: savedUser._id.toString(),
      roles: savedUser.roles.map((role) => role.toString()),
      teamId: defaultTeam._id.toString(),
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

    return {
      sub: user._id.toString(),
      teamId: user.teamId.toString(),
      roles: user.roles.map((role) => role.toString()),
    };
  }

  async cleanup() {
    await User.deleteMany({});
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

export default AuthService;
