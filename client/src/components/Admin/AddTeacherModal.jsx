// AddTeacherModal.jsx
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const AddTeacherModal = ({ isOpen, onClose, onAddTeacher }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name || !email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    onAddTeacher({ name, email, password });
    toast.success("Visiting faculty added successfully!");

    setName("");
    setEmail("");
    setPassword("");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Add Visiting Faculty</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-2 border rounded px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-2 border rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 border rounded px-3 py-2"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-3 py-1 bg-primary text-white rounded">
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTeacherModal;
