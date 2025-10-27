import { pool } from "../config/pool";
import type { NewUser, User } from "@shared/types/users.types";

export async function createNewUser(user: NewUser): Promise<User> {
    const query = `
        INSERT INTO users (name, email,created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
        RETURNING 
            user_id as "id", 
            name, 
            email, 
            created_at as "createdAt"
    `;
    
    const values = [user.name, user.email];
    const result = await pool.query(query, values);
    return result.rows[0];
}