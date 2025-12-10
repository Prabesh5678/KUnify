import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import StudentNavbar from "./components/StudentNavbar";
import Sidebar from "./components/Sidebar";
import GuidelinesPage from "./pages/Student/Guidelinespage";
import Request from "./pages/Student/Request";
import Logsheet from "./pages/Student/Logsheet";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import LoginPanel from "./components/LoginPanel";
import AboutSPMP from "./pages/AboutSPMP";
import ProfileSetup from "./pages/Student/ProfileSetup";
import StudentDashboard from "./pages/Student/StudentDashboard";
import ProfileGuard from "./components/ProfileGuard";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { pathname } = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isStudentPath = pathname.includes("student");
  const isTeacherPath = pathname.includes("teacher");
  const isAdminPath = pathname.includes("admin");
  const isHomePath = pathname === "/";

  let NavbarToShow = null;

  if (isStudentPath)
    NavbarToShow = (
      <StudentNavbar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    );
  else if (!isAdminPath) NavbarToShow = <Navbar />;

  const contentClass =
    isStudentPath
      ? "ml-20 px-6 md:px-16 lg:px-24 xl:px-32 pt-24"
      : !isHomePath && !isAdminPath
        ? "px-6 md:px-16 lg:px-24 xl:px-32"
        : "";

  return (
    <>
      <Toaster position="top-right" />
      {/* Sidebar controlled by navbar */}
      {isStudentPath && (
        <Sidebar isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen} />
      )}
      {/*correct navbar */}
      {NavbarToShow}

      <LoginPanel />
      <div className={contentClass}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/about-SPMP" element={<AboutSPMP />} />
          <Route
            path="/student/dashboard"
            element={
              <ProfileGuard>
                <StudentDashboard />
              </ProfileGuard>
            }
          />
          <Route path="/setup-profile" element={<ProfileSetup />} />
          <Route path="/student/guidelines" element={<GuidelinesPage />} />
          <Route path="/student/requestsupervisor" element={<Request />} />
          <Route path="/student/logsheet" element={<Logsheet />} />
        </Routes>
      </div>
      {!isStudentPath && <Footer />}

    </>
  );
};

export default App;
