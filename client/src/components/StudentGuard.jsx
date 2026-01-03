
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

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

  // ❌ Block student routes if profile incomplete
  if (!profileCompleted) {
    return <Navigate to="/setup-profile" replace />;
  }

  // ⏳ Team approval logic
  const hasTeam = !!user.teamId;
  const isApproved = user.isApproved === true;
  const needsApproval = hasTeam && !isApproved;

  // 🔒 Define team-specific routes (require team AND approval)
  const teamProtectedRoutes = [
    "/student/dashboard",
    "/student/team-members",
    "/student/member",
    "/student/logsheet",
    "/student/requestsupervisor",
  ];

  const isTeamProtectedRoute = teamProtectedRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  // 🚨 If trying to access team-protected routes
  if (isTeamProtectedRoute) {
    // No team at all? Redirect to home to join/create one
    if (!hasTeam) {
      toast.error("You need to join or create a team first!");
      return <Navigate to="/student/home" replace />;
    }
    // Has team but waiting for approval? Redirect to waiting page
    if (needsApproval) {
      toast("Your team request is pending approval", { icon: "⏳" });
      return <Navigate to="/student/waiting" replace />;
    }
    // Has team and approved? Allow access
  }

  // ✅ If user is on waiting page but shouldn't be there
  if (location.pathname === "/student/waiting") {
    // No team? They shouldn't be on waiting page
    if (!hasTeam) {
      return <Navigate to="/student/home" replace />;
    }
    // Has team and approved? Go to dashboard
    if (isApproved) {
      toast.success("Your request has been approved!");
      return <Navigate to="/student/dashboard" replace />;
    }
    // Has team but not approved? Stay on waiting page (correct state)
  }

  // ✅ Allow access to non-team routes (home, profile, guidelines, etc.)
  // Users can access these even while waiting for approval
  return <Outlet />;
};

export default StudentGuard;