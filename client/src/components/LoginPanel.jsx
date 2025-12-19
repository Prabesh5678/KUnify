
import { useAppContext } from "../context/AppContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const LoginPanel = () => {
  const { setUser, showUserLogin, setShowUserLogin } = useAppContext();
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

      if (!data?.success || !data?.student) {
        toast.error(data?.message || "Login failed.");
        return;
      }

      // 🔥 IMPORTANT: user === student
      setUser(data.student);

      setShowUserLogin(false);

      // 🔥 Navigate based on REAL backend data
      const profileCompleted = !!(
        data.student.department &&
        data.student.semester &&
        data.student.rollNumber &&
        data.student.subjectCode
      );

      navigate(profileCompleted ? "/student/dashboard" : "/setup-profile", {
        replace: true,
      });

      toast.success("Login successful!");
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Something went wrong during login.");
    }
  };

  const handleError = () => {
    toast.error("Google Login Failed");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="w-full max-w-md rounded-xl bg-[#111] text-gray-100 shadow-2xl border border-gray-800 px-8 py-10 relative">
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
          Kathmandu University students can log in using their official KU email
          (e.g.,{" "}
          <span className="text-gray-100">username@student.ku.edu.np</span>
          ).
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
