import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";

const TeacherHeader = ({ teacherName = "Teacher" }) => {
  const navigate = useNavigate();
  const { logout } = useAppContext(); // central logout

  const handleLogout = async () => {
    try {
      await logout(); // API + state cleanup
      navigate("/teacher/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex justify-between items-center bg-primary p-5 shadow-md mb-8 rounded-none">
      {/* Left Section */}
      <NavLink to="/teacher/dashboard" className="flex items-center gap-4">
        <img src={assets.ku_logo} alt="ku_logo" className="h-12" />

        <div className="text-white">
          <div className="text-xl font-semibold">
            Welcome, {teacherName}
          </div>
          <div className="text-lg font-semibold">
            Kathmandu University
          </div>
          <div className="text-sm">
            Student Project Management Platform
          </div>
        </div>
      </NavLink>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="bg-primary text-secondary font-semibold px-5 py-2 rounded-lg
                   hover:bg-primary/80 transition-all duration-200 cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};

export default TeacherHeader;
