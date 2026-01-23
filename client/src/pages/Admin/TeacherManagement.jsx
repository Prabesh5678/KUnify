
import React, { useState, useEffect } from "react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AddTeacherModal from "../../components/Admin/AddTeacherModal";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
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
  const [search, setSearch] = useState(""); // <-- search state
  const navigate = useNavigate();
  const sampleTeachers = [
    {
      id: 1,
      name: "Prof. Sharma",
      email: "sharma@college.edu",
      active: true,
      isVisiting: false,
    },
    {
      id: 2,
      name: "Prof. Koirala",
      email: "koirala@college.edu",
      active: true,
      isVisiting: true,
      password: "visit@123",
    },
    {
      id: 3,
      name: "Prof. Joshi",
      email: "joshi@college.edu",
      active: false,
      isVisiting: true,
      password: "temp@456",
    },
  ];
  // =========================
  // Fetch teachers
  // =========================
  const fetchTeachers = async () => {
    try {
      // API CALL (commented)
      // const res = await axios.get("/api/teachers");
      // setTeachers(res.data);
      // TEMP: use sample data
      setTeachers(sampleTeachers);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch teachers");
    }
  };
  useEffect(() => {
    fetchTeachers(); // load once (no auto-refresh)
  }, []);
  // Toggle active/inactive
  const handleToggle = async (id) => {
    try {
      const teacher = teachers.find((t) => t.id === id);
      // API CALL (commented)
      // const res = await axios.patch(`/api/teachers/${id}/toggle`, {
      //   active: !teacher.active,
      // });
      // TEMP: local toggle
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, active: !t.active } : t
        )
      );
      toast.success(
        `${teacher.name} is now ${!teacher.active ? "Active" : "Inactive"}`
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };
  const handleAddTeacher = (teacher) => {
    setTeachers((prev) => [...prev, teacher]);
  };
  // 🔎 Filter teachers based on search
  const filteredTeachers = teachers.filter((t) => {
    const term = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.email.toLowerCase().includes(term)
    );
  });
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <AdminHeader />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Teachers Management
          </h2>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            Add Visiting Faculty
          </button>
        </div>
        {/* 🔎 SEARCH BAR */}
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
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((t, idx) => {
                const color = pastelColors[idx % pastelColors.length];
                return (
                  <tr
                    key={t.id}
                    className={`${color.bg} ${color.border} border-b hover:shadow-md`}
                  >
                    <td className="p-3">
                      <button
                        onClick={() => navigate(`/admin/teachers/${t.id}`)}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {t.name}
                      </button>
                      {t.isVisiting && (
                        <div className="text-sm text-purple-700">
                          Visiting Faculty | Password:{" "}
                          <span className="font-mono text-gray-800">
                            {t.password}
                          </span>
                        </div>
                      )}
                    </td>
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
              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-3 text-center text-gray-500">
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
