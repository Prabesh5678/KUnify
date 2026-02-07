import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import { FaUserGraduate, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.withCredentials = true;

const StudentsManagement = () => {
  const navigate = useNavigate();

  const departments = ["CE", "CS"];
  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [activeDepartment, setActiveDepartment] = useState("CE"); // CE default
  const [activeSemester, setActiveSemester] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch students from API
  const fetchStudents = async (department = "", semester = "", searchTerm = "") => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/get-students", {
        params: { department, semester, search: searchTerm },
      });

      if (res.data.success) {
        setStudents(res.data.students || []);
      } else {
        setStudents([]);
        toast.error("Failed to load students");
      }
    } catch (err) {
      console.error(err);
      setStudents([]);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  // Fetch CE students on initial render
  useEffect(() => {
    fetchStudents("CE");
  }, []);

  const handleDepartmentClick = (dept) => {
    setActiveDepartment(dept);
    setActiveSemester(null); // reset semester selection
    setStudents([]); // clear previous students
    fetchStudents(dept); // fetch all students for department if no semester selected
  };

  const handleSemesterClick = (sem) => {
    setActiveSemester(sem);
    fetchStudents(activeDepartment, sem, search);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    fetchStudents(activeDepartment || "", activeSemester || "", value);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const pastelColors = [
   { bg: "bg-sky-50", border: "border-sky-200" },
  { bg: "bg-teal-50", border: "border-teal-200" },
  { bg: "bg-indigo-50", border: "border-indigo-200" },
  { bg: "bg-rose-50", border: "border-rose-200" },
  { bg: "bg-amber-50", border: "border-amber-200" },
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {/* Department Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => handleDepartmentClick(dept)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer
                ${activeDepartment === dept
                  ? "bg-primary text-white shadow-md scale-105"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-primary/10"
                }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Semester Tabs */}
        {activeDepartment && (
          <div className="flex flex-wrap gap-3 mb-6">
            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => handleSemesterClick(sem)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer
                  ${activeSemester === sem
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-primary/10"
                  }`}
              >
                {sem} Semester
              </button>
            ))}
          </div>
        )}

        {/* Students Table */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <p className="text-center text-gray-400 py-6">Loading students...</p>
          ) : filteredStudents.length > 0 ? (
            <div className="bg-secondary rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-secondary/70">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Email</th>
                      <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Registration Number</th>
                      <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Department</th>
                      <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Semester</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((s, index) => (
                      <tr
                        key={s._id}
                        className={`transition duration-200 cursor-pointer ${pastelColors[index % pastelColors.length].bg
                          } hover:bg-primary/30`}
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
                        <td className="px-6 py-4 text-sm">{s.department || "N/A"}</td>
                        <td className="px-6 py-4 text-sm">{s.semester || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center italic py-6">
              No students found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsManagement;
