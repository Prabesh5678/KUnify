import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

axios.defaults.withCredentials = true;

const TEACHER_EMAIL = [
  "grocerease6699@gmail.com",
  "deekshyabadal@gmail.com",
  "subhechhakarkee@gmail.com",
  "sajanaranjitkar64@gmail.com",
];

const LoginPanel = () => {
  const { setUser, showUserLogin, setShowUserLogin, fetchUser } =
    useAppContext();
  const navigate = useNavigate();

  const [vfEmail, setVfEmail] = useState("");
  const [vfPassword, setVfPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingVF, setLoadingVF] = useState(false);

  if (!showUserLogin) return null;

  // ---- Google login for Teacher/Student ----
  const handleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const email = decoded.email;
      if (!email) return toast.error("Email not provided by Google.");
      const decodedData = {
        name: decoded.name,
        email,
        picture: decoded.picture,
        googleId: decoded.sub,
      };
      // ---- Teacher ----
      if (
        TEACHER_EMAIL.includes(email.toLowerCase()) ||
        email.toLowerCase().endsWith("@ku.edu.np")
      ) {
        const { data } = await axios.post(
          "/api/teacher/google-signin",
          { credential: decodedData },
          { withCredentials: true },
        );
        if (data.success) {
          toast.success("Teacher login successful!");
        }
        if (!data.success) {
          return toast.error("Teacher login failed");
        }

        setShowUserLogin(false);

        // fetch the real DB user into context
        const freshUser = await fetchUser("/teacher");
        
        // Navigate based on actual user in context
        if (freshUser?.isProfileCompleted) {
          navigate("/teacher/projects", { replace: true });
        } else {
          navigate("/teacher/profilesetup", { replace: true });
        }
        return;
      }

      // ---- Student ----
      else if (!email.endsWith("@student.ku.edu.np"))
        return toast.error("Only emails provided by KU is allowed");

      const { data } = await axios.post("/api/student/google-signin", {
        credential: decoded,
      });

      if (!data.success)
        return toast.error(data.message || "Student login failed");

      setUser({ ...data.student, role: "student" });
      console.log("from login panel, student data(user setted):", data.student.subjectCode);
      setShowUserLogin(false);

      const profileCompleted = !!(
        data.student.department &&
        data.student.semester &&
        data.student.rollNumber &&
        data.student.subjectCode
      );
      await fetchUser(); // Ensure context is updated before navigating
      navigate(profileCompleted ? "/student/home/" : "/setup-profile", {
        replace: true,
      });
      return toast.success("Login successful!");
    }
     catch (err) {
       console.error(err);
      toast.error("Something went wrong during login.");
      return;
    }
  };

  // ---- Visiting Faculty / Admin login ----
  const handleEmailChange = (e) => {
    setVfEmail(e.target.value);
  };

  const handleVisitingFacultyLogin = async () => {
    if (!vfEmail || !vfPassword)
      return toast.error("Please enter email and password");
    setLoadingVF(true);

    try {
      // Admin login
      const { data } = await axios.post("/api/admin/login", {
        email: vfEmail,
        password: vfPassword,
      });

      if (data.success) {
        setUser({ email: vfEmail, role: "admin" });
        setShowUserLogin(false);
        navigate("/admin/dashboard", { replace: true });
        setVfEmail("");
        setVfPassword("");
        toast.success("Admin login successful!");
        setLoadingVF(false);
        return;
      }
    } catch (err) {
      //  console.log("Not admin, trying Visiting Faculty login");
    }

    // Visiting Faculty fallback
    try {
      const { data } = await axios.post("/api/teacher/login", {
        email: vfEmail,
        password: vfPassword,
      });

      if (data.success) {
        setShowUserLogin(false);

        // fetch the real DB user from backend and populate context
        const freshUser = await fetchUser();

        // navigate based on actual profile completion
        if (freshUser?.isProfileCompleted) {
          navigate("/teacher/projects", { replace: true });
        } else {
          navigate("/teacher/profilesetup", { replace: true });
        }

        // reset login form
        setVfEmail("");
        setVfPassword("");
        toast.success("Visiting faculty login successful!");
      } else {
        toast.error("Unable to login");
        console.error(data?.messge);
      }
    } catch (err) {
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
            <span className="font-semibold text-gray-100">Students:</span> Use
            email ending with{" "}
            <span className="text-gray-100">@student.ku.edu.np</span>
          </p>
          <p>
            <span className="font-semibold text-gray-100">Teachers:</span> Use
            email ending with <span className="text-gray-100">@ku.edu.np</span>
          </p>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <h2 className="text-lg font-semibold mb-4 text-center">
            Visiting Faculty Login
          </h2>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={vfEmail}
              onChange={handleEmailChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // move focus to password input
                  document.getElementById("vfPasswordInput")?.focus();
                }
              }}
              className="w-full px-4 py-2 rounded-md bg-[#1a1a1a] border border-gray-700"
            />

            <div className="relative">
              <input
                id="vfPasswordInput"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={vfPassword}
                onChange={(e) => setVfPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // trigger login on Enter
                    handleVisitingFacultyLogin();
                  }
                }}
                className="w-full px-4 py-2 rounded-md bg-[#1a1a1a] border border-gray-700 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              onClick={handleVisitingFacultyLogin}
              disabled={loadingVF}
              className="w-full bg-primary text-white py-2 rounded-md cursor-pointer"
            >
              {loadingVF ? "Logging in..." : "Login as Visiting Faculty"}
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            setShowUserLogin(false);
            setVfEmail("");
            setVfPassword("");
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-lg cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default LoginPanel;
