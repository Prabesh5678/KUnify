import React from "react";
import { useNavigate } from "react-router-dom";

const InstructionsPage = () => {
    const navigate = useNavigate();
    const handleNext = () => {
        navigate("/team-setup"); // replace with your target page route
    };
    return (<div className="min-h-screen bg-white p-8"> <div className="max-w-4xl mx-auto bg-blue-50 p-10 rounded-2xl shadow-lg"> <h1 className="text-3xl font-bold text-primary mb-6">
        Student Project Instructions </h1>

        <p className="mb-6 text-gray-700">
            Welcome! Before you start creating or joining a project team, please
            carefully read the instructions below to ensure smooth collaboration
            and submission of your project work.
        </p>

        <section className="mb-6">
            <h2 className="text-2xl font-semibold text-primary-600 mb-3">
                1. Individual Accounts & Profiles
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Every student must have their own login account.</li>
                <li>Each student must complete their personal profile before joining or creating a team.</li>
                <li>Incomplete profiles will prevent access to team features.</li>
            </ul>
        </section>

        <section className="mb-6">
            <h2 className="text-2xl font-semibold text-primary-600 mb-3">
                2. Team Creation & Joining
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Any student can create a new team.</li>
                <li>Upon creation, the system generates a unique team code.</li>
                <li>All team members must enter this same code individually to join.</li>
                <li>No student can belong to more than one team at a time.</li>
                <li>To join a new team, a student must leave their current team first.</li>
            </ul>
        </section>

        <section className="mb-6">
            <h2 className="text-2xl font-semibold text-primary-600 mb-3">
                3. Project Details Submission
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Project Keywords – key phrases describing your project.</li>
                <li>Project Summary – a few lines summarizing your project clearly.</li>
                <li>Once submitted, team members cannot leave or join another team.</li>
            </ul>
        </section>

        <section className="mb-6">
            <h2 className="text-2xl font-semibold text-primary-600 mb-3">
                4. Required Documents
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Project Proposal / Report – your complete project document.</li>
                <li>Log Sheets – record of project progress.</li>
                <li>GitHub Repository Link – link to the project repository.</li>
            </ul>
        </section>

        <section className="mb-6">
            <h2 className="text-2xl font-semibold text-primary-600 mb-3">
                5. Important Rules
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Only students with completed profiles can create or join teams.</li>
                <li>Every team member must enter the same team code to join successfully.</li>
                <li>Ensure your project summary and keywords are accurate.</li>
                <li>Once the proposal is submitted, no changes to team membership are allowed.</li>
            </ul>
        </section>

        <p className="mt-8 text-gray-700 font-semibold">
            Following these instructions ensures proper record-keeping, fair collaboration, and smooth project submission.
        </p>
        <div className="flex justify-end mt-8">
            <button
                onClick={handleNext}
                className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary/90 transition duration-300 font-semibold cursor-pointer"
            >
                Next
            </button>
        </div>


    </div>

    </div>
    );
};

export default InstructionsPage;
