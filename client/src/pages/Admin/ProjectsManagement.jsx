import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import ProjectDetailModal from "../../components/Admin/ProjectDetailModal";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const pastelColors = [
  { bg: "bg-sky-50", border: "border-sky-200" },
  { bg: "bg-teal-50", border: "border-teal-200" },
  { bg: "bg-indigo-50", border: "border-indigo-200" },
  { bg: "bg-rose-50", border: "border-rose-200" },
  { bg: "bg-amber-50", border: "border-amber-200" },
];

const MAX_PROJECTS_PER_TEACHER = 5;

const ProjectsManagement = () => {
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [unassignedTeams, setUnassignedTeams] = useState([]);
  const [activeTab, setActiveTab] = useState("unassigned"); // default
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();

  const fetchTeams = async () => {
    try {
      const res = await axios.get("/api/admin/teams");
      setAssignedTeams(res.data.assignedTeams);
      setUnassignedTeams(res.data.unassignedTeams);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load teams");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const countAssignedProjects = (teacherId) => {
    const allTeams = [...assignedTeams, ...unassignedTeams];
    return allTeams.filter(
      (t) => t.supervisor && t.supervisor._id === teacherId
    ).length;
  };

  const openModal = (team) => {
    setSelectedTeam(team);
    setModalOpen(true);
  };

  const handleAssignTeacher = async (teacherId, teamId) => {
    try {
      // call backend to assign teacher
      await axios.put(`/api/admin/assign-supervisor`, {
        teacherId,teamId,
      });

      // update frontend state
      let assignedTeam;
      const updatedUnassigned = unassignedTeams.filter((t) => {
        if (t._id === teamId) {
          assignedTeam = { ...t, supervisor: { _id: teacherId } }; // temporary
          return false;
        }
        return true;
      });

      setUnassignedTeams(updatedUnassigned);
      setAssignedTeams([assignedTeam, ...assignedTeams]);

      toast.success("Teacher assigned successfully");
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign teacher");
    }
  };

  const renderTable = (teamsList, isAssigned) => {
    if (!teamsList.length)
      return <p className="p-6 text-gray-500">No teams found</p>;

    return (
      <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="p-3 text-gray-600">Team Name / Project</th>
              <th className="p-3 text-gray-600">Department</th>
              <th className="p-3 text-gray-600">Semester</th>
              {isAssigned && <th className="p-3 text-gray-600">Supervisor</th>}
              {!isAssigned && <th className="p-3 text-gray-600">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {teamsList.map((team, idx) => {
              const color = pastelColors[idx % pastelColors.length];
              const supervisorCount = team.supervisor
                ? countAssignedProjects(team.supervisor._id)
                : 0;

              return (
                <tr
                  key={team._id}
                  className={`${color.bg} ${color.border} border-b hover:shadow-md transition-all duration-200`}
                >
                  <td
                    className="p-3 text-primary cursor-pointer"
                    onClick={() => navigate(`/admin/teamdetail/${team._id}`)}
                  >
                    {team.name || team.projectTitle || "Unnamed Team"}
                  </td>

                  <td className="p-3">
                    {team.department || team.leaderId?.department || team.members?.[0]?.department || "N/A"}
                  </td>

                  <td className="p-3">
                    {team.semester || team.leaderId?.semester || team.members?.[0]?.semester || "N/A"}
                  </td>

                  {isAssigned && (
                    <td className="p-3">
                      {team.supervisor
                        ? `${team.supervisor.name} (${supervisorCount}/${MAX_PROJECTS_PER_TEACHER})`
                        : "Not Assigned"}
                    </td>
                  )}

                  {!isAssigned && (
                    <td className="p-3">
                      <button
                        onClick={() => openModal(team)}
                        className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/80 transition-colors cursor-pointer"
                      >
                        Assign
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };


  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <AdminHeader />

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Teams Management
        </h2>

        {/* Toggle Buttons */}
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded cursor-pointer ${activeTab === "unassigned"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => setActiveTab("unassigned")}
          >
            Unassigned Teams
          </button>
          <button
            className={`px-4 py-2 rounded cursor-pointer ${activeTab === "assigned"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => setActiveTab("assigned")}
          >
            Assigned Teams
          </button>
        </div>

        {/* Table */}
        {activeTab === "unassigned"
          ? renderTable(unassignedTeams, false)
          : renderTable(assignedTeams, true)}

        {/* Modal */}
        {selectedTeam && (
          <ProjectDetailModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            project={selectedTeam}
            onAssignTeacher={handleAssignTeacher}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectsManagement;
