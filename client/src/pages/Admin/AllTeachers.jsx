import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";

const AllTeachers = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // SAFELY extract state
  const teacherId = location.state?.teacherId;
  const projects = location.state?.projects || [];

  // SAMPLE TEACHER DATA
  const teachers = [
    {
      id: 101,
      name: "Prof. Sharma",
      phone: "9800000001",
      email: "sharma@college.edu",
      expertise: "AI, Machine Learning",
      designation: "Professor",
    },
    {
      id: 102,
      name: "Prof. Koirala",
      phone: "9800000002",
      email: "koirala@college.edu",
      expertise: "Web Development",
      designation: "Assistant Professor",
    },
    {
      id: 103,
      name: "Prof. Joshi",
      phone: "9800000003",
      email: "joshi@college.edu",
      expertise: "Databases, OS",
      designation: "Lecturer",
    },
  ];

  // Find teacher safely
  const teacher = teachers.find((t) => t.id === teacherId);

  // If page refreshed or opened directly
  if (!teacherId || !teacher) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <AdminHeader adminName="Deekshya Badal" />
          <p className="text-red-600 font-semibold">
            Teacher data not found. Please navigate from Projects page.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const assignedProjects = projects.filter(
    (p) => p.assignedTeacher?.id === teacherId
  );

  const [designation, setDesignation] = useState(teacher.designation);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <AdminHeader adminName="Deekshya Badal" />

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Teacher Details
        </h2>

        {/* Teacher Info */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <p className="mb-2"><strong>Name:</strong> {teacher.name}</p>
          <p className="mb-2"><strong>Phone:</strong> {teacher.phone}</p>
          <p className="mb-2"><strong>Email:</strong> {teacher.email}</p>
          <p className="mb-2"><strong>Expertise:</strong> {teacher.expertise}</p>

          <div className="mb-2">
            <strong>Designation:</strong>
            <select
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="ml-3 p-2 border rounded"
            >
              <option>Lecturer</option>
              <option>Visiting Faculty</option>
              <option>Assistant Professor</option>
              <option>Professor</option>
            </select>
          </div>
        </div>

        {/* Assigned Projects */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4">
            Assigned Projects
          </h3>

          {assignedProjects.length === 0 ? (
            <p className="text-gray-600">No projects assigned</p>
          ) : (
            <ul className="list-disc ml-6">
              {assignedProjects.map((p) => (
                <li key={p.id} className="mb-1">
                  {p.title} — <span className="text-gray-600">{p.teamName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllTeachers;
