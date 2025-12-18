import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const ProfileGuard = () => {
  const { user, profileSetupDone } = useAppContext();

  // Only allow logged-in students who have completed profile
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!user.profileCompleted && !profileSetupDone) {
    return <Navigate to="/setup-profile" replace />;
  }

  // Everything is fine, render the nested route
  return <Outlet />;
};

export default ProfileGuard;
