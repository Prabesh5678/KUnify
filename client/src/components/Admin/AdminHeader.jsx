import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import React, { useState } from "react";
const AdminHeader = ({ adminName = "Admin" }) => {
  const navigate = useNavigate();
  const { setUser } = useAppContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      const { data } = await axios.get("/api/logout", {
        withCredentials: true,
      });

      if (data.success) {
        setUser(null);
        toast.success("Logged out");
        navigate("/home", { replace: true });
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center bg-primary p-5 rounded-xl shadow-md mb-8">
        <NavLink to="/admin/dashboard" className="flex items-center gap-4">
          <img src={assets.ku_logo} alt="ku_logo" className="h-12" />
          <div className="text-white">
            <div className="text-xl font-semibold">Welcome, {adminName}</div>
            <div className="text-lg font-semibold">Kathmandu University</div>
            <div className="text-sm">Student Project Management Platform</div>
          </div>
        </NavLink>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          title="Logout"
          className="bg-primary text-secondary font-semibold px-5 py-2 rounded-lg hover:bg-primary transition-all duration-200 cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-96 text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              Are you sure you want to logout?
            </h3>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 cursor-pointer rounded-lg font-semibold"
              >
                Yes
              </button>

              <button
                onClick={() => setShowLogoutModal(false)}
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
};

export default AdminHeader;
