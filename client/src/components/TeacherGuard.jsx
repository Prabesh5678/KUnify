import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const TeacherGuard = () => {
  const { user } = useAppContext();
  const location = useLocation();

  if (!user || user.role !== "teacher") {
    return <Navigate to="/home" replace />;
  }

  if (!user.isProfileCompleted) {
    if (location.pathname !== "/teacher/profilesetup") {
      return <Navigate to="/teacher/profilesetup" replace />;
    }
    return <Outlet />;
  }

  if (user.isProfileCompleted && location.pathname === "/teacher/profilesetup") {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  return <Outlet />;
};

export default TeacherGuard;
