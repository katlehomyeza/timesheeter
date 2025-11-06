import type { Goal, GoalPeriod } from "@shared/types/project.types";
import { isErrorDetail, type ErrorDetail } from "@shared/types/utility.types";
import API from "../utils/api";

export async function createGoal(
  projectId: string,
  periodId: string,
  title: string,
  targetHours: number
): Promise<Goal | ErrorDetail> {
  try {
    const response = await API.post("/goals", {
      projectId,
      periodId,
      title,
      targetHours,
    });
    return response;
  } catch (error) {
    if (isErrorDetail(error)) {
      return error;
    } else {
      return {
        message: "Failed to create goal: Please try again later",
      };
    }
  }
}

export async function updateGoal(
  goalId: string,
  periodId: string,
  targetHours: number,
): Promise<Goal | ErrorDetail> {
  try {
    const response = await API.patch("/goals", {
      goalId,
      periodId,
      targetHours,
    });
    return response;
  } catch (error) {
    if (isErrorDetail(error)) {
      return error;
    } else {
      return {
        message: "Failed to update goal: Please try again later",
      };
    }
  }
}

// Get all goals for the authenticated user
export async function getGoals(): Promise<Goal[] | ErrorDetail> {
  try {
    const response = await API.get("/goals");
    return response;
  } catch (error) {
    if (isErrorDetail(error)) {
      return error;
    } else {
      return {
        message: "Failed to get goals: Please try again later",
      };
    }
  }
}


export async function getGoalPeriods():Promise<GoalPeriod[] | ErrorDetail>{
    try {
        const response = await API.get('/goals/periods');  
        return response;
    } catch (error) {
        if(isErrorDetail(error)){
            return error
        } else {
             return {
                message: "Failed to get goal periods: Please try again later",
            };
        }
    }
    
}