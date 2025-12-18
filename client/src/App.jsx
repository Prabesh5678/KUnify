import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { useAppContext } from "./context/AppContext";
import StudentNavbar from "./components/StudentNavbar";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import LoginPanel from "./components/LoginPanel";

import Home from "./pages/Home";
import Contact from "./pages/Contact";
import AboutSPMP from "./pages/AboutSPMP";
import ProfileSetup from "./pages/Student/ProfileSetup";
import StudentDashboard from "./pages/Student/StudentDashboard";
import GuidelinesPage from "./pages/Student/GuidelinesPage";
import Request from "./pages/Student/Request";
import Logsheet from "./pages/Student/Logsheet";
import MyProfile from "./pages/Student/MyProfile";
import StudentGuard from "./components/StudentGuard";

const App = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAppContext();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isStudentPath = pathname.includes("student");
  const isAdminPath = pathname.includes("admin");
  const isHomePath = pathname === "/";

  // Navbar logic
  const NavbarToShow = isStudentPath ? (
    <StudentNavbar
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    />
  ) : !isAdminPath ? (
    <Navbar />
  ) : null;

  // Content padding
  const contentClass = isStudentPath
    ? "ml-20 px-6 md:px-16 lg:px-24 xl:px-32 pt-24"
    : !isHomePath && !isAdminPath
    ? "px-6 md:px-16 lg:px-24 xl:px-32"
    : "";

  // Redirect logic
 useEffect(() => {
   if (!user) return;

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
     navigate("/student/dashboard", { replace: true });
   }
 }, [user, pathname, navigate]);


  return (
    <>
      <Toaster position="top-right" />

      {/* Sidebar for students */}
      {isStudentPath && (
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}

      {/* Navbar */}
      {NavbarToShow}

      {/* Login Panel */}
      <LoginPanel />

      {/* Main Content */}
      <div className={contentClass}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about-SPMP" element={<AboutSPMP />} />

          {/* Profile Setup (one-time) */}
          <Route path="/setup-profile" element={<ProfileSetup />} />

          {/* Student Routes (protected) */}
          <Route element={<StudentGuard />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/guidelines" element={<GuidelinesPage />} />
            <Route path="/student/requestsupervisor" element={<Request />} />
            <Route path="/student/logsheet" element={<Logsheet />} />
            <Route path="/student/profile" element={<MyProfile />} />
          </Route>
        </Routes>
      </div>

      {/* Footer for non-student pages */}
      {!isStudentPath && <Footer />}
    </>
  );
};

export default App;
