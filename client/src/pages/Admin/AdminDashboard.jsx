import React, { useEffect, useState } from "react";
import {
  FaChalkboardTeacher,
  FaProjectDiagram,
  FaUsers,
  FaTasks,
  FaUserGraduate,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminHeader from "../../components/Admin/AdminHeader";
import StatsCard from "../../components/Admin/StatsCard";

axios.defaults.withCredentials = true;

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalProjects: 0,
    totalRequests: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/admin/dashboard", {
        withCredentials: true,
      });

      setStats({
        totalStudents: res.data.totalStudents || 0,
        totalTeachers: res.data.totalTeachers || 0,
        totalProjects: res.data.totalProjects || 0,
        totalRequests: res.data.totalRequests || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <AdminSidebar />

      <div className="flex-1 p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8 overflow-x-hidden">
        <AdminHeader adminName="Admin" />

        {/* Stats Section */}
        <div className="bg-blue-50/40 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Students"
              value={loading ? "..." : stats.totalStudents}
              icon={<FaUsers />}
              color="blue"
              onClick={() => navigate("/admin/admin_std")}
            />

            <StatsCard
              title="Total Teachers"
              value={loading ? "..." : stats.totalTeachers}
              icon={<FaChalkboardTeacher />}
              color="purple"
              onClick={() => navigate("/admin/admin_teachers")}
            />

            <StatsCard
              title="Total Projects"
              value={loading ? "..." : stats.totalProjects}
              icon={<FaProjectDiagram />}
              color="green"
              onClick={() => navigate("/admin/projects")}
            />

            <StatsCard
              title="Pending Requests"
              value={loading ? "..." : stats.totalRequests}
              icon={<FaTasks />}
              color="orange"
              onClick={() => navigate("/admin/requestteacher")}
            />
          </div>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Student Management */}
          <button
            onClick={() => navigate("/admin/admin_std")}
            className="w-full rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md
                      flex justify-between items-center
                      bg-gradient-to-r from-purple-50 to-purple-100
                      transition transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="p-2 sm:p-3 bg-purple-200 rounded-xl flex-shrink-0">
                <FaUserGraduate className="text-purple-700" size={22} />
              </div>

              <div className="text-left min-w-0">
                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                  Student Management
                </p>

                <p className="text-xs sm:text-sm text-gray-600">
                  View all students based on semester
                </p>
              </div>
            </div>

            <span className="text-lg sm:text-xl text-purple-700 flex-shrink-0">
              →
            </span>
          </button>

          {/* Projects Management */}
          <button
            onClick={() => navigate("/admin/projects")}
            className="w-full rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md
                      flex justify-between items-center
                      bg-gradient-to-r from-green-50 to-green-100
                      transition transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="p-2 sm:p-3 bg-green-200 rounded-xl flex-shrink-0">
                <FaProjectDiagram className="text-green-700" size={22} />
              </div>

              <div className="text-left min-w-0">
                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                  Projects Management
                </p>

                <p className="text-xs sm:text-sm text-gray-600">
                  View all projects and update status
                </p>
              </div>
            </div>

            <span className="text-lg sm:text-xl text-green-700 flex-shrink-0">
              →
            </span>
          </button>

          {/* All Teachers */}
          <button
            onClick={() => navigate("/admin/admin_teachers")}
            className="w-full rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md
                      flex justify-between items-center
                      bg-gradient-to-r from-orange-50 to-orange-100
                      transition transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="p-2 sm:p-3 bg-orange-200 rounded-xl flex-shrink-0">
                <FaChalkboardTeacher
                  className="text-orange-700"
                  size={22}
                />
              </div>

              <div className="text-left min-w-0">
                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                  All Teachers
                </p>

                <p className="text-xs sm:text-sm text-gray-600">
                  View all the teachers
                </p>
              </div>
            </div>

            <span className="text-lg sm:text-xl text-orange-700 flex-shrink-0">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;