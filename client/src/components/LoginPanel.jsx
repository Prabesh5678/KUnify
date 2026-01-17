import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

axios.defaults.withCredentials = true;

const ADMIN_EMAIL = [
  "ssubhechhakarkee@gmail.com",
];

const TEACHER_EMAIL = [
  "grocerease6699@gmail.com",
  "deekshyabadal@gmail.com",
  "subhechhakarkee@gmail.com",
  "sajanaranjitkar64@gmail.com"
];

const LoginPanel = () => {
  const { setUser, showUserLogin, setShowUserLogin } = useAppContext();
  const navigate = useNavigate();

  const [vfName, setVfName] = useState("");
  const [vfPassword, setVfPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingVF, setLoadingVF] = useState(false);

  if (!showUserLogin) return null;

  const handleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const email = decoded.email;

      if (!email) {
        toast.error("Email not provided by Google.");
        return;
      }

      /* ===================== ADMIN LOGIN ===================== */
      if (ADMIN_EMAIL.includes(email.toLowerCase())) {
        setUser({
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
          role: "admin",
        });

        setShowUserLogin(false);
        navigate("/admin/dashboard", { replace: true });
        toast.success("Admin login successful!");
        return;
      }

      /* ===================== TEACHER LOGIN ===================== */
      if (
        TEACHER_EMAIL.includes(email.toLowerCase()) ||
        (email.endsWith("@ku.edu.np") && decoded.hd !== "student.ku.edu.np")
      ) {
        const teacherUser = {
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
          googleId: decoded.sub,
        };

        console.log("Teacher payload:", teacherUser);

        const { data } = await axios.post(
          "/api/teacher/google-signin",
          { credential: teacherUser },
          { withCredentials: true }
        );

        console.log("Teacher API response:", data);

        if (data?.success && data.user) {
          const backendUser = data.user;

          const userWithRole = {
            _id: backendUser._id || backendUser.id,   // support both
            name: backendUser.name,
            email: backendUser.email,
            picture: backendUser.avatar || backendUser.picture || "",
            role: backendUser.role || "teacher",     // force role
            isProfileCompleted: backendUser.isProfileCompleted || false,
            specialization: backendUser.specialization || null,
            googleId: backendUser.googleId || "",
          };

          setUser(userWithRole);
          setShowUserLogin(false);

          navigate(
            userWithRole.isProfileCompleted
              ? "/teacher/dashboard"
              : "/teacher/profilesetup",
            { replace: true }
          );

          console.log("User in context after login:", userWithRole);
        } else {
          toast.error(data?.message || "Teacher login failed");
        }

        return;
      }

      /* ===================== STUDENT LOGIN ===================== */
      if (
        !email.endsWith("@student.ku.edu.np") ||
        decoded.hd !== "student.ku.edu.np"
      ) {
        toast.error("Only KU student emails are allowed.");
        return;
      }

      const { data } = await axios.post("/api/student/google-signin", {
        credential: {
          name: decoded.name,
          email: decoded.email,
          googleId: decoded.sub,
          picture: decoded.picture,
        },
      });

      if (!data?.success || !data?.student) {
        toast.error(data?.message || "Login failed.");
        return;
      }

      setUser({ ...data.student, role: "student" });
      setShowUserLogin(false);

      const profileCompleted = !!(
        data.student.department &&
        data.student.semester &&
        data.student.rollNumber &&
        data.student.subjectCode
      );

      navigate(profileCompleted ? "/student/home" : "/setup-profile", {
        replace: true,
      });

      toast.success("Login successful!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong during login.");
    }
  };

  /* ===================== VISITING FACULTY ===================== */
  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^A-Za-z\s]/g, "").toUpperCase();
    setVfName(value);
  };

  const handleVisitingFacultyLogin = async () => {
    if (!vfName || !vfPassword) {
      toast.error("Please enter name and password");
      return;
    }

    try {
      setLoadingVF(true);

      setUser({
        name: vfName,
        role: "teacher",
        type: "visiting",
      });

      setShowUserLogin(false);
      navigate("/teacher/dashboard", { replace: true });
      toast.success("Visiting faculty login successful");
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setLoadingVF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-xl rounded-xl bg-[#111] text-gray-100 shadow-2xl border border-gray-800 px-10 py-10 relative">
        <h1 className="text-center text-2xl font-semibold mb-6">
          Login to Student Project Management Platform
        </h1>

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error("Google Login Failed")}
            useOneTap={false}
            width="280"
          />
        </div>

        <div className="text-sm text-gray-300 space-y-2 mb-6">
          <p>
            <span className="font-semibold text-gray-100">Students:</span>{" "}
            Use email ending with{" "}
            <span className="text-gray-100">@student.ku.edu.np</span>
          </p>
          <p>
            <span className="font-semibold text-gray-100">Teachers:</span>{" "}
            Use email ending with{" "}
            <span className="text-gray-100">@ku.edu.np</span>
          </p>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <h2 className="text-lg font-semibold mb-4 text-center">
            Visiting Faculty Login
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="FULL NAME"
              value={vfName}
              onChange={handleNameChange}
              className="w-full px-4 py-2 rounded-md bg-[#1a1a1a] border border-gray-700"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={vfPassword}
                onChange={(e) => setVfPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#1a1a1a] border border-gray-700 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              onClick={handleVisitingFacultyLogin}
              disabled={loadingVF}
              className="w-full bg-primary text-white py-2 rounded-md"
            >
              {loadingVF ? "Logging in..." : "Login as Visiting Faculty"}
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowUserLogin(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default LoginPanel;
