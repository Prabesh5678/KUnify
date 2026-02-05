import React, { useEffect, useState } from "react";
import { FaChalkboardTeacher, FaProjectDiagram, FaUsers, FaTasks } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import StatsCard from "../../components/Admin/StatsCard";

axios.defaults.withCredentials = true;

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalProjects: 0,
    activeProjects: 0,
  });

  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get("/api/admin/dashboard"); // correct route
      setStats(res.data);
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
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <AdminHeader adminName="Admin" />

        {/* Stats Section */}
        <div className="bg-blue-50/40 rounded-2xl p-6 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Students"
              value={loading ? "..." : stats.totalStudents}
              icon={<FaUsers />}
              color="blue"
            />
            <StatsCard
              title="Total Teachers"
              value={loading ? "..." : stats.totalTeachers}
              icon={<FaChalkboardTeacher />}
              color="purple"
            />
            <StatsCard
              title="Total Projects"
              value={loading ? "..." : stats.totalProjects}
              icon={<FaProjectDiagram />}
              color="green"
            />
            <StatsCard
              title="Active Projects"
              value={loading ? "..." : stats.activeProjects}
              icon={<FaTasks />}
              color="orange"
            />
          </div>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Teachers Management */}
          <button
            onClick={() => navigate("/admin/teachers")}
            className="w-full rounded-2xl p-5 shadow-sm hover:shadow-md flex justify-between items-center
                       bg-gradient-to-r from-purple-50 to-purple-100 transition transform hover:-translate-y-1"
          >
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-purple-200 rounded-xl">
                <FaChalkboardTeacher className="text-purple-700" size={26} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Teachers Management</p>
                <p className="text-sm text-gray-600">
                  View all teachers and toggle status
                </p>
              </div>
            </div>
            <span className="text-xl text-purple-700">→</span>
          </button>

          {/* Projects Management */}
          <button
            onClick={() => navigate("/admin/projects")}
            className="w-full rounded-2xl p-5 shadow-sm hover:shadow-md flex justify-between items-center
                       bg-gradient-to-r from-green-50 to-green-100 transition transform hover:-translate-y-1"
          >
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-green-200 rounded-xl">
                <FaProjectDiagram className="text-green-700" size={26} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Projects Management</p>
                <p className="text-sm text-gray-600">
                  View all projects and update status
                </p>
              </div>
            </div>
            <span className="text-xl text-green-700">→</span>
          </button>

          {/* All Teachers */}
          <button
            onClick={() => navigate("/admin/allteachers")}
            className="w-full rounded-2xl p-5 shadow-sm hover:shadow-md flex justify-between items-center
                       bg-gradient-to-r from-green-50 to-green-100 transition transform hover:-translate-y-1"
          >
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-green-200 rounded-xl">
                <FaProjectDiagram className="text-green-700" size={26} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">All Teachers</p>
                <p className="text-sm text-gray-600">
                  View all the teachers
                </p>
              </div>
            </div>
            <span className="text-xl text-green-700">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
