import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ProtectedRouteProps } from '../types/Prop.types';
import { checkAuth } from '../services/auth.service';
import ClockLoader from './ClockLoader/ClockLoader';

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isValid = await checkAuth();
        setIsAuthenticated(isValid);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  if (isLoading) {
    return (
      <ClockLoader></ClockLoader>
    );
  }

  return !isAuthenticated ? <Navigate to="/landing" replace /> : <>{children}</>;
}