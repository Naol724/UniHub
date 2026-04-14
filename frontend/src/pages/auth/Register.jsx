import { useState } from "react";

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

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
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
    // TODO: wire up to auth service
    console.log("Registering with:", formData);
    setIsSubmitting(false);
  };

  const inputStyle = (field) => ({
    padding: "9px 13px",
    borderRadius: "10px",
    background: errors[field] ? "#fff5f5" : "#f8fafc",
    border: errors[field] ? "1px solid #f87171" : "1px solid #e2e8f0",
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
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
        <p
          className="text-center text-gray-400 mb-6"
          style={{ fontSize: "13px" }}
        >
          Join UniHub and start collaborating
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* First Name + Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="firstName"
                className="block font-bold text-gray-700 mb-1"
                style={{ fontSize: "12px" }}
              >
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Jane"
                className="w-full outline-none transition text-sm text-gray-800 placeholder-gray-400"
                style={inputStyle("firstName")}
              />
              {errors.firstName && (
                <p className="mt-1 text-red-500" style={{ fontSize: "11px" }}>
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block font-bold text-gray-700 mb-1"
                style={{ fontSize: "12px" }}
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full outline-none transition text-sm text-gray-800 placeholder-gray-400"
                style={inputStyle("lastName")}
              />
              {errors.lastName && (
                <p className="mt-1 text-red-500" style={{ fontSize: "11px" }}>
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* University Email */}
          <div>
            <label
              htmlFor="email"
              className="block font-bold text-gray-700 mb-1"
              style={{ fontSize: "12px" }}
            >
              University Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@university.edu"
              className="w-full outline-none transition text-sm text-gray-800 placeholder-gray-400"
              style={inputStyle("email")}
            />
            {errors.email && (
              <p className="mt-1 text-red-500" style={{ fontSize: "11px" }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block font-bold text-gray-700 mb-1"
              style={{ fontSize: "12px" }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full outline-none transition text-sm text-gray-800 placeholder-gray-400"
              style={inputStyle("password")}
            />
            {errors.password && (
              <p className="mt-1 text-red-500" style={{ fontSize: "11px" }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block font-bold text-gray-700 mb-1"
              style={{ fontSize: "12px" }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full outline-none transition text-sm text-gray-800 placeholder-gray-400"
              style={inputStyle("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-red-500" style={{ fontSize: "11px" }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

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
        <p className="text-center text-gray-400 mt-5" style={{ fontSize: "13px" }}>
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 font-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
