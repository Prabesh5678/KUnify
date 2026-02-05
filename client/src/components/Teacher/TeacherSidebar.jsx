import {
  LayoutGrid,
  FolderKanban,
  Bell,
  Users,
  AlertCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import axios from "axios"; 

export default function TeacherSidebar() {
  const { user, logout } = useAppContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();
  const [teamRequestCount, setTeamRequestCount] = useState(0);
  //const teamRequestCount = 5;

const handleLogout = async () => {
  try {
    await logout();
    navigate("/teacher/login");
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

useEffect(() => {
    if (showLogoutModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [showLogoutModal]);

useEffect(() => {
  const fetchTeamRequestsCount = async () => {
    try {
      const { data } = await axios.get("/api/teacher/teams?get=request-count", {
        withCredentials: true,
      });
      if (data.success) {
        setTeamRequestCount(data.count); // update badge dynamically
      } else {
        console.error("Failed to fetch team request count:", data.message);
      }
    } catch (err) {
      console.error("Error fetching team request count:", err);
    }
  };

  fetchTeamRequestsCount();

  // Optional: poll every 10 seconds
  const interval = setInterval(fetchTeamRequestsCount, 10000);

  return () => clearInterval(interval); // cleanup
}, []);


  // Hide sidebar on profile setup page
  if (location.pathname === "/teacher/profile-setup") {
    return null;
  }

  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { id: 1, label: "Dashboard", icon: <LayoutGrid size={20} />, to: "/teacher/dashboard" },
    { id: 2, label: "Team Projects", icon: <FolderKanban size={20} />, to: "/teacher/projects" },
    { id: 3, label: "Team Requests", icon: <Bell size={20} />, to: "/teacher/requests" },
    { id: 4, label: "Team Deficits", icon: <AlertCircle size={20} />, to: "/teacher/deficits" },
    { id: 5, label: "Settings", icon: <Settings size={20} />, to: "/teacher/settings" },
  ];

  return (
    <>
    <aside
      className={`h-screen bg-primary text-white flex flex-col justify-between transition-width duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-semibold">Teacher Panel</h1>
              <p className="text-gray-400 text-sm">Student Project Management Platform</p>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-[#1b2334]"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="px-2">
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive ? "bg-[#0f172a]" : "hover:bg-[#1b2334]"
                }`
              }
              title={item.label}  // tooltip
            >
              <div className="flex items-center gap-3">
                <div className="relative">
        {item.icon}
        {item.label === "Team Requests" && teamRequestCount > 0 && (
            <span
              className={`absolute text-white text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-500 
                ${collapsed ? "-top-2 -right-2" : "top-0 right-0 translate-x-[160px]"}`}
            >
              {teamRequestCount}
            </span>
          )}
      </div>

      {!collapsed && <span className="text-sm">{item.label}</span>}
      </div>
            </NavLink>
          ))}
        </nav>
      </div>
{/* Footer */}
<div className="border-t border-gray-700 p-4 space-y-4 flex flex-col items-center">
  {/* User Info */}
  <div
    className={`flex items-center gap-3 w-full ${
      collapsed ? "flex-col gap-2" : "flex-row"
    }`}
  >
    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-white">
      {user?.name?.charAt(0) || "T"}
    </div>

    {!collapsed && (
      <div className="flex flex-col">
        <p className="font-medium text-sm">{user?.name || "Teacher"}</p>
        <p className="text-gray-400 text-xs">{user?.email || "email@example.com"}</p>
      </div>
    )}
  </div>

  {/* Logout Button */}
  <button
     onClick={() => setShowLogoutModal(true)} 
    className={`flex items-center px-4 py-3 rounded-lg
                bg-primary hover:bg-[#1b2334] transition-colors ${
                  collapsed ? "justify-center w-16 px-0" :  "justify-start  w-full px-4"
                }`}
    title="Logout"
  >
    <LogOut size={20} />
    {!collapsed && <span className="text-sm font-medium ml-3">Logout</span>}
  </button>
  </div>
   </aside>
   
  {/* LOGOUT CONFIRMATION MODAL */}
{showLogoutModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
    <div className="bg-white rounded-xl p-6 w-96 text-center shadow-lg">
      <h3 className="text-xl font-semibold mb-4">
        Are you sure you want to logout?
      </h3>
      <div className="flex justify-center gap-4">
        <button
          onClick={handleLogout} // call your actual logout function here
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 cursor-pointer rounded-lg font-semibold"
        >
          Yes
        </button>
        <button
          onClick={() => setShowLogoutModal(false)} // close modal
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 cursor-pointer rounded-lg font-semibold"
        >
          No
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}
