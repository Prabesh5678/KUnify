import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const UploadProject = ({ teacherId,onPublished, project: projectProp }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const existingProject = projectProp ?? location.state?.project ?? null;
  const isEditMode = Boolean(existingProject?._id);

  const [form, setForm] = useState({
    title: existingProject?.title ?? "",
    description: existingProject?.description ?? "",
    status: existingProject?.status ?? "open",
  });
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState(existingProject?.technologies ?? []);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addTechnology = (e) => {
    e.preventDefault();
    const value = techInput.trim();
    if (!value) return;
    if (technologies.some((t) => t.toLowerCase() === value.toLowerCase())) {
      setTechInput("");
      return;
    }
    setTechnologies((prev) => [...prev, value]);
    setTechInput("");
  };

  const handleTechKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      addTechnology(e);
    } else if (e.key === "Backspace" && !techInput && technologies.length) {
      setTechnologies((prev) => prev.slice(0, -1));
    }
  };

  const removeTechnology = (index) => {
    setTechnologies((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setForm({ title: "", description: "", status: "open" });
    setTechnologies([]);
    setTechInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !technologies.length) {
      toast.error("Please fill in title, description and at least one technology");
      return;
    }

    try {
      setSubmitting(true);

      if (isEditMode) {
        await axios.put(`/api/teacher/my-projects/${existingProject._id}`, {
          ...form,
          technologies,
        });
        toast.success("Project updated");
      } else {
        await axios.post("/api/teacher/my-projects", {
          ...form,
          technologies,
          teacher: teacherId,
        });
        toast.success("Project published");
        resetForm();
      }

      if (onPublished) {
        onPublished(); 
      } else {
        navigate("/teacher/projects"); 
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          (isEditMode ? "Failed to update project" : "Failed to publish project")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-0">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          {isEditMode ? "Edit project" : "Publish a project"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEditMode
            ? "Update details or change the status (e.g. close it once it's filled)."
            : "Fill in the details below. Students will see this once it's published."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >

        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
            Project title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Smart Attendance System"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="technologies" className="mb-1 block text-sm font-medium text-gray-700">
            Technologies <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-300 px-2 py-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            {technologies.map((tech, index) => (
              <span
                key={`${tech}-${index}`}
                className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(index)}
                  className="ml-0.5 text-indigo-400 hover:text-indigo-700"
                  aria-label={`Remove ${tech}`}
                >
                  &times;
                </button>
              </span>
            ))}
            <input
              id="technologies"
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleTechKeyDown}
              onBlur={addTechnology}
              placeholder={technologies.length ? "" : "Type and press Enter (e.g. React, Node.js)"}
              className="min-w-[140px] flex-1 border-none py-1 text-sm outline-none focus:ring-0"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">Press Enter or comma to add each technology</p>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the project scope, goals and expectations for applicants"
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">Status</span>
          <div className="flex gap-2">
            {["open", "closed"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, status: option }))}
                className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors  ${
                  form.status === option
                    ? option === "open"
                      ? "bg-green-100 text-green-700 ring-1 ring-green-300 pointer-cursor"
                      : "bg-gray-200 text-gray-700 ring-1 ring-gray-300 pointer-cursor"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 pointer-cursor"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => (isEditMode ? navigate(-1) : resetForm())}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            {isEditMode ? "Cancel" : "Clear"}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? isEditMode
                ? "Saving..."
                : "Publishing..."
              : isEditMode
              ? "Save changes"
              : "Publish project"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadProject;