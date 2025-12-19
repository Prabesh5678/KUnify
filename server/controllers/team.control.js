import Team from "../models/team.model.js";
import Student from "../models/student.model.js";
import mongoose from "mongoose";

// Generate 5-character team code (like Google Classroom)
const generateTeamCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create Team
export const createTeam = async (req, res) => {
  try {
    const studentId = req.studentId;
    const { name, subject } = req.body;

    // Check if student already has a team
    const student = await Student.findById(studentId);
    if (student.teamId) {
      return res.json({ 
        success: false, 
        message: "You already belong to a team" 
      });
    }

    // Generate unique team code
    let code;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      code = generateTeamCode();
      const existingTeam = await Team.findOne({ code });
      if (!existingTeam) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.json({ 
        success: false, 
        message: "Failed to generate unique team code. Please try again." 
      });
    }

    // Create team
    const team = new Team({
      name,
      code,
      subject,
      leaderId: studentId,
      members: [studentId]
    });

    await team.save();

    // Update student
    student.teamId = team._id;
    student.isTeamLeader = true;
    await student.save();

    return res.json({
      success: true,
      message: "Team created successfully!",
      team: {
        id: team._id,
        name: team.name,
        code: team.code,
        subject: team.subject
      }
    });

  } catch (error) {
    console.error("Create team error:", error);
    return res.json({
      success: false,
      message: error.message
    });
  }
};

// Join Team
export const joinTeam = async (req, res) => {
  try {
    const studentId = req.studentId;
    const { code } = req.body;

    // Check if student already has a team
    const student = await Student.findById(studentId);
    if (student.teamId) {
      return res.json({ 
        success: false, 
        message: "You already belong to a team" 
      });
    }

    // Find team by code
    const team = await Team.findOne({ code: code.toUpperCase() });
    if (!team) {
      return res.json({ 
        success: false, 
        message: "Invalid team code" 
      });
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return res.json({ 
        success: false, 
        message: "Team is already full (max 4 members)" 
      });
    }

    // Check if student is already in team
    if (team.members.includes(studentId)) {
      return res.json({ 
        success: false, 
        message: "You are already in this team" 
      });
    }

    // Add student to team
    team.members.push(studentId);
    await team.save();

    // Update student
    student.teamId = team._id;
    student.isTeamLeader = false;
    await student.save();

    return res.json({
      success: true,
      message: "Joined team successfully!",
      team: {
        id: team._id,
        name: team.name,
        code: team.code,
        subject: team.subject
      }
    });

  } catch (error) {
    console.error("Join team error:", error);
    return res.json({
      success: false,
      message: error.message
    });
  }
};

// Get Team Info
export const getTeam = async (req, res) => {
  try {
    const studentId = req.studentId;
    
    const student = await Student.findById(studentId).populate('teamId');
    
    if (!student.teamId) {
      return res.json({ 
        success: true, 
        hasTeam: false 
      });
    }

    const team = await Team.findById(student.teamId)
      .populate('leaderId', 'name email avatar')
      .populate('members', 'name email avatar rollNumber');

    return res.json({
      success: true,
      hasTeam: true,
      team,
      isLeader: student.isTeamLeader
    });

  } catch (error) {
    console.error("Get team error:", error);
    return res.json({
      success: false,
      message: error.message
    });
  }
};