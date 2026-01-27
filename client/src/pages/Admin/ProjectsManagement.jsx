import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import ProjectDetailModal from "../../components/Admin/ProjectDetailModal";
import { toast } from "react-hot-toast";

const pastelColors = [
  { bg: "bg-sky-50", border: "border-sky-200" },
  { bg: "bg-teal-50", border: "border-teal-200" },
  { bg: "bg-indigo-50", border: "border-indigo-200" },
  { bg: "bg-rose-50", border: "border-rose-200" },
  { bg: "bg-amber-50", border: "border-amber-200" },
];

axios.defaults.withCredentials = true;

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // TEMP DATA UNTIL PROJECT API EXISTS
  const sampleProjects = [
    {
      id: 1,
      title: "Smart Attendance System",
      teamName: "Team Alpha",
      assignedTeacher: { id: 101, name: "Prof. Sharma" },
    },
    {
      id: 2,
      title: "AI Chatbot",
      teamName: "Team Beta",
      assignedTeacher: null,
    },
    {
      id: 3,
      title: "Online Exam Portal",
      teamName: "Team Gamma",
      assignedTeacher: { id: 103, name: "Prof. Joshi" },
    },
  ];

  const sampleTeachers = [
    { id: 101, name: "Prof. Sharma" },
    { id: 102, name: "Prof. Koirala" },
    { id: 103, name: "Prof. Joshi" },
  ];

  const MAX_PROJECTS_PER_TEACHER = 5;

  const countAssignedProjects = (teacherId) => {
    return projects.filter(
      (p) => p.assignedTeacher && p.assignedTeacher.id === teacherId
    ).length;
  };

  const fetchProjects = async () => {
    try {
      // ⚠️ No API exists yet
      // const res = await axios.get("/api/admin/projects");
      // setProjects(res.data.projects);

      setProjects(sampleProjects); // temporary
    } catch (err) {
      console.error("Failed to fetch projects", err);
      toast.error("Unable to load projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openModal = async (project) => {
    try {
      // ⚠️ No API exists yet
      // const res = await axios.get(`/api/admin/projects/${project.id}/suggested-teachers`);
      // setSelectedProject({ ...project, teachers: res.data.teachers });

      setSelectedProject({ ...project, teachers: sampleTeachers }); // temporary
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch suggested teachers");
    }
  };

  const handleAssignTeacher = async (teacherId, projectId) => {
    try {
      // ⚠️ No API exists yet
      // const res = await axios.post(`/api/admin/projects/${projectId}/assign-teacher`, { teacherId });

      const updatedProject = projects
        .map((p) =>
          p.id === projectId
            ? {
                ...p,
                assignedTeacher: sampleTeachers.find((t) => t.id === teacherId),
              }
            : p
        )
        .find((p) => p.id === projectId);

      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? updatedProject : p))
      );

      toast.success(
        `Teacher ${updatedProject.assignedTeacher.name} assigned to ${updatedProject.title}`
      );
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Assignment failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <AdminHeader />
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

                const count = p.assignedTeacher
                  ? countAssignedProjects(p.assignedTeacher.id)
                  : 0;

                return (
                  <tr
                    key={p.id}
                    className={`${color.bg} ${color.border} border-b hover:shadow-md transition-all duration-200`}
                  >
                    <td className="p-3 font-medium text-gray-800">{p.title}</td>
                    <td className="p-3 text-gray-600">{p.teamName}</td>
                    <td className="p-3 text-gray-700">
                      {p.assignedTeacher
                        ? `${p.assignedTeacher.name} (${count}/${MAX_PROJECTS_PER_TEACHER})`
                        : "Not Assigned"}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => openModal(p)}
                        className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
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

        {selectedProject && (
          <ProjectDetailModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            project={selectedProject}
            onAssignTeacher={handleAssignTeacher}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectsManagement;
