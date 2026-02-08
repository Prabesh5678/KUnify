
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

  // Fetch suggested teachers using cosine similarity when modal opens
  useEffect(() => {
    if (!isOpen || !project) return;

    const fetchSuggestedTeachers = async () => {
      setLoading(true);

      let teachersLoaded = false;

      // Attempt 1: Try cosine similarity API
      if (!teachersLoaded) {
        try {
          console.log("Attempting to fetch cosine similarity data...");
          const res = await axios.get("/api/admin/teacher-similarity", {
            withCredentials: true,
            timeout: 10000,
          });

          console.log("=== FULL SIMILARITY API RESPONSE ===");
          console.log(JSON.stringify(res.data, null, 2));

          // Store debug info
          setDebugInfo(res.data);

          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            const projectTeamId = (project._id || project.teamId)?.toString();
            console.log("Looking for team ID:", projectTeamId);

            const teamData = res.data.find((item) => {
              const itemTeamId = item.teamId?.toString();
              console.log(`Comparing: "${itemTeamId}" === "${projectTeamId}"`);
              return itemTeamId === projectTeamId;
            });

            console.log("=== FOUND TEAM DATA ===");
            console.log(JSON.stringify(teamData, null, 2));

            if (teamData?.teacherScores?.length > 0) {
              console.log("=== TEAM KEYWORDS ===");
              console.log(teamData.keywords);

              const teachers = teamData.teacherScores.map((score) => {
                console.log(`Teacher: ${score.teacherName}, Spec: "${score.specialization}", Score: ${score.similarityScore}`);

                return {
                  _id: score.teacherId?.toString() || score.teacherId,
                  name: score.teacherName || "Unknown",
                  specialization: score.specialization || "N/A",
                  similarityScore: parseFloat(score.similarityScore) || 0,
                  displayName: `${score.teacherName} (Match: ${Math.round(parseFloat(score.similarityScore) * 100)}%)`,
                };
              });

              setSuggestedTeachers(teachers);
              setSimilarityData(teamData);
              teachersLoaded = true;
              console.log("✓ Cosine similarity loaded successfully");
            }
          }
        } catch (error) {
          console.warn("⚠ Cosine similarity failed:", error.message);
        }
      }

      // Attempt 2: Fetch all teachers from the teachers endpoint
      if (!teachersLoaded) {
        try {
          console.log("Fetching all teachers as fallback...");
          const teachersRes = await axios.get("/api/admin/teachers", {
            withCredentials: true,
            timeout: 5000,
          });

          if (teachersRes.data?.success) {
            const allTeachers = [
              ...(teachersRes.data.regularFaculty || []),
              ...(teachersRes.data.visitingFaculty || [])
            ];

            const activeTeachers = allTeachers
              .filter(t => t.activeStatus !== false)
              .map(t => ({
                _id: t._id?.toString() || t._id,
                name: t.name || "Unknown",
                specialization: t.specialization || "N/A",
                displayName: t.name,
              }));

            if (activeTeachers.length > 0) {
              setSuggestedTeachers(activeTeachers);
              teachersLoaded = true;
              toast.info("Showing all teachers (smart matching temporarily unavailable)");
              console.log("✓ All teachers loaded successfully");
            }
          }
        } catch (error) {
          console.warn("⚠ Failed to fetch all teachers:", error.message);
        }
      }

      // Attempt 3: Use project.teachers if provided
      if (!teachersLoaded && project.teachers?.length > 0) {
        console.log("Using project.teachers as fallback...");
        setSuggestedTeachers(project.teachers);
        teachersLoaded = true;
        console.log("✓ Project teachers loaded");
      }

      // Final state: Show message if no teachers loaded
      if (!teachersLoaded) {
        setSuggestedTeachers([]);
        toast.warning("No teachers available. Please contact administrator.");
        console.log("✗ No teachers could be loaded");
      }

      setLoading(false);
    };

    fetchSuggestedTeachers();
  }, [isOpen, project]);

  if (!isOpen || !project) return null;
  {/*

  const handleAssign = async () => {
    if (!selectedTeacher) {
      toast.error("Please select a teacher to assign");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(
  "/api/admin/assign-supervisor",
  {
    teamId: project._id,
    teacherId: selectedTeacher,
  },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Teacher assigned successfully!");
        if (onAssignTeacher) {
          onAssignTeacher(selectedTeacher, project._id, res.data.updatedProject);
        }
        setSelectedTeacher("");
        onClose();
      } else {
        toast.error(res.data.message || "Assignment failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };
*/
  }
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

    // ✅ Handle backend response
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-4xl overflow-y-auto max-h-[90vh] shadow-lg">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg cursor-pointer"
        >
          ✕
        </button>

        {/* Project Title */}
        <h2 className="text-3xl font-bold mb-4 text-gray-800 border-b pb-2">
          {project.proposal?.projectTitle || project.title || teamName}
        </h2>

        {/* Requested Teacher */}
        {/* Requested Teacher */}
        <div className="bg-gray-50 p-4 rounded-xl shadow mb-4 space-y-1">
          <p className="font-medium">
            Requested Teacher:{" "}
            <span className="text-gray-700">
              {(() => {
                // Case 1: Full object with name
                if (project.requestedTeacher?.name) return project.requestedTeacher.name;

                // Case 2: ID only, find in suggestedTeachers
                if (typeof project.requestedTeacher === "string") {
                  const teacher = suggestedTeachers.find(
                    (t) => t._id === project.requestedTeacher
                  );
                  if (teacher) return teacher.name;
                }

                // Fallback
                return "None";
              })()}
            </span>
          </p>
          <p className="font-medium">
            Teacher Acceptance Status:{" "}
            {project.teacherAccepted ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                Accepted
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-semibold">
                Not Accepted
              </span>
            )}
          </p>
        </div>


        {/* Team Keywords */}
        {(project.keywords || similarityData?.keywords) && (
          <div className="bg-blue-50 p-4 rounded-xl shadow mb-4">
            <p className="font-medium text-gray-700 mb-1">Project Keywords:</p>
            <p className="text-sm text-gray-600 italic">
              {project.keywords || similarityData?.keywords}
            </p>
          </div>
        )}

        {/* Suggested Teachers with Cosine Similarity */}
        <div className="mt-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Suggested Teachers (Ranked by Similarity)
          </label>

          {suggestedTeachers.length === 0 && !loading ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-yellow-800">
                No teacher suggestions available. This may be because:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Team keywords are not set</li>
                <li>• No teachers have specializations defined</li>
                <li>• No active teachers available</li>
              </ul>
            </div>
          ) : (
            <>
              <select
                className="w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                disabled={loading}
              >
                <option value="">
                  {loading ? "Loading..." : "-- Select Teacher --"}
                </option>
                {suggestedTeachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.displayName || t.name || "Unknown Teacher"}
                  </option>
                ))}
              </select>

              {/* Show selected teacher's specialization */}
              {selectedTeacher && (
                <div className="mt-2 p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Specialization: </span>
                    {suggestedTeachers.find(t => t._id === selectedTeacher)?.specialization || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">Similarity Score: </span>
                    <span className="text-green-600 font-semibold">
                      {Math.round((suggestedTeachers.find(t => t._id === selectedTeacher)?.similarityScore || 0) * 100)}%
                    </span>
                  </p>
                </div>
              )}

              <button
                onClick={handleAssign}
                disabled={loading || !selectedTeacher}
                className="mt-3 w-full px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Assigning..." : "Assign Teacher"}
              </button>
            </>
          )}
        </div>

        {/* Teacher Rankings Table */}
        {suggestedTeachers.length > 0 && suggestedTeachers[0]?.similarityScore !== undefined && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Teacher Match Rankings
            </h3>
            <div className="overflow-x-auto">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailModal;
