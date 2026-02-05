import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
import Team from "../models/team.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Admin Login (with email + password)
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
console.log('hi')
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

// Admin Logout
export const adminLogout = (req, res) => {
  res.clearCookie("adminToken");
  res.json({ success: true, message: "Admin logged out" });
};

// Dashboard Stats
export const getDashboardStats = async (_, res) => {
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
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // naya password hash garna
    const hashedPassword = await bcrypt.hash(newPassword, 10);//10 bhaneko chai salt round ho (security level bhanna milcha yeslai)
    teacher.password = hashedPassword;

    await teacher.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get students by semester and department
export const getStudentsBySemester = async (req, res) => {
  try {
    const semester = req.query.semester || "";   
    const department = req.query.department || ""; // <-- new filter
    const search = req.query.search || "";

    const filter = {
      semester: semester,
    };

    if (department) {
      filter.department = department; // add department filter only if provided
    }

    const students = await Student.find({
      ...filter,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    })
      .select("name email semester rollNumber department teamId")
      .populate("teamId", "name");

    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET /api/admin/supervisor/pending
export const getPendingSupervisorRequests = async (req, res) => {
  try {
   
    const teams = await Team.find({ supervisorStatus: "teacherApproved" })
      .populate("leaderId", "name semester department email")
      .populate("supervisor", "name email") 
      .populate("members", "name email semester department rollNumber ")
      .populate("proposal")
      .populate("logsheets");

    res.json({ success: true, teams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Approve supervisor request
// POST /api/admin/supervisor/approve
export const approveSupervisorRequest = async (req, res) => {
  try {
    const { teamId } = req.body;

    const team = await Team.findById(teamId);
    if (!team)
      return res.status(404).json({ success: false, message: "Team not found" });

    
    if (team.supervisorStatus !== "teacherApproved") {
      return res.status(400).json({
        success: false,
        message: "Teacher has not approved yet",
      });
    }

    const teacher = await Teacher.findById(team.requestedTeacher);
    if (!teacher)
      return res.status(404).json({ success: false, message: "Teacher not found" });

   
    team.supervisor = teacher._id;
    team.supervisorStatus = "adminApproved";

    
    if (!teacher.assignedTeams.includes(team._id)) {
      teacher.assignedTeams.push(team._id);
    }

    
    teacher.approvedTeams = teacher.approvedTeams.filter(
      (id) => id.toString() !== team._id.toString()
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
      return res.status(404).json({ success: false, message: "Team not found" });

    const teacher = await Teacher.findById(team.requestedTeacher);

   
    team.supervisorStatus = "notApproved";
    team.requestedTeacher = null;

    
    if (teacher) {
      teacher.approvedTeams = teacher.approvedTeams.filter(
        (id) => id.toString() !== team._id.toString()
      );
    }

    await Promise.all([team.save(), teacher?.save()]);

    res.json({ success: true, message: "Request declined by admin" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//fetching team
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("leaderId", "name semester department")
      .populate("supervisor", "name")
      .populate("members", "name email semester rollNumber department")
      .populate("proposal")
      .populate("leaderId","logsheets");

    const assignedTeams = [];
    const unassignedTeams = [];

    teams.forEach((team) => {
      if (team.supervisor) assignedTeams.push(team);
      else unassignedTeams.push(team);
    });

    res.json({
      success: true,
      assignedTeams,
      unassignedTeams,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
