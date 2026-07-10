import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import ThemeToggle from "../../components/ThemeToggle";

const getGoogleAuthUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return `${baseUrl.replace(/\/api\/?$/, "")}/api/google`;
};

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;
    const messages = {
      google_failed: "Google sign-in failed. Please try again.",
      google_not_configured: "Google sign-in is not configured on the server.",
      google_callback_error: "Google authentication error. Please try again.",
      google_no_user: "Could not retrieve your Google account. Please try again.",
    };
    setErrors({ general: messages[error] || "Authentication failed. Please try again." });
  }, [searchParams]);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    return newErrors;
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
    setErrors({});
    try {
      await login(formData);
      navigate("/", { replace: true });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Network error. Please try again.";
      setErrors({ general: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ backgroundColor: theme.colors.background }}
    >
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div
        className="w-full"
        style={{
          maxWidth: "380px",
          borderRadius: "20px",
          padding: "36px 32px",
          backgroundColor: theme.colors.surface,
          boxShadow: `0 4px 6px -1px ${theme.colors.shadow}, 0 10px 40px -4px ${theme.colors.shadow}`,
        }}
      >
        <div className="flex justify-center mb-5">
          <div
            className="flex items-center justify-center w-12 h-12"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
              borderRadius: "14px",
            }}
          >
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

        <h1
          className="text-center font-bold mb-1"
          style={{ fontSize: "20px", color: theme.colors.text }}
        >
          Welcome back
        </h1>

        <p
          className="text-center mb-6"
          style={{ fontSize: "13px", color: theme.colors.textSecondary }}
        >
          Sign in to your UniHub account
        </p>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block font-bold mb-1"
              style={{ fontSize: "12px", color: theme.colors.text }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@university.edu"
              className="w-full outline-none transition text-sm placeholder-gray-400"
              style={{
                padding: "9px 13px",
                borderRadius: "10px",
                background: errors.email ? "#fff5f5" : theme.colors.background,
                border: errors.email ? "1px solid #f87171" : `1px solid ${theme.colors.border}`,
                color: theme.colors.text,
              }}
            />
            {errors.email && (
              <p className="mt-1 text-red-500" style={{ fontSize: "11px" }}>
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block font-bold mb-1"
                style={{ fontSize: "12px", color: theme.colors.text }}
              >
                Password
              </label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full outline-none transition text-sm placeholder-gray-400"
              style={{
                padding: "9px 13px",
                borderRadius: "10px",
                background: errors.password ? "#fff5f5" : theme.colors.background,
                border: errors.password
                  ? "1px solid #f87171"
                  : `1px solid ${theme.colors.border}`,
                color: theme.colors.text,
              }}
            />
            {errors.password && (
              <p className="mt-1 text-red-500" style={{ fontSize: "11px" }}>
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-slate-600" />
          <span className="text-gray-400" style={{ fontSize: "12px" }}>
            or
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-slate-600" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="btn-secondary w-full"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.09 29.5 1 24 1 14.82 1 7.07 6.48 3.64 14.22l7.08 5.5C12.43 13.61 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.7c-.55 2.96-2.2 5.47-4.68 7.16l7.18 5.57C43.44 37.27 46.52 31.36 46.52 24.5z"/>
            <path fill="#FBBC05" d="M10.72 28.28A14.6 14.6 0 0 1 9.5 24c0-1.49.26-2.93.72-4.28l-7.08-5.5A23.93 23.93 0 0 0 0 24c0 3.87.93 7.53 2.56 10.76l8.16-6.48z"/>
            <path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.5-4.95l-7.18-5.57C28.6 38.13 26.42 39 24 39c-6.26 0-11.57-4.11-13.28-9.72l-8.16 6.48C6.07 43.52 14.46 47 24 47z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-gray-400 mt-5" style={{ fontSize: "13px" }}>
          Don&apos;t have an account?{" "}
          <Link to="/user/register" className="text-blue-500 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
