import type { Goal, GoalPeriod, Project } from "@shared/types/project.types";
import type { User } from "@shared/types/users.types";
import { pool } from "../config/pool.js";

export async function createGoal(
  userId: User["id"],
  periodId: GoalPeriod['id'],
  title: string,
  targetHours: number,
  projectId: Project['id']
): Promise<Goal> {
  const query = `
    INSERT INTO goals (
      user_id, project_id, period_id, title, target_hours, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING
      goal_id AS id,
      user_id AS "userId",
      project_id AS "projectId",
      period_id AS "periodId",
      title,
      target_hours AS "targetHours",
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;

  const values = [userId, projectId, periodId, title, targetHours];
  const result = await pool.query(query, values);

  return result.rows[0];
}
