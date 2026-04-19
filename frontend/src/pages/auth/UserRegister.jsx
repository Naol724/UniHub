// pages/auth/UserRegister.jsx - Fixed with proper API integration
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../API/Axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password1: '',
    password2: '',
    department: ''
  });
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email address is required');
      return false;
    }
    if (!formData.password1) {
      setError('Password is required');
      return false;
    }
    if (formData.password1.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password1 !== formData.password2) {
      setError('Passwords do not match');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    
    try {
      const response = await API.post("/user/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password1: formData.password1,
        password2: formData.password2,
        department: formData.department
      });
      
      // Registration successful, redirect to login
      navigate('/user/login', { 
        state: { message: 'Registration successful! Please sign in.' }
      });
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.msg) {
        setError(err.response.data.msg);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="w-full max-w-[94%] xs:max-w-[90%] sm:max-w-[500px] md:max-w-[540px] lg:max-w-[580px] 
                      bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10
                      transition-all duration-300 hover:shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 
                          bg-blue-50 rounded-2xl mb-4">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" 
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            UniHub
          </h1>
          <p className="text-gray-500 mt-3 text-base sm:text-lg">
            Create account
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Join UniHub and start collaborating
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm 
                        flex items-start gap-2 animate-shake">
            <span>⚠️</span>
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name Fields - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200 text-sm sm:text-base
                         disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="John"
                autoComplete="given-name"
                disabled={isLoading}
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200 text-sm sm:text-base
                         disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Doe"
                autoComplete="family-name"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              University Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-200 text-sm sm:text-base
                       disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="student@university.edu"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          {/* Department Field (Optional) */}
          <div>
            <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
              Department (Optional)
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-200 text-sm sm:text-base
                       disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Information Systems">Information Systems</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Business Administration">Business Administration</option>
            </select>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password1" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword1 ? "text" : "password"}
                id="password1"
                name="password1"
                value={formData.password1}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-gray-700 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200 text-sm sm:text-base
                         disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Create a strong password"
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword1(!showPassword1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword1 ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="password2" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword2 ? "text" : "password"}
                id="password2"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-gray-700 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200 text-sm sm:text-base
                         disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword2(!showPassword2)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword2 ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {formData.password1 && (
            <div className="mt-2">
              <div className="flex gap-1 h-1.5">
                <div className={`flex-1 rounded-full transition-all duration-300 ${
                  formData.password1.length >= 6 ? 'bg-green-500' : 'bg-gray-200'
                }`} />
                <div className={`flex-1 rounded-full transition-all duration-300 ${
                  formData.password1.length >= 8 && /[A-Z]/.test(formData.password1) ? 'bg-green-500' : 'bg-gray-200'
                }`} />
                <div className={`flex-1 rounded-full transition-all duration-300 ${
                  formData.password1.length >= 10 && /[0-9]/.test(formData.password1) && /[^A-Za-z0-9]/.test(formData.password1) ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Use 6+ characters with letters, numbers & symbols
              </p>
            </div>
          )}

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold 
                     py-3 sm:py-3.5 px-4 rounded-xl transition-all duration-200
                     transform hover:scale-[1.02] active:scale-[0.98]
                     disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
                     flex items-center justify-center gap-2 text-base sm:text-lg mt-6 shadow-md"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/user/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;