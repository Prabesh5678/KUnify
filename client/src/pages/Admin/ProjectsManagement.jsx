import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSidebar";
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
  const [activeTab, setActiveTab] = useState("unassigned");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("all");

  const navigate = useNavigate();

  const fetchTeams = async () => {
    try {
      const res = await axios.get("/api/admin/teams");
      setAssignedTeams(res.data.assignedTeams);
      setUnassignedTeams(res.data.unassignedTeams);
    } catch (err) {
      toast.error("Failed to load teams");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [refreshFlag]);

  const handleModalClose = () => {
    setRefreshFlag((prev) => !prev);
  };

  // Derive all unique semesters across both lists
  const allTeams = [...assignedTeams, ...unassignedTeams];
  const allSemesters = [
    ...new Set(
      allTeams
        .map(
          (t) =>
            t.semester ||
            t.leaderId?.semester ||
            t.members?.[0]?.semester ||
            null
        )
        .filter(Boolean)
    ),
  ].sort();

  const getTeamSemester = (team) =>
    team.semester || team.leaderId?.semester || team.members?.[0]?.semester || "";

  const applyFilters = (teamsList) => {
    return teamsList.filter((team) => {
      const name = (team.name || team.projectTitle || "").toLowerCase();
      const dept = (
        team.department ||
        team.leaderId?.department ||
        team.members?.[0]?.department ||
        ""
      ).toLowerCase();
      const semester = getTeamSemester(team);

      const matchesSearch =
        searchQuery.trim() === "" ||
        name.includes(searchQuery.toLowerCase()) ||
        dept.includes(searchQuery.toLowerCase());

      const matchesSemester =
        selectedSemester === "all" || semester === selectedSemester;

      return matchesSearch && matchesSemester;
    });
  };

  const filteredUnassigned = applyFilters(unassignedTeams);
  const filteredAssigned = applyFilters(assignedTeams);

  const countAssignedProjects = (teacherId) => {
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
      await axios.put(`/api/admin/assign-supervisor`, { teacherId, teamId });

      let assignedTeam;
      const updatedUnassigned = unassignedTeams.filter((t) => {
        if (t._id === teamId) {
          assignedTeam = { ...t, supervisor: { _id: teacherId } };
          return false;
        }
        return true;
      });

      setUnassignedTeams(updatedUnassigned);
      setAssignedTeams([assignedTeam, ...assignedTeams]);

      toast.success("Teacher assigned successfully");
      setModalOpen(false);
    } catch (err) {
      toast.error("Failed to assign teacher");
    }
  };

  const renderTable = (teamsList, isAssigned) => {
    if (!teamsList.length)
      return (
        <p className="p-6 text-gray-500">
          No teams found{selectedSemester !== "all" ? ` for Semester ${selectedSemester}` : ""}.
        </p>
      );

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
                    className="p-3 text-primary cursor-pointer break-words max-w-[150px]"
                    onClick={() => navigate(`/admin/teamdetail/${team._id}`)}
                  >
                    {team.name || team.projectTitle || "Unnamed Team"}
                  </td>

                  <td className="p-3 break-words max-w-[150px]">
                    {team.department ||
                      team.leaderId?.department ||
                      team.members?.[0]?.department ||
                      "N/A"}
                  </td>

                  <td className="p-3">
                    {getTeamSemester(team) || "N/A"}
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

        {/* ── Summary Count Cards ── */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-3 bg-white rounded-xl shadow px-5 py-4 min-w-[170px]">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Assigned</p>
              <p className="text-2xl font-bold text-gray-800">{assignedTeams.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white rounded-xl shadow px-5 py-4 min-w-[170px]">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Unassigned</p>
              <p className="text-2xl font-bold text-gray-800">{unassignedTeams.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white rounded-xl shadow px-5 py-4 min-w-[170px]">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Teams</p>
              <p className="text-2xl font-bold text-gray-800">{allTeams.length}</p>
            </div>
          </div>
        </div>

        {/* ── Search & Semester Filter ── */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          {/* Text search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or department…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Semester filter */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="all">All Semesters</option>
            {allSemesters.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>

          {/* Active filter chip */}
          {(searchQuery || selectedSemester !== "all") && (
            <button
              onClick={() => { setSearchQuery(""); setSelectedSemester("all"); }}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          )}
        </div>

        {/* ── Toggle Tabs ── */}
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded cursor-pointer flex items-center gap-2 ${
              activeTab === "unassigned"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("unassigned")}
          >
            Unassigned Teams
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                activeTab === "unassigned"
                  ? "bg-white/20 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {filteredUnassigned.length}
            </span>
          </button>

          <button
            className={`px-4 py-2 rounded cursor-pointer flex items-center gap-2 ${
              activeTab === "assigned"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("assigned")}
          >
            Assigned Teams
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                activeTab === "assigned"
                  ? "bg-white/20 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {filteredAssigned.length}
            </span>
          </button>
        </div>

        {/* ── Table ── */}
        {activeTab === "unassigned"
          ? renderTable(filteredUnassigned, false)
          : renderTable(filteredAssigned, true)}

        {/* ── Modal ── */}
        {selectedTeam && (
          <ProjectDetailModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              handleModalClose();
            }}
            project={selectedTeam}
            onAssignTeacher={handleAssignTeacher}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectsManagement;
