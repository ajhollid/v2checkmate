import "dotenv/config";
import express from "express";
import { connectDatabase } from "./db/index.js";
import authRoutes from "./routes/auth.js";
import { errorHandler } from "./middleware/ErrorHandler.js";
const app = express();
const PORT = process.env.PORT || 55555;
connectDatabase();
app.use(express.json());
const v1ApiRouter = express.Router();
v1ApiRouter.use("/auth", authRoutes);

app.use("/api/v1", v1ApiRouter);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
