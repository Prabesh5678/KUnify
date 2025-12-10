// ProfileGuard.jsx
import { useAppContext } from "../context/AppContext";
import { Navigate } from "react-router-dom";

export default function ProfileGuard({ children }) {
  const { user, profileSetupDone, loadingUser } = useAppContext();

  if (loadingUser) return null; // or a loader

  // if you truly never have "student but logged out", you can just use user check
  if (!user) {
    return null; // or maybe show login; but do NOT redirect to home
  }

  if (!profileSetupDone && !user.profileCompleted) {
    return <Navigate to="/setup-profile" replace />;
  }

  return children;
}
