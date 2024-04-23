import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = () => {
  const { currentUser } = useAuth();
  const authorized = currentUser ? true : false;
  return authorized ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
