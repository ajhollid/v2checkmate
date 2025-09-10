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

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenizedUser = req.user;
      if (!tokenizedUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const resource = req.resource; // Retrieved from middleware
      const monitor = await monitorService.get(resource);

      res.status(200).json({
        message: "Monitor retrieved successfully",
        data: monitor,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenizedUser = req.user;
      if (!tokenizedUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const resource = req.resource; // Retrieved from middleware
      if (!resource) {
        throw new ApiError("Monitor not found", 404);
      }

      const monitor = await monitorService.update(
        tokenizedUser,
        resource,
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

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenizedUser = req.user;
      if (!tokenizedUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const monitor = req.resource; // Retrieved from middleware
      await monitorService.delete(monitor);
      if (!monitor) {
        throw new ApiError("Monitor not found", 404);
      }

      res.status(200).json({
        message: "Monitor deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MonitorController();
