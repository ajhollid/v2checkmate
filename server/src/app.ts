import express from "express";
import authRoutes from "./routes/auth.js";
import monitorRoutes from "./routes/monitors.js";
import { errorHandler } from "./middleware/ErrorHandler.js";

const app = express();
const v1ApiRouter = express.Router();
app.use(express.json());
v1ApiRouter.use("/auth", authRoutes);
v1ApiRouter.use("/monitors", monitorRoutes);
app.use("/api/v1", v1ApiRouter);
app.use(errorHandler);

export default app;
