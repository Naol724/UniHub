import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const { dispatch } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userStr = params.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        window.location.href = "/";
      } catch {
        navigate("/login?error=google_failed");
      }
    } else {
      navigate("/login?error=google_failed");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500 text-sm">Signing you in with Google...</p>
    </div>
  );
};

export default GoogleSuccess;
