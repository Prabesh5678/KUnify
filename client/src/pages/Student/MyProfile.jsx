import React from "react";
import { useAppContext } from "../../context/AppContext";
import avatar from "../../assets/avatar.png"; 

const MyProfile = () => {
  const { user } = useAppContext();

  return (
    <div className="min-h-screen bg-white flex justify-center items-start py-16 px-4">
      <div className="max-w-3xl w-full bg-white border-2 border-primary rounded-2xl shadow-md p-10">
        <h2 className="text-3xl font-bold text-center text-primary mb-10">
          My Profile
        </h2>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <img
            src={user?.avatar || avatar}
            alt="User Avatar"
            className="w-32 h-32 rounded-full border-2 border-primary object-cover"
          />

          {/* User Info */}
          <div className="flex flex-col gap-4">
            <div>
              <span className="font-semibold text-primary">Name: </span>
              <span className="text-black">{user?.name || "N/A"}</span>
            </div>

            <div>
              <span className="font-semibold text-primary">Email: </span>
              <span className="text-black">{user?.email || "N/A"}</span>
            </div>

            <div>
              <span className="font-semibold text-primary">Department: </span>
              <span className="text-black">{user?.department || "N/A"}</span>
            </div>

            <div>
              <span className="font-semibold text-primary">Semester: </span>
              <span className="text-black">{user?.semester || "N/A"}</span>
            </div>

            <div>
              <span className="font-semibold text-primary">Roll Number: </span>
              <span className="text-black">{user?.rollNumber || "N/A"}</span>
            </div>

            <div>
              <span className="font-semibold text-primary">Subject Code: </span>
              <span className="text-black">{user?.subjectCode || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
