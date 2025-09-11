import { Router } from "express";
import MonitorController from "../controllers/MonitorController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { verifyPermission } from "../middleware/NewVerifyPermissions.js";
import { Monitor } from "../db/models/index.js";

class MonitorRoutes {
  private router;
  private controller;
  constructor(monitorController: MonitorController) {
    this.router = Router();
    this.controller = monitorController;
    this.initRoutes();
  }

  initRoutes = () => {
    this.router.post(
      "/",
      verifyToken,
      verifyPermission(["monitors.create"], {
        ResourceModel: Monitor,
        requireResource: false,
      }),
      this.controller.create
    );

    this.router.patch(
      "/:id",
      verifyToken,
      verifyPermission(["monitors.update"], {
        ResourceModel: Monitor,
        requireResource: true,
      }),
      this.controller.update
    );

    this.router.get(
      "/:id",
      verifyToken,
      verifyPermission(["monitors.view"], {
        ResourceModel: Monitor,
        requireResource: true,
      }),
      this.controller.get
    );

    this.router.delete(
      "/:id",
      verifyToken,
      verifyPermission(["monitors.delete"], {
        ResourceModel: Monitor,
        requireResource: true,
      }),
      this.controller.delete
    );
  };

  getRouter() {
    return this.router;
  }
}

export default MonitorRoutes;
