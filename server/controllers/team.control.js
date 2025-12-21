/*import Team from "../models/team.model.js";
import Student from "../models/student.model.js";
import mongoose from "mongoose";

// Generate 5-character team code 
const generateTeamCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
*/

/*
// Import necessary modules
import Team from "../models/team.model.js";
import Student from "../models/student.model.js";
import mongoose from "mongoose";  // Need this for transactions

// Function to generate team code
const generateTeamCode = () => {
  // All characters we can use for the code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';  // Start with empty code
  
  // Add 6 random characters to the code
  for (let i = 0; i < 6; i++) {
    // Pick random character from chars string
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars.charAt(randomIndex);  // Add to code
  }
  
  return code;  // Return the finished code
};

// CREATE TEAM FUNCTION
export const createTeam = async (req, res) => {
  // Start a database transaction (like a "save point" in a game)
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Get data from request
    const studentId = req.studentId;  // Student ID from auth middleware
    const { name, subject } = req.body;  // Team name and subject from form

    // Check if required data is provided
    if (!name || !subject) {
      await session.abortTransaction();  // Cancel the transaction
      session.endSession();  // Close the session
      return res.status(400).json({  // Send error response
        success: false,
        message: "Team name and subject are required"
      });
    }

    // Find the student in database
    const student = await Student.findById(studentId).session(session);
    
    // Check if student already has a team
    if (student.teamId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You already belong to a team"
      });
    }

    // Generate UNIQUE team code
    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 20;  // Try max 20 times
    
    // Keep trying until we get a unique code
    while (!isUnique && attempts < maxAttempts) {
      code = generateTeamCode();  // Generate new code
      
      // Check if code already exists in database
      const existingTeam = await Team.findOne({ code }).session(session);
      if (!existingTeam) {
        isUnique = true;  // Code is unique!
      }
      attempts++;  // Count this attempt
    }

    // If couldn't find unique code after 20 tries
    if (!isUnique) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        success: false,
        message: "Failed to generate unique team code. Please try again."
      });
    }

    // Create new team object
    const team = new Team({
      name,        // Team name
      code,        // Unique code
      subject,     // Subject
      leaderId: studentId,  // This student is leader
      members: [studentId]  // Add student as first member
    });

    // Save team to database
    await team.save({ session });

    // Update student's information
    student.teamId = team._id;     // Link student to team
    student.isTeamLeader = true;   // Mark as leader
    await student.save({ session });

    // FINAL STEP: Save everything to database
    await session.commitTransaction();
    session.endSession();

    // Send success response to frontend
    return res.status(201).json({
      success: true,
      message: "Team created successfully!",
      team: {
        id: team._id,
        name: team.name,
        code: team.code,  // This will be shown to user
        subject: team.subject
      }
    });

  } catch (error) {
    // If ANY error happens, cancel everything
    await session.abortTransaction();
    session.endSession();
    
    console.error("Create team error:", error);
    
    // Special check for duplicate code error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Team code already exists. Please try creating team again."
      });
    }
    
    // Generic error response
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
};

// JOIN TEAM FUNCTION
export const joinTeam = async (req, res) => {
  // Start transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const studentId = req.studentId;
    const { code } = req.body;  // Code entered by student

    // Check if code was provided
    if (!code) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Team code is required"
      });
    }

    // Clean the code (remove spaces, keep case as-is)
    const teamCode = code.trim();

    // Find student
    const student = await Student.findById(studentId).session(session);
    
    // Check if student already in a team
    if (student.teamId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You already belong to a team"
      });
    }

    // Find team by code (CASE SENSITIVE now)
    const team = await Team.findOne({ code: teamCode }).session(session);
    
    // If team not found
    if (!team) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Invalid team code"
      });
    }

    // Check if team is full
    const maxMembers = team.maxMembers || 4;
    if (team.members.length >= maxMembers) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Team is already full (max ${maxMembers} members)`
      });
    }

    // Check if student already in this team
    if (team.members.includes(studentId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You are already in this team"
      });
    }

    // Add student to team's member list
    team.members.push(studentId);
    await team.save({ session });

    // Update student's info
    student.teamId = team._id;
    student.isTeamLeader = false;  // Not leader when joining
    await student.save({ session });

    // Save everything
    await session.commitTransaction();
    session.endSession();

    // Success response
    return res.status(200).json({
      success: true,
      message: "Joined team successfully!",
      team: {
        id: team._id,
        name: team.name,
        code: team.code,
        subject: team.subject,
        currentMembers: team.members.length
      }
    });

  } catch (error) {
    // Error handling
    await session.abortTransaction();
    session.endSession();
    
    console.error("Join team error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
};

// GET TEAM INFO FUNCTION
export const getTeam = async (req, res) => {
  try {
    const studentId = req.studentId;
    
    // Find student and populate team info
    const student = await Student.findById(studentId)
      .populate({
        path: 'teamId',
        select: 'name code subject leaderId members createdAt'
      });
    
    // If student has no team
    if (!student.teamId) {
      return res.status(200).json({
        success: true,
        hasTeam: false,
        message: "You are not in any team"
      });
    }

    // Get full team details with member info
    const team = await Team.findById(student.teamId._id)
      .populate('leaderId', 'name email avatar rollNumber')
      .populate('members', 'name email avatar rollNumber isTeamLeader');

    // Send team data
    return res.status(200).json({
      success: true,
      hasTeam: true,
      team,
      isLeader: student.isTeamLeader
    });

  } catch (error) {
    console.error("Get team error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// LEAVE TEAM FUNCTION
export const leaveTeam = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const studentId = req.studentId;
    
    // Find student
    const student = await Student.findById(studentId).session(session);
    
    // Check if student is in a team
    if (!student.teamId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You are not in any team"
      });
    }

    // Find the team
    const team = await Team.findById(student.teamId).session(session);
    
    // If student is the leader
    if (student.isTeamLeader) {
      // If only one member (the leader)
      if (team.members.length === 1) {
        // Delete the team
        await Team.findByIdAndDelete(team._id).session(session);
      } else {
        // Find another member to be leader
        const otherMembers = team.members.filter(memberId => 
          memberId.toString() !== studentId.toString()
        );
        const newLeaderId = otherMembers[0];  // First other member becomes leader
        
        team.leaderId = newLeaderId;
        
        // Update new leader's status
        await Student.findByIdAndUpdate(newLeaderId,
          { isTeamLeader: true },
          { session }
        );
        
        // Remove student from team
        team.members = team.members.filter(memberId => 
          memberId.toString() !== studentId.toString()
        );
        await team.save({ session });
      }
    } else {
      // Regular member - just remove from team
      team.members = team.members.filter(memberId => 
        memberId.toString() !== studentId.toString()
      );
      await team.save({ session });
    }

    // Update student
    student.teamId = null;
    student.isTeamLeader = false;
    await student.save({ session });

    // Save changes
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Left team successfully"
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Leave team error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
*/
/*
import Team from "../models/team.model.js";
import Student from "../models/student.model.js";
import mongoose from "mongoose";

// IMPROVED: Generate team code with timestamp for better uniqueness
const generateTeamCode = () => {
  // Use timestamp + random characters for guaranteed uniqueness
  const timestamp = Date.now().toString(36).slice(-3).toUpperCase(); // Last 3 chars of timestamp
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed 0,1,O,I for clarity
  let random = '';
  
  // Generate 3 random characters
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    random += chars.charAt(randomIndex);
  }
  
  return timestamp + random; // 6-character code
};

// CREATE TEAM FUNCTION - SIMPLIFIED AND IMPROVED
export const createTeam = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const studentId = req.studentId;
    const { name, subject } = req.body;

    // Validate input
    if (!name?.trim() || !subject?.trim()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Team name and subject are required"
      });
    }

    // Check student
    const student = await Student.findById(studentId).session(session);
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (student.teamId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You already belong to a team"
      });
    }

    // Generate unique team code with multiple attempts
    let code;
    let attempts = 0;
    const maxAttempts = 10;
    let existingTeam = null;
    
    do {
      code = generateTeamCode().toUpperCase();
      existingTeam = await Team.findOne({ code }).session(session);
      attempts++;
      
      if (attempts >= maxAttempts) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
          success: false,
          message: "Failed to generate unique team code. Please try again."
        });
      }
    } while (existingTeam);

    // Create team
    const team = new Team({
      name: name.trim(),
      code: code,
      subject: subject.trim(),
      leaderId: studentId,
      members: [studentId],
      maxMembers: 4
    });

    await team.save({ session });

    // Update student
    student.teamId = team._id;
    student.isTeamLeader = true;
    await student.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Team created successfully!",
      team: {
        id: team._id,
        name: team.name,
        code: team.code,
        subject: team.subject,
        leaderId: team.leaderId
      }
    });

  } catch (error) {
    // Ensure session is ended in case of error
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    
    console.error("Create team error:", error);
    
    // Handle duplicate key error (should be rare with improved generator)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Team creation failed due to duplicate code. Please try again."
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating team. Please try again."
    });
  }
};

// JOIN TEAM FUNCTION - IMPROVED
export const joinTeam = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const studentId = req.studentId;
    const { code } = req.body;

    if (!code?.trim()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Team code is required"
      });
    }

    const teamCode = code.trim().toUpperCase();

    // Check student
    const student = await Student.findById(studentId).session(session);
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (student.teamId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You already belong to a team"
      });
    }

    // Find team (case-insensitive search)
    const team = await Team.findOne({ code: teamCode }).session(session);
    if (!team) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Invalid team code"
      });
    }

    // Check team capacity
    const maxMembers = team.maxMembers || 4;
    if (team.members.length >= maxMembers) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Team is full. Maximum ${maxMembers} members allowed.`
      });
    }

    // Check if already a member
    const isAlreadyMember = team.members.some(memberId => 
      memberId.toString() === studentId.toString()
    );
    
    if (isAlreadyMember) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You are already a member of this team"
      });
    }

    // Add student to team
    team.members.push(studentId);
    await team.save({ session });

    // Update student
    student.teamId = team._id;
    student.isTeamLeader = false;
    await student.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Successfully joined the team!",
      team: {
        id: team._id,
        name: team.name,
        code: team.code,
        subject: team.subject,
        currentMembers: team.members.length,
        maxMembers: team.maxMembers
      }
    });

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    
    console.error("Join team error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while joining team. Please try again."
    });
  }
};

// GET TEAM INFO - IMPROVED WITH ERROR HANDLING
export const getTeam = async (req, res) => {
  try {
    const studentId = req.studentId;
    
    const student = await Student.findById(studentId)
      .populate({
        path: 'teamId',
        select: 'name code subject leaderId members maxMembers createdAt updatedAt'
      });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (!student.teamId) {
      return res.status(200).json({
        success: true,
        hasTeam: false,
        message: "You are not currently in a team"
      });
    }

    // Get detailed team info
    const team = await Team.findById(student.teamId._id)
      .populate('leaderId', 'name email avatar rollNumber isTeamLeader')
      .populate('members', 'name email avatar rollNumber isTeamLeader')
      .lean();

    // Add member count for convenience
    team.memberCount = team.members.length;
    team.isFull = team.memberCount >= (team.maxMembers || 4);

    return res.status(200).json({
      success: true,
      hasTeam: true,
      team,
      isLeader: student.isTeamLeader,
      studentRole: student.isTeamLeader ? "Leader" : "Member"
    });

  } catch (error) {
    console.error("Get team error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching team information"
    });
  }
};

// LEAVE TEAM - IMPROVED WITH BETTER LOGIC
export const leaveTeam = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const studentId = req.studentId;
    
    const student = await Student.findById(studentId).session(session);
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (!student.teamId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You are not in any team"
      });
    }

    const team = await Team.findById(student.teamId).session(session);
    if (!team) {
      // Team might have been deleted
      student.teamId = null;
      student.isTeamLeader = false;
      await student.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      return res.status(200).json({
        success: true,
        message: "Successfully left the team"
      });
    }

    // Remove student from team members
    team.members = team.members.filter(memberId => 
      memberId.toString() !== studentId.toString()
    );

    // Handle if student is the leader
    if (student.isTeamLeader) {
      if (team.members.length === 0) {
        // Delete team if no members left
        await Team.findByIdAndDelete(team._id).session(session);
      } else {
        // Assign new leader (first member in list)
        team.leaderId = team.members[0];
        
        // Update new leader's status
        await Student.findByIdAndUpdate(
          team.members[0],
          { isTeamLeader: true },
          { session }
        );
        
        await team.save({ session });
      }
    } else {
      // Just save team without leader change
      await team.save({ session });
    }

    // Update student
    student.teamId = null;
    student.isTeamLeader = false;
    await student.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Successfully left the team"
    });

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    
    console.error("Leave team error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while leaving the team. Please try again."
    });
  }
};

// BONUS: GET TEAM BY CODE (for verification)
export const getTeamByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Team code is required"
      });
    }

    const teamCode = code.trim().toUpperCase();
    const team = await Team.findOne({ code: teamCode })
      .populate('leaderId', 'name rollNumber')
      .populate('members', 'name rollNumber')
      .select('name code subject members maxMembers createdAt')
      .lean();

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Calculate available slots
    team.availableSlots = (team.maxMembers || 4) - team.members.length;
    team.isJoinable = team.availableSlots > 0;
    team.memberCount = team.members.length;

    return res.status(200).json({
      success: true,
      team
    });

  } catch (error) {
    console.error("Get team by code error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching team information"
    });
  }
};
*/
import Team from "../models/team.model.js";
import Student from "../models/student.model.js";
import mongoose from "mongoose";

