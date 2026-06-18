import TeacherSidebar from "../components/Teacher/TeacherSidebar";
import TeacherHeader from "./Teacher/TeacherHeader";
import { Outlet } from "react-router-dom";

const TeacherLayout = () => {
  return (
    <div className="flex min-h-screen h-screen bg-gray-50 overflow-x-hidden">
      {/* Sidebar - fixed height */}
      <div className="h-screen sticky top-0">
        <TeacherSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-auto px-6 mt-2">
          <div className="px-6 mt-4">
            <TeacherHeader />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
