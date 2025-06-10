"use client";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router";
import apiService from "../../utilities/service/api";

// Google OAuth configuration
const GOOGLE_CLIENT_ID = "304822574625-8ms40dmitm2mup0h2i8de5lf6jn8mtsj.apps.googleusercontent.com";
const GOOGLE_REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

const LoginForm : React.FC = () => {
  // const [isPending, startTransition] = React.useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordType, setPasswordType] = useState<"password" | "text">("password");
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  //handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });

      // Clear error when typing
      setErrors({ ...errors, [e.target.name]: "" });
    };

    const validateForm = () => {
      let isValid = true;
      let newErrors = { email: "", password: "" };

      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Your email is invalid.";
        isValid = false;
      }

      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters.";
        isValid = false;
      }

      setErrors(newErrors);
      return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('am i here?');
      // if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        const response: any = await apiService.post("auth/login", formData,{});
        if (response.success) {
          // Store the token and navigate
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('userData',JSON.stringify(response.data.user));
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error during API call:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    // Google OAuth handler
    const handleGoogleLogin = () => {
      setIsSubmitting(true);
      
      // Debug: Log the redirect URI being used
      console.log('Redirect URI:', GOOGLE_REDIRECT_URI);
      console.log('Current origin:', window.location.origin);
      
      // Create Google OAuth URL
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=email profile&` +
        `access_type=offline&` +
        `prompt=consent`;

      console.log('Full Google Auth URL:', googleAuthUrl);

      // Redirect to Google OAuth
      window.location.href = googleAuthUrl;
    };

    // Handle Google OAuth callback (you might want to create a separate component for this)


    const togglePasswordType = () => {
      setPasswordType((prev) => (prev === "password" ? "text" : "password"));
    };

  // const toggleVisibility = () => setIsVisible(!isVisible);

  return (
   <div className="w-full">
         <div className="flex justify-center">
           <NavLink to="/">
             <img src="/images/logo_minilessons.png" height="30" width="147" alt="logo" />
           </NavLink>
         </div>
         <h2 className="mt-6 text-2xl font-bold text-gray-900">Hey, Welcome Back! 👋</h2>
         <p className="text-base text-gray-600 mt-2"> Welcome back to Mini Lessons Academy </p>
   
         <form onSubmit={handleSubmit} className="mt-5">
           <div className="space-y-4">
             {/* Email Field */}
             <div>
               <label htmlFor="email" className="font-medium text-gray-600">Email</label>
               <input
                 type="text"
                 id="email"
                 name="email"
                 value={formData.email}
                 onChange={handleChange}
                 className={`w-full p-2 border ${errors.email ? "border-red-500" : "border-gray-300"}`}
               />
               {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
             </div>
   
             {/* Password Field */}
             <div>
               <label htmlFor="password" className="font-medium text-gray-600">Password</label>
               <div className="relative">
                 <input
                   type={passwordType}
                   id="password"
                   name="password"
                   value={formData.password}
                   onChange={handleChange}
                   className={`w-full p-2 border ${errors.password ? "border-red-500" : "border-gray-300"}`}
                 />
                 <button
                   type="button"
                   className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400"
                   onClick={togglePasswordType}
                 >
                   {passwordType === "password" ? "👁️" : "🙈"}
                 </button>
               </div>
               {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
             </div>
           </div>

      <div className="flex justify-between items-center">
          {/* Remember Me Checkbox */}
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              className="mr-2"
            />
            <label htmlFor="rememberMe" className="text-gray-600">Remember Me</label>
          </div>

          {/* Forgot Password */}
          <NavLink to="/reset-password" className="text-blue-600 mt-4">Forgot Password?</NavLink>

      </div>
           {/* Submit Button */}
           <button
             type="submit"
             className="w-full mt-5 p-2 bg-primary text-white rounded"
             disabled={isSubmitting}
           >
             {isSubmitting ? "Joining..." : "Log in"}
           </button>
         </form>

         {/* Divider */}
         <div className="flex items-center my-6">
           <div className="flex-1 border-t border-gray-300"></div>
           <span className="px-4 text-gray-500 text-sm">or</span>
           <div className="flex-1 border-t border-gray-300"></div>
         </div>

         {/* Google OAuth Button */}
         <button
           type="button"
           onClick={handleGoogleLogin}
           disabled={isSubmitting}
           className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
         >
           <svg
             className="w-5 h-5"
             viewBox="0 0 24 24"
           >
             <path
               fill="#4285F4"
               d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
             />
             <path
               fill="#34A853"
               d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
             />
             <path
               fill="#FBBC05"
               d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
             />
             <path
               fill="#EA4335"
               d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
             />
           </svg>
           <span className="text-gray-700 font-medium">Continue with Google</span>
         </button>
   
         <p className="mt-5 text-center text-gray-600">
           {/* Not Registered? <NavLink className="text-primary" to="/sign-up">Sign up</NavLink> */}
         </p>
       </div>
  );
};

export default LoginForm;