// ==================== UTILITY FUNCTIONS ====================

// Generate team code - INCLUDING ALL CHARACTERS as requested
const generateTeamCode = () => {
  console.log(" Generating team code...");
  
  // Include ALL characters as you wanted: 0-9, A-Z, a-z
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  
  // Generate 6 random characters
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars.charAt(randomIndex);
  }
  
  console.log(` Generated code: ${code}`);
  return code;
};

// ==================== CREATE TEAM FUNCTION ====================
export const createTeam = async (req, res) => {
  console.log("\n" + "=".repeat(60));
  console.log(" CREATE TEAM REQUEST STARTED");
  console.log("=".repeat(60));
  
  // Log incoming request details
  console.log(` Request Details:`);
  console.log(`   Student ID: ${req.studentId || "NOT FOUND"}`);
  console.log(`   Body: ${JSON.stringify(req.body, null, 2)}`);
  console.log(`   Method: ${req.method}`);
  console.log(`   URL: ${req.originalUrl}`);
  
  const session = await mongoose.startSession();
  console.log(" MongoDB session created");
  
  try {
    // Start transaction
    await session.startTransaction();
    console.log(" Transaction started");
    
    const studentId = req.studentId;
    const { name, subject } = req.body;

    // ========== VALIDATION PHASE ==========
    console.log("\n🔍 PHASE 1: Input Validation");
    
    if (!name?.trim() || !subject?.trim()) {
      console.log(" Validation failed - Missing name or subject");
      console.log(`   Name: "${name}"`);
      console.log(`   Subject: "${subject}"`);
      
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Team name and subject are required"
      });
    }
    console.log(" Input validation passed");

    // ========== STUDENT CHECK PHASE ==========
    console.log("\n PHASE 2: Student Verification");
    console.log(`Looking up student: ${studentId}`);
    
    const student = await Student.findById(studentId).session(session);
    
    if (!student) {
      console.log(" Student not found in database");
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    console.log(` Student found: ${student.name} (${student.email})`);

    // Check if student already has a team
    if (student.teamId) {
      console.log(` Student already has a team: ${student.teamId}`);
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You already belong to a team"
      });
    }
    console.log(" Student is not in any team");

    // ========== TEAM CODE GENERATION PHASE ==========
    console.log("\n PHASE 3: Team Code Generation");
    
    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 15;
    
    console.log(`Generating unique team code (max attempts: ${maxAttempts})`);
    
    while (!isUnique && attempts < maxAttempts) {
      attempts++;
      code = generateTeamCode();
      console.log(`   Attempt ${attempts}: ${code}`);
      
      // Check if code exists
      const existingTeam = await Team.findOne({ code }).session(session);
      
      if (!existingTeam) {
        isUnique = true;
        console.log(`    Code is unique!`);
      } else {
        console.log(`    Code already exists (team: ${existingTeam.name})`);
      }
    }

    if (!isUnique) {
      console.log(` Failed to generate unique code after ${maxAttempts} attempts`);
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        success: false,
        message: "Failed to generate unique team code. Please try again."
      });
    }

    console.log(` Final unique code: ${code}`);

    // ========== TEAM CREATION PHASE ==========
    console.log("\n PHASE 4: Creating Team");
    
    const teamData = {
      name: name.trim(),
      code: code,
      subject: subject.trim(),
      leaderId: studentId,
      members: [studentId],
      maxMembers: 4
    };
    
    console.log(`Team data:`, JSON.stringify(teamData, null, 2));
    
    const team = new Team(teamData);
    
    console.log("Saving team to database...");
    await team.save({ session });
    console.log(` Team saved with ID: ${team._id}`);

    // ========== STUDENT UPDATE PHASE ==========
    console.log("\n PHASE 5: Updating Student");
    
    student.teamId = team._id;
    student.isTeamLeader = true;
    
    console.log("Updating student record...");
    await student.save({ session });
    console.log(" Student updated successfully");

    // ========== FINAL COMMIT PHASE ==========
    console.log("\n PHASE 6: Final Commit");
    
    await session.commitTransaction();
    console.log(" Transaction committed");
    
    session.endSession();
    console.log(" Session ended");

    // ========== SUCCESS RESPONSE ==========
    console.log("\n" + "=".repeat(60));
    console.log(" TEAM CREATED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`Team Name: ${team.name}`);
    console.log(`Team Code: ${team.code}`);
    console.log(`Subject: ${team.subject}`);
    console.log(`Team ID: ${team._id}`);
    console.log(`Leader: ${student.name}`);
    console.log("=".repeat(60) + "\n");

    return res.status(201).json({
      success: true,
      message: "Team created successfully!",
      team: {
        id: team._id,
        name: team.name,
        code: team.code,
        subject: team.subject,
        leaderId: team.leaderId
      }
    });

  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error(" CREATE TEAM ERROR");
    console.error("=".repeat(60));
    console.error(`Error Type: ${error.name}`);
    console.error(`Error Message: ${error.message}`);
    console.error(`Error Code: ${error.code || "N/A"}`);
    console.error(`Stack Trace: ${error.stack}`);
    console.error("=".repeat(60));

    // Clean up session
    try {
      if (session.inTransaction()) {
        console.log(" Aborting transaction...");
        await session.abortTransaction();
      }
      session.endSession();
      console.log(" Session cleaned up");
    } catch (sessionError) {
      console.error("Error cleaning up session:", sessionError);
    }

    // Handle specific errors
    if (error.code === 11000) {
      console.error(" DUPLICATE KEY ERROR - Team code already exists");
      return res.status(409).json({
        success: false,
        message: "Team code already exists. Please try creating team again."
      });
    }
    
    if (error.name === 'ValidationError') {
      console.error(" VALIDATION ERROR - Check team model schema");
      return res.status(400).json({
        success: false,
        message: error.message || "Invalid team data provided"
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating team. Please try again."
    });
  }
};

