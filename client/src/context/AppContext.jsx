import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const[user,setIsUser]=useState(null);
  const [student, setstudent] = useState(null);
  const [isTeacher, setIsTeacher] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const[showUserLogin,setShowUserLogin]=useState(null);

  const value = { user,setIsUser,navigate, student, setstudent, isTeacher, setIsTeacher, isAdmin, setIsAdmin, showUserLogin,setShowUserLogin};

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
