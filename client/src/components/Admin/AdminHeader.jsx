// AdminHeader.jsx

import { NavLink } from "react-router-dom";

import { assets } from "../../assets/assets";

const AdminHeader = ({ adminName = "Admin" }) => {
  return (
    <div className="flex justify-between items-center bg-primary p-5 rounded-xl shadow-md mb-8">
      {/* Left: Logo and Welcome */}
      <NavLink to="/" className="flex items-center gap-4">
        <img src={assets.ku_logo} alt="ku_logo" className="h-12" />
        <div className="text-white">
          <div className="text-xl font-semibold">Welcome, {adminName}</div>
          <div className="text-lg font-semibold">Kathmandu University</div>
          <div className="text-sm">Student Project Management Platform</div>
        </div>
      </NavLink>

      {/* Right: Logout */}
      <button className="bg-primary text-secondary font-semibold px-5 py-2 rounded-lg hover:bg-[primary]/70 transition cursor-pointer">
        Logout
      </button>
    </div>
  );
};

export default AdminHeader;
