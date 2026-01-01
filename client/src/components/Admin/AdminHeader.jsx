import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { assets } from "../../assets/assets";

const AdminHeader = ({ adminName = "Admin" }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // API call only
      await axios.post("/auth/logout");

      // Redirect after successful logout
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex justify-between items-center bg-primary p-5 rounded-xl shadow-md mb-8">
      {/* Left Section */}
      <NavLink to="/" className="flex items-center gap-4">
        <img src={assets.ku_logo} alt="ku_logo" className="h-12" />
        <div className="text-white">
          <div className="text-xl font-semibold">Welcome, {adminName}</div>
          <div className="text-lg font-semibold">Kathmandu University</div>
          <div className="text-sm">Student Project Management Platform</div>
        </div>
      </NavLink>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="bg-secondary text-primary font-semibold px-5 py-2 rounded-lg
                   hover:bg-secondary/80 transition-all duration-200"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminHeader;
