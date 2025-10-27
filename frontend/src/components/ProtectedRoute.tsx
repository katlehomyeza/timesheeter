import { Navigate } from 'react-router-dom'
import type { ProtectedRouteProps } from '../types/Prop.types';
import { checkAuth } from '../utils/auth';

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = checkAuth();
  return !isAuthenticated ? <Navigate to="/landing" replace /> : <>{children}</>;
}