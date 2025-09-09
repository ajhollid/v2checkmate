import { Request, Response, NextFunction } from "express";
import monitorService from "../services/business/monitorService.js";
import ApiError from "../utils/ApiError.js";

class MonitorController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenizedUser = req.user;
      if (!tokenizedUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const monitor = await monitorService.create(tokenizedUser, req.body);
      res.status(201).json({
        message: "Monitor created successfully",
        data: monitor,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateById(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenizedUser = req.user;
      if (!tokenizedUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const monitorId = req.params.monitorId;
      if (!monitorId) {
        throw new ApiError("Monitor ID is required", 400);
      }

      const monitor = await monitorService.updateById(
        tokenizedUser,
        monitorId,
        req.body
      );
      res.status(200).json({
        message: "Monitor updated successfully",
        data: monitor,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenizedUser = req.user;
      if (!tokenizedUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const monitorId = req.params.monitorId;
      if (!monitorId) {
        throw new ApiError("Monitor ID is required", 400);
      }

      const monitor = await monitorService.getById(
        tokenizedUser.teamId,
        monitorId
      );
      res.status(200).json({
        message: "Monitor retrieved successfully",
        data: monitor,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenizedUser = req.user;
      if (!tokenizedUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const monitorId = req.params.monitorId;
      if (!monitorId) {
        throw new ApiError("Monitor ID is required", 400);
      }

      await monitorService.deleteById(tokenizedUser.teamId, monitorId);
      res.status(200).json({
        message: "Monitor deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MonitorController();
