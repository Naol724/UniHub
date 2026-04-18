import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectRoute = ({ children }) => {
    const token = localStorage.getItem("UniHub-Haramaya-Dev");
    
    if (!token) {
        return <Navigate to="/user/login" replace />;
    }
    
    try {
        const cleanToken = token.replace('Bearer ', '');
        const decode = jwtDecode(cleanToken);
        
        if (decode.exp * 1000 < Date.now()) {
            localStorage.removeItem("UniHub-Haramaya-Dev");
            localStorage.removeItem("UniHub-User");
            alert("Session expired. Please login again.");
            return <Navigate to="/user/login" replace />;
        }
        
        return children;
    } catch (error) {
        console.error("Token decode error:", error);
        localStorage.removeItem("UniHub-Haramaya-Dev");
        localStorage.removeItem("UniHub-User");
        alert("Invalid session. Please login again.");
        return <Navigate to="/user/login" replace />;
    }
};

export default ProtectRoute;