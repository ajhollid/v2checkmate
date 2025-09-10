import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";
import { User, IUser, Role, IRole } from "../db/models/index.js";

const rolesCache = new Map<string, { roles: IRole[]; timestamp: number }>();
// const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const CACHE_TTL = 1; // 30 minutes
const MAX_CACHE_SIZE = 1000;

const getCachedRoles = async (userId: string) => {
  if (rolesCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = rolesCache.keys().next().value;
    if (!oldestKey) return null;
    rolesCache.delete(oldestKey);
  }

  const cached = rolesCache.get(userId);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.roles;
  }

  const user: IUser | null = await User.findById(userId);
  if (!user) {
    return null;
  }

  const roles = await Role.find({ _id: { $in: user.roles } });
  rolesCache.set(userId, { roles, timestamp: Date.now() });
  return roles;
};

const permissionsMatch = (
  rolePermissions: string[],
  requiredPermission: string
) => {
  return rolePermissions.some((permission) => {
    if (permission === "*") return true;
    if (permission.endsWith(".*")) {
      const prefix = permission.slice(0, -1);
      return requiredPermission.startsWith(prefix);
    }
    if (permission === requiredPermission) return true;
    return false;
  });
};

const hasPermission = (
  roles: IRole[],
  requiredPermission: string,
  organizationId?: string,
  teamId?: string
) => {
  // First check for org level roles, they take precedence
  const orgRoles = roles.filter((role) => {
    return (
      role.isActive &&
      role.level === "organization" &&
      role.organizationId?.toString() === organizationId
    );
  });
  if (
    orgRoles.some((role) =>
      permissionsMatch(role.permissions, requiredPermission)
    )
  ) {
    return true;
  }

  // If there is no teamId, we're done
  if (!teamId) return false;

  // Check for team level roles
  const teamRoles = roles.filter(
    (role) =>
      role.isActive &&
      role.level === "team" &&
      role.organizationId?.toString() === organizationId &&
      role.teamId?.toString() === teamId
  );

  return teamRoles.some((role) =>
    permissionsMatch(role.permissions, requiredPermission)
  );
};

const verifyPermission = (
  resourceAction: string,
  options?: { ResourceModel: any; requireResource: boolean }
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tokenizedUser = req.user;

    if (!tokenizedUser) {
      throw new ApiError("No user", 400);
    }

    const userId = tokenizedUser.sub;
    if (!userId) {
      throw new ApiError("No user ID", 400);
    }

    let organizationId: string | undefined;
    let teamId: string | undefined;

    // For actions that affect existing resources (view, update, delete)
    if (options?.ResourceModel && options?.requireResource) {
      const resourceId = req.params.id;
      if (!resourceId) {
        throw new ApiError("No resource ID", 400);
      }

      const resource = await options.ResourceModel.findById(resourceId);
      if (!resource) {
        throw new ApiError("Resource not found", 404);
      }

      // Reject if not a team resource
      teamId = resource?.teamId?.toString();
      if (teamId && !tokenizedUser.teamId.includes(teamId)) {
        throw new ApiError("Resource does not belong to user's team", 403);
      }

      // Reject if not an org resource
      organizationId = resource?.organizationId?.toString();
      if (organizationId && organizationId !== tokenizedUser.organizationId) {
        throw new ApiError(
          "Resource does not belong to user's organization",
          403
        );
      }

      req.resource = resource;
    } else {
      // For creating new resources
      organizationId = tokenizedUser.organizationId;
      teamId = req.body.teamId || req.params.teamId;
    }

    const userRoles = await getCachedRoles(userId);
    if (!userRoles || userRoles.length === 0) {
      {
        throw new ApiError("No roles found for user", 403);
      }
    }
    const allowed = hasPermission(
      userRoles,
      resourceAction,
      organizationId,
      teamId
    );

    if (!allowed) {
      throw new ApiError("Insufficient permissions", 403);
    }
    next();
  };
};

export { verifyPermission };
