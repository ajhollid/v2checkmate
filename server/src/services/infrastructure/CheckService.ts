import { ICheck, Check } from "../../db/models/index.js";
import { IStatusResponse } from "./NetworkService.js";
import mongoose from "mongoose";

export interface ICheckService {
  buildCheck: (statusResponse: IStatusResponse) => Promise<ICheck>;
}

class CheckService implements ICheckService {
  buildCheck = async (statusResponse: IStatusResponse): Promise<ICheck> => {
    const monitorId = new mongoose.Types.ObjectId(statusResponse.monitorId);
    const teamId = new mongoose.Types.ObjectId(statusResponse.teamId);

    const check = new Check({
      monitorId: monitorId,
      teamId: teamId,
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
