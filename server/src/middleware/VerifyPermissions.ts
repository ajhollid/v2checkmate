import { Request, Response, NextFunction } from "express";
import { Role, User, IUser } from "../db/models/index.js";
import ApiError from "../utils/ApiError.js";

// Simple in-memory cache for roles
const rolesCache = new Map<string, { roles: any[]; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_SIZE = 1000;

const checkPermission = (
  userPermissions: Set<string>,
  requiredPermission: string
): boolean => {
  // Check for exact match
  if (userPermissions.has(requiredPermission)) {
    return true;
  }

  // Check for wildcard permissions
  for (const permission of userPermissions) {
    if (permission === "*") {
      return true;
    }

    // Check for prefix wildcard (e.g., "monitors.*")
    if (permission.endsWith("*")) {
      const prefix = permission.slice(0, -1); // Get prefix before '*'
      if (requiredPermission.startsWith(prefix)) {
        return true;
      }
    }
  }

  return false;
};

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

  const roles = await Role.find({ _id: { $in: user.roles || [] } });
  rolesCache.set(userId, { roles, timestamp: Date.now() });
  return roles;
};

const verifyPermission = (
  requiredPermissions: string[],
  level: "organization" | "team"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenizedUser = req.user;

      if (!tokenizedUser) {
        return next(new ApiError("Unauthorized", 401));
      }

      // *****************************************
      // Check for required permissions
      // *****************************************

      const roles = await getCachedRoles(tokenizedUser.sub);
      if (!roles || roles.length === 0) {
        return next(new ApiError("Forbidden", 403));
      }

      // *****************************************
      // Check for org level roles first, these trump team level roles
      // *****************************************
      const orgRoles = roles.filter((role) => role.level === "organization");
      const orgPermissions = new Set(
        orgRoles.flatMap((role) => role.permissions)
      );

      // *****************************************
      // Check if ALL required permissions are satisfied at organization level
      // *****************************************
      let allOrgPermissionsSatisfied = true;

      for (const permission of requiredPermissions) {
        if (!checkPermission(orgPermissions, permission)) {
          allOrgPermissionsSatisfied = false;

          // *****************************************
          // If org level is missing a permission, and we're checking org level, fail immediately
          // *****************************************
          if (level === "organization") {
            throw new ApiError("Forbidden", 403);
          }
          break;
        }
      }

      if (allOrgPermissionsSatisfied) {
        return next();
      }

      // *****************************************
      // Check if ALL required permissions are satisfied at team level
      // *****************************************

      const teamId = req?.params?.teamId || req?.body?.teamId;
      if (!teamId) {
        return next(
          new ApiError(
            "Team ID is required for team level permission checks",
            400
          )
        );
      }

      // *****************************************
      // Get permissions for the specific team
      // *****************************************
      const teamRoles = roles.filter((role) => role.level === "team");
      const teamPermissions = new Set(
        teamRoles
          .filter((teamRole) => teamRole.teamId?.toString() === teamId)
          .flatMap((role) => role.permissions)
      );

      let allTeamPermissionsSatisfied = true;
      for (const permission of requiredPermissions) {
        if (!checkPermission(teamPermissions, permission)) {
          allTeamPermissionsSatisfied = false;
          break;
        }
      }

      if (allTeamPermissionsSatisfied) {
        return next();
      }

      throw new ApiError("Forbidden", 403);
    } catch (error) {
      next(error);
    }
  };
};
export { verifyPermission };
