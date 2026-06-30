import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminHeader from "../../components/Admin/AdminHeader";
import ProjectDetailModal from "../../components/Admin/ProjectDetailModal";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const pastelColors = [
  
  { bg: "bg-teal-50", border: "border-teal-200" },
  { bg: "bg-indigo-50", border: "border-indigo-200" },
 
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
        <p className="p-6 text-gray-500 text-sm sm:text-base">
          No teams found{selectedSemester !== "all" ? ` for Semester ${selectedSemester}` : ""}.
        </p>
      );

    return (
      <>
        {/* ── Mobile: stacked cards (sm and below) ── */}
        <div className="flex flex-col gap-3 sm:hidden">
          {teamsList.map((team, idx) => {
            const color = pastelColors[idx % pastelColors.length];
            const supervisorCount = team.supervisor
              ? countAssignedProjects(team.supervisor._id)
              : 0;
            const dept =
              team.department ||
              team.leaderId?.department ||
              team.members?.[0]?.department ||
              "N/A";
            const semester = getTeamSemester(team) || "N/A";

            return (
              <div
                key={team._id}
                className={`${color.bg} ${color.border} border rounded-xl shadow p-4 flex flex-col gap-2`}
              >
                <p
                  className="text-primary font-semibold cursor-pointer break-words"
                  onClick={() => navigate(`/admin/teamdetail/${team._id}`)}
                >
                  {team.name || team.projectTitle || "Unnamed Team"}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-500">Dept:</span>{" "}
                    <span className="break-words">{dept}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Sem:</span>{" "}
                    {semester}
                  </p>
                </div>

                {isAssigned ? (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-500">Supervisor:</span>{" "}
                    {team.supervisor
                      ? `${team.supervisor.name} (${supervisorCount}/${MAX_PROJECTS_PER_TEACHER})`
                      : "Not Assigned"}
                  </p>
                ) : (
                  <button
                    onClick={() => openModal(team)}
                    className="mt-1 w-full px-3 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors cursor-pointer text-sm"
                  >
                    Assign
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Tablet & up: table ── */}
        <div className="hidden sm:block w-full overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full table-auto text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-3 text-gray-600 whitespace-nowrap">Team Name / Project</th>
                <th className="p-3 text-gray-600 whitespace-nowrap">Department</th>
                <th className="p-3 text-gray-600 whitespace-nowrap">Semester</th>
                {isAssigned && <th className="p-3 text-gray-600 whitespace-nowrap">Supervisor</th>}
                {!isAssigned && <th className="p-3 text-gray-600 whitespace-nowrap">Actions</th>}
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

                    <td className="p-3 max-w-[180px] whitespace-normal break-words">
                      {team.department ||
                        team.leaderId?.department ||
                        team.members?.[0]?.department ||
                        "N/A"}
                    </td>

                    <td className="p-3 max-w-[200px] break-words">
                      {getTeamSemester(team) || "N/A"}
                    </td>

                    {isAssigned && (
                      <td className="p-3 max-w-[200px] break-words">
                        {team.supervisor
                          ? `${team.supervisor.name} (${supervisorCount}/${MAX_PROJECTS_PER_TEACHER})`
                          : "Not Assigned"}
                      </td>
                    )}

                    {!isAssigned && (
                      <td className="p-3 max-w-[200px] break-words">
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
      </>
    );
  };

  return (
    <div className="flex min-h-screen h-screen bg-gray-50 overflow-x-hidden">
      <AdminSidebar />
      <div className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 overflow-auto h-full">
        <AdminHeader />

        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Teams Management
        </h2>

        {/* ── Summary Count Cards ── */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="flex items-center gap-3 bg-white rounded-xl shadow px-4 sm:px-5 py-3 sm:py-4 w-full">
            <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">Assigned</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{assignedTeams.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white rounded-xl shadow px-4 sm:px-5 py-3 sm:py-4 w-full">
            <div className="w-10 h-10 shrink-0 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">Unassigned</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{unassignedTeams.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white rounded-xl shadow px-4 sm:px-5 py-3 sm:py-4 w-full col-span-1 xs:col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">Total Teams</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{allTeams.length}</p>
            </div>
          </div>
        </div>

        {/* ── Search & Semester Filter ── */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4 items-stretch sm:items-center">
          {/* Text search */}
          <div className="relative w-full sm:flex-1 sm:max-w-sm">
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

          <div className="flex gap-3 w-full sm:w-auto">
            {/* Semester filter */}
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
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
                className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden xs:inline">Clear filters</span>
                <span className="xs:hidden">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Toggle Tabs ── */}
        <div className="flex flex-row gap-2 sm:gap-3 mb-4">
          <button
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base ${activeTab === "unassigned"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => setActiveTab("unassigned")}
          >
            <span className="truncate">Unassigned</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${activeTab === "unassigned"
                ? "bg-white/20 text-white"
                : "bg-gray-300 text-gray-600"
                }`}
            >
              {filteredUnassigned.length}
            </span>
          </button>

          <button
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base ${activeTab === "assigned"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => setActiveTab("assigned")}
          >
            <span className="truncate">Assigned</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${activeTab === "assigned"
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