// ==================== JOIN TEAM FUNCTION ====================
export const joinTeam = async (req, res) => {
  console.log("\n" + "=".repeat(60));
  console.log(" JOIN TEAM REQUEST STARTED");
  console.log("=".repeat(60));
  
  console.log(` Request Details:`);
  console.log(`   Student ID: ${req.studentId}`);
  console.log(`   Team Code: ${req.body?.code || "NOT PROVIDED"}`);
  
  const session = await mongoose.startSession();
  console.log(" MongoDB session created");
  
  try {
    await session.startTransaction();
    console.log(" Transaction started");
    
    const studentId = req.studentId;
    const { code } = req.body;

    // Validation
    if (!code?.trim()) {
      console.log(" No team code provided");
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Team code is required"
      });
    }

    const teamCode = code.trim();
    console.log(` Looking for team with code: "${teamCode}"`);

    // Check student
    const student = await Student.findById(studentId).session(session);
    if (!student) {
      console.log(" Student not found");
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (student.teamId) {
      console.log(` Student already in team: ${student.teamId}`);
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You already belong to a team"
      });
    }

    // Find team (case-sensitive as per your schema)
    const team = await Team.findOne({ code: teamCode }).session(session);
    if (!team) {
      console.log(` Team not found with code: "${teamCode}"`);
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Invalid team code"
      });
    }
    console.log(` Team found: ${team.name}`);

    // Check team capacity
    const maxMembers = team.maxMembers || 4;
    if (team.members.length >= maxMembers) {
      console.log(` Team is full (${team.members.length}/${maxMembers})`);
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Team is full. Maximum ${maxMembers} members allowed.`
      });
    }
    console.log(` Team has space (${team.members.length}/${maxMembers})`);

    // Check if already a member
    const isAlreadyMember = team.members.some(memberId => 
      memberId.toString() === studentId.toString()
    );
    
    if (isAlreadyMember) {
      console.log(" Student already a member of this team");
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You are already a member of this team"
      });
    }

    // Add student to team
    console.log(` Adding student to team...`);
    team.members.push(studentId);
    await team.save({ session });
    console.log(` Student added to team. New member count: ${team.members.length}`);

    // Update student
    console.log(` Updating student record...`);
    student.teamId = team._id;
    student.isTeamLeader = false;
    await student.save({ session });
    console.log(" Student updated");

    // Commit
    await session.commitTransaction();
    session.endSession();
    console.log(" Transaction committed and session ended");

    console.log("\n" + "=".repeat(60));
    console.log(" STUDENT JOINED TEAM SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`Student: ${student.name}`);
    console.log(`Team: ${team.name} (${team.code})`);
    console.log(`New Member Count: ${team.members.length}/${maxMembers}`);
    console.log("=".repeat(60) + "\n");

    return res.status(200).json({
      success: true,
      message: "Successfully joined the team!",
      team: {
        id: team._id,
        name: team.name,
        code: team.code,
        subject: team.subject,
        currentMembers: team.members.length,
        maxMembers: team.maxMembers
      }
    });

  } catch (error) {
    console.error("\n JOIN TEAM ERROR:", error);
    
    try {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      session.endSession();
    } catch (sessionError) {
      console.error("Error cleaning up session:", sessionError);
    }
    
    return res.status(500).json({
      success: false,
      message: "An error occurred while joining team. Please try again."
    });
  }
};

// ==================== GET TEAM INFO ====================
export const getTeam = async (req, res) => {
  console.log("\n GET TEAM INFO REQUEST");
  console.log(`Student ID: ${req.studentId}`);
  
  try {
    const studentId = req.studentId;
    
    const student = await Student.findById(studentId)
      .populate({
        path: 'teamId',
        select: 'name code subject leaderId members maxMembers createdAt updatedAt'
      });
    
    if (!student) {
      console.log(" Student not found");
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (!student.teamId) {
      console.log("ℹ Student is not in any team");
      return res.status(200).json({
        success: true,
        hasTeam: false,
        message: "You are not currently in a team"
      });
    }

    console.log(` Student is in team: ${student.teamId._id}`);
    
    // Get detailed team info
    const team = await Team.findById(student.teamId._id)
      .populate('leaderId', 'name email avatar rollNumber isTeamLeader')
      .populate('members', 'name email avatar rollNumber isTeamLeader')
      .lean();

    // Add calculated fields
    team.memberCount = team.members.length;
    team.isFull = team.memberCount >= (team.maxMembers || 4);
    team.availableSlots = (team.maxMembers || 4) - team.memberCount;

    console.log(` Team Info:`);
    console.log(`   Name: ${team.name}`);
    console.log(`   Code: ${team.code}`);
    console.log(`   Members: ${team.memberCount}/${team.maxMembers}`);
    console.log(`   Leader: ${team.leaderId?.name || "Unknown"}`);

    return res.status(200).json({
      success: true,
      hasTeam: true,
      team,
      isLeader: student.isTeamLeader,
      studentRole: student.isTeamLeader ? "Leader" : "Member"
    });

  } catch (error) {
    console.error(" GET TEAM ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching team information"
    });
  }
};

// ==================== LEAVE TEAM ====================
export const leaveTeam = async (req, res) => {
  console.log("\n" + "=".repeat(60));
  console.log(" LEAVE TEAM REQUEST");
  console.log("=".repeat(60));
  console.log(`Student ID: ${req.studentId}`);
  
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
    console.log(" Transaction started");
    
    const studentId = req.studentId;
    
    const student = await Student.findById(studentId).session(session);
    if (!student) {
      console.log(" Student not found");
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (!student.teamId) {
      console.log(" Student not in any team");
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You are not in any team"
      });
    }

    console.log(` Student found: ${student.name}`);
    console.log(`Current team ID: ${student.teamId}`);

    const team = await Team.findById(student.teamId).session(session);
    if (!team) {
      console.log(" Team not found (may have been deleted)");
      // Clean up student record
      student.teamId = null;
      student.isTeamLeader = false;
      await student.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      return res.status(200).json({
        success: true,
        message: "Successfully left the team"
      });
    }

    console.log(` Team found: ${team.name}`);
    console.log(`Current members: ${team.members.length}`);

    // Remove student from team
    const initialMemberCount = team.members.length;
    team.members = team.members.filter(memberId => 
      memberId.toString() !== studentId.toString()
    );
    
    console.log(`Removed student. New member count: ${team.members.length}`);

    // Handle leader transfer if needed
    if (student.isTeamLeader) {
      console.log(" Student is team leader");
      
      if (team.members.length === 0) {
        console.log(" No members left - deleting team");
        await Team.findByIdAndDelete(team._id).session(session);
      } else {
        // Assign new leader
        const newLeaderId = team.members[0];
        console.log(` Transferring leadership to: ${newLeaderId}`);
        
        team.leaderId = newLeaderId;
        
        // Update new leader's status
        await Student.findByIdAndUpdate(
          newLeaderId,
          { isTeamLeader: true },
          { session }
        );
        
        await team.save({ session });
      }
    } else {
      console.log(" Student is regular member - just removing from team");
      await team.save({ session });
    }

    // Update student
    student.teamId = null;
    student.isTeamLeader = false;
    await student.save({ session });
    console.log(" Student record updated");

    await session.commitTransaction();
    session.endSession();
    
    console.log("\n" + "=".repeat(60));
    console.log(" STUDENT LEFT TEAM SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`Student: ${student.name}`);
    console.log(`Team: ${team.name}`);
    console.log(`Members before: ${initialMemberCount}, after: ${team.members.length}`);
    console.log("=".repeat(60) + "\n");

    return res.status(200).json({
      success: true,
      message: "Successfully left the team"
    });

  } catch (error) {
    console.error("\n LEAVE TEAM ERROR:", error);
    
    try {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      session.endSession();
    } catch (sessionError) {
      console.error("Error cleaning up session:", sessionError);
    }
    
    return res.status(500).json({
      success: false,
      message: "An error occurred while leaving the team. Please try again."
    });
  }
};

// ==================== GET TEAM BY CODE ====================
export const getTeamByCode = async (req, res) => {
  const { code } = req.params;
  
  console.log("\n GET TEAM BY CODE REQUEST");
  console.log(`Code: "${code}"`);
  
  try {
    if (!code?.trim()) {
      console.log(" No code provided");
      return res.status(400).json({
        success: false,
        message: "Team code is required"
      });
    }

    const teamCode = code.trim();
    const team = await Team.findOne({ code: teamCode })
      .populate('leaderId', 'name rollNumber')
      .populate('members', 'name rollNumber')
      .select('name code subject members maxMembers createdAt')
      .lean();

    if (!team) {
      console.log(` Team not found with code: "${teamCode}"`);
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Calculate additional info
    team.memberCount = team.members.length;
    team.availableSlots = (team.maxMembers || 4) - team.memberCount;
    team.isJoinable = team.availableSlots > 0;

    console.log(` Team found: ${team.name}`);
    console.log(`  Members: ${team.memberCount}/${team.maxMembers}`);
    console.log(`   Available slots: ${team.availableSlots}`);

    return res.status(200).json({
      success: true,
      team
    });

  } catch (error) {
    console.error(" GET TEAM BY CODE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching team information"
    });
  }
};

// ==================== DEBUG ENDPOINT ====================
export const debugTeams = async (req, res) => {
  console.log("\n DEBUG TEAMS ENDPOINT CALLED");
  
  try {
    const teamCount = await Team.countDocuments();
    console.log(`Total teams in database: ${teamCount}`);
    
    const teams = await Team.find({}, 'code name subject members createdAt');
    console.log("\n ALL TEAMS IN DATABASE:");
    teams.forEach((team, index) => {
      console.log(`${index + 1}. ${team.code} - "${team.name}" (${team.subject})`);
      console.log(`   Members: ${team.members.length}, Created: ${team.createdAt}`);
    });
    
    // Check for duplicates
    const codes = teams.map(t => t.code);
    const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);
    
    if (duplicates.length > 0) {
      console.log("\n DUPLICATE CODES FOUND:", duplicates);
    } else {
      console.log("\n No duplicate codes found");
    }
    
    return res.json({
      success: true,
      totalTeams: teamCount,
      teams: teams,
      hasDuplicates: duplicates.length > 0,
      duplicates: duplicates
    });
    
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};