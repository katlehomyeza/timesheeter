import type { User } from "./users.types"
import type { UUID } from "@shared/types/utility.types"

export type Project = {
    id : UUID,
    userId : User["id"],
    name : string,
    description : string,
    colorHex : string,
}

export type TimeLog = {
  id: UUID;
  userId: string;
  projectId: string;
  goalId?: string; 
  startTime?: Date;
  endTime?: Date;
  durationMinutes: number;
  note?: string;
};

export type Goal = {
  id: UUID; 
  userId: string;
  projectId: string;
  periodId: GoalPeriod['id'];
  title: string;
  targetHours: number;
};

export type GoalPeriod = {
    id:UUID,
    period: "daily"|"weekly"|"monthly"
}

