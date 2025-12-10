// context/AppContext.jsx
{/*
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setIsUser] = useState(null);
  const [student, setstudent] = useState(null);
  const [isTeacher, setIsTeacher] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showSignupPanel, setShowSignupPanel] = useState(false);
  const [profileSetupDone, setProfileSetupDone] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const profileCompleted = localStorage.getItem("profileCompleted") === "true";
    const savedProfile = localStorage.getItem("profileData");

    if (profileCompleted && savedProfile) {
      const profile = JSON.parse(savedProfile);
      setIsUser((prev) => ({
        ...(prev || {}),
        profileCompleted: true,
        profile,
      }));
      setProfileSetupDone(true);
    }
    setLoadingUser(false);
  }, []);

  const value = {
    user,
    setIsUser,
    navigate,
    student,
    setstudent,
    isTeacher,
    setIsTeacher,
    isAdmin,
    setIsAdmin,
    showUserLogin,
    setShowUserLogin,
    showSignupPanel,
    setShowSignupPanel,
    profileSetupDone,
    setProfileSetupDone,
    loadingUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
*/}
// context/AppContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setIsUser] = useState(null);
  const [student, setstudent] = useState(null);
  const [isTeacher, setIsTeacher] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showSignupPanel, setShowSignupPanel] = useState(false);
  const [profileSetupDone, setProfileSetupDone] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  // hydrate from localStorage once
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const profileCompleted =
        localStorage.getItem("profileCompleted") === "true";
      const profileData = localStorage.getItem("profileData");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setIsUser({
          ...parsedUser,
          profileCompleted:
            parsedUser.profileCompleted || profileCompleted || false,
          profile: parsedUser.profile || (profileData && JSON.parse(profileData)) || null,
        });
        setProfileSetupDone(
          parsedUser.profileCompleted || profileCompleted || false
        );
      }
    } catch (err) {
      console.error("Error hydrating user from localStorage", err);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const value = {
    user,
    setIsUser,
    student,
    setstudent,
    isTeacher,
    setIsTeacher,
    isAdmin,
    setIsAdmin,
    showUserLogin,
    setShowUserLogin,
    showSignupPanel,
    setShowSignupPanel,
    profileSetupDone,
    setProfileSetupDone,
    loadingUser,
    navigate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
