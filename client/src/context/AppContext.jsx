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
const [isStudent, setIsStudent] = useState(false);
  // UI states
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showSignupPanel, setShowSignupPanel] = useState(false);

  // ✅ Selected subject
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Team code
  const [teamCode, setTeamCode] = useState(null);

  const [requestRefetchTrigger, setRequestRefetchTrigger] = useState(0);

const triggerRequestRefetch = () => {
  setRequestRefetchTrigger(prev => prev + 1);
};

 const fetchUser = async () => {
 // try {
    setLoadingUser(true);
try{
    /* ===================== ADMIN AUTH ===================== */
    try {
      const adminRes = await axios.get("/api/admin/dashboard");
      if (adminRes.data?.success) {
        setUser({ role: "admin" });
        setIsAdmin(true);
        setIsTeacher(false);
        setIsStudent(false);
        setStudentProfile(null);
        setSelectedSubject(null);
        setProfileSetupDone(true);
        return;
      }
    } catch (err) {
      console.warn("Admin not authenticated");
    }

    /* ===================== TEACHER AUTH ===================== */
    try {
      const teacherRes = await axios.get("/api/teacher/is-auth");
      if (teacherRes.data?.success && teacherRes.data?.user) {
        const teacherUser = {
          ...teacherRes.data.user,
          role: "teacher",
        };
        setUser(teacherUser);
        setIsTeacher(true);
        setIsAdmin(false);
        setIsStudent(false);

        setProfileSetupDone(teacherUser.isProfileCompleted === true);

        setStudentProfile(null);
        setSelectedSubject(null);
        return;
      }
    } catch (err) {
       if (err.response && err.response.status !== 401) {
    console.warn("Admin auth error:", err.response?.data?.message || err.message);
  }
    }

    /* ===================== STUDENT AUTH ===================== */
  try {
  const studentRes = await axios.get("/api/student/is-auth?populateTeam=true", { withCredentials: true });

  if (studentRes.data?.success && studentRes.data?.student) {
    const studentUser = { ...studentRes.data.student, role: "student" };

    setUser(studentUser);
    setIsStudent(true);
    setIsAdmin(false);
    setIsTeacher(false);

    // Profile setup
    const profileDone = !!(
      studentUser.department &&
      studentUser.semester &&
      studentUser.rollNumber &&
      studentUser.subjectCode
    );
    setProfileSetupDone(profileDone);

    setStudentProfile({
      department: studentUser.department,
      semester: studentUser.semester,
      rollNumber: studentUser.rollNumber,
      subjectCode: studentUser.subjectCode,
    });
    setSelectedSubject(studentUser.subjectCode || null);
    return;
  }
} catch (err) {
  console.warn("Student not authenticated:", err.response?.data?.message || err.message);
}


    // If no one is authenticated
    setUser(null);
    setIsAdmin(false);
    setIsTeacher(false);
    setIsStudent(false);
    setStudentProfile(null);
    setSelectedSubject(null);
    setProfileSetupDone(false);

  } catch (err) {
    console.error("Fetch user failed:", err);
    setUser(null);
     setIsAdmin(false);
      setIsTeacher(false);
      setIsStudent(false);
      setStudentProfile(null);
      setSelectedSubject(null);
      setProfileSetupDone(false);
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
      setIsAdmin(false);
      setIsTeacher(false);
      setIsStudent(false);
      setStudentProfile(null);
      setSelectedSubject(null);
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
    isStudent,
    setIsStudent,
    requestRefetchTrigger,
    triggerRequestRefetch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// 🔟 Custom hook
export const useAppContext = () => useContext(AppContext);

