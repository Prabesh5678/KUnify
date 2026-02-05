import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext"; // <-- add this

const AdminHeader = ({ adminName = "Admin" }) => {
  const navigate = useNavigate();
  const { setUser } = useAppContext(); // <-- add this

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      const { data } = await axios.get(
        "/api/logout",
        {},
        { withCredentials: true },
      );
      if (data.success) {
        // Clear user context
        setUser(null);
        toast.success('Logged out')
        // Redirect to home/login page
        navigate("/");
      } else {
        toast.error("Failed to logout");
        console.error(data.message);
      }
    } catch (error) {
      console.error("Logout failed:", error);

    }
  };

  return (
    <div className="flex justify-between items-center bg-primary p-5 rounded-xl shadow-md mb-8">
      <NavLink to="/" className="flex items-center gap-4">
        <img src={assets.ku_logo} alt="ku_logo" className="h-12" />
        <div className="text-white">
          <div className="text-xl font-semibold">Welcome, {adminName}</div>
          <div className="text-lg font-semibold">Kathmandu University</div>
          <div className="text-sm">Student Project Management Platform</div>
        </div>
      </NavLink>

      <button
        onClick={handleLogout}
        title="Logout"
        className="bg-primary text-secondary font-semibold px-5 py-2 rounded-lg hover:bg-primary transition-all duration-200 cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminHeader;
