import { ICheck, Check } from "../../db/models/index.js";
import { StatusResponse } from "../infrastructure/NetworkService.js";
import mongoose from "mongoose";

export interface ICheckService {
  buildCheck: (statusResponse: StatusResponse) => Promise<ICheck>;
}

class CheckService implements ICheckService {
  buildCheck = async (statusResponse: StatusResponse): Promise<ICheck> => {
    const monitorId = new mongoose.Types.ObjectId(statusResponse.monitorId);

    const check = new Check({
      monitorId: monitorId,
      type: statusResponse.type,
      status: statusResponse.status,
      message: statusResponse.message,
      responseTime: statusResponse.responseTime,
      timings: statusResponse.timings,
    });
    return check;
  };
}

export default CheckService;
