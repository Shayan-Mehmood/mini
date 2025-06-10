
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router";
import apiService from "../../utilities/service/api";
import { toast } from "react-hot-toast";

const SetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [passwordType, setPasswordType] = useState<"password" | "text">("password");

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear error when typing
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Fetch user details when component mounts
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        toast.error("Invalid user ID");
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        const response: any = await apiService.get(`auth/user/${userId}`);
        
        if (response.success) {
          setUserEmail(response.user.email);
          setUserName(`${response.user.firstName} ${response.user.lastName}`.trim());
          
          // Check if user already has a password
          if (response.user.hasPassword) {
            toast.error("Password already set for this user");
            navigate("/login");
            return;
          }
        } else {
          toast.error(response.message || "User not found");
          navigate("/login");
        }
      } catch (error: any) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load user details");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, navigate]);

  // Validate form
  const validateForm = () => {
    let isValid = true;
    let newErrors = { newPassword: "", confirmPassword: "" };

    if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters.";
      isValid = false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
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
    setMessage("");
    setErrors({ newPassword: "", confirmPassword: "" });

    try {
      const response: any = await apiService.post("auth/set-password", {
        userId: userId,
        password: formData.newPassword,
      },{});
      
      if (response.success) {
        toast.success(response.message || "Password set successfully!");
        setMessage("Password set successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(response.message || "Failed to set password");
        setMessage(response.message || "Failed to set password");
      }
    } catch (error: any) {
      console.error("Error during password setting:", error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordType = () => {
    setPasswordType((prev) => (prev === "password" ? "text" : "password"));
  };

  if (isLoading) {
    return (
      <div className="w-full px-8 md:w-1/2 mx-auto my-4">
        <div className="flex justify-center">
          <NavLink to="/">
            <img src="/images/logo_minilessons.png" height="30" width="147" alt="logo" />
          </NavLink>
        </div>
        <div className="mt-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-8 md:w-1/2 mx-auto my-4">
      <div className="flex justify-center">
        <NavLink to="/">
          <img src="/images/logo_minilessons.png" height="30" width="147" alt="logo" />
        </NavLink>
      </div>
      <h2 className="mt-6 text-2xl font-bold text-gray-900 text-center">Set Your Password</h2>
      <p className="text-base text-gray-600 mt-2 text-center">
        Welcome {userName}! Set your password to complete your account setup.
      </p>

      {/* User Info Display */}
      {userEmail && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Account:</strong> {userEmail}
          </p>
        </div>
      )}

      {message && (
        <div className={`mt-4 p-3 rounded-md text-center ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5">
        <div className="space-y-4">

          {/* New Password Field */}
          <div>
            <label htmlFor="newPassword" className="font-medium text-gray-600">Password</label>
            <div className="relative">
              <input
                type={passwordType}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your password (min 8 characters)"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors pr-12 ${
                  errors.newPassword 
                    ? "border-red-500 focus:ring-red-200" 
                    : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                className="absolute top-5 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={togglePasswordType}
                aria-label={passwordType === "password" ? "Show password" : "Hide password"}
              >
                {passwordType === "password" ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="font-medium text-gray-600">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.confirmPassword 
                  ? "border-red-500 focus:ring-red-200" 
                  : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
              }`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full mt-6 p-3 rounded-lg font-medium text-white transition-colors ${
            isSubmitting 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Setting Password...
            </span>
          ) : (
            "Set Password"
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-gray-600">
        Already have an account? <NavLink className="text-blue-600 hover:text-blue-800 transition-colors" to="/login">Login</NavLink>
      </p>
    </div>
  );
};

export default SetPasswordForm;
