import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userStr = params.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Use the AuthContext login method with Google login flag
        login({ token, user }, true);
        navigate("/dashboard");
      } catch (error) {
        console.error("Google auth success error:", error);
        navigate("/user/login?error=google_failed");
      }
    } else {
      navigate("/user/login?error=google_failed");
    }
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Signing you in with Google...</p>
      </div>
    </div>
  );
};

export default GoogleSuccess;
