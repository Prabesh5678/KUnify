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

// Admin Logout
export const adminLogout = (req, res) => {
  res.clearCookie("adminToken");
  res.json({ success: true, message: "Admin logged out" });
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
/*
export const getStudentsBySemester = async (req, res) => {
  try {
    const semester = Number(req.query.semester);
    const search = req.query.search || "";

    const students = await Student.find({
      semester,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    })
      .select("name email semester activeStatus team")
      .populate("team", "name");

    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
*/
// Get students by semester
export const getStudentsBySemester = async (req, res) => {
  try {
    const semester = req.query.semester || "";   // <-- keep as string
    const search = req.query.search || "";

    const students = await Student.find({
      semester: semester,    // <-- string match
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    })
      .select("name email semester activeStatus rollNumber teamId")
      .populate("teamId", "name");

    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Toggle student activeStatus
export const toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    student.activeStatus = !student.activeStatus;
    await student.save();

    res.json({ success: true, activeStatus: student.activeStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
