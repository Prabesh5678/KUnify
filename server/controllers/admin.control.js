import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
import Team from "../models/team.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [teachers, students, totalProjects, activeProjects] =
      await Promise.all([
        Teacher.countDocuments(),
        Student.countDocuments(),
        Team.countDocuments(),
        Team.countDocuments({ supervisorStatus: "adminApproved" }),
      ]);

    res.json({
      success: true,
      data: {
        teachers,
        students,
        totalProjects,
        activeProjects,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


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

export const toggleTeacherStatus = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher)
      return res.json({ success: false, message: "Teacher not found" });

    teacher.activeStatus = !teacher.activeStatus;
    await teacher.save();

    res.json({
      success: true,
      message: "Teacher status updated",
      activeStatus: teacher.activeStatus,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


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

export const toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student)
      return res.json({ success: false, message: "Student not found" });

    student.activeStatus = !student.activeStatus;
    await student.save();

    res.json({
      success: true,
      message: "Student status updated",
      activeStatus: student.activeStatus,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
