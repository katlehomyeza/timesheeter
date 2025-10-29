import { pool } from "../config/pool";
import type { NewUser, User } from "@shared/types/users.types";

export async function createNewUser(user: NewUser): Promise<User> {
    const query = `
        INSERT INTO users (name, googleId, email,created_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
        RETURNING 
            user_id as "id", 
            name, 
            email, 
            created_at as "createdAt"
    `;
    
    const values = [user.name, user.googleId, user.email];
    const result = await pool.query(query, values);
    return result.rows[0];
}

export async function getUserByEmail(email: User['email']): Promise<User | null> {
  const query = `
    SELECT 
      user_id AS "id",
      name,
      googleId,
      email,
      created_at AS "createdAt"
    FROM users
    WHERE email = $1;
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}