import React, { useState, useEffect } from "react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AddTeacherModal from "../../components/Admin/AddTeacherModal";
import ResetPasswordModal from "../../components/Admin/ResetPasswordModal";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


const pastelColors = [
  { bg: "bg-indigo-50", border: "border-indigo-100" },
  { bg: "bg-teal-50", border: "border-teal-100" },
];

axios.defaults.withCredentials = true;

const TeachersManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("regular"); // "regular" or "visiting"
  const navigate = useNavigate();


  // Fetch all teachers
  const fetchTeachers = async () => {
    try {
      const res = await axios.get("/api/admin/get-teachers");
      if (res.data.success) {
        // Add flags for frontend
        const regularTeachers = res.data.regularFaculty.map((t) => ({
          ...t,
          active: t.activeStatus,
          isVisiting: false,
        }));
        const visitingTeachers = res.data.visitingFaculty.map((t) => ({
          ...t,
          active: t.activeStatus,
          isVisiting: true,
        }));

        // Merge into one array for filtering
        setTeachers([...regularTeachers, ...visitingTeachers]);
      } else {
        setTeachers([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch teachers");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Toggle active/inactive
  // Toggle active/inactive
  const handleToggle = async (id) => {
    try {
      const teacher = teachers.find((t) => t._id === id);
      if (!teacher) return;

      const res = await axios.patch(`/api/admin/get-teachers/${id}/status`);
      if (res.data.success) {
        // Use the updated status from the backend response
        const updatedStatus = res.data.teacher?.activeStatus ?? !teacher.active;

        setTeachers((prev) =>
          prev.map((t) => (t._id === id ? { ...t, active: updatedStatus } : t))
        );
        toast.success(
          `${teacher.name} is now ${updatedStatus ? "Active" : "Inactive"}`
        );
      } else {
        toast.error("Status update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };
  // Add visiting faculty
  const handleAddTeacher = async (teacherData) => {
    try {
      const res = await axios.post("/api/admin/create-visiting-teacher", teacherData);
      if (res.data.success) {
        const newTeacher = {
          ...res.data.teacher,
          active: res.data.teacher.activeStatus,
          isVisiting: true,
        };
        setTeachers((prev) => [...prev, newTeacher]);
        toast.success("Visiting faculty added successfully!");
        setModalOpen(false);
      } else {
        toast.error(res.data.message || "Failed to add teacher");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add teacher");
    }
  };

  // Reset password
  const handleResetPassword = async (newPassword) => {
    try {
      const res = await axios.post("/api/admin/teacher/reset-password", {
        teacherId: selectedTeacher._id,
        newPassword,
      });
      if (res.data.success) {
        toast.success("Password reset successfully!");
        setResetModalOpen(false);
        setSelectedTeacher(null);
      } else {
        toast.error(res.data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reset password");
    }
  };

  // Filtered teachers by search
  const filteredTeachers = teachers.filter((t) => {
    const term = search.toLowerCase();
    return t.name.toLowerCase().includes(term) || t.email.toLowerCase().includes(term);
  });

  // Separate into regular and visiting
  const regularTeachers = filteredTeachers.filter((t) => !t.isVisiting);
  const visitingTeachers = filteredTeachers.filter((t) => t.isVisiting);

  // Render table rows
  const renderTable = (teacherList) =>
    teacherList.map((t, idx) => {
      const color = pastelColors[idx % pastelColors.length];
      return (
        <tr
          key={t._id}
          className={`${color.bg} ${color.border} border-b hover:bg-primary/20`}
        >
          <td
            className="p-3 text-primary"
          >
            {t.name}
          </td>

          <td className="p-3">{t.email}</td>
          <td className="p-3">
            <button
              onClick={() => handleToggle(t._id)}
              className="cursor-pointer rounded p-1 transition"
            >
              {t.active ? (
                <FaToggleOn className="text-green-500 text-2xl" />
              ) : (
                <FaToggleOff className="text-gray-400 text-2xl" />
              )}
            </button>
          </td>

          <td className="p-3">
            {t.isVisiting && (
              <button
                onClick={() => {
                  setSelectedTeacher(t);
                  setResetModalOpen(true);
                }}
                className="px-3 py-1 bg-primary text-white rounded hover:bg-yellow-600 cursor-pointer"
              >
                Reset Password
              </button>
            )}
          </td>
        </tr>
      );
    });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <AdminHeader />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Teachers Management</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 cursor-pointer"
          >
            Add Visiting Faculty
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full p-3 mb-4 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300 "
        />

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 -mb-px font-semibold cursor-pointer ${activeTab === "regular"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-primary"
              }`}
            onClick={() => setActiveTab("regular")}
          >
            Regular Faculty
          </button>

          <button
            className={`px-4 py-2 -mb-px font-semibold cursor-pointer ${activeTab === "visiting"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-primary"
              }`}
            onClick={() => setActiveTab("visiting")}
          >
            Visiting Faculty
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "regular" && (
          <div className="overflow-x-auto bg-white rounded-xl shadow p-4 mb-8">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-3 text-gray-600">Name</th>
                  <th className="p-3 text-gray-600">Email</th>
                  <th className="p-3 text-gray-600">Status</th>
                  <th className="p-3 text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {regularTeachers.length > 0 ? renderTable(regularTeachers) : (
                  <tr>
                    <td colSpan="4" className="p-3 text-center text-gray-500">
                      No regular teachers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "visiting" && (
          <div className="overflow-x-auto bg-white rounded-xl shadow p-4 mb-8">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-3 text-gray-600">Name</th>
                  <th className="p-3 text-gray-600">Email</th>
                  <th className="p-3 text-gray-600">Status</th>
                  <th className="p-3 text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {visitingTeachers.length > 0 ? renderTable(visitingTeachers) : (
                  <tr>
                    <td colSpan="4" className="p-3 text-center text-gray-500">
                      No visiting teachers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <AddTeacherModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAddTeacher={handleAddTeacher}
        />

        <ResetPasswordModal
          isOpen={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          teacher={selectedTeacher}
          onReset={handleResetPassword}
        />
      </div>
    </div>
  );
};

export default TeachersManagement;