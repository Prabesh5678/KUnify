import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const TeacherGuard = () => {
  const { user } = useAppContext();
  if (!user || user.role !== "teacher") return <Navigate to="/" replace />;
  return <Outlet />;
};

export default TeacherGuard;
