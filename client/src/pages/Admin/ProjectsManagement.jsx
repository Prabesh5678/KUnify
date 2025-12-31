// ProjectsManagement.jsx
import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import ProjectDetailModal from "../../components/Admin/ProjectDetailModal";
import { toast } from "react-hot-toast";

// Modern pastel/neutral colors for table rows
const pastelColors = [
  { bg: "bg-sky-50", border: "border-sky-200" },
  { bg: "bg-teal-50", border: "border-teal-200" },
  { bg: "bg-indigo-50", border: "border-indigo-200" },
  { bg: "bg-rose-50", border: "border-rose-200" },
  { bg: "bg-amber-50", border: "border-amber-200" },
];

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 🔹 Placeholder: fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      const data = [
        {
          id: 1,
          title: "Smart Parking System",
          abstract: "This project is about IoT-based smart parking...",
          keywords: "IoT, React",
          pdfUrl: "/pdfs/sample1.pdf",
          teamName: "Team Alpha",
          teachers: [
            { id: 101, name: "Prof. Alice" },
            { id: 102, name: "Prof. Bob" },
          ],
          assignedTeacher: null,
        },
        {
          id: 2,
          title: "AI Chatbot",
          abstract: "This project is about building an AI-powered chatbot...",
          keywords: "AI, ML",
          pdfUrl: "/pdfs/sample2.pdf",
          teamName: "Team Beta",
          teachers: [
            { id: 101, name: "Prof. Alice" },
            { id: 103, name: "Prof. Charlie" },
          ],
          assignedTeacher: null,
        },
      ];
      setProjects(data);
    };

    fetchProjects();
  }, []);

  const openModal = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleAssignTeacher = (teacherId, projectId) => {
    const projectIndex = projects.findIndex((p) => p.id === projectId);
    if (projectIndex === -1) return;

    const teacher = projects[projectIndex].teachers.find((t) => t.id === teacherId);
    if (!teacher) return;

    const updatedProjects = [...projects];
    updatedProjects[projectIndex].assignedTeacher = teacher;
    setProjects(updatedProjects);

    toast.success(`Teacher ${teacher.name} assigned to ${updatedProjects[projectIndex].title}`);
    setModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <AdminHeader adminName="Deekshya Badal" />

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Projects Management
        </h2>

        <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-3 text-gray-600">Project Title</th>
                <th className="p-3 text-gray-600">Team</th>
                <th className="p-3 text-gray-600">Assigned Teacher</th>
                <th className="p-3 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, idx) => {
                const color = pastelColors[idx % pastelColors.length];
                return (
                  <tr
                    key={p.id}
                    className={`${color.bg} ${color.border} border-b hover:shadow-md transition-all duration-200`}
                  >
                    <td className="p-3 font-medium text-gray-800">{p.title}</td>
                    <td className="p-3 text-gray-600">{p.teamName}</td>
                    <td className="p-3 text-gray-700">
                      {p.assignedTeacher ? p.assignedTeacher.name : "Not Assigned"}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => openModal(p)}
                        className="px-3 py-1 bg-primary text-white rounded hover:bg-primary transition-colors"
                      >
                        View / Assign
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ProjectDetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          project={selectedProject}
          onAssignTeacher={handleAssignTeacher}
        />
      </div>
    </div>
  );
};

export default ProjectsManagement;
