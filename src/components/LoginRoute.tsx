import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface LoginRouteProps {
  children: React.ReactNode;
}

const LoginRoute = ({ children }: LoginRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-orion-blue" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // If authenticated, don't render login (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  // If not authenticated, render the login page
  return <>{children}</>;
};

export default LoginRoute;
