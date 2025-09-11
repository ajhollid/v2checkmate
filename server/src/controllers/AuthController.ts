import { Request, Response, NextFunction } from "express";
import { encode, decode } from "../utils/JWTUtils.js";
import AuthService from "../services/business/AuthService.js";

class AuthController {
  private authService: AuthService;
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
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

      const result = await this.authService.register({
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
        data: token,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      // Validation
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }
      const result = await this.authService.login({ email, password });
      const token = encode(result);
      res.status(200).json({
        message: "Login successful",
        token,
      });
    } catch (error) {
      next(error);
    }
  };

  cleanup = async (req: Request, res: Response) => {
    try {
      await this.authService.cleanup();
      res.status(200).json({ message: "Cleanup successful" });
    } catch (error) {}
  };

  cleanMonitors = async (req: Request, res: Response) => {
    try {
      await this.authService.cleanMonitors();
      res.status(200).json({ message: "Monitors cleanup successful" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

export default AuthController;
