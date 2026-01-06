import TeacherSidebar from "../components/Teacher/TeacherSidebar";
import { Outlet } from "react-router-dom";

export default function TeacherLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <TeacherSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
