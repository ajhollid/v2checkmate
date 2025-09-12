import {
  IMonitor,
  Monitor,
  ITokenizedUser,
  MonitorStats,
} from "../../db/models/index.js";
import { IJobQueue } from "../infrastructure/JobQueue.js";
class MonitorService {
  private jobQueue: IJobQueue;
  constructor(jobQueue: IJobQueue) {
    this.jobQueue = jobQueue;
  }

  async create(tokenizedUser: ITokenizedUser, monitorData: IMonitor) {
    const monitor = await Monitor.create({
      ...monitorData,
      createdBy: tokenizedUser.sub,
      updatedBy: tokenizedUser.sub,
    });
    const monitorStats = await MonitorStats.create({
      monitorId: monitor._id,
    });
    await this.jobQueue.addJob(monitor);
    return monitor;
  }

  async get(monitor: IMonitor) {
    return monitor;
  }

  async update(
    tokenizedUser: ITokenizedUser,
    monitor: IMonitor,
    updateData: Partial<IMonitor>
  ) {
    const allowedFields: (keyof IMonitor)[] = [
      "name",
      "interval",
      "isActive",
      "n",
      "m",
    ];
    const safeUpdate: Partial<IMonitor> = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        (safeUpdate as any)[field] = updateData[field];
      }
    }

    monitor.set({
      ...safeUpdate,
      updatedAt: new Date(),
      updatedBy: tokenizedUser.sub,
    });

    const updatedMonitor = await monitor.save();
    await this.jobQueue.updateJob(updatedMonitor);
    return updatedMonitor;
  }

  async delete(monitor: IMonitor) {
    await monitor.deleteOne();
    await this.jobQueue.deleteJob(monitor);
  }
}

export default MonitorService;
