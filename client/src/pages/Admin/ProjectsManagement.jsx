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

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      const res = await axios.get("/admin/projects"); // GET projects from backend
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
      toast.error("Unable to load projects");
    }
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 10000);
    return () => clearInterval(interval);
  }, []);

  // Open modal and fetch suggested teachers for project
  const openModal = async (project) => {
    try {
      const res = await axios.get(
        `/admin/projects/${project.id}/suggested-teachers`
      ); // teachers sorted by cosine similarity
      setSelectedProject({ ...project, teachers: res.data });
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch suggested teachers");
    }
  };

  // Assign or change teacher
  const handleAssignTeacher = async (teacherId, projectId) => {
    try {
      const res = await axios.post(
        `/admin/projects/${projectId}/assign-teacher`,
        { teacherId }
      );

      // Update project in state
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? res.data : p))
      );

      toast.success(
        `Teacher ${res.data.assignedTeacher.name} assigned to ${res.data.title}`
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
