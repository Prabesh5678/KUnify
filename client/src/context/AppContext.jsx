import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// Axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

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
  const triggerRequestRefetch = () => setRequestRefetchTrigger(prev => prev + 1);

  // ===== fetchUser - refresh-safe auth =====
  const fetchUser = async () => {
    setLoadingUser(true);
    try {
      // ---- ADMIN ----
      try {
        const adminRes = await axios.get("/api/admin/is-auth");
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
        // ignore 401
        if (err.response?.status && err.response.status !== 401) {
          console.warn("Admin auth error:", err.response?.data?.message || err.message);
        }
      }

      // ---- STUDENT ----
      try {
        const studentRes = await axios.get("/api/student/is-auth?populateTeam=true");
        if (studentRes.data?.success && studentRes.data?.student) {
          const studentUser = { ...studentRes.data.student, role: "student" };
          setUser(studentUser);
          setIsStudent(true);
          setIsAdmin(false);
          setIsTeacher(false);

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

          // Sync selectedSubject
          setSelectedSubject(studentUser.subjectCode || null);
          return;
        }
      } catch (err) {
        console.warn("Student not authenticated:", err.response?.data?.message || err.message);
      }

      // ---- TEACHER ----
      try {
        const teacherRes = await axios.get("/api/teacher/is-auth");
        if (teacherRes.data?.success && teacherRes.data?.user) {
          setUser({ ...teacherRes.data.user, role: "teacher" });
          setIsTeacher(true);
          setIsAdmin(false);
          setIsStudent(false);
          setStudentProfile(null);
          setSelectedSubject(null);
          setProfileSetupDone(teacherRes.data.user.isProfileCompleted === true);
          return;
        }
      } catch (err) {
        if (err.response?.status !== 401) {
          console.warn("Teacher auth error:", err.response?.data?.message || err.message);
        }
      }

      // ---- Not authenticated ----
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

  // ===== Logout =====
  const logout = async () => {
    try {
      await axios.get("/api/logout");
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

  // ===== Complete profile helper =====
  const completeProfile = async (formData) => {
    try {
      await axios.put("/api/student/setup-profile", formData);
      await fetchUser();
      toast.success("Profile completed successfully!");
    } catch (err) {
      console.error("Failed to complete profile:", err);
      throw err;
    }
  };

  // ===== Save selected subject =====
  const saveSelectedSubject = async (subject) => {
    try {
      setSelectedSubject(subject);
      setStudentProfile(prev => ({ ...prev, subjectCode: subject }));
      await axios.put("/api/student/profile-update", { subjectCode: subject });
    } catch (err) {
      console.error("Failed to save selected subject:", err);
    }
  };

  // ===== Fetch user on mount or when refetch triggered =====
  useEffect(() => {
    fetchUser();
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
    saveSelectedSubject,
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
