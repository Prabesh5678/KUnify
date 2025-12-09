import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import LoginPanel from "./components/LoginPanel";
import AboutSPMP from "./pages/AboutSPMP";
import ProfileSetup from "./pages/Student/ProfileSetup";
import InstructionsPage from "./pages/Student/Instructionpage";
import StudentDashboard from "./pages/Student/StudentDashboard";
import ProfileGuard from "./components/ProfileGuard";
const App = () => {
  const { pathname } = useLocation();

  const isStudentPath = pathname.includes("student");
  const isTeacherPath = pathname.includes("teacher");
  const isAdminPath = pathname.includes("admin");
  const isHomePath = pathname === "/";


  const hideNavbar = isAdminPath;

  const contentClass =
    !isHomePath && !isAdminPath ? "px-6 md:px-16 lg:px-24 xl:px-32" : "";

  return (
    <>
      {!hideNavbar && <Navbar />}

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
          {/*<Route
            path="/student/dashboard"
            element={
              <ProfileGuard>
                <StudentDashboard />
              </ProfileGuard>
            }
          />
          <Route path="/Instructionspage" element={<InstructionsPage />} />
          */ }



        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
