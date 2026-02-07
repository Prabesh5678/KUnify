/*
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
import AllTeachers from "./pages/Admin/AllTeachers";
import StudentsManagement from "./pages/Admin/StudentsManagement";
import StudentDetails from "./pages/Admin/StudentDetails";
import RequestTeacher from "./pages/Admin/RequestTeacher";
import TeamDetail from "./pages/Admin/TeamDetail";

//Teacher Pages
import TeacherGuard from "./components/TeacherGuard";
import TeacherLayout from "./components/TeacherLayout";
import TeacherSidebar from "./components/Teacher/TeacherSidebar";
import TeacherDashboard from "./pages/Teacher/Dashboard";
import TeacherProjects from "./pages/Teacher/Projects";
import TeacherRequests from "./pages/Teacher/Requests";
import TeacherTeams from "./pages/Teacher/Teams";
import TeacherDeficits from "./pages/Teacher/Deficits";
import TeacherSettings from "./pages/Teacher/Settings";
import TeacherProfileSetup from "./pages/Teacher/TeacherProfileSetup";
import TeacherHeader from "./components/Teacher/TeacherHeader";
import TeamDetails from "./pages/Teacher/TeamDetail";
import PDFViewer from "./components/PDFViewer";
const App = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAppContext();

  const isStudentPath = pathname.includes("student");
  const isAdminPath = pathname.includes("admin");
  const isTeacherPath = pathname.includes("teacher");
  const isHomePath = pathname === "/";

  // Decide Navbar
  const NavbarToShow = isStudentPath ? (
    <StudentNavbar />
  ) : !isAdminPath && !isTeacherPath ? (
    <Navbar />
  ) : null;

  const contentClass = isStudentPath
    ? "px-6 md:px-16 lg:px-24 xl:px-32 pt-24"
    : !isHomePath && !isAdminPath && !isTeacherPath
      ? "px-6 md:px-16 lg:px-24 xl:px-32"
      : "";

  // ✅ Global redirect logic
  useEffect(() => {
    if (!user) return;

    // Admin bypass
    if (user.role === "admin") return;

    // Teacher profile check
    if (user.role === "teacher") {
      const profileDone = !!user.isProfileCompleted;

      if (!profileDone && pathname !== "/teacher/profilesetup") {
        navigate("/teacher/profilesetup", { replace: true });
      }

      if (profileDone && pathname === "/teacher/profilesetup") {
        navigate("/teacher/dashboard", { replace: true });
      }
      return;
    }


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

      {
      {NavbarToShow}

     
      <LoginPanel />

      <div className={contentClass}>
        <Routes>
         
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about-SPMP" element={<AboutSPMP />} />

          <Route
            path="/setup-profile"
            element={
              user?.role === "student" ? (
                <ProfileSetup />
              ) : user?.role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : user?.role === "teacher" ? (
                <Navigate to="/teacher/dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route element={<StudentGuard />}>
            <Route path="/student/waiting" element={<WaitingPage />} />
            <Route path="/student/home" element={<StudentHome />} />
            <Route
              path="/student/team-members"
              element={<StudentTeamMembers />}
            />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/guidelines" element={<GuidelinesPage />} />
            <Route path="/view-pdf" element={<PDFViewer />} />
            <Route
              path="/student/requestsupervisor/:teamId"
              element={<Request />}
            />
            <Route path="/student/logsheet" element={<Logsheet />} />
            <Route path="/student/profile" element={<MyProfile />} />
            <Route path="/student/member/:teamId" element={<TeamMembers />} />
          </Route>

          <Route element={<AdminGuard />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/admin_teachers" element={<TeachersManagement />} />
            <Route path="/admin/projects" element={<ProjectsManagement />} />
            <Route path="/admin/allteachers/:id" element={<AllTeachers />} />
            <Route path="/admin/admin_std" element={<StudentsManagement />} />
            <Route path="/admin/requestteacher" element={<RequestTeacher />} />
            <Route path="/admin/admin_std-details" element={<StudentDetails />} />
            <Route path="/admin/teamdetail/:teamId" element={<TeamDetail />} />

          </Route>

    
          <Route element={<TeacherGuard />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="projects" element={<TeacherProjects />} />
              <Route path="requests" element={<TeacherRequests />} />
              <Route path="teams" element={<TeacherTeams />} />
              <Route path="deficits" element={<TeacherDeficits />} />
              <Route path="settings" element={<TeacherSettings />} />
              <Route path="profilesetup" element={<TeacherProfileSetup />} />
              <Route path="teamdetails/:id" element={<TeamDetails />} />

            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isStudentPath && !isAdminPath && !isTeacherPath && <Footer />}
    </>
  );
};

export default App;
*/

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
import AllTeachers from "./pages/Admin/AllTeachers";
import StudentsManagement from "./pages/Admin/StudentsManagement";
import StudentDetails from "./pages/Admin/StudentDetails";
import RequestTeacher from "./pages/Admin/RequestTeacher";
import TeamDetail from "./pages/Admin/TeamDetail";

