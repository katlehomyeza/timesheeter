import type { User } from "@shared/types/users.types";
import type { Project } from "@shared/types/project.types"
import { pool } from "../config/pool";

export async function createNewProject(
  userId: User["id"],
  projectName: Project['name'],
  color_hex: Project['colorHex'],
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

  const values = [userId, projectName, description ?? null, color_hex];
  const result = await pool.query(query, values);
  return result.rows[0];
}

