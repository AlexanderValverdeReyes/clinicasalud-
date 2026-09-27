import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, user, requiredRole, role }) {
  const targetRole = requiredRole || role;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (targetRole && user.role !== targetRole) {
    const redirectPath =
      user.role === "admin" ? "/admin-dashboard" : "/patient-dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
