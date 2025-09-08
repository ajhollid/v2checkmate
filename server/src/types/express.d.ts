import { AuthResult } from "../services/authService.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthResult;
    }
  }
}