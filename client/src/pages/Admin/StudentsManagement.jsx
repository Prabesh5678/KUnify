import React, { useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import { FaUserGraduate, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.withCredentials = true;

const StudentsManagement = () => {
  const navigate = useNavigate();

  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [activeSemester, setActiveSemester] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async (semester) => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/get-students", {
        params: { semester },
      });

      if (res.data.success) {
        setStudents(res.data.students || []);
      } else {
        toast.error("Failed to load students");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterClick = (sem) => {
    setActiveSemester(sem);
    fetchStudents(sem);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  // Only yellow and orange pastel rows
  const pastelColors = [
    { bg: "bg-indigo-50", border: "border-indigo-100" },
    { bg: "bg-teal-50", border: "border-teal-100" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <AdminHeader />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <FaUserGraduate className="text-primary" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Students Management
            </h2>
          </div>

          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {/* Semester Buttons */}
        <div className="flex flex-wrap gap-3 mb-10">
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => handleSemesterClick(sem)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer
                ${
                  activeSemester === sem
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-primary/10"
                }
              `}
            >
              {sem} Semester
            </button>
          ))}
        </div>

        {/* Semester List */}
        {activeSemester && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 bg-primary rounded-full"></div>
              <h3 className="text-lg font-bold text-gray-700">
                {activeSemester} Semester List
              </h3>
            </div>

      <div className="bg-secondary rounded-2xl shadow-md border border-gray-100 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      {/* Table Head */}
      <thead className="bg-secondary/70">
        <tr>
          <th className="px-6 py-4 text-xs font-bold text-primary uppercase">
            Name
          </th>
          <th className="px-6 py-4 text-xs font-bold text-primary uppercase">
            Email
          </th>
          <th className="px-6 py-4 text-xs font-bold text-primary uppercase">
            Roll Number
          </th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody className="divide-y divide-gray-100">
        {loading ? (
          <tr>
            <td colSpan="3" className="px-6 py-10 text-center text-gray-400">
              Loading students...
            </td>
          </tr>
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((s, index) => (
            <tr
              key={s._id}
              className={`transition duration-200 hover:bg-primary/30 hover:text-white cursor-pointer ${
                pastelColors[index % pastelColors.length].bg
              }`}
            >
              <td className="px-6 py-4">
                <button
                  onClick={() =>
                    navigate("/admin/admin_std-details", { state: { student: s } })
                  }
                  className="font-semibold hover:underline cursor-pointer"
                >
                  {s.name}
                </button>
              </td>
              <td className="px-6 py-4 text-sm">{s.email}</td>
              <td className="px-6 py-4 text-sm">{s.rollNumber || "N/A"}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" className="px-6 py-10 text-center text-gray-400 italic">
              No students found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
</div>
        )}

        {!activeSemester && (
          <p className="text-gray-400 text-center italic mt-20">
            Select a semester to view students
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentsManagement;
