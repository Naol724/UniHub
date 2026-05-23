import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectRoute = ({ children }) => {
    const { isAuthenticated, token } = useAuth();
    
    if (!isAuthenticated || !token) {
        return <Navigate to="/user/login" replace />;
    }
    
    return children;
};

export default ProtectRoute;