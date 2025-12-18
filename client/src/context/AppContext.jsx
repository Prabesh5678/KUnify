
// context/AppContext.jsx
{/*}
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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
        setUser({
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
    setUser,
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
*/}

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// 1️⃣ Create context
export const AppContext = createContext();

// 2️⃣ Provider
export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // User states
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileSetupDone, setProfileSetupDone] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  // UI states
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showSignupPanel, setShowSignupPanel] = useState(false);

  // 3️⃣ Fetch logged-in user
  const fetchUser = async () => {
    try {
      setLoadingUser(true);
      const { data } = await axios.get("/api/student/is-auth", { withCredentials: true });

      if (data?.student) {
        const userData = data.student;
        setUser(userData);

        // Compute profile setup
        const profileDone = !!(
          userData.department &&
          userData.semester &&
          userData.rollNumber &&
          userData.subjectCode
        );
        setProfileSetupDone(profileDone);

        // Set student profile
        setStudentProfile({
          department: userData.department,
          semester: userData.semester,
          rollNumber: userData.rollNumber,
          subjectCode: userData.subjectCode
        });

        // Roles (currently only student)
        setIsTeacher(false);
        setIsAdmin(false);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // 4️⃣ Refresh user helper
  const refreshUser = async () => {
    await fetchUser();
  };

  // 5️⃣ Complete profile helper (can be used in ProfileSetup.jsx)
  const completeProfile = async (formData) => {
    try {
      const res = await axios.put("/api/student/setup-profile", formData, {
        withCredentials: true,
      });
      console.log("Profile updated:", res.data);

      // Refresh user state after update
      await fetchUser();
    } catch (err) {
      console.error("Failed to complete profile:", err);
      throw err; // allow the calling component to handle toast/errors
    }
  };

  // 6️⃣ Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // 7️⃣ Context value
  const value = {
    user,
    setUser,
    studentProfile,
    setStudentProfile,
    isTeacher,
    setIsTeacher,
    isAdmin,
    setIsAdmin,
    profileSetupDone,
    setProfileSetupDone,
    loadingUser,
    fetchUser,
    refreshUser,
    completeProfile,
    showUserLogin,
    setShowUserLogin,
    showSignupPanel,
    setShowSignupPanel,
    navigate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// 3️⃣ Custom hook
export const useAppContext = () => useContext(AppContext);
