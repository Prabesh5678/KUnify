import React, { useState } from "react";
import StudentNavbar from "./StudentNavbar";
import Sidebar from "./Sidebar";

const StudentLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <StudentNavbar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            <Sidebar
                isSidebarOpen={isSidebarOpen}
            />

            <div className={`transition-all duration-300 mt-20${isSidebarOpen ? "ml-56" : "ml-20"} `}>
                {children}
            </div>
        </>
    );
};

export default StudentLayout;
