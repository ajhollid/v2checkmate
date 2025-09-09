import express from "express";
import monitorController from "../controllers/monitorController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { verifyPermission } from "../middleware/VerifyPermissions.js";
const router = express.Router();

router.post(
  "/",
  verifyToken,
  verifyPermission(["monitors.create"], "team"),
  monitorController.create
);

router.patch(
  "/:teamId/:monitorId",
  verifyToken,
  verifyPermission(["monitors.update"], "team"),
  monitorController.updateById
);

router.get(
  "/:teamId/:monitorId",
  verifyToken,
  verifyPermission(["monitors.view"], "team"),
  monitorController.getById
);

router.delete(
  "/:teamId/:monitorId",
  verifyToken,
  verifyPermission(["monitors.delete"], "team"),
  monitorController.deleteById
);

export default router;
