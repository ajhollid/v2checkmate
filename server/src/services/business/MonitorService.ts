import { IMonitor, Monitor, ITokenizedUser } from "../../db/models/index.js";
class MonitorService {
  async create(tokenizedUser: ITokenizedUser, monitorData: IMonitor) {
    const monitor: IMonitor = new Monitor({
      ...monitorData,
      createdBy: tokenizedUser.sub,
      updatedBy: tokenizedUser.sub,
    });
    await monitor.save();
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
    const allowedFields: (keyof IMonitor)[] = ["name", "interval", "isActive"];
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
    return updatedMonitor;
  }

  async delete(monitor: IMonitor) {
    await monitor.deleteOne();
  }
}

export default MonitorService;
