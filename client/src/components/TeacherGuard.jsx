import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function TeacherGuard() {
  const { user, loadingUser } = useAppContext();
  const location = useLocation();

  if (loadingUser) return null; // wait for user context

  if (!user) return <Navigate to="/" replace />;

  if (user.role !== "teacher") {
    return (
      <Navigate
        to={user.role === "student" ? "/student/home" : "/admin/dashboard"}
        replace
      />
    );
  }

  // Prevent redirect loop on /teacher/profilesetup
  const isProfileSetupPage = location.pathname === "/teacher/profilesetup";
  const profileDone = user.isProfileCompleted === true;

  if (!profileDone && !isProfileSetupPage) {
    return <Navigate to="/teacher/profilesetup" replace />;
  }

  return <Outlet />;
}
