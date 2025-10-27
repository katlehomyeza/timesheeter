import type { Goal, Project, TimeLog } from "@shared/types/project.types";
import type { User } from "@shared/types/users.types";
import { pool } from "../config/pool.js"; 

export async function createTimeLog(
  userId: User["id"],
  projectId: Project['id'],
  startTime: Date,
  endTime: Date,
  note?: string,
  goalId?: Goal['id']
): Promise<TimeLog> {
  const query = `
    INSERT INTO timelogs (
      user_id, project_id, goal_id, start_time, end_time, duration_minutes, note, created_at
    )
    VALUES (
      $1, $2, $3, $4, $5,
      EXTRACT(EPOCH FROM ($5 - $4)) / 60,
      $6, NOW()
    )
    RETURNING 
      timelog_id AS id,
      user_id AS "userId",
      project_id AS "projectId",
      goal_id AS "goalId",
      start_time AS "startTime",
      end_time AS "endTime",
      duration_minutes AS "durationMinutes",
      note,
      created_at AS "createdAt";
  `;

  const values = [
    userId,
    projectId,
    goalId ?? null,
    startTime,
    endTime,
    note ?? null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function createManualTimeLog(
  userId: User["id"],
  projectId: Project['id'],
  durationMinutes: number,
  note?: string,
  goalId?: Goal['id']
): Promise<TimeLog> {
  const query = `
    INSERT INTO timelogs (
      user_id, project_id, goal_id, duration_minutes, note, created_at
    )
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING 
      timelog_id AS id,
      user_id AS "userId",
      project_id AS "projectId",
      goal_id AS "goalId",
      start_time AS "startTime",
      end_time AS "endTime",
      duration_minutes AS "durationMinutes",
      note,
      created_at AS "createdAt";
  `;

  const values = [
    userId,
    projectId ?? null,
    goalId ?? null,
    durationMinutes,
    note ?? null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}
