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

export async function updateGoal(
  goalId: Goal["id"],
  periodId: GoalPeriod["id"],
  targetHours: number
): Promise<Goal> {
  const query = `
    UPDATE goals
    SET 
        target_hours = $1,
        period_id = $2,
        updated_at = NOW()
    WHERE goal_id = $3
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

  const values = [targetHours, periodId, goalId];
  const result = await pool.query(query, values);

  return result.rows[0];
}


export async function isUserGoal(
  userId: User["id"],
  goalId: Goal["id"]
): Promise<boolean> {
  const query = `
    SELECT 1
    FROM goals
    WHERE goal_id = $1
      AND user_id = $2
    LIMIT 1;
  `;

  const values = [goalId, userId];
  const result = await pool.query(query, values);

  return (result.rowCount !== null && result.rowCount > 0);
}

export async function getGoals(
  userId: User['id']
):Promise<Goal[]>{
    const query = `
    SELECT
      goal_id AS id,
      user_id AS "userId",
      project_id AS "projectId",
      period_id AS "periodId",
      title,
      target_hours AS "targetHours"
    FROM goals
    WHERE user_id= $1;
  `;

  const result = await pool.query(query , [userId]);
  return result.rows;
}

export async function getGoalPeriods(): Promise<GoalPeriod[]> {
  const query = `
    SELECT
      period_id AS id,
      period_type as period
    FROM goal_periods;
  `;

  const result = await pool.query(query);
  return result.rows;
}

export async function getGoalByProjectId(  
  userId: User['id'],
  projectId: Project['id'],
):Promise<Goal[]>{
    const query = `
    SELECT
      goal_id AS id,
      user_id AS "userId",
      project_id AS "projectId",
      period_id AS "periodId",
      title,
      target_hours AS "targetHours"
    FROM goals
    WHERE user_id= $1
      AND project_id= $2;
  `;

  const result = await pool.query(query , [userId, projectId]);
  return result.rows;
}

export async function deleteGoal(
  goalId: Goal['id']
):Promise<Goal> {
  const query = `
    DELETE FROM goals
    WHERE goal_id = $1
    RETURNING 
      goal_id AS id,
      user_id AS "userId",
      project_id AS "projectId",
      period_id AS "periodId",
      title,
      target_hours AS "targetHours";
  `;

  const result = await pool.query(query, [goalId]);
  return result.rows[0] || null;
}
