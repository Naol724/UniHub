import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("UniHub-Haramaya-Dev");
    
    if (!token) {
        return children;
    }
    
    try {
        const cleanToken = token.replace('Bearer ', '');
        const decode = jwtDecode(cleanToken);
        
        if (decode.exp * 1000 > Date.now()) {
            return <Navigate to="/dashboard" replace />;
        }
        
        return children;
    } catch (error) {
        return children;
    }
};

export default PublicRoute;