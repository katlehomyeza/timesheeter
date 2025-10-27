import pkg from 'pg';
import { env } from "./env";
const { Pool } = pkg;

export const pool = new Pool({
  user: env.postgres.user,
  host: env.postgres.host,
  database: env.postgres.database,
  password: env.postgres.password,
  port: env.postgres.port,
  max: 10, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool
  .connect()
  .then((client) => {
    console.log("✅ Connected to PostgreSQL");
    client.release();
  })
  .catch((error) => {
    console.error("❌ PostgreSQL connection error:", error);
  });


