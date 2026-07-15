import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
  const fetchProjects = async () => {
    try {
      const res = await axios.get("/api/student/projects");
      if (res.data.success) {
        setProjects(res.data.projects || []);
      } else {
        setError(res.data.message || "Failed to load projects.");
      }
    } catch (err) {
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };
  fetchProjects();
}, []);
  if (loading) return <p className="p-4 text-gray-500">Loading projects...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
return (
  <div className="min-h-screen bg-gray-50 p-4 md:p-6">
    <div className="max-w-7xl mx-auto">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Available Projects
        </h1>
        <p className="text-gray-500 mt-1">
          Explore projects posted by teachers and find the one that matches
          your interests.
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Teacher</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Project Title
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  Technologies
                </th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-center font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {projects.map((project) => (
                <tr
                  key={project._id}
                  className="border-b last:border-none hover:bg-primary/5 transition-all duration-200"
                >
                  <td className="px-6 py-5 font-medium text-gray-700">
                    {project.teacher?.name || "N/A"}
                  </td>

                  <td className="px-6 py-5">
                    <h2 className="font-semibold text-gray-800">
                      {project.title}
                    </h2>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {project.technologies?.slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        project.status === "open"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {project.applicationStatus === "accepted" && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Enrolled
                        </span>
                      )}
                      {project.applicationStatus === "pending" && (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Pending
                        </span>
                      )}
                      {project.applicationStatus === "rejected" && (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Rejected
                        </span>
                      )}
                      <button
                        onClick={() => navigate(`/student/projects/${project._id}`)}
                        className="bg-primary hover:opacity-90 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
                      >
                        Explore
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-5">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex justify-between items-start gap-3">
              <h2 className="font-semibold text-lg text-gray-800 leading-snug">
                {project.title}
              </h2>

              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                  project.status === "open"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {project.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-2 font-medium">
              {project.teacher?.name || "N/A"}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {project.technologies?.slice(0, 4).map((tech, i) => (
                <span
                  key={i}
                  className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>

           <div className="mt-5 flex items-center gap-2">
              {project.applicationStatus === "accepted" && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Enrolled
                </span>
              )}
              {project.applicationStatus === "pending" && (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Pending
                </span>
              )}
              {project.applicationStatus === "rejected" && (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Rejected
                </span>
              )}
              <button
                onClick={() => navigate(`/student/projects/${project._id}`)}
                className="flex-1 bg-primary hover:opacity-90 text-white py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
              >
                Explore Project
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
};

export default StudentProjectsList;