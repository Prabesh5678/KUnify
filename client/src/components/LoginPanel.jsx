/*
import { useAppContext } from "../context/AppContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";  // ✅ add this

const LoginPanel = () => {
  const { setIsUser, showUserLogin, setShowUserLogin } = useAppContext();
  const navigate = useNavigate(); // ✅ create navigate function

  if (!showUserLogin) return null;

  const handleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const email = decoded.email;

      if (!email.endsWith("@student.ku.edu.np")) {
        alert("Only KU student emails are allowed.");
        return;
      }

      // mark as not completed so ProfileGuard knows to send user here on future protected routes
      const newUser = {
        name: decoded.name,
        email: decoded.email,
        profileCompleted: false,
      };

      setIsUser(newUser);
      setShowUserLogin(false);

      // ✅ navigate to one-time setup page right after login
      navigate("/setup-profile");

      alert("Login successful!");
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong during login.");
    }
  };

  const handleError = () => {
    alert("Google Login Failed");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Login</h2>
          <button
            onClick={() => setShowUserLogin(false)}
            className="text-sm text-gray-500"
          >
            ✕
          </button>
        </div>

        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          text="continue_with"
          shape="rectangular"
          width="280"
        />
      </div>
    </div>
  );
};

export default LoginPanel;
*/// src/components/LoginPanel.jsx
import { useAppContext } from "../context/AppContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const LoginPanel = () => {
  const { setIsUser, showUserLogin, setShowUserLogin, setProfileSetupDone } =
    useAppContext();
  const navigate = useNavigate();

  if (!showUserLogin) return null;

  const handleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const email = decoded.email;

      if (!email) {
        toast.error("Email not provided by Google.");
        return;
      }

      if (
        !email.endsWith("@student.ku.edu.np") ||
        decoded.hd !== "student.ku.edu.np"
      ) {
        toast.error("Only KU student emails are allowed.");
        return;
      }

      const baseUser = {
        name: decoded.name,
        email: decoded.email,
        googleId: decoded.sub,
        picture: decoded.picture,
      };

      const { data } = await axios.post("/api/student/google-signin", {
        credential: baseUser,
      });
      console.log("google-signin response:", data);

      if (!data.success) {
        toast.error(data.message || "Login failed.");
        return;
      }

      const fullUser = {
        ...baseUser,
        profileCompleted: data.profileCompleted || false,
        profile: data.profile || null,
      };

      setIsUser(fullUser);
      localStorage.setItem("user", JSON.stringify(fullUser));

      setShowUserLogin(false);

      if (fullUser.profileCompleted) {
        setProfileSetupDone(true);
        localStorage.setItem("profileCompleted", "true");
        if (fullUser.profile) {
          localStorage.setItem("profileData", JSON.stringify(fullUser.profile));
        }
        navigate("/student/dashboard");
      } else {
        setProfileSetupDone(false);
        localStorage.removeItem("profileCompleted");
        localStorage.removeItem("profileData");
        navigate("/setup-profile");
      }

      toast.success("Login successful!");
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Something went wrong during login.");
    }
  };

  const handleError = (error) => {
    console.error(error?.response?.data?.message || "error");
    toast.error("Google Login Failed");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="w-full max-w-md rounded-xl bg-[#111] text-gray-100 shadow-2xl border border-gray-800 px-8 py-10">
        <h1 className="text-center text-xl font-semibold mb-8">
          Continue with
        </h1>

        <div className="flex justify-center mb-8">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={false}
            text="Continue_with"
            shape="rectangular"
            width="260"
          />
        </div>

        <p className="text-sm text-center text-gray-300 mb-2">
          Kathmandu University students can log in using their official KU
          email (e.g.,{" "}
          <span className="text-gray-100">username@student.ku.edu.np</span>).
        </p>
        <p className="text-sm text-center text-gray-300 mb-8">
          Click <span className="font-semibold">“Login with KU Email”</span> to
          enter the Student Project Management Platform.
        </p>

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
