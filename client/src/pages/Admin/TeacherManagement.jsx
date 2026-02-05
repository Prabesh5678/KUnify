import React, { useState, useEffect } from "react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AddTeacherModal from "../../components/Admin/AddTeacherModal";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const pastelColors = [
  { bg: "bg-yellow-50", border: "border-yellow-200" },
  { bg: "bg-orange-50", border: "border-orange-200" },
];

axios.defaults.withCredentials = true;

const TeachersManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // =====================
  // Fetch all teachers
  // =====================
  const fetchTeachers = async () => {
    try {
      const res = await axios.get("/api/admin/get-teachers");
      if (res.data.success) {
        setTeachers(res.data.teachers);
      } else {
        setTeachers(res.data); // fallback
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
  const handleToggle = async (id) => {
    try {
      const teacher = teachers.find((t) => t._id === id || t.id === id);
      const res = await axios.patch(`/api/admin/get-teachers/${id}/status`, {
        status: !teacher.active,
      });
      if (res.data.success) {
        setTeachers((prev) =>
          prev.map((t) =>
            t._id === id || t.id === id ? { ...t, active: !t.active } : t
          )
        );
        toast.success(
          `${teacher.name} is now ${!teacher.active ? "Active" : "Inactive"}`
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
        setTeachers((prev) => [...prev, res.data.teacher]);
        toast.success("Visiting faculty added successfully!");
      } else {
        toast.error(res.data.message || "Failed to add teacher");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add teacher");
    }
  };

  // Filter teachers by search
  const filteredTeachers = teachers.filter((t) => {
    const term = search.toLowerCase();
    return t.name.toLowerCase().includes(term) || t.email.toLowerCase().includes(term);
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
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            Add Visiting Faculty
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-3 text-gray-600">Name</th>
                <th className="p-3 text-gray-600">Email</th>
                <th className="p-3 text-gray-600">Status</th>
                <th className="p-3 text-gray-600">Password</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((t, idx) => {
                const color = pastelColors[idx % pastelColors.length];
                return (
                  <tr
                    key={t._id || t.id}
                    className={`${color.bg} ${color.border} border-b hover:bg-primary/20 cursor-pointer`}
                  >
                    <td className="p-3">
                      <button
                        onClick={() =>
                          navigate("/admin/allteachers/:id", { state: { teacherId: t._id || t.id, teacher: t, projects: t.projects || [] } })
                        }
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {t.name}
                      </button>
                    </td>
                    <td className="p-3">{t.email}</td>
                    <td className="p-3">
                      <button onClick={() => handleToggle(t._id || t.id)}>
                        {t.active ? (
                          <FaToggleOn className="text-green-500 text-2xl" />
                        ) : (
                          <FaToggleOff className="text-gray-400 text-2xl" />
                        )}
                      </button>
                    </td>
                    <td className="p-3 font-mono">{t.isVisiting ? t.password : "-"}</td>
                  </tr>
                );
              })}

              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-gray-500">
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <AddTeacherModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAddTeacher={handleAddTeacher}
        />
      </div>
    </div>
  );
};

export default TeachersManagement;
