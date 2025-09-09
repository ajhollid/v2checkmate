import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/cleanup", authController.cleanup);
router.post("/cleanup-monitors", authController.cleanMonitors);

export default router;
