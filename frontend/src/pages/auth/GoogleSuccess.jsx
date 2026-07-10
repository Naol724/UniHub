import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const userStr = params.get("user");

        console.log("[Google OAuth] Callback received");
        console.log("[Google OAuth] Token present:", !!token);
        console.log("[Google OAuth] User present:", !!userStr);

        if (!token || !userStr) {
          console.error("[Google OAuth] Missing token or user in callback");
          setError("Missing authentication data");
          setTimeout(() => {
            navigate("/user/login?error=google_failed", { replace: true });
          }, 2000);
          return;
        }

        // URLSearchParams already decodes — do not double-decode
        const user = JSON.parse(userStr);
        console.log("[Google OAuth] Parsed user:", user);

        await login({ token, user }, true);
        console.log("[Google OAuth] Login successful, redirecting to dashboard");

        // Clear sensitive query params from the address bar
        window.history.replaceState({}, document.title, "/auth/google/success");
        navigate("/", { replace: true });
      } catch (err) {
        console.error("[Google OAuth] Error:", err);
        setError(err.message || "Authentication failed");
        setTimeout(() => {
          navigate("/user/login?error=google_failed", { replace: true });
        }, 2000);
      }
    };

    handleGoogleAuth();
  }, [navigate, login]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <p className="text-gray-500 text-xs">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Signing you in...</h2>
        <p className="text-gray-600 text-sm">Please wait while we complete your Google authentication</p>
      </div>
    </div>
  );
};

export default GoogleSuccess;
