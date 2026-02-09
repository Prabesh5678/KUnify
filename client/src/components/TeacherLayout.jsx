import TeacherSidebar from "../components/Teacher/TeacherSidebar";
import TeacherHeader from "./Teacher/TeacherHeader";
import { Outlet } from "react-router-dom";

const TeacherLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - fixed height */}
      <div className="h-screen sticky top-0">
        <TeacherSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header Container with side spacing */}
        <div className="px-6 mt-4">
          <TeacherHeader />
        </div>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-auto px-6 mt-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
