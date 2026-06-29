import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { ExternalLink } from "lucide-react";

const ProjectDetailModal = ({ isOpen, onClose, project, onAssignTeacher }) => {
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [suggestedTeachers, setSuggestedTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [similarityData, setSimilarityData] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);

  // Fetch suggested teachers using cosine similarity when modal opens
  useEffect(() => {
    if (!isOpen || !project) return;

    const fetchSuggestedTeachers = async () => {
      setLoading(true);
      try {
        const teamId = project._id || project.teamId;
        const res = await axios.get(`/api/admin/teacher-similarity/${teamId}`, {
          withCredentials: true,
        });

        if (res.data?.success && res.data.data) {
          const teamData = res.data.data;

          const teachers = teamData.teacherScores.map((score) => ({
            _id: score.teacherId?.toString(),
            name: score.teacherName || "Unknown",
            specialization: score.specialization || "N/A",
            similarityScore: parseFloat(score.similarityScore) || 0,
            displayName: `${score.teacherName} (Match: ${Math.round(parseFloat(score.similarityScore) * 100)}%)`,
          }));

          setSuggestedTeachers(teachers);
          setSimilarityData(teamData);
        }
      } catch (error) {
        console.error("Smart matching failed, loading all teachers:", error);

        const teachersRes = await axios.get("/api/admin/get-teachers", { withCredentials: true });
        if (teachersRes.data?.success) {
          const all = [...(teachersRes.data.regularFaculty || []), ...(teachersRes.data.visitingFaculty || [])];
          setSuggestedTeachers(all.map(t => ({
            _id: t._id,
            name: t.name,
            specialization: t.specialization,
            displayName: t.name,
            similarityScore: 0
          })));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedTeachers();
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handleAssign = async () => {
    if (!selectedTeacher) {
      toast.error("Please select a teacher to assign");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put(
        "/api/admin/assign-supervisor",
        {
          teamId: project._id,
          teacherId: selectedTeacher,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        // Update UI state if needed (example: mark teacher as assigned)
        setSuggestedTeachers((prev) =>
          prev.map((t) =>
            t._id === selectedTeacher ? { ...t, assigned: true } : t
          )
        );

        toast.success("Teacher assigned successfully!");

        setSelectedTeacher(""); // reset selection
        onClose?.();
      } else {
        // Backend returned success: false
        toast.error(res.data.message || "Assignment failed");
      }
    } catch (err) {
      console.error("Assign error:", err);

      // Only show toast if there really was a network or server error
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Assignment failed due to server error";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };


  const handleViewPDF = (url) => {
    if (!url) return toast.error("PDF not found");
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
      url
    )}&embedded=true`;
    window.open(viewerUrl, "_blank");
  };

  const teamName = project.team?.name || project.teamName || project.name || "Untitled Project";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-0 sm:p-4">
      <div className="relative bg-white rounded-none sm:rounded-2xl p-4 sm:p-6 w-full max-w-4xl overflow-y-auto h-full sm:h-auto sm:max-h-[90vh] shadow-lg">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-800 font-bold text-lg cursor-pointer z-10"
        >
          ✕
        </button>

        {/* Project Title */}
        <h2 className="text-xl sm:text-3xl font-bold mb-4 text-gray-800 border-b pb-2 pr-8">
          {project.proposal?.projectTitle || project.title || teamName}
        </h2>

        {/* Requested Teacher */}
        {/* Requested Teacher */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-xl shadow mb-4 space-y-2">
          <p className="font-medium text-sm sm:text-base break-words">
            Requested Teacher:{" "}
            <span className="text-gray-700">
              {project.supervisor?.name || "None"}
            </span>
          </p>
          <p className="font-medium text-sm sm:text-base flex flex-wrap items-center gap-2">
            <span>Teacher Acceptance Status:</span>
            {project.supervisorStatus === 'teacherApproved' ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                Accepted
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                Not Accepted
              </span>
            )}
          </p>
        </div>


        {/* Team Keywords */}
        {(project.keywords || similarityData?.keywords) && (
          <div className="bg-blue-50 p-3 sm:p-4 rounded-xl shadow mb-4">
            <p className="font-medium text-gray-700 mb-1 text-sm sm:text-base">Project Keywords:</p>
            <p className="text-xs sm:text-sm text-gray-600 italic break-words">
              {project.keywords || similarityData?.keywords}
            </p>
          </div>
        )}

        {/* Suggested Teachers with Cosine Similarity */}
        <div className="mt-4">
          <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
            Suggested Teachers (Ranked by Similarity)
          </label>

          {suggestedTeachers.length === 0 && !loading ? (
            <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-yellow-800 text-sm sm:text-base">
                No teacher suggestions available. This may be because:
              </p>
              <ul className="text-xs sm:text-sm text-yellow-700 mt-2 space-y-1 text-left sm:text-center">
                <li>• Team keywords are not set</li>
                <li>• No teachers have specializations defined</li>
                <li>• No active teachers available</li>
              </ul>
            </div>
          ) : (
            <>
              {/* Searchable Teacher Dropdown */}
              <div className="relative">
                {/* Trigger button */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setTeacherDropdownOpen((prev) => !prev);
                    setTeacherSearch("");
                  }}
                  className="w-full flex items-center justify-between p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50"
                >
                  <span className="text-sm text-gray-700 truncate pr-2">
                    {selectedTeacher
                      ? suggestedTeachers.find((t) => t._id === selectedTeacher)?.name || "Selected"
                      : loading
                        ? "Loading..."
                        : "-- Select Teacher --"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${teacherDropdownOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {teacherDropdownOpen && !loading && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    {/* Search input */}
                    <div className="p-2 border-b">
                      <input
                        type="text"
                        autoFocus
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                        placeholder="Search teacher..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                      />
                    </div>

                    {/* List */}
                    <div className="max-h-52 overflow-y-auto">
                      {/* None option */}
                      <div
                        onClick={() => {
                          setSelectedTeacher("");
                          setTeacherDropdownOpen(false);
                          setTeacherSearch("");
                        }}
                        className="px-4 py-2 text-sm text-gray-400 italic cursor-pointer hover:bg-red-50 border-b"
                      >
                        -- None --
                      </div>

                      {suggestedTeachers
                        .filter((t) =>
                          t.name?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                          t.specialization?.toLowerCase().includes(teacherSearch.toLowerCase())
                        )
                        .map((t) => (
                          <div
                            key={t._id}
                            onClick={() => {
                              setSelectedTeacher(t._id);
                              setTeacherDropdownOpen(false);
                              setTeacherSearch("");
                            }}
                            className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 flex justify-between items-center gap-2"
                          >
                            <span className="truncate">{t.name}</span>
                            {t.similarityScore > 0 && (
                              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
                                {Math.round(t.similarityScore * 100)}%
                              </span>
                            )}
                          </div>
                        ))}

                      {/* No results */}
                      {suggestedTeachers.filter((t) =>
                        t.name?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                        t.specialization?.toLowerCase().includes(teacherSearch.toLowerCase())
                      ).length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-400 text-center">
                            No teachers found
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected teacher info */}
              {selectedTeacher && (
                <div className="mt-2 p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-700 break-words">
                    <span className="font-semibold">Specialization: </span>
                    {suggestedTeachers.find((t) => t._id === selectedTeacher)?.specialization || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">Similarity Score: </span>
                    <span className="text-green-600 font-semibold">
                      {Math.round((suggestedTeachers.find((t) => t._id === selectedTeacher)?.similarityScore || 0) * 100)}%
                    </span>
                  </p>
                </div>
              )}

              <button
                onClick={handleAssign}
                disabled={loading || !selectedTeacher}
                className="mt-3 w-full px-4 py-2.5 sm:py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? "Loading..." : "Assign Teacher"}
              </button>
            </>
          )}
        </div>

        {/* Teacher Rankings Table */}
        {suggestedTeachers.length > 0 && suggestedTeachers[0]?.similarityScore !== undefined && (
          <div className="mt-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-800">
              Teacher Match Rankings
            </h3>

            {/* Desktop / tablet: table view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">Rank</th>
                    <th className="px-4 py-2 border">Teacher Name</th>
                    <th className="px-4 py-2 border">Similarity Score</th>
                    <th className="px-4 py-2 border">Specialization</th>
                  </tr>
                </thead>
                <tbody>
                  {suggestedTeachers.slice(0, 5).map((teacher, index) => {
                    const score = teacher.similarityScore || 0;
                    const percentage = Math.round(score * 100);

                    return (
                      <tr
                        key={teacher._id}
                        className={`hover:bg-gray-50 ${index === 0 ? 'bg-green-50' : ''
                          }`}
                      >
                        <td className="px-4 py-2 border font-medium">
                          {index + 1}
                          {index === 0 && " 🏆"}
                        </td>
                        <td className="px-4 py-2 border">{teacher.name}</td>
                        <td className="px-4 py-2 border">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="font-semibold text-green-700 min-w-[45px]">
                              {percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 border text-gray-600">
                          {teacher.specialization || "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked card view (same data, no table) */}
            <div className="sm:hidden space-y-2">
              {suggestedTeachers.slice(0, 5).map((teacher, index) => {
                const score = teacher.similarityScore || 0;
                const percentage = Math.round(score * 100);

                return (
                  <div
                    key={teacher._id}
                    className={`border rounded-lg p-3 ${index === 0 ? 'bg-green-50 border-green-200' : 'bg-white'
                      }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-medium text-sm">
                        #{index + 1} {teacher.name}
                        {index === 0 && " 🏆"}
                      </span>
                      <span className="font-semibold text-green-700 text-sm flex-shrink-0">
                        {percentage}%
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {teacher.specialization || "N/A"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailModal;
