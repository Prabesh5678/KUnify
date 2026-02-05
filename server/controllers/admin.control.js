import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
import Team from "../models/team.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Admin Login (with email + password)
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

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
export const isAuth = async (_,res) => {
   return res.json({success:true,message:'Welcome Admin!'});
};

// Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const [totalTeachers, totalStudents, totalProjects, activeProjects] =
      await Promise.all([
        Teacher.countDocuments(),
        Student.countDocuments(),
        Team.countDocuments(),
        Team.countDocuments({ supervisorStatus: "adminApproved" }),
      ]);

    res.json({
      success: true,
      totalTeachers,
      totalStudents,
      totalProjects,
      activeProjects,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const search = req.query.search || "";

    const teachers = await Teacher.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("name email specialization activeStatus");

    res.json({ success: true, teachers });
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

    const existing = await Teacher.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: "Teacher already exists" });

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

// Get students by semester
export const getStudentsBySemester = async (req, res) => {
  try {
    const semester = req.query.semester || "";   // <-- keep as string
    const search = req.query.search || "";

    const students = await Student.find({
      semester: semester,    // <-- string match
      $or: [
        { name: { $regex: search, $options: "i" } }, //regex=pattern matching search
        { email: { $regex: search, $options: "i" } },//option:i bhaneko chai case insensitive search 
      ],
    })
      .select("name email semester rollNumber teamId")
      .populate("teamId", "name");

    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Approve supervisor request (Admin)
// POST /api/admin/supervisor/approve
export const approveSupervisorRequest = async (req, res) => {
  try {
    const { teamId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });

    const teacher = await Teacher.findById(team.requestedTeacher);
    if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

    // Update team status to pending teacher approval
    team.supervisorStatus = "pendingTeacher";
    await team.save();

    // Add team to teacher.pendingTeams if not already present
    if (!teacher.pendingTeams.includes(team._id)) {
      teacher.pendingTeams.push(team._id);
      await teacher.save();
    }

    res.json({
      success: true,
      message: "Request approved by admin, now pending teacher approval",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Decline supervisor request (Admin)
// POST /api/admin/supervisor/decline
export const declineSupervisorRequest = async (req, res) => {
  try {
    const { teamId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });

    const teacher = await Teacher.findById(team.requestedTeacher);

    // Update team
    team.supervisorStatus = "notApproved";
    team.requestedTeacher = null;
    await team.save();

    // Remove team from teacher.pendingTeams if exists
    if (teacher) {
      teacher.pendingTeams = teacher.pendingTeams.filter(id => id.toString() !== teamId);
      await teacher.save();
    }

    res.json({ success: true, message: "Request declined by admin" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};