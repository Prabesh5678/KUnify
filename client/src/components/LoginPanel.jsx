// components/LoginPanel.jsx
{/*
import { useAppContext } from "../context/AppContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const LoginPanel = () => {
  const { setIsUser } = useAppContext();

  const handleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const email = decoded.email;

      if (!email.endsWith("@student.ku.edu.np")) {
        alert("Only KU student emails are allowed.");
        return;
      }

      setIsUser({
        name: decoded.name,
        email: decoded.email,
      });

      alert("Login successful!");
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong during login.");
    }
  };

  const handleError = () => {
    alert("Google Login Failed");
    console.log("CLIENT ID:", CLIENT_ID);

  };

  return (
    <div className="flex justify-center mt-10">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        text="continue_with"
        shape="rectangular"
        width="280"
      />
    </div>
  );
};

export default LoginPanel;
*/}
// components/LoginPanel.jsx
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
