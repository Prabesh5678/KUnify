import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// Axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();
let fetchDone=false;
export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // ===== States =====
  const [user, setUser] = useState(null); // {role: "admin"/"teacher"/"student", ...data}
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileSetupDone, setProfileSetupDone] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  // UI states
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showSignupPanel, setShowSignupPanel] = useState(false);

  // Optional helpers
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [teamCode, setTeamCode] = useState(null);

  // Refetch trigger
  const [requestRefetchTrigger, setRequestRefetchTrigger] = useState(0);
  const triggerRequestRefetch = () =>
    setRequestRefetchTrigger((prev) => prev + 1);

  //helper functions for fetchUser
  const tryAdmin = async (set) => {
    try {
      const res = await axios.get("/api/admin/is-auth");
      if (res.data?.success) {
        set.user({ role: "admin" });
        set.isAdmin(true);
        set.isTeacher(false);
        set.isStudent(false);
        set.studentProfile(null);
        set.selectedSubject(null);
        set.profileSetupDone(true);
        return true;
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.warn(
          "Admin auth error:",
          err.response?.data?.message || err.message,
        );
      }
      // 401 = just not admin, silently ignore
    }
    return false;
  };

  const tryStudent = async (set) => {
    try {
      const res = await axios.get("/api/student/is-auth?populateTeam=true");
      if (res.data?.success && res.data?.student) {
        const studentUser = { ...res.data.student, role: "student" };
        set.user(studentUser);
        set.isStudent(true);
        set.isAdmin(false);
        set.isTeacher(false);
        set.profileSetupDone(
          !!(
            studentUser.department &&
            studentUser.semester &&
            studentUser.rollNumber &&
            studentUser.subjectCode
          ),
        );
        set.studentProfile({
          department: studentUser.department,
          semester: studentUser.semester,
          rollNumber: studentUser.rollNumber,
          subjectCode: studentUser.subjectCode,
        });
        set.selectedSubject(studentUser.subjectCode || null);
        return true;
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.warn(
          "Student auth error:",
          err.response?.data?.message || err.message,
        );
      }
    }
    return false;
  };

  const tryTeacher = async (set) => {
    try {
      const res = await axios.get("/api/teacher/is-auth");
      if (res.data?.success && res.data?.user) {
        set.user({ ...res.data.user, role: "teacher" });
        set.isTeacher(true);
        set.isAdmin(false);
        set.isStudent(false);
        set.studentProfile(null);
        set.selectedSubject(null);
        set.profileSetupDone(res.data.user.isProfileCompleted === true);
        return true;
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.warn(
          "Teacher auth error:",
          err.response?.data?.message || err.message,
        );
      }
    }
    return false;
  };
  const clearUser = (set) => {
    set.user(null);
    set.isAdmin(false);
    set.isTeacher(false);
    set.isStudent(false);
    set.studentProfile(null);
    set.selectedSubject(null);
    set.profileSetupDone(false);
  };
  // ===== fetchUser - refresh-safe auth =====
  const set = {
    user: setUser,
    isAdmin: setIsAdmin,
    isTeacher: setIsTeacher,
    isStudent: setIsStudent,
    studentProfile: setStudentProfile,
    selectedSubject: setSelectedSubject,
    profileSetupDone: setProfileSetupDone,
  };
 const fetchUser = async (forcedPath) => {
   setLoadingUser(true);
   const path = forcedPath || window.location.pathname;


   try {
     let authenticated = false;

     if (path.startsWith("/admin")) authenticated = await tryAdmin(set);
     else if (path.startsWith("/student"))
       authenticated = await tryStudent(set);
     else if (path.startsWith("/teacher"))
       authenticated = await tryTeacher(set);
     else
       authenticated =
      (await tryStudent(set)) ||
      (await tryTeacher(set))||
         (await tryAdmin(set)) ;

     if (!authenticated) clearUser(set); // ← nothing matched, clear everything
   } catch (err) {
     console.error("Fetch user failed:", err);
     clearUser(set); // ← unexpected error, clear everything
   } finally {
     setLoadingUser(false);
   }
 };

  // ===== Logout =====
  const logout = async () => {
    try {
      await axios.get("/api/logout");
      clearUser(set);
      toast.success("Logged out successfully!");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  // ===== Complete profile helper =====
  const completeProfile = async (formData) => {
    try {
      await axios.put("/api/student/setup-profile", formData);
      await fetchUser();
      toast.success("Profile completed successfully!");
    } catch (err) {
      console.error("Failed to complete profile:", err);
      //   throw err;
    }
  };



  // ===== Fetch user on mount (only once, prevents React StrictMode double-call) =====
  useEffect(() => {
    if (fetchDone) return;
    fetchDone = true;
    fetchUser();
  }, []); // Empty array - only run once on mount

  // ===== Refetch when explicitly triggered =====
  useEffect(() => {
    if (requestRefetchTrigger >0) {
      fetchUser();
    }
  }, [requestRefetchTrigger]);

  // ===== Context value =====
  const value = {
    user,
    setUser,
    isAdmin,
    setIsAdmin,
    isTeacher,
    setIsTeacher,
    isStudent,
    setIsStudent,
    studentProfile,
    setStudentProfile,
    profileSetupDone,
    setProfileSetupDone,
    loadingUser,
    showUserLogin,
    setShowUserLogin,
    showSignupPanel,
    setShowSignupPanel,
    selectedSubject,
    setSelectedSubject,
    completeProfile,
    fetchUser,
    logout,
    navigate,
    teamCode,
    setTeamCode,
    requestRefetchTrigger,
    triggerRequestRefetch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
