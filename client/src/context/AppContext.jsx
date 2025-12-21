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

  // ✅ Selected subject
  const [selectedSubject, setSelectedSubject] = useState(null);

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

        // Set selected subject immediately from backend
        setSelectedSubject(userData.subjectCode || null);

        // Roles
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

  // 5️⃣ Complete profile helper
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
      throw err;
    }
  };

  // 6️⃣ Save selected subject helper (instant + backend)
  const saveSelectedSubject = async (subject) => {
    try {
      setSelectedSubject(subject); // update context immediately
      setStudentProfile(prev => ({ ...prev, subjectCode: subject })); // keep profile consistent

      // 🔹 Save to backend immediately
      await axios.put("/api/student/profile-update", { subjectCode: subject }, {
        withCredentials: true,
      });

    } catch (err) {
      console.error("Failed to save selected subject:", err);
    }
  };

  // 7️⃣ Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // 10️⃣ Add leaveTeam helper
const leaveTeam = async (teamId) => {
  try {
    const { data } = await axios.post(
      `/api/team/${teamId}/leave`,
      {},
      { withCredentials: true }
    );

    if (data.success) {
      toast.success("You left the team successfully!");
      // Refresh user to update team info
      await fetchUser();
      return true;
    } else {
      toast.error(data.message || "Failed to leave the team");
      return false;
    }
  } catch (err) {
    console.error("Error leaving team:", err);
    toast.error("Something went wrong while leaving the team");
    return false;
  }
};

  // 8️⃣ Context value
  const value = {
    user,
    setUser,
    studentProfile,
    setStudentProfile,
    selectedSubject,
    saveSelectedSubject,
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
    leaveTeam,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// 9️⃣ Custom hook
export const useAppContext = () => useContext(AppContext);
