import { Request, Response, NextFunction } from "express";
import authService from "../services/authService.js";
import { encode, decode } from "../utils/JWTUtils.js";
class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        firstName,
        lastName,
        password,
        organizationName,
        organizationDescription,
      } = req.body;

      if (!email || !firstName || !lastName || !password || !organizationName) {
        throw new Error(
          "Email, firstName, lastName, password, and organizationName are required"
        );
      }

      const result = await authService.register({
        email,
        firstName,
        lastName,
        password,
        organizationName,
        organizationDescription,
      });

      const token = encode(result);

      res.status(201).json({
        message: "User and organization created successfully",
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      // Validation
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }
      const result = await authService.login({ email, password });
      const token = encode(result);
      res.status(200).json({
        message: "Login successful",
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async cleanup(req: Request, res: Response) {
    try {
      await authService.cleanup();
      res.status(200).json({ message: "Cleanup successful" });
    } catch (error) {}
  }
}

export default new AuthController();
