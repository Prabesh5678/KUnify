import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function TeacherTeams() {
  const navigate = useNavigate();

  // 1. Default floral color palette (light)
  const colorPalette = [
    "bg-gradient-to-r from-pink-50 to-rose-50",
    "bg-gradient-to-r from-lime-50 to-emerald-50",
    "bg-gradient-to-r from-sky-50 to-indigo-50",
    "bg-gradient-to-r from-amber-50 to-yellow-50",
    "bg-gradient-to-r from-fuchsia-50 to-purple-50",
  ];

  // 2. Dummy data for teams (replace with API later)
  const [teams, setTeams] = useState([
    // {
    //   id: 1,
    //   teamName: "Team Alpha",
    //   subjectCode: "CS101",
    // },
    // {
    //   id: 2,
    //   teamName: "Team Beta",
    //   subjectCode: "CS102",
    // },
    // {
    //   id: 3,
    //   teamName: "Team Gamma",
    //   subjectCode: "CS103",
    // },
    // {
    //   id: 4,
    //   teamName: "Team Delta",
    //   subjectCode: "CS104",
    // },
    // {
    //   id: 5,
    //   teamName: "Team Epsilon",
    //   subjectCode: "CS105",
    // },
    // {
    //   id: 6,
    //   teamName: "Team Zeta",
    //   subjectCode: "CS106",
    // },
    // {
    //   id: 7,
    //   teamName: "Team Eta",
    //   subjectCode: "CS107",
    // },
  ]);
const fetchTeams = async () => {
  try {
    // BACKEND (when ready)
    const { data } = await axios.get("/api/teacher/teams?get=assigned", {
      withCredentials: true,
    });
    if (data.success) {
      setTeams(data.teams);
    } else {
      toast.error("Unable to get teams!");
      console.error(data.message);
    }
    // TEMP:
    // setRequests(testRequests);
  } catch (err) {
    toast.error("Failed to load requests");
    console.error(err.stack);
  }
};

useEffect(() => {
  fetchTeams();
}, []);
  const [search, setSearch] = useState("");

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-3">Teacher Teams</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search teams..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 mb-5 w-full rounded"
      />

      {/* Scrollable Teams List */}
      <div className="grid grid-cols-1 gap-4 max-h-[75vh] overflow-y-auto">
        {filteredTeams.map((team, index) => (
          <div
            key={team.id||1}
            className={`border p-4 rounded flex justify-between items-center ${
              colorPalette[index % colorPalette.length]
            } text-gray-700`}
          >
            <div>
              <h2 className="font-bold">{team.name}</h2>
              <p className="text-gray-600">{team.code}</p>
            </div>

            <button
              className="px-4 py-2 rounded text-white font-semibold cursor-pointer bg-primary hover:bg-primary-dark transition duration-200"
              onClick={() =>
                navigate(`/teacher/teamdetails/${team.id}`)
              }
            >
              Explore More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
