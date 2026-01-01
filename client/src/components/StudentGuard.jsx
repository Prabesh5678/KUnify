/*{
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
if (user.role === "student") {
  const profileCompleted = !!(
    user.department &&
    user.semester &&
    user.rollNumber &&
    user.subjectCode
  );
   if (!profileCompleted) {
    navigate("/setup-profile");
  }
}

  // Allow profile setup page
  if (!profileCompleted && location.pathname === "/setup-profile") {
    return <Outlet />;
  }
  // If profile is complete, prevent access to /setup-profile
  if (location.pathname === "/setup-profile" && profileCompleted) {
    return <Navigate to="/student/home" replace />;
  }
  // Block student routes if profile incomplete
  if (!profileCompleted && location.pathname.startsWith("/student")) {
    return <Navigate to="/setup-profile" replace />;
  }

  return <Outlet />;
};

export default StudentGuard;
*/

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const StudentGuard = () => {
  const { user, loadingUser } = useAppContext();
  const location = useLocation();

  if (loadingUser) return null;

  // 🔒 Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ✅ Admin & Teacher bypass StudentGuard completely
  if (user.role !== "student") {
    return <Outlet />;
  }

  // 🔍 Student profile check
  const profileCompleted = !!(
    user.department &&
    user.semester &&
    user.rollNumber &&
    user.subjectCode
  );

  // ✅ Allow setup-profile if profile incomplete
  if (!profileCompleted && location.pathname === "/setup-profile") {
    return <Outlet />;
  }

  // ❌ Prevent accessing setup-profile if already completed
  if (profileCompleted && location.pathname === "/setup-profile") {
    return <Navigate to="/student/home" replace />;
  }

  // ❌ Block student routes if profile incomplete
  if (!profileCompleted && location.pathname.startsWith("/student")) {
    return <Navigate to="/setup-profile" replace />;
  }

  return <Outlet />;
};

export default StudentGuard;
