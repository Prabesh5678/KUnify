import { Outlet, Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function TeacherGuard() {
  const { user, loadingUser } = useAppContext();

  if (loadingUser) return null;

  if (!user) return <Navigate to="/" replace />;

  if (user.role !== "teacher") {
    return (
      <Navigate
        to={user.role === "student" ? "/student/home" : "/admin/dashboard"}
        replace
      />
    );
  }

  const profileDone = user?.isProfileCompleted === true;

  if (!profileDone) {
    return <Navigate to="/teacher/profilesetup" replace />;
  }

  return <Outlet />;
}
