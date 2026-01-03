import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const WaitingPage = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApproval = async () => {
      try {
        const res = await axios.get("/api/student/is-auth?populateTeam=true", { withCredentials: true });
        if (res.data.success) {
          const team = res.data.student.teamId;
          if (!team) {
            // If no team, redirect to dashboard
            navigate("/student/dashboard");
            return;
          }

          setTeamName(team.name || "");
          // If student is approved by leader
          if (team.members.some((m) => m._id === res.data.student._id && m.status === "approved")) {
            toast.success("You have been approved!");
            navigate("/student/dashboard");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkApproval();
    // Auto-refresh every 5 seconds
    const interval = setInterval(checkApproval, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl p-10 shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Waiting for Team Approval</h1>
        <p className="text-gray-600 mb-6">
          Your request to join <span className="font-semibold">{teamName}</span> is pending.
        </p>
        {loading && <p className="text-sm text-gray-400">Checking status...</p>}
        <p className="text-sm text-gray-500 mt-4">
          This page will automatically refresh when your request is approved.
        </p>
      </div>
    </div>
  );
};

export default WaitingPage;
