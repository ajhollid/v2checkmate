import { IMonitor } from "../../db/models/index.js";
import { INetworkService } from "./NetworkService.js";
import { ICheckService } from "../business/CheckService.js";
import ApiError from "../../utils/ApiError.js";

export interface IJobGenerator {
  generateJob: () => (Monitor: IMonitor) => Promise<void>;
}

class JobGenerator implements IJobGenerator {
  private networkService: INetworkService;
  private checkService: ICheckService;
  constructor(networkService: INetworkService, checkService: ICheckService) {
    this.networkService = networkService;
    this.checkService = checkService;
  }

  generateJob = () => {
    return async (Monitor: IMonitor) => {
      try {
        const monitorId = Monitor._id.toString();
        if (!monitorId) {
          throw new ApiError("No monitorID for creating job", 400);
        }
        const status = await this.networkService.requestStatus(Monitor);
        const check = await this.checkService.buildCheck(status);
        await check.save();
      } catch (error) {}
    };
  };
}

export default JobGenerator;
