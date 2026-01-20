import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

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

  // Team code
  const [teamCode, setTeamCode] = useState(null);

  // 3️⃣ Fetch logged-in user
  const fetchUser = async () => {
    try {
      setLoadingUser(true);

      /* ===================== TEACHER AUTH ===================== */
      /* ===================== TEACHER AUTH ===================== */
      try {
        const teacherRes = await axios.get("/api/teacher/is-auth");

        console.log("Teacher API response:", teacherRes.data);

        if (teacherRes.data?.success && teacherRes.data?.user) {
          const teacherUser = {
            ...teacherRes.data.user,
            role: "teacher",
          };

          // Compute profile completion
          const profileDone = teacherUser.isProfileCompleted === true;

          setUser(teacherUser);
          setIsTeacher(true);
          setIsAdmin(false);
          setProfileSetupDone(profileDone);

          // Clear student-specific state
          setStudentProfile(null);
          setSelectedSubject(null);

          setLoadingUser(false);
          return;
        }
      } catch (err) {
        console.warn("Teacher not authenticated:", err.response?.data || err.message);
      }



      /* ===================== STUDENT AUTH ===================== */
      try {
        const studentRes = await axios.get("/api/student/is-auth?populateTeam=true", {
          withCredentials: true,
        });

        if (studentRes.data?.student) {
          const userData = { ...studentRes.data.student, role: "student" };
          setUser(userData);

          // Compute profile setup
          const profileDone = !!(
            userData.department &&
            userData.semester &&
            userData.rollNumber &&
            userData.subjectCode
          );
          setProfileSetupDone(profileDone);

          setStudentProfile({
            department: userData.department,
            semester: userData.semester,
            rollNumber: userData.rollNumber,
            subjectCode: userData.subjectCode,
          });

          setSelectedSubject(userData.subjectCode || null);

          setIsTeacher(false);
          setIsAdmin(false);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Student auth failed:", err.response?.data || err.message);
        setUser(null);
      }
    } catch (err) {
      console.error("Fetch user failed:", err);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };


  // 4️⃣ Refresh user helper
  const refreshUser = async () => {
    await fetchUser();



    toast.success("Profile completed successfully!");

  };

  // 5️⃣ Complete profile helper (student)
  const completeProfile = async (formData) => {
    try {
      const res = await axios.put("/api/student/setup-profile", formData, {
        withCredentials: true,
      });
      console.log("Profile updated:", res.data);

      await fetchUser();
    } catch (err) {
      console.error("Failed to complete profile:", err);
      throw err;
    }
  };

  // 6️⃣ Save selected subject helper (student)
  const saveSelectedSubject = async (subject) => {
    try {
      setSelectedSubject(subject);
      setStudentProfile((prev) => ({ ...prev, subjectCode: subject }));

      await axios.put(
        "/api/student/profile-update",
        { subjectCode: subject },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to save selected subject:", err);
    }
  };

  // 7️⃣ Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // 8️⃣ Leave team helper
  const leaveTeam = async (teamId) => {
    try {
      const { data } = await axios.post(
        `/api/team/${teamId}/leave`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("You left the team successfully!");
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
  const logout = async () => {
    try {
      await axios.get("/api/logout", { withCredentials: true });
      setUser(null);
      setIsTeacher(false);
      setProfileSetupDone(false);
      toast.success("Logged out successfully!");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  // 9️⃣ Context value
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
    teamCode,
    setTeamCode,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// 🔟 Custom hook
export const useAppContext = () => useContext(AppContext);

