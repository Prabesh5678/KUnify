import React, { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { useAppContext } from "./context/AppContext";
import StudentNavbar from "./components/StudentNavbar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPanel from "./components/LoginPanel";

import Home from "./pages/Home";
import Contact from "./pages/Contact";
import AboutSPMP from "./pages/AboutSPMP";
import ProfileSetup from "./pages/Student/ProfileSetup";
import StudentDashboard from "./pages/Student/StudentDashboard";
import GuidelinesPage from "./pages/Student/Guidelinespage";
import Request from "./pages/Student/Request";
import Logsheet from "./pages/Student/Logsheet";
import MyProfile from "./pages/Student/MyProfile";
import StudentGuard from "./components/StudentGuard";
import StudentHome from "./pages/Student/StudentHome";
import TeamMembers from "./pages/Student/TeamMembers";
import StudentTeamMembers from "./pages/Student/TeamMembers";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import TeachersManagement from "./pages/Admin/TeacherManagement";
import AddTeacherModal from "./components/Admin/AddTeacherModal";
import AdminGuard from "./components/AdminGuard";
import ProjectsManagement from "./pages/Admin/ProjectsManagement";
import WaitingPage from "./pages/Student/WaitingPage";
const App = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAppContext();

  const isStudentPath = pathname.includes("student");
  const isAdminPath = pathname.includes("admin");
  const isHomePath = pathname === "/";

  // Decide Navbar
  const NavbarToShow = isStudentPath ? (
    <StudentNavbar />
  ) : !isAdminPath ? (
    <Navbar />
  ) : null;

  const contentClass = isStudentPath
    ? "px-6 md:px-16 lg:px-24 xl:px-32 pt-24"
    : !isHomePath && !isAdminPath
      ? "px-6 md:px-16 lg:px-24 xl:px-32"
      : "";

  // ✅ Global redirect logic
  useEffect(() => {
    if (!user) return;

    // Admin bypass
    if (user.role === "admin") return;

    // Student profile check
    if (user.role === "student") {
      const profileDone = !!(
        user.department &&
        user.semester &&
        user.rollNumber &&
        user.subjectCode
      );

      if (!profileDone && pathname !== "/setup-profile") {
        navigate("/setup-profile", { replace: true });
      }

      if (profileDone && (pathname === "/setup-profile" || pathname === "/")) {
        navigate("/student/home", { replace: true });
      }
    }
  }, [user, pathname, navigate]);

  return (
    <>
      <Toaster position="top-right" />

      {/* Navbar */}
      {NavbarToShow}

      {/* Login Panel */}
      <LoginPanel />

      <div className={contentClass}>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about-SPMP" element={<AboutSPMP />} />

          {/* Profile Setup (only for students) */}
          <Route
            path="/setup-profile"
            element={
              user?.role === "student" ? (
                <ProfileSetup />
              ) : user?.role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Student Routes */}
          <Route element={<StudentGuard />}>
            <Route path="/student/home" element={<StudentHome />} />
            <Route path="/student/team-members" element={<StudentTeamMembers />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/guidelines" element={<GuidelinesPage />} />
            <Route path="/student/requestsupervisor" element={<Request />} />
            <Route path="/student/team/logsheet" element={<Logsheet />} />
            <Route path="/student/profile" element={<MyProfile />} />
            <Route path="/student/member/:teamId" element={<TeamMembers />} />
            <Route path="/student/waiting" element={<WaitingPage />} />
          </Route>


          {/* Admin Routes */}
          <Route element={<AdminGuard />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/teachers" element={<TeachersManagement />} />
            <Route path="/admin/projects" element={<ProjectsManagement />} />
            {/* Add more admin routes here */}
          </Route>


          {/* Fallback: Not Found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isStudentPath && !isAdminPath && <Footer />}
    </>
  );
};

export default App;
