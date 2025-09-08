import express from "express";
import authController from "../controllers/authController.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/cleanup", authController.cleanup);

export default router;
