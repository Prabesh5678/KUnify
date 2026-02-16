import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileText, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const SupervisorCard = ({

  teamStatus,
  selectedSupervisor,
  setSelectedSupervisor,
  handleRequestSupervisor,
}) => {
  const [supervisors, setSupervisors] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredSupervisor, setHoveredSupervisor] = useState(null);

  // Fetch teachers on component mount
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const { data } = await axios.get("/api/student/get-teachers");
        if (data.success) {
          setSupervisors(data.teachers); // assuming the API returns { success: true, teachers: [...] }
        } else {
          toast.error(data.message || "Failed to fetch supervisors");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching supervisors");
      }
    };

    fetchSupervisors();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-black-200 hover:shadow-md transition-shadow relative">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="p-2 bg-purple-100 rounded-lg shrink-0">
          <FileText className="text-purple-600" size={22} />
        </div>

        <div className="flex-1">
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
            Supervisor
          </p>

          {(teamStatus === "notRequested" || teamStatus === "rejected") && (
            <div className="mb-2 relative">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-2 py-1.5 border rounded-md bg-gray-100 hover:bg-gray-200 text-xs cursor-pointer"
              >
                <span className="truncate">
                  {selectedSupervisor
                    ? supervisors.find((s) => s._id === selectedSupervisor)?.name
                    : "Select Supervisor"}
                </span>
              </button>

              {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-md max-h-40 overflow-y-auto text-xs">
                  {supervisors.map((sup) => (
                    <div
                      key={sup._id}
                      onClick={() => {
                        setSelectedSupervisor(sup._id);
                        setIsOpen(false);
                        setHoveredSupervisor(null);
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredSupervisor({
                          ...sup,
                          top: rect.top + rect.height / 2,
                          left: rect.right + 10,
                        });
                      }}
                      onMouseLeave={() => setHoveredSupervisor(null)}
                      className="px-2 py-1.5 cursor-pointer hover:bg-purple-50 relative"
                    >
                      {sup.name}
                    </div>
                  ))}
                </div>
              )}

              {hoveredSupervisor && (
                <div
                  className="fixed w-40 bg-white text-xs text-black border rounded-md shadow-lg p-2 z-50 pointer-events-none"
                  style={{
                    top: hoveredSupervisor.top,
                    left: hoveredSupervisor.left,
                    transform: "translateY(-50%)",
                  }}
                >
                  <p className="font-semibold mb-1">{hoveredSupervisor.name}</p>
                  <p>{hoveredSupervisor.specialization}</p>
                </div>
              )}
            </div>
          )}

          {/* Status Buttons / Labels */}
          {teamStatus === "notRequested" && (
            <button
              onClick={handleRequestSupervisor}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-1 rounded-md transition cursor-pointer"
            >
              Request Supervisor
            </button>
          )}

          {teamStatus === "pending" && (
            <div className="text-xs font-semibold text-amber-600">Reviewing...</div>
          )}

          {teamStatus === "rejected" && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-red-600">Rejected</span>
              <button
                onClick={handleRequestSupervisor}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-1 rounded-md"
              >
                Request Again
              </button>
            </div>
          )}

          {teamStatus === "teacherApproved" && (
            <div className="text-xs font-semibold text-violet-600">
              Approved by Teacher
            </div>
          )}

          {teamStatus === "adminApproved" && (
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <CheckCircle size={14} />
              Assigned
            </div>
          )}
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="mt-3 pt-2 border-t text-[11px]">
        {teamStatus === "notRequested" && (
          <p className="text-amber-500">Request your Supervisor</p>
        )}
        {teamStatus === "pending" && (
          <p className="text-amber-500">Being reviewed by teacher.</p>
        )}
        {teamStatus === "rejected" && (
          <p className="text-red-400">Rejected by Teacher or Admin.</p>
        )}
        {teamStatus === "teacherApproved" && (
          <p className="text-violet-500">Pending admin approval.</p>
        )}
        {teamStatus === "adminApproved" && (
          <p className="text-emerald-500">Supervisor assigned.</p>
        )}
      </div>
    </div>
  );
};

export default SupervisorCard;
