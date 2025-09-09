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

  async updateById(
    tokenizedUser: ITokenizedUser,
    monitorId: string,
    updateData: Partial<IMonitor>
  ) {
    const allowedFields: (keyof IMonitor)[] = ["name", "interval", "isActive"];
    const safeUpdate: Partial<IMonitor> = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        (safeUpdate as any)[field] = updateData[field];
      }
    }

    const monitor = await Monitor.findOneAndUpdate(
      { _id: monitorId, teamId: { $in: tokenizedUser.teamId } },
      { ...safeUpdate, updatedAt: new Date(), updatedBy: tokenizedUser.sub },
      { new: true }
    );

    if (!monitor) {
      throw new Error("Monitor not found or not authorized");
    }

    return monitor;
  }

  async getById(teamIds: string[], monitorId: string) {
    const monitor = await Monitor.findOne({
      _id: monitorId,
      teamId: { $in: teamIds },
    });

    if (!monitor) {
      throw new Error("Monitor not found");
    }

    return monitor;
  }

  async deleteById(teamIds: string[], monitorId: string) {
    const monitor = await Monitor.findOneAndDelete({
      _id: monitorId,
      teamId: { $in: teamIds },
    });

    if (!monitor) {
      throw new Error("Monitor not found or already deleted");
    }
  }
}

export default new MonitorService();
