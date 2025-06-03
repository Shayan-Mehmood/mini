import { useEffect, useState } from 'react';
import { useLocation, Outlet } from 'react-router';
import { Loader2 } from 'lucide-react';
import apiService from '../../utilities/service/api';
import { jwtDecode, JwtPayload } from "jwt-decode";
// Session cache constants
const SESSION_CACHE_KEY = 'auth_session_verified';
// const SESSION_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
// Define access URL as a constant to ensure consistency
const ACCESS_REDIRECT_URL = 'https://minilessonsacademy.com/react-access.php';



// Export function to handle logout/authentication failures
export const handleAuthFailure = () => {
  // Clean up localStorage auth data
  localStorage.removeItem('authToken');
  localStorage.removeItem(SESSION_CACHE_KEY);
  localStorage.clear();
  // Redirect to access page
  window.location.href = ACCESS_REDIRECT_URL;
};

const ProtectedRoute = () => {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      const token:string = localStorage.getItem('authToken')||'';

      console.log('Token:', token);
      if(token === 'undefined' || token === null || token === undefined || token === ''){
        handleAuthFailure();
        return;
      }
      const myDecodedToken:any = jwtDecode<JwtPayload>(token);
      console.log('Decoded Token:', myDecodedToken);
      // Checking if the token is expired
      const isMyTokenExpired = myDecodedToken.exp < Date.now() / 1000;
      console.log('Is my token expired : ',isMyTokenExpired);
      if (!token) {
        setAuthState('unauthenticated');
        handleAuthFailure();
        return;
      }

      if(isMyTokenExpired){
        handleAuthFailure();
      }

      // Check if we have a valid session cache
      const sessionCache = JSON.parse(localStorage.getItem(SESSION_CACHE_KEY) || '{}');
  
      // If we have a recent valid session verification, skip verification
      if (
        sessionCache.token === token 
      ) {
        console.log('Using cached session verification');
        setAuthState('authenticated');
        return;
      }
      
      try {
        // Verify token with backend
        const response = await apiService.post('/auth/verify-access-token', {
          token
        });
        
        if (response.success) {
          // Cache the successful verification
          localStorage.setItem(
            SESSION_CACHE_KEY, 
            JSON.stringify({ 
              token, 
              timestamp: Date.now() 
            })
          );
          
          setAuthState('authenticated');
        } else {
          // Valid response but verification failed
          handleAuthFailure();
        }
      } catch (error: any) {
        // API request error
        console.error('Token verification error:', error);
        handleAuthFailure();
      }
    };
    
    verifyAuth();
  }, []);

  // Show loading state while checking authentication
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-purple-100 rounded-full mb-4">
            <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying your session</h2>
          <p className="text-gray-600">Please wait while we authenticate your access...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the child routes
  if (authState === 'authenticated') {
    return <Outlet />;
  }

  // Return null while redirect happens
  return null;
};

// Export a function to clear the session cache (useful for logout)
export const clearAuthSessionCache = () => {
  localStorage.removeItem(SESSION_CACHE_KEY);
  // For a complete logout, also remove the token and redirect
  // Uncomment the line below if you want logout to always redirect
  // handleAuthFailure();
};

export default ProtectedRoute;