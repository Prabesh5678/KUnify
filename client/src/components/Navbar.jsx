import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  
  const {
    user,
    setUser,
    navigate,        
    showUserLogin,
    setShowUserLogin
  } = useAppContext();
  
 const logout = async () => {
   try {
     const { data } = await axios.get("/api/student/logout");
     if (data.success) {
       toast.success(data.message);
       setUser(null);
       navigate("/");
     } else {
       toast.error(data.message);
     }
   } catch (error) {
     toast.error(error.message);
   }
 };
  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-primary text-secondary backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 md:px-16 py-3  ">
        <NavLink to="/" className="flex items-center gap-3">
          <img
            src={assets.ku_logo}
            alt="ku_logo"
            className="h-12 hover:cursor-pointer"
          />
          <div className="leading-tight">
            <div className="text-lg font-semibold">Kathmandu University</div>
            <div className="text-sm">Student Project Management Platform</div>
          </div>
        </NavLink>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-10 text-base">
          <NavLink to="/" className="relative pb-1">
            {({ isActive }) => (
              <span
                className={
                  isActive
                    ? "after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[3px] after:bg-secondary"
                    : ""
                }
              >
                Home
              </span>
            )}
          </NavLink>
          <NavLink to="/about-spmp">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>

          {/* Login / Logout button */}
          {!user ? (
            <button
              onClick={() => {
                setOpen(false);
                setShowUserLogin(true);
              }}
              className="cursor-pointer"
            >
              Login
            </button>
          ) : (
            <button onClick={logout} className="cursor-pointer">
              Logout
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="18"
            viewBox="0 0 24 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="2" rx="1" fill="white" />
            <rect y="8" width="24" height="2" rx="1" fill="white" />
            <rect y="16" width="24" height="2" rx="1" fill="white" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden bg-primary text-secondary px-6 pb-3 flex flex-col gap-2 ${
          open ? "block" : "hidden"
        }`}
      >
        <NavLink to="/" onClick={() => setOpen(false)} className="py-1">
          Home
        </NavLink>
        <NavLink
          to="/about-spmp"
          onClick={() => setOpen(false)}
          className="py-1"
        >
          About
        </NavLink>
        <NavLink to="/contact" onClick={() => setOpen(false)} className="py-1">
          Contact
        </NavLink>

        {!user ? (
          <button
            onClick={() => {
              setOpen(false);
              setShowUserLogin(true);
            }}
            className="py-1 text-left w-full"
          >
            Login
          </button>
        ) : (
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="py-1 text-left w-full"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
