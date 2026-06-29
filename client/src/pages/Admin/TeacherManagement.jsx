import React, { useState, useEffect } from "react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import AddTeacherModal from "../../components/Admin/AddTeacherModal";
import ResetPasswordModal from "../../components/Admin/ResetPasswordModal";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


const pastelColors = [

  { bg: "bg-teal-50", border: "border-teal-200" },
  { bg: "bg-indigo-50", border: "border-indigo-200" },
  
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
      //console.error(err);
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
      //console.error(err);
      toast.error("Failed to update status");
    }
  };
  // Add visiting faculty
  const handleAddTeacher = async (teacherData) => {
    try {
      const res = await axios.post("/api/admin/create-visiting-teacher", teacherData);
      if (res.data.success) {
        toast.success("Visiting faculty added successfully!");
        const newTeacher = {
          ...res.data.teacher,
          active: res.data.teacher.activeStatus,
          isVisiting: true,
        };
        setTeachers((prev) => [...prev, newTeacher]);
        setModalOpen(false);
      } else {
       // console.error(res?.data?.message||'errored' );
        toast.error("Failed to add teacher");
      }
    } catch (err) {
     // console.error(err);
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
    //  console.error(err);
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

  // Render table rows (desktop / tablet table view)
  const renderTable = (teacherList) =>
    teacherList.map((t, idx) => {
      const color = pastelColors[idx % pastelColors.length];
      return (
        <tr
          key={t._id}
          className={`${color.bg} ${color.border} border-b hover:bg-primary/20`}
        >
          <td
            className="p-3 text-primary cursor-pointer hover:underline hover:text-primary/80"
            onClick={() =>
              navigate(`/admin/allteachers/${t._id || t.id}`, {
                state: { teacher: t, projects: [] },
              })
            }
          >
            {t.name}
          </td>


          <td className="p-3 max-w-[200px] break-words">{t.email}</td>
          <td className="p-3 max-w-[200px] break-words">
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

          <td className="p-3 max-w-[200px] break-words">
            {t.isVisiting && (
              <button
                onClick={() => {
                  setSelectedTeacher(t);
                  setResetModalOpen(true);
                }}
                className="px-3 py-1 bg-primary text-white rounded hover:bg-primary cursor-pointer"
              >
                Reset Password
              </button>
            )}
          </td>
        </tr>
      );
    });

  // Render cards (mobile view) — same data/handlers, just a stacked layout
  const renderCards = (teacherList) =>
    teacherList.map((t, idx) => {
      const color = pastelColors[idx % pastelColors.length];
      return (
        <div
          key={t._id}
          className={`${color.bg} ${color.border} border rounded-lg p-4 mb-3 shadow-sm`}
        >
          <div className="flex items-start justify-between gap-3">
            <button
              onClick={() =>
                navigate(`/admin/allteachers/${t._id || t.id}`, {
                  state: { teacher: t, projects: [] },
                })
              }
              className="text-left text-primary font-semibold hover:underline hover:text-primary/80 cursor-pointer break-words"
            >
              {t.name}
            </button>

            <button
              onClick={() => handleToggle(t._id)}
              className="cursor-pointer rounded p-1 transition shrink-0"
              aria-label={t.active ? "Set inactive" : "Set active"}
            >
              {t.active ? (
                <FaToggleOn className="text-green-500 text-2xl" />
              ) : (
                <FaToggleOff className="text-gray-400 text-2xl" />
              )}
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-1 break-words">{t.email}</p>

          {t.isVisiting && (
            <button
              onClick={() => {
                setSelectedTeacher(t);
                setResetModalOpen(true);
              }}
              className="mt-3 w-full px-3 py-2 bg-primary text-white rounded hover:bg-primary cursor-pointer text-sm"
            >
              Reset Password
            </button>
          )}
        </div>
      );
    });

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto h-full">
        <AdminHeader />
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Teachers Management</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 cursor-pointer w-full sm:w-auto"
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
        <div className="flex border-b mb-4 overflow-x-auto">
          <button
            className={`px-3 sm:px-4 py-2 -mb-px font-semibold cursor-pointer whitespace-nowrap text-sm sm:text-base ${activeTab === "regular"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-primary"
              }`}
            onClick={() => setActiveTab("regular")}
          >
            Regular Faculty
          </button>

          <button
            className={`px-3 sm:px-4 py-2 -mb-px font-semibold cursor-pointer whitespace-nowrap text-sm sm:text-base ${activeTab === "visiting"
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
          <div className="mb-8">
            {/* Mobile: stacked cards */}
            <div className="sm:hidden">
              {regularTeachers.length > 0 ? (
                renderCards(regularTeachers)
              ) : (
                <p className="text-center text-gray-500 py-6 bg-white rounded-xl shadow">
                  No regular teachers found.
                </p>
              )}
            </div>

            {/* Tablet/Desktop: table */}
            <div className="hidden sm:block overflow-x-auto bg-white rounded-xl shadow p-4">
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
          </div>
        )}

        {activeTab === "visiting" && (
          <div className="mb-8">
            {/* Mobile: stacked cards */}
            <div className="sm:hidden">
              {visitingTeachers.length > 0 ? (
                renderCards(visitingTeachers)
              ) : (
                <p className="text-center text-gray-500 py-6 bg-white rounded-xl shadow">
                  No visiting teachers found.
                </p>
              )}
            </div>

            {/* Tablet/Desktop: table */}
            <div className="hidden sm:block overflow-x-auto bg-white rounded-xl shadow p-4">
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
