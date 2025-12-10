import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setIsUser] = useState(null);
  const [student, setstudent] = useState(null);
  const [isTeacher, setIsTeacher] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showSignupPanel, setShowSignupPanel] = useState(false);
  const [profileSetupDone, setProfileSetupDone] = useState(false);

  const value = {
    user, setIsUser, navigate, student, setstudent, isTeacher, setIsTeacher, isAdmin, setIsAdmin, showUserLogin, setShowUserLogin, showSignupPanel, setShowSignupPanel,
  profileSetupDone,
    setProfileSetupDone,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
