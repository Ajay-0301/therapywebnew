import { Navigate, useLocation } from 'react-router-dom';
import { getUserData } from '../utils/store';

interface ProtectedRouteProps {
  element: React.ReactNode;
}

/**
 * ProtectedRoute ensures only authenticated users can access routes
 * If user is not logged in, redirects to /login with returnTo parameter
 * After login, user is redirected back to their original requested page
 */
export default function ProtectedRoute({ element }: ProtectedRouteProps) {
  const user = getUserData();
  const location = useLocation();

  if (!user) {
    // User not logged in - redirect to login with returnTo
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // User is logged in - render the requested component
  return element;
}
