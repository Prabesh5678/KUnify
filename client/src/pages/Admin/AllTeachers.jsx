import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminHeader from "../../components/Admin/AdminHeader";
import { FaUserGraduate, FaPhone, FaEnvelope, FaTools, FaBriefcase } from "react-icons/fa";
import toast from "react-hot-toast";

const POSITION_OPTIONS = [
  "Visiting Faculty",
  "Teaching Assistant",
  "Lecturer",
  "Assistant Professor",
  "Associate Professor",
  "Professor",
];

const AllTeachers = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [teacher, setTeacher] = useState(location.state?.teacher || null);
  const [loading, setLoading] = useState(!teacher);
  const [editMode, setEditMode] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!teacher && id) {
      const fetchTeacher = async () => {
        try {
          setLoading(true);
          const res = await axios.get("/api/admin/get-teachers", { withCredentials: true });
          if (res.data.success) {
            const allTeachers = [...res.data.regularFaculty, ...res.data.visitingFaculty];
            const t = allTeachers.find((t) => t._id === id);
            if (t) setTeacher(t);
          }
        } catch (err) {
          console.error("Failed to fetch teacher:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchTeacher();
    }
  }, [id, teacher]);

  // Pre-select current position when teacher data loads
  useEffect(() => {
    if (teacher) {
      setSelectedPosition(teacher.position || "");
    }
  }, [teacher]);

  const handleSavePosition = async () => {
    if (!selectedPosition) {
      toast.error("Please select a position");
      return;
    }

    try {
      setSaving(true);
      const teacherId = teacher._id || teacher.id;

      const res = await axios.put(
        `/api/admin/teacher/${teacherId}/position`,
        { position: selectedPosition },
        { withCredentials: true }
      );

      if (res.data.success) {
        setTeacher((prev) => ({ ...prev, position: selectedPosition }));
        toast.success("Position updated successfully!");
        setEditMode(false);
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update position");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setSelectedPosition(teacher.position || "");
    setEditMode(false);
  };

  if (loading) {
    return <p className="p-8 text-gray-600">Loading teacher information...</p>;
  }

  if (!teacher || !(teacher._id || teacher.id)) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <AdminHeader />
          <p className="text-red-600 font-semibold">
            Teacher data not found or invalid. Please navigate from Teachers Management page.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <AdminHeader />
        <div className="p-4 md:p-4">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <FaUserGraduate className="text-primary text-3xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Teacher Profile</h2>
              <p className="text-sm text-gray-500">View and manage teacher details</p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <InfoItem icon={<FaUserGraduate />} label="Full Name">
              <input
                value={teacher.name || ""}
                readOnly
                className="ml-2 p-2 border rounded w-full bg-gray-100 cursor-not-allowed"
              />
            </InfoItem>

            <InfoItem icon={<FaPhone />} label="Phone">
              <input
                value={teacher.phone || ""}
                readOnly
                className="ml-2 p-2 border rounded w-full bg-gray-100 cursor-not-allowed"
              />
            </InfoItem>

            <InfoItem icon={<FaEnvelope />} label="Email">
              <input
                value={teacher.email || ""}
                readOnly
                className="ml-2 p-2 border rounded w-full bg-gray-100 cursor-not-allowed"
              />
            </InfoItem>

            <InfoItem icon={<FaTools />} label="Specialization">
              <input
                value={teacher.specialization || ""}
                readOnly
                className="ml-2 p-2 border rounded w-full bg-gray-100 cursor-not-allowed"
              />
            </InfoItem>
          </div>

          {/* Position Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaBriefcase className="text-primary text-lg" />
                <h3 className="text-base font-semibold text-gray-700">Position</h3>
              </div>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition cursor-pointer"
                >
                  Edit Position
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePosition}
                    disabled={saving}
                    className="px-4 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition cursor-pointer disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>

            {/* View mode — show current position as badge */}
            {!editMode && (
              <div>
                {teacher.position ? (
                  <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-white">
                    {teacher.position}
                  </span>
                ) : (
                  <p className="text-sm text-gray-400 italic">No position assigned yet</p>
                )}
              </div>
            )}

            {/* Edit mode — pill selector */}
            {editMode && (
              <div>
                <p className="text-xs text-gray-500 mb-3">
                  Select a new position for this teacher:
                </p>
                <div className="flex flex-wrap gap-2">
                  {POSITION_OPTIONS.map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setSelectedPosition(pos)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                        selectedPosition === pos
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
                {selectedPosition && (
                  <p className="text-xs text-primary mt-3">
                    Selected: <span className="font-semibold">{selectedPosition}</span>
                  </p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, children }) => (
  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
    <div className="text-primary text-xl mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-xs uppercase text-gray-400 font-semibold">{label}</p>
      <div>{children}</div>
    </div>
  </div>
);

export default AllTeachers;