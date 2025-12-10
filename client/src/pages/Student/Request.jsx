import React from 'react'
import { NotebookPen } from 'lucide-react';

const Request = () => {
  return (
    <div className="min-h-screen py-9 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg border-b">
          <div className="px-8 py-6 flex items-center gap-4">
            <NotebookPen className="text-blue-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Supervisor Request Form</h1>
              <p className="text-gray-600 mt-1">Complete the form below to request a supervisor</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-b-2xl shadow-xl p-8 md:p-10 -mt-1">
          <form className="space-y-8">
            {/* Team Name + Project Title - Same Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your team name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Project Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your project title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
            {/* Project Objectives */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Objectives <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Main objectives of your project"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keywords <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React, Machine Learning, IoT, Blockchain"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
                <p className="text-xs text-gray-500 mt-2">Separate keywords with commas</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Supervisor
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition">
                  <option>Select a supervisor</option>
                  <option>Dr. Amita Sharma</option>
                  <option>Prof. Rajesh KC</option>
                  <option>Dr. Suman Shrestha</option>
                  <option>Dr. Priya Thapa</option>
                  <option>Any available supervisor</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">Final assignment subject to availability</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-10">
              <button
                type="submit"
                className="bg-primary hover:bg-blue-100 text-white hover:text-blue-700 font-bold py-3.5 px-12 rounded-xl shadow-lg transition transform hover:scale-105 text-base"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Request