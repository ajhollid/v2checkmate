import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";
import MonitorService from "../services/business/MonitorService.js";

class MonitorController {
  private monitorService: MonitorService;
  constructor(monitorService: MonitorService) {
    this.monitorService = monitorService;
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenizedUser = req.user;
      if (!tokenizedUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const monitor = await this.monitorService.create(tokenizedUser, req.body);
      res.status(201).json({
        message: "Monitor created successfully",
        data: monitor,
      });
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenizedUser = req.user;
      if (!tokenizedUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const resource = req.resource; // Retrieved from middleware
      const monitor = await this.monitorService.get(resource);

      res.status(200).json({
        message: "Monitor retrieved successfully",
        data: monitor,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenizedUser = req.user;
      if (!tokenizedUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const resource = req.resource; // Retrieved from middleware
      if (!resource) {
        throw new ApiError("Monitor not found", 404);
      }

      const monitor = await this.monitorService.update(
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
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenizedUser = req.user;
      if (!tokenizedUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const monitor = req.resource; // Retrieved from middleware
      await this.monitorService.delete(monitor);
      if (!monitor) {
        throw new ApiError("Monitor not found", 404);
      }

      res.status(200).json({
        message: "Monitor deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default MonitorController;
