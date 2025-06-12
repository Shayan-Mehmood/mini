import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import apiService from "../../utilities/service/api";
import { toast } from "react-hot-toast";
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  // Extract token and email from URL on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlToken = queryParams.get("token");
    const urlEmail = queryParams.get("email");

    if (!urlToken || !urlEmail) {
      setVerificationError("Invalid reset link. The link might be expired or malformed.");
      setIsVerifying(false);
      return;
    }

    setToken(urlToken);
    setEmail(urlEmail);
    
    // Verify the token
    verifyToken(urlEmail, urlToken);
  }, [location.search]);

  // Function to verify token with the backend
  const verifyToken = async (email: string, token: string) => {
    try {
      const response = await apiService.post("/auth/password/verify-token", {
        email,
        token,
      });

      if (response.success) {
        setIsVerified(true);
      } else {
        setVerificationError(response.message || "Invalid or expired token. Please request a new password reset.");
      }
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        "Token verification failed. Please request a new password reset.";
      
      setVerificationError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = { password: "", confirmPassword: "" };
    
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase letters, and numbers";
      isValid = false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await apiService.post("/auth/password/reset-with-token", {
        email,
        token,
        password: formData.password,
      });

      if (response.success) {
        toast.success("Password reset successfully!");
        setResetSuccess(true);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              notification: "Password reset successful! You can now log in with your new password."
            }
          });
        }, 2000);
      } else {
        toast.error(response.message || "Failed to reset password");
      }
    } catch (err: any) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while verifying token
  if (isVerifying) {
    return (
      <div className="w-full px-8 md:w-1/2 mx-auto my-8">
        <div className="flex justify-center">
          <NavLink to="/">
            <img src="/images/logo_minilessons.png" height="30" width="147" alt="logo" />
          </NavLink>
        </div>
        <div className="mt-8 text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-4" />
          <h2 className="text-xl font-medium text-gray-800 mb-2">Verifying Your Reset Link</h2>
          <p className="text-gray-600">Please wait while we verify your reset token...</p>
        </div>
      </div>
    );
  }

  // Show error state if token verification failed
  if (!isVerified && verificationError) {
    return (
      <div className="w-full px-8 md:w-1/2 mx-auto my-8">
        <div className="flex justify-center">
          <NavLink to="/">
            <img src="/images/logo_minilessons.png" height="30" width="147" alt="logo" />
          </NavLink>
        </div>
        <div className="mt-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-medium text-gray-800 text-center">Reset Link Invalid</h2>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-6">{verificationError}</p>
            
            <NavLink
              to="/forgot-password"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Request New Reset Link
            </NavLink>
            
            <div className="mt-4">
              <NavLink
                to="/login"
                className="text-blue-600 hover:text-blue-800"
              >
                Back to Login
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success message after password reset
  if (resetSuccess) {
    return (
      <div className="w-full px-8 md:w-1/2 mx-auto my-8">
        <div className="flex justify-center">
          <NavLink to="/">
            <img src="/images/logo_minilessons.png" height="30" width="147" alt="logo" />
          </NavLink>
        </div>
        <div className="mt-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-medium text-gray-800 text-center">Password Reset Successful</h2>
          </div>
          
          <p className="text-center text-gray-600 mb-6">
            Your password has been reset successfully. You will be redirected to the login page shortly.
          </p>
          
          <div className="text-center">
            <NavLink
              to="/login"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  // Password reset form (shown if token is valid)
  return (
    <div className="w-full px-8 md:w-1/2 mx-auto my-8">
      <div className="flex justify-center">
        <NavLink to="/">
          <img src="/images/logo_minilessons.png" height="30" width="147" alt="logo" />
        </NavLink>
      </div>
      <h2 className="mt-6 text-2xl font-bold text-gray-900 text-center">Reset Your Password</h2>
      <p className="text-base text-gray-600 mt-2 text-center">
        Create a new password for your account
      </p>

      <form onSubmit={handleSubmit} className="mt-8">
        {/* Email display (non-editable) */}
        <div className="mb-5">
          <label className="block font-medium text-gray-600 mb-2">
            Email Address
          </label>
          <div className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
            {email}
          </div>
        </div>

        {/* New Password Field */}
        <div className="mb-5">
          <label htmlFor="password" className="block font-medium text-gray-600 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={passwordVisibility.password ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className={`w-full p-3 border rounded-lg pr-12 focus:outline-none focus:ring-2 transition-colors ${
                errors.password 
                  ? "border-red-500 focus:ring-red-200" 
                  : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
              }`}
            />
            <button
              type="button"
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => togglePasswordVisibility('password')}
              aria-label={passwordVisibility.password ? "Hide password" : "Show password"}
            >
              {passwordVisibility.password ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          ) : (
            <p className="text-gray-500 text-xs mt-1">
              Must be at least 8 characters with uppercase, lowercase letters, and numbers
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block font-medium text-gray-600 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={passwordVisibility.confirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              className={`w-full p-3 border rounded-lg pr-12 focus:outline-none focus:ring-2 transition-colors ${
                errors.confirmPassword 
                  ? "border-red-500 focus:ring-red-200" 
                  : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
              }`}
            />
            <button
              type="button"
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => togglePasswordVisibility('confirmPassword')}
              aria-label={passwordVisibility.confirmPassword ? "Hide password" : "Show password"}
            >
              {passwordVisibility.confirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full p-3 rounded-lg font-medium text-white transition-colors ${
            isSubmitting 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Resetting Password...
            </span>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-gray-600">
        Go Back? <NavLink className="text-blue-600 hover:text-blue-800" to="/login">Login</NavLink>
      </p>
    </div>
  );
};

export default ResetPasswordForm;
