// TeachersManagement.jsx
import React, { useState, useEffect } from "react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AddTeacherModal from "../../components/Admin/AddTeacherModal";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";

// Soft pastel colors for rows (cycled)
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

  useEffect(() => {
    const fetchTeachers = async () => {
      const data = [
        { id: 1, name: "Alice", email: "alice@gmail.com", active: true },
        { id: 2, name: "Bob", email: "bob@gmail.com", active: false },
      ];
      setTeachers(data);
    };
    fetchTeachers();
  }, []);

  const handleToggle = (id) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  };

  const handleAddTeacher = (teacher) => {
    setTeachers((prev) => [
      ...prev,
      { id: Date.now(), active: true, ...teacher },
    ]);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <AdminHeader adminName="Deekshya Badal" />

        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Teachers Management</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 cursor-pointer"
          >
            Add Visiting Faculty
          </button>
        </div>

        {/* Teachers Table */}
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
                    <td className="p-3">{t.name}</td>
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

        {/* Add Teacher Modal */}
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
