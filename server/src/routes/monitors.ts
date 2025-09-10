import express from "express";
import monitorController from "../controllers/monitorController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { verifyPermission } from "../middleware/VerifyPermissions.js";
import { Monitor } from "../db/models/index.js";
const router = express.Router();

router.post(
  "/",
  verifyToken,
  verifyPermission("monitors.create", {
    ResourceModel: Monitor,
    requireResource: false,
  }),
  monitorController.create
);

router.patch(
  "/:id",
  verifyToken,
  verifyPermission("monitors.update", {
    ResourceModel: Monitor,
    requireResource: true,
  }),
  monitorController.update
);

router.get(
  "/:id",
  verifyToken,
  verifyPermission("monitors.view", {
    ResourceModel: Monitor,
    requireResource: true,
  }),
  monitorController.get
);

router.delete(
  "/:id",
  verifyToken,
  verifyPermission("monitors.deletes", {
    ResourceModel: Monitor,
    requireResource: true,
  }),
  monitorController.delete
);

export default router;
