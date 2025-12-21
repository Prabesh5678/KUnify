import Team from "../models/team.model.js";
import Student from "../models/student.model.js";
import mongoose from "mongoose";


// Generate team code - INCLUDING ALL CHARACTERS as requested
const generateTeamCode = () => {
  
  // Include ALL characters as you wanted: 0-9, A-Z, a-z
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  
  // Generate 6 random characters
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars.charAt(randomIndex);
  }
  
  return code;
};

// ==================== CREATE TEAM FUNCTION ====================
export const createTeam = async (req, res) => {
  
  // Log incoming request details
  
  const session = await mongoose.startSession();
  
  try {
    // Start transaction
    await session.startTransaction();
    
    const studentId = req.studentId;
    const { name, subject } = req.body;

    // ========== VALIDATION PHASE ==========
    
    if (!name?.trim() || !subject?.trim()) {
      
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Team name and subject are required"
      });
    }

    // ========== STUDENT CHECK PHASE ==========
    
    const student = await Student.findById(studentId).session(session);
    
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Check if student already has a team
    if (student.teamId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You already belong to a team"
      });
    }

    // ========== TEAM CODE GENERATION PHASE ==========
    
    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 15;
    
    
    while (!isUnique && attempts < maxAttempts) {
      attempts++;
      code = generateTeamCode();
      
      // Check if code exists
      const existingTeam = await Team.findOne({ code }).session(session);
      
      if (!existingTeam) {
        isUnique = true;
      } else {
      }
    }

    if (!isUnique) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        success: false,
        message: "Failed to generate unique team code. Please try again."
      });
    }


    // ========== TEAM CREATION PHASE ==========
    
    const teamData = {
      name: name.trim(),
      code: code,
      subject: subject.trim(),
      leaderId: studentId,
      members: [studentId],
      maxMembers: 4
    };
    
    
    const team = new Team(teamData);
    
    await team.save({ session });

    // ========== STUDENT UPDATE PHASE ==========
    
    student.teamId = team._id;
    student.isTeamLeader = true;
    
    await student.save({ session });

    // ========== FINAL COMMIT PHASE ==========
    
    await session.commitTransaction();
    
    session.endSession();

    // ========== SUCCESS RESPONSE ==========

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
        await session.abortTransaction();
      }
      session.endSession();
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
  
  
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
    
    const studentId = req.studentId;
    const { code } = req.body;

    // Validation
    if (!code?.trim()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Team code is required"
      });
    }

    const teamCode = code.trim();

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

    // Find team (case-sensitive as per your schema)
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

    // Commit
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

    // Add calculated fields
    team.memberCount = team.members.length;
    team.isFull = team.memberCount >= (team.maxMembers || 4);
    team.availableSlots = (team.maxMembers || 4) - team.memberCount;


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
  
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
    
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


    // Remove student from team
    const initialMemberCount = team.members.length;
    team.members = team.members.filter(memberId => 
      memberId.toString() !== studentId.toString()
    );
    

    // Handle leader transfer if needed
    if (student.isTeamLeader) {
      
      if (team.members.length === 0) {
        await Team.findByIdAndDelete(team._id).session(session);
      } else {
        // Assign new leader
        const newLeaderId = team.members[0];
        
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
  
  
  try {
    if (!code?.trim()) {
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
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Calculate additional info
    team.memberCount = team.members.length;
    team.availableSlots = (team.maxMembers || 4) - team.memberCount;
    team.isJoinable = team.availableSlots > 0;


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
  
  try {
    const teamCount = await Team.countDocuments();
    
    const teams = await Team.find({}, 'code name subject members createdAt');
    teams.forEach((team, index) => {
    });
    
    // Check for duplicates
    const codes = teams.map(t => t.code);
    const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);
    
    if (duplicates.length > 0) {
    } else {
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