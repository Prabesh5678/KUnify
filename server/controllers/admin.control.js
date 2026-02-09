import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
import natural from "natural";
import Team from "../models/team.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import LogEntry from "../models/logEntry.model.js";
import mongoose from "mongoose";

// Admin Login (with email + password)
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("hi");
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("adminToken", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({ success: true, message: "Admin logged in" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
//get admin auth
export const isAuth = async (_, res) => {
  return res.json({ success: true, message: "Welcome Admin!" });
};

// Dashboard Stats
export const getDashboardStats = async (_, res) => {
  try {
    const [totalTeachers, totalStudents, totalProjects, totalRequests] =
      await Promise.all([
        Teacher.countDocuments(),
        Student.countDocuments(),
        Team.countDocuments(),
        Team.countDocuments({ supervisorStatus: "teacherApproved" }),
      ]);
    res.json({
      success: true,
      totalTeachers,
      totalStudents,
      totalProjects,
      totalRequests,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const regularFaculty = await Teacher.find({
      googleId: { $exists: true, $ne: null },
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("name email specialization phone activeStatus googleId");
    const visitingFaculty = await Teacher.find({
      googleId: { $in: [null, undefined] },
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("name email specialization phone activeStatus");
    res.json({ success: true, regularFaculty, visitingFaculty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle teacher activeStatus
export const toggleTeacherStatus = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher)
      return res.status(404).json({ success: false, message: "Teacher not found" });
    teacher.activeStatus = !teacher.activeStatus;
    await teacher.save();
    res.json({ success: true, activeStatus: teacher.activeStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create visiting faculty
export const createVisitingTeacher = async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;
    if (!name || !email || !password)
      return res.json({ success: false, message: "Something is missing!" });

    const existing = await Teacher.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Teacher already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = await Teacher.create({
      name,
      email,
      password: hashedPassword,
      specialization,
      visiting: true,
      activeStatus: true,
    });
    res.json({ success: true, teacher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reset visiting faculty password
// POST /api/admin/teacher/reset-password
export const resetVisitingTeacherPassword = async (req, res) => {
  try {
    const { teacherId, newPassword } = req.body;
    if (!teacherId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Provide teacherId and newPassword",
      });
    }
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    teacher.password = hashedPassword;
    teacher.passwordChangedAt = Date.now();
    await teacher.save();
    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// Get students by semester and department
export const getStudentsBySemester = async (req, res) => {
  try {
    const semester = req.query.semester || "";
    const department = req.query.department || "";
    const search = req.query.search || "";
    const filter = {
      semester: semester,
    };
    if (department) {
      filter.department = department;
    }
    const students = await Student.find({
      ...filter,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    })
      .select("name email semester rollNumber department logsheets teamId")
      .populate("teamId", "name");
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/supervisor/pending
export const getSupervisorRequests = async (req, res) => {
  try {
    const teams = await Team.find({ supervisorStatus: "teacherApproved" })
      .populate("leaderId", "name semester department email")
      .populate("supervisor", "name email phone specialization")
      .populate("members", "name email semester department rollNumber ")
      .populate("proposal");
    if (!teams) throw new Error("No Teams Found!");
    res.json({ success: true, teams });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/supervisor/approve
export const approveSupervisorRequest = async (req, res) => {
  try {
    const { teamId } = req.body;
    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    if (
      team.supervisorStatus !== "teacherApproved" &&
      team.supervisorStatus !== "APPROVED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Teacher has not approved yet",
      });
    }

    const teacher = await Teacher.findById(team.supervisor);
    if (!teacher)
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });

    team.supervisor = teacher._id;
    team.supervisorStatus = "adminApproved";

    if (!teacher.assignedTeams.includes(team._id)) {
      teacher.assignedTeams.push(team._id);
    }

    teacher.approvedTeams = teacher.approvedTeams.filter(
      (id) => id.toString() !== team._id.toString(),
    );
    await Promise.all([team.save(), teacher.save()]);
    res.json({ success: true, message: "Supervisor assigned successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Decline supervisor request
// POST /api/admin/supervisor/decline
export const declineSupervisorRequest = async (req, res) => {
  try {
    const { teamId } = req.body;
    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    const teacher = await Teacher.findById(team.supervisor);

    team.supervisorStatus = "pending";
    team.requestedTeacher = null;

    if (teacher) {
      teacher.approvedTeams = teacher.approvedTeams.filter(
        (id) => id.toString() !== team._id.toString(),
      );
    }
    await Promise.all([team.save(), teacher?.save()]);
    res.json({ success: true, message: "Request declined by admin" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//fetching all teams
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("leaderId", "name email semester rollNumber department")
      .populate("supervisor", "name email")
      .populate("members", "name email semester rollNumber department")
      .populate("proposal");
    const assignedTeams = [];
    const unassignedTeams = [];

    teams.forEach((team) => {
      //if team. supervisor samma thapeko
      const proposal = team.proposal || {};

      const teamData = {
        ...team.toObject(),
        proposal,
        keywords: proposal.projectKeyword || "", 
      };
      if (team.supervisor && team.supervisorStatus === "adminApproved") {
        assignedTeams.push(team);
      } else {
        unassignedTeams.push(team);
      }
    });
    res.json({ success: true, assignedTeams, unassignedTeams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//fetching logsheet
export const getTeamLogsheets = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { week, studentId } = req.query;
    const query = { teamId };
    if (week && week !== "all") query.week = week;
    if (studentId && studentId !== "all") query.createdBy = studentId;
    const logs = await LogEntry.find(query)
      .populate("createdBy", "name email semester rollNumber department")
      .lean();
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
//cosine similarity
const tokenizer = new natural.WordTokenizer();
function getCosineSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  const tokens1 = text1.toLowerCase().split(/[\s,]+/).filter(t => t.trim() !== "");
  const tokens2 = text2.toLowerCase().split(/[\s,]+/).filter(t => t.trim() !== "");
  const allTokens = Array.from(new Set([...tokens1, ...tokens2]));
  const vec1 = allTokens.map(t => tokens1.filter(x => x === t).length);
  const vec2 = allTokens.map(t => tokens2.filter(x => x === t).length);
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (magnitude1 * magnitude2);
}
export const getTeacherSimilarity = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId)
      .populate("proposal", "projectKeyword");
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    if (team.supervisor || team.requestedSupervisor) {
      return res.status(400).json({
        message: "Similarity only for teams without requested/assigned supervisor"
      });
    }
    const teachers = await Teacher.find({
      activeStatus: true,
      isProfileCompleted: true,
    });
    const teacherScores = teachers.map((teacher) => {
      const score = getCosineSimilarity(
        team.proposal?.projectKeyword || "",
        teacher.specialization
      );
      return {
        teacherId: teacher._id,
        teacherName: teacher.name,
        specialization: teacher.specialization,
        similarityScore: parseFloat(score.toFixed(2)),
      };
    });
    const result = {
      teamId: team._id,
      teamName: team.name,
      keywords: team.proposal?.projectKeyword || "",
      teacherScores: teacherScores.sort(
        (a, b) => b.similarityScore - a.similarityScore
      ),
    };
   return res.status(200).json({
  success: true,
  message: "Teacher similarity calculated successfully",
  data: result,
});
  } catch (err) {
    console.error("Error calculating similarity:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// PUT /api/admin/assign-supervisor
export const assignSupervisorManually = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    console.log(req.body)
    const { teamId, teacherId } = req.body;
    if (!teamId || !teacherId) {
      throw new Error("Provide teamId and teacherId");
    }
    const team = await Team.findById(teamId);
    if (!team) throw new Error("Team not found!");
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) throw new Error("Teacher not found!");
    team.supervisor = teacher._id;
    team.supervisorStatus = "adminApproved";
    await team.save({ session });
    if (!teacher.assignedTeams.includes(team._id)) {
      teacher.assignedTeams.push(team._id);
      await teacher.save();
    }
    if (teacher.pendingTeams.includes(team._id)) {
      teacher.pendingTeams.pull(team._id);
    }
    if (teacher.approvedTeams.includes(team._id)) {
      teacher.approvedTeams.pull(team._id);
    }
    await teacher.save({ session });
await session.commitTransaction();
    res.json({
      success: true,
      message: `Supervisor ${teacher.name} assigned to ${team.name} successfully!`,
      teamId: team._id,
      supervisorId: teacher._id,
    });
  } catch (err) {
    if (session) await session.abortTransaction();

    console.error("Error assigning supervisor manually:", err);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  } finally {
    if (session) session.endSession();
  }
};
