import type { TimeLog } from "@shared/types/project.types";
import { isErrorDetail, type ErrorDetail } from "@shared/types/utility.types";
import API from "../utils/api";

export async function createTimeLog(
  projectId: string,
  options: {
    durationMinutes?: number;
    startTime?: Date;
    endTime?: Date;
    note?: string;
    goalId?: string;
    isManualEntry: boolean;
  }
): Promise<TimeLog | ErrorDetail> {
  try {
    return await API.post("/timelogs", {
      projectId,
      ...options,
    });
  } catch (error) {
    if (isErrorDetail(error)) {
      return error;
    } else {
      return {
        message: "Failed to create time log: Please try again later",
      };
    }
  }
}

export async function deleteTimelog(
  timeLogId: string
): Promise<TimeLog | ErrorDetail> {
  try {
    return await API.delete(`/timelogs/${timeLogId}`);
  } catch (error) {
    if (isErrorDetail(error)) {
      return error;
    } else {
      return {
        message: "Failed to delete time log: Please try again later",
      };
    }
  }
}

export async function getTimeLogs(
  projectId: string
): Promise<TimeLog[] | ErrorDetail> {
  try {
    return await API.get(`/timelogs/${projectId}`);
  } catch (error) {
    if (isErrorDetail(error)) {
      return error;
    } else {
      return {
        message: "Failed to fetch time logs: Please try again later",
      };
    }
  }
}

export async function getDailyTimeLog(
    date: String   
): Promise<TimeLog[] | ErrorDetail> {
  try {
    return await API.get(`/timelogs?date=${date}`);
  } catch (error) {
    if (isErrorDetail(error)) {
      return error;
    } else {
      return {
        message: "Failed to fetch time logs: Please try again later",
      };
    }
  }
}