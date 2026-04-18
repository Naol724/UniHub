import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import { validateEmail, validatePassword } from "../utils/validation";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    // Remove keys with no error so Object.keys check works correctly
    return Object.fromEntries(Object.entries(newErrors).filter(([, v]) => v));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      await login(formData);
      navigate('/');
    } catch (error) {
      setErrors({ general: error.message || 'Login failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = () => {
    // TODO: wire up Google OAuth
    console.log("Google sign-in");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      {/* Card */}
      <div className="w-full bg-white rounded-2xl shadow-lg p-8 max-w-sm border border-slate-200">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center font-bold text-slate-900 mb-2 text-xl">
          Welcome back
        </h1>

        {/* Subtitle */}
        <p className="text-center text-slate-500 mb-6 text-sm">
          Sign in to your UniHub account
        </p>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errors.general}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@university.edu"
          />

          {/* Password — custom label row for "Forgot password?" link */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-700 text-sm">
                Password
              </span>
              <a
                href="#"
                className="text-blue-500 hover:text-blue-600 text-xs transition"
              >
                Forgot password?
              </a>
            </div>
            <FormInput
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed mt-1 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-slate-400 text-xs">
            or
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 bg-white text-slate-700 text-sm font-medium transition hover:bg-slate-50 border border-slate-200 rounded-lg py-2.5"
        >
          {/* Google icon */}
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.09 29.5 1 24 1 14.82 1 7.07 6.48 3.64 14.22l7.08 5.5C12.43 13.61 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.7c-.55 2.96-2.2 5.47-4.68 7.16l7.18 5.57C43.44 37.27 46.52 31.36 46.52 24.5z"/>
            <path fill="#FBBC05" d="M10.72 28.28A14.6 14.6 0 0 1 9.5 24c0-1.49.26-2.93.72-4.28l-7.08-5.5A23.93 23.93 0 0 0 0 24c0 3.87.93 7.53 2.56 10.76l8.16-6.48z"/>
            <path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.5-4.95l-7.18-5.57C28.6 38.13 26.42 39 24 39c-6.26 0-11.57-4.11-13.28-9.72l-8.16 6.48C6.07 43.52 14.46 47 24 47z"/>
          </svg>
          Continue with Google
        </button>

        {/* Footer */}
        <p className="text-center text-slate-400 mt-5 text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-blue-500 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
