import TeacherSidebar from "../components/Teacher/TeacherSidebar";

import { Outlet } from "react-router-dom";

const TeacherLayout = () => {
  return (
    <div className="flex min-h-screen">
      <TeacherSidebar />
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
