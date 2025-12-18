import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Info, NotebookPen, Sheet, Settings, LogOut } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, setProfileSetupDone } = useAppContext();

  const menuItems = [
    { icon: Home, path: "/student/dashboard", label: "Dashboard" },
    {
      icon: NotebookPen,
      path: "/student/requestsupervisor",
      label: "Request Supervisor",
    },
    { icon: Info, path: "/student/guidelines", label: "Guidelines" },
    { icon: Sheet, path: "/student/logsheet", label: "Log Sheet" },
    { icon: Settings, path: "/student/settings", label: "Settings" },
  ];
  {
    /*
  const handleLogout = () => {
    // clear context
    setUser(null);
    setProfileSetupDone(false);

    // clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("profileCompleted");
    localStorage.removeItem("profileData");

    // navigate to home
    navigate("/", { replace: true });
    setIsSidebarOpen(false);
  };
  */
  }
  const handleLogout = async () => {
    // clear session in context
    try {
      
      const { data } = await axios.get("/api/student/logout");
      if (data.success) {
        setUser(null);
        setProfileSetupDone(false);
  
        // clear only user session object
        localStorage.removeItem("user");
        // OPTIONAL: keep or clear profile flags; doesn't matter if backend is source of truth.
        // localStorage.removeItem("profileCompleted");
        // localStorage.removeItem("profileData");
  
        // navigate to home and stay there as a logged-out user
        navigate("/", { replace: true });
        setIsSidebarOpen(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message||'Failed to logout');
      console.error(error.stack);
    }
  };

  return (
    <div
      className={`fixed top-15 left-0 h-screen bg-primary text-secondary
        transition-all duration-500 py-4 z-40 flex flex-col
        ${isSidebarOpen ? "w-56" : "w-20"}`}
    >
      <div className="flex flex-col gap-4 mt-4 flex-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={index}
              onClick={() => {
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-lg transition
                ${isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-300"}
              `}
            >
              <Icon size={22} strokeWidth={2.5} />
              {isSidebarOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Logout button at bottom */}
      <div className="mt-4 mb-10 px-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-gray-300 transition"
        >
          <LogOut size={22} strokeWidth={2.5} />
          {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
