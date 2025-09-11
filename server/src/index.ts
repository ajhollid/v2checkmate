import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "./db/index.js";
import JobQueue, { IJobQueue } from "./services/infrastructure/JobQueue.js";

import initApp from "./app.js";

const PORT = process.env.PORT || 55555;
let jobQueue: IJobQueue;

const startServer = async () => {
  await connectDatabase();
  jobQueue = await JobQueue.create();
  const app = initApp(jobQueue);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

const stopServer = async () => {
  await disconnectDatabase();
  await jobQueue.shutdown();
  process.exit(0);
};

process.on("SIGTERM", stopServer);
process.on("SIGINT", stopServer);

startServer();
