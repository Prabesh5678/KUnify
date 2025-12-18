// import React from "react";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { useAppContext } from "../context/AppContext";

// const StudentGuard = () => {
//   const { user } = useAppContext();
//   const location = useLocation();

//   // If not logged in → redirect to home/login
//   if (!user) {
//     return <Navigate to="/" replace />;
//   }

//   // Allow profile setup page even if profile not completed
//   if (!user.student && location.pathname === "/setup-profile") {
//     return <Outlet />;
//   }

//   // If profile not completed and trying to access student pages → redirect to profile setup
//   if (!user.student && location.pathname.startsWith("/student")) {
//     return <Navigate to="/setup-profile" replace />;
//   }

//   // User logged in, profile completed → allow student pages
//   return <Outlet />;
// };

// export default StudentGuard;

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const StudentGuard = () => {
  const { user, loadingUser } = useAppContext();
  const location = useLocation();

  if (loadingUser) return null;

  // Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const profileCompleted = !!(
    user.department &&
    user.semester &&
    user.rollNumber &&
    user.subjectCode
  );

  // Allow profile setup page
  if (!profileCompleted && location.pathname === "/setup-profile") {
    return <Outlet />;
  }
  // If profile is complete, prevent access to /setup-profile
  if (location.pathname === "/setup-profile" && profileCompleted) {
    return <Navigate to="/student/dashboard" replace />;
  }
  // Block student routes if profile incomplete
  if (!profileCompleted && location.pathname.startsWith("/student")) {
    return <Navigate to="/setup-profile" replace />;
  }

  return <Outlet />;
};

export default StudentGuard;
