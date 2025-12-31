import React, { useState, useEffect } from "react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AddTeacherModal from "../../components/Admin/AddTeacherModal";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

const pastelColors = [
  { bg: "bg-blue-50", border: "border-blue-200" },
  { bg: "bg-green-50", border: "border-green-200" },
  { bg: "bg-purple-50", border: "border-purple-200" },
  { bg: "bg-pink-50", border: "border-pink-200" },
  { bg: "bg-yellow-50", border: "border-yellow-200" },
];

const TeachersManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch teachers periodically for auto-refresh
  const fetchTeachers = async () => {
    try {
      const res = await axios.get("/api/teachers");
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch teachers");
    }
  };

  useEffect(() => {
    fetchTeachers();
    const interval = setInterval(fetchTeachers, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async (id) => {
    try {
      const teacher = teachers.find((t) => t.id === id);
      const res = await axios.patch(`/api/teachers/${id}/toggle`, {
        active: !teacher.active,
      });
      setTeachers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, active: res.data.active } : t))
      );
      toast.success(`${teacher.name} is now ${res.data.active ? "Active" : "Inactive"}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleAddTeacher = (teacher) => {
    setTeachers((prev) => [...prev, teacher]);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <AdminHeader adminName="Deekshya Badal" />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Teachers Management</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 cursor-pointer"
          >
            Add Visiting Faculty
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-3 text-gray-600">Name</th>
                <th className="p-3 text-gray-600">Email</th>
                <th className="p-3 text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t, idx) => {
                const color = pastelColors[idx % pastelColors.length];
                return (
                  <tr
                    key={t.id}
                    className={`${color.bg} ${color.border} border-b hover:shadow-md`}
                  >
                    <td className="p-3">{t.name} {t.isVisiting && <span className="text-xs text-purple-700 font-semibold">Visiting</span>}</td>
                    <td className="p-3">{t.email}</td>
                    <td className="p-3">
                      <button onClick={() => handleToggle(t.id)}>
                        {t.active ? (
                          <FaToggleOn className="text-green-500 text-2xl" />
                        ) : (
                          <FaToggleOff className="text-gray-400 text-2xl" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
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
