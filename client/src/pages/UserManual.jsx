import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Users, Shield, UserCheck } from "lucide-react";

const UserManual = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  const sections = [
    {
      title: "For Students",
      icon: <Users className="w-6 h-6 text-primary" />,
      content: (
        <div className="space-y-4 text-gray-700">
          <div>
            <h4 className="font-semibold text-lg text-gray-800">1. Registration & Login</h4>
            <p className="ml-4">
              - Use your university email ending in <code>@student.ku.edu.np</code> to sign in via Google.
              - Upon first login, complete your profile by providing your Department, Semester, Roll Number, and Subject Code.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-gray-800">2. Team Formation</h4>
            <p className="ml-4">
              - <span className="font-medium">Create a Team:</span> Click the "+" icon in the navbar and select "Create Team". You will get a unique Team Code.
              - <span className="font-medium">Join a Team:</span> Click the "+" icon and select "Join Team". Enter the Team Code shared by your team leader.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-gray-800">3. Proposal Submission</h4>
            <p className="ml-4">
              - Once a team is formed, navigate to your Dashboard to submit a project proposal.
              - Include a title, description, and keywords.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-gray-800">4. Requesting a Supervisor</h4>
            <p className="ml-4">
              - After proposal submission, browse the list of available supervisors.
              - Send a request to your preferred supervisor. You can check the status of your request in the Dashboard.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-gray-800">5. Weekly Logs</h4>
            <p className="ml-4">
              - Fill out your weekly logsheets to track progress. These will be reviewed by your supervisor.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "For Teachers",
      icon: <UserCheck className="w-6 h-6 text-primary" />,
      content: (
        <div className="space-y-4 text-gray-700">
          <div>
            <h4 className="font-semibold text-lg text-gray-800">1. Login & Profile</h4>
            <p className="ml-4">
              - Log in using your university email (<code>@ku.edu.np</code>).
              - Complete your profile with your specialization and contact details.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-gray-800">2. Managing Requests</h4>
            <p className="ml-4">
              - Go to the "Requests" tab to view supervision requests from student teams.
              - You can Accept or Reject requests after reviewing their proposals.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-gray-800">3. Supervising Teams</h4>
            <p className="ml-4">
              - View your assigned teams in the "Teams" section.
              - Monitor their weekly logsheets and provide feedback.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "For Admins",
      icon: <Shield className="w-6 h-6 text-primary" />,
      content: (
        <div className="space-y-4 text-gray-700">
          <div>
            <h4 className="font-semibold text-lg text-gray-800">1. Administrative Login</h4>
            <p className="ml-4">
              - Use the dedicated "Visiting Faculty / Admin" login option.
              - Enter your admin credentials.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-gray-800">2. User Management</h4>
            <p className="ml-4">
              - Manage Student and Teacher accounts.
              - Approve or Decline supervisor assignments if manual intervention is needed.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-gray-800">3. Project Oversight</h4>
            <p className="ml-4">
              - View all projects, their status, and assigned supervisors across the department.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "For Visiting Faculty",
      icon: <BookOpen className="w-6 h-6 text-primary" />,
      content: (
        <div className="space-y-4 text-gray-700">
          <div>
            <h4 className="font-semibold text-lg text-gray-800">1. Login Access</h4>
            <p className="ml-4">
              - Since you may not have a KU email, use the "Visiting Faculty Login" section.
              - Enter the email and password provided by the administration.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-gray-800">2. Functionality</h4>
            <p className="ml-4">
              - You have similar privileges to regular teachers for supervising assigned teams.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">User Manual</h1>
          <p className="text-lg text-gray-600">
            A comprehensive guide to navigating the Student Project Management Platform.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {section.title}
                  </h3>
                </div>
                {openSection === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${openSection === index
                  ? "max-h-[1000px] opacity-100 p-6 pt-0 border-t border-gray-100"
                  : "max-h-0 opacity-0 overflow-hidden"
                  }`}
              >
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 text-lg">
          <a href="/usermanual.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">Click here</a> to find the full User Manual of this System
        </p>
      </div>
    </div>
  );
};

export default UserManual;
