import dotenv from "dotenv";

dotenv.config();

export const env = {
  postgres: {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    clientId: process.env.GOOGLE_CLIENT_ID, 
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET
  },
  constants: {
    clientUrl: process.env.CLIENT_URL
  }
};
