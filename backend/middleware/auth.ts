import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    authUser?: AuthUser;
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      res.status(401).json({ 
        message: "Access denied", 
        detail: "No token provided" 
      });
    } else {
      const decoded = jwt.verify(token, env.auth.jwtSecret!) as JWTPayload;
      
      req.authUser = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      };

      next();
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ 
        message: "Invalid token", 
        detail: "Token verification failed" 
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(403).json({ 
        message: "Token expired", 
        detail: "Please login again" 
      });
    } else {
      res.status(500).json({ 
        message: "Internal server error", 
        detail: "Token verification failed" 
      });
    }
  }
};

export const extractUserFromToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      next();
    } else {
      const decoded = jwt.verify(token, env.auth.jwtSecret!) as JWTPayload;
      
      req.authUser = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      };

      next();
    }
  } catch (error) {
    next();
  }
};