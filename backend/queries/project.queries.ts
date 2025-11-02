import type { User } from "@shared/types/users.types";
import type { Project } from "@shared/types/project.types"
import { pool } from "../config/pool";

export async function createNewProject(
  userId: User["id"],
  projectName: Project['name'],
  colorHex: Project['colorHex'],
  description?: Project['description']
): Promise<Project> {
  const query = `
    INSERT INTO projects (user_id, name, description, color_hex, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT DO NOTHING
    RETURNING 
        project_id AS "id", 
        user_id as "userId", 
        name, 
        description, 
        color_hex as "colorHex", 
        created_at as "createdAt";
  `;

  const values = [userId, projectName, description ?? null, colorHex];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function deleteProject(
  projectId: Project["id"]
): Promise<Project> {
  const query = `
    DELETE FROM projects
    WHERE project_id = $1
    RETURNING 
      project_id AS "id", 
      user_id AS "userId", 
      name, 
      description, 
      color_hex AS "colorHex", 
      created_at AS "createdAt";
  `;

  const result = await pool.query(query, [projectId]);
  return result.rows[0] ?? null;
}

export async function isUsersProject(
  userId: User["id"],
  projectId: Project["id"]
): Promise<boolean> {
  const query = `
    SELECT 1
    FROM projects
    WHERE user_id = $1 AND project_id = $2
    LIMIT 1;
  `;

  const result = await pool.query(query, [userId, projectId]);
  return (result.rowCount !== null && result.rowCount > 0);
}
export async function getAllProjects(
  userId: User["id"],
): Promise<Project[]> {
  const query = `
    SELECT 
      project_id AS "id",
      user_id AS "userId",
      name,
      description,
      color_hex AS "colorHex",
      created_at AS "createdAt"
    FROM projects
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
}