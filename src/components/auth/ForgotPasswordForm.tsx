import React, { useState } from "react";
import { NavLink } from "react-router";
import apiService from "../../utilities/service/api";
import { toast } from "react-hot-toast";
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  // Validate email
  const validateEmail = () => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.post("/auth/password/reset-request", {
        email: email.trim()
      });

      if (response.success) {
        toast.success("Reset link sent to your email!");
        setSuccess(true);
      } else {
        toast.error(response.message || "Failed to send password reset link");
      }
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        "An error occurred while sending the password reset link.";
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-8 md:w-1/2 mx-auto my-8">
      <div className="flex justify-center">
        <NavLink to="/">
          <img src="/images/logo_minilessons.png" height="30" width="147" alt="logo" />
        </NavLink>
      </div>

      {success ? (
        <div className="mt-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-medium text-gray-800 text-center">Check Your Email</h2>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              We've sent a password reset link to:
            </p>
            <p className="text-gray-800 font-medium mb-6">{email}</p>
            <p className="text-gray-600 mb-6">
              Please check your inbox and click on the link to reset your password.
              If you don't receive an email within a few minutes, check your spam folder.
            </p>
            
            <div className="mt-6">
              <NavLink
                to="/login"
                className="inline-block px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                <span className="flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Login
                </span>
              </NavLink>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h2 className="mt-6 text-2xl font-bold text-gray-900 text-center">Reset Your Password</h2>
          <p className="text-base text-gray-600 mt-2 text-center">
            Enter your email address and we'll send you a link to reset your password
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="mb-5">
              <label htmlFor="email" className="block font-medium text-gray-600 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  emailError
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                }`}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

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
                  Sending Reset Link...
                </span>
              ) : (
                "Send Password Reset Link"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-gray-600">
            Remember your password? <NavLink className="text-blue-600 hover:text-blue-800" to="/login">Login</NavLink>
          </p>
        </>
      )}
    </div>
  );
};

export default ForgotPasswordForm;