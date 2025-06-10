import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import apiService from '../../utilities/service/api';
import { toast } from 'react-hot-toast';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Google authentication failed');
        navigate('/login');
        return;
      }

      if (!code) {
        toast.error('No authorization code received');
        navigate('/login');
        return;
      }

      try {
        // Send the authorization code to your backend
        const response = await apiService.post('auth/google', { code });
        
        if (response.success && response.token) {
          // Store the JWT token
          localStorage.setItem('authToken', response.token);
          
          // Store user data if provided
          if (response.user) {
            localStorage.setItem('userData', JSON.stringify(response.user));
          }
          
          toast.success('Successfully logged in with Google!');
          navigate('/dashboard');
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error: any) {
        console.error('Google OAuth error:', error);
        toast.error(error?.response?.data?.message || 'Authentication failed');
        navigate('/login');
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <h2 className="mt-6 text-xl font-medium text-gray-900">
            Completing Google Sign-In...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we complete your authentication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback; 