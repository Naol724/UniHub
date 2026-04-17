import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import { validateEmail, validatePassword, validateName, validateConfirmPassword } from "../utils/validation";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    newErrors.firstName = validateName(formData.firstName, "First name");
    newErrors.lastName = validateName(formData.lastName, "Last name");
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.confirmPassword = validateConfirmPassword(formData.confirmPassword, formData.password);
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
      await register(formData);
      navigate('/');
    } catch (error) {
      setErrors({ general: error.message || 'Registration failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      {/* Card */}
      <div
        className="w-full bg-white"
        style={{
          maxWidth: "380px",
          borderRadius: "20px",
          padding: "36px 32px",
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 40px -4px rgba(0,0,0,0.10)",
        }}
      >
        {/* Logo */}
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

        {/* Title */}
        <h1
          className="text-center font-bold text-gray-900 mb-1"
          style={{ fontSize: "20px" }}
        >
          Create account
        </h1>

        {/* Subtitle */}
        <p className="text-center text-slate-500 mb-6 text-sm">
          Join UniHub to collaborate with your university peers
        </p>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* First Name + Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="First Name"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              placeholder="Jane"
            />
            <FormInput
              label="Last Name"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              placeholder="Doe"
            />
          </div>

          {/* University Email */}
          <FormInput
            label="University Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@university.edu"
          />

          {/* Password */}
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
          />

          {/* Confirm Password */}
          <FormInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white text-sm transition disabled:opacity-60"
            style={{
              background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
              borderRadius: "10px",
              padding: "11px",
              fontWeight: 600,
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              marginTop: "4px",
            }}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-slate-400 mt-5 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