//Teacher Pages
import TeacherGuard from "./components/TeacherGuard";
import TeacherLayout from "./components/TeacherLayout";
import TeacherSidebar from "./components/Teacher/TeacherSidebar";
import TeacherDashboard from "./pages/Teacher/Dashboard";
import TeacherProjects from "./pages/Teacher/Projects";
import TeacherRequests from "./pages/Teacher/Requests";
import TeacherTeams from "./pages/Teacher/Teams";
import TeacherDeficits from "./pages/Teacher/Deficits";
import TeacherSettings from "./pages/Teacher/Settings";
import TeacherProfileSetup from "./pages/Teacher/TeacherProfileSetup";
import TeacherHeader from "./components/Teacher/TeacherHeader";
import TeamDetails from "./pages/Teacher/TeamDetail";
import PDFViewer from "./components/PDFViewer";
const App = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loadingUser } = useAppContext();

  const isStudentPath = pathname.includes("student");
  const isAdminPath = pathname.includes("admin");
  const isTeacherPath = pathname.includes("teacher");
  const isHomePath = pathname === "/";

  const NavbarToShow = isStudentPath
    ? <StudentNavbar />
    : !isAdminPath && !isTeacherPath
      ? <Navbar />
      : null;

  const contentClass = isStudentPath
    ? "px-6 md:px-16 lg:px-24 xl:px-32 pt-24"
    : !isHomePath && !isAdminPath && !isTeacherPath
      ? "px-6 md:px-16 lg:px-24 xl:px-32"
      : "";

  // Global profile redirect
  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") return;

    if (user.role === "teacher") {
      const profileDone = !!user.isProfileCompleted;
      if (!profileDone && pathname !== "/teacher/profilesetup") {
        navigate("/teacher/profilesetup", { replace: true });
      } else if (profileDone && pathname === "/teacher/profilesetup") {
        navigate("/teacher/dashboard", { replace: true });
      }
      return;
    }

    if (user.role === "student") {
      const profileDone = !!(
        user.department &&
        user.semester &&
        user.rollNumber &&
        user.subjectCode
      );
      if (!profileDone && pathname !== "/setup-profile") {
        navigate("/setup-profile", { replace: true });
      } else if (profileDone && (pathname === "/setup-profile" || pathname === "/")) {
        navigate("/student/home", { replace: true });
      }
    }
  }, [user, pathname, navigate]);

  return (
    <>
      <Toaster position="top-right" />
      {loadingUser ? (
        <div className="flex justify-center items-center h-screen text-white">
          Loading...
        </div>
      ) : (
        <>
          {NavbarToShow}
          <LoginPanel />
          <div className={contentClass}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about-SPMP" element={<AboutSPMP />} />

              {/* Student setup */}
              <Route
                path="/setup-profile"
                element={
                  user?.role === "student" ? (
                    <ProfileSetup />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
 <Route element={<StudentGuard />}>
            <Route path="/student/waiting" element={<WaitingPage />} />
            <Route path="/student/home" element={<StudentHome />} />
            <Route
              path="/student/team-members"
              element={<StudentTeamMembers />}
            />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/guidelines" element={<GuidelinesPage />} />
            <Route path="/view-pdf" element={<PDFViewer />} />
            <Route
              path="/student/requestsupervisor/:teamId"
              element={<Request />}
            />
            <Route path="/student/logsheet" element={<Logsheet />} />
            <Route path="/student/profile" element={<MyProfile />} />
            <Route path="/student/member/:teamId" element={<TeamMembers />} />
          </Route>

          <Route element={<AdminGuard />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/admin_teachers" element={<TeachersManagement />} />
            <Route path="/admin/projects" element={<ProjectsManagement />} />
            <Route path="/admin/allteachers/:id" element={<AllTeachers />} />
            <Route path="/admin/admin_std" element={<StudentsManagement />} />
            <Route path="/admin/requestteacher" element={<RequestTeacher />} />
            <Route path="/admin/admin_std-details" element={<StudentDetails />} />
            <Route path="/admin/teamdetail/:teamId" element={<TeamDetail />} />

          </Route>

    
          <Route element={<TeacherGuard />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="projects" element={<TeacherProjects />} />
              <Route path="requests" element={<TeacherRequests />} />
              <Route path="teams" element={<TeacherTeams />} />
              <Route path="deficits" element={<TeacherDeficits />} />
              <Route path="settings" element={<TeacherSettings />} />
              <Route path="profilesetup" element={<TeacherProfileSetup />} />
              <Route path="teamdetails" element={<TeamDetails />} />

            </Route>
          </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          {!isStudentPath && !isAdminPath && !isTeacherPath && <Footer />}
        </>
      )}
    </>
  );
};

export default App;

