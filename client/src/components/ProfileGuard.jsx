import { useAppContext } from "../context/AppContext";
import { Navigate } from "react-router-dom";

export default function ProfileGuard({ children }) {
  const { isUser } = useAppContext();

  if (!isUser) return <Navigate to="/student/dashboard" />;

  if (!isUser.profileCompleted) {
    return <Navigate to="/setup-profile" />;
  }

  return children;
}
