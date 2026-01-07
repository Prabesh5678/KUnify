import React, { useEffect, useState } from "react";
import axios from "axios";
import {toast } from "react-hot-toast";
import AddLogEntryModal from "../../components/AddLogEntryModal";
import { useAppContext } from "../../context/AppContext";
import { useParams } from "react-router-dom";


const Logsheet = () => {
  const { user } = useAppContext();
  const [myLogs, setMyLogs] = useState([]);
  const [teamLogs, setTeamLogs] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("my"); // my | team
// if(!user||user._id){
//   toast.error('user not found')
//   console.error('hi')
//   return;
// }
const userId=user._id;
const teamId=user.teamId._id;
  useEffect(() => {
    if(activeTab==='my')
    fetchMyLogs();else
    fetchTeamLogs();
  }, [activeTab]);

  const fetchMyLogs = async () => {
    try {
      const {data} = await axios.get(`/api/log/user/${userId}`);
      if (data.success) {
        setMyLogs(data.logs);
      }
      else toast.error(data.message)
    } catch {
      toast.error("Failed to fetch my logs");
    }
  };

  const fetchTeamLogs = async () => {
    try {
      const {data} = await axios.get(`/api/log/team/${teamId}`);
      if (data.success) {
        setTeamLogs(data.logs);
      } else toast.error(data.message);

    } catch {
      toast.error("Failed to fetch team logs");
    }
  };

  const logsToShow = activeTab === "my" ? myLogs : teamLogs;

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">

    {/* Header */}
    <div className="max-w-5xl mx-auto flex justify-between items-center mb-8 px-4">
      <h1 className="text-3xl font-extrabold text-gray-800">
        Logsheet
      </h1>

      {activeTab === "my" && (
        <button
          onClick={() => setOpen(true)}
          className="bg-primary hover:bg-primary/90 transition text-white px-6 py-2.5 rounded-xl shadow"
        >
          + Add Log
        </button>
      )}
    </div>

    {/* Tabs */}
    <div className="max-w-5xl mx-auto flex gap-3 mb-8 px-4">
      <button
        onClick={() => setActiveTab("my")}
        className={`px-5 py-2 rounded-full font-medium transition ${
          activeTab === "my"
            ? "bg-primary text-white shadow"
            : "bg-white text-gray-600 border hover:bg-gray-50"
        }`}
      >
        My Logs
      </button>

      <button
        onClick={() => setActiveTab("team")}
        className={`px-5 py-2 rounded-full font-medium transition ${
          activeTab === "team"
            ? "bg-primary text-white shadow"
            : "bg-white text-gray-600 border hover:bg-gray-50"
        }`}
      >
        Team Logs
      </button>
    </div>

    {/* Logs */}
    <div className="max-w-5xl mx-auto space-y-5 px-4">
      {logsToShow.length === 0 && (
        <p className="text-gray-500 text-center py-10">
          No logs found
        </p>
      )}

      {logsToShow.map((log) => (
        <div
          key={log._id}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">
              {new Date(log.date).toLocaleDateString()}
            </h3>

            {activeTab === "team" && (
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                {log.user?.name}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold text-blue-600">
                Activity:
              </span>{" "}
              {log.activity}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold text-green-600">
                Outcome:
              </span>{" "}
              {log.outcome}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* Modal */}
    <AddLogEntryModal
      isOpen={open}
      onClose={() => setOpen(false)}
      onSuccess={fetchMyLogs}
    />
  </div>
);

};

export default Logsheet;
