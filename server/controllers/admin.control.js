import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
import Team from "../models/team.model.js";

//admin dashboard ko lagi
export const getDashboardStats = async (req, res) => {
  try {
    const [totalTeachers, totalStudents, totalProjects, activeProjects] =
      await Promise.all([
        Teacher.countDocuments(),
        Student.countDocuments(),
        Team.countDocuments(),
        Team.countDocuments({ status: "active" }),
      ]);

    res.json({
      success: true,
      data: {
        totalTeachers,
        totalStudents,
        totalProjects,
        activeProjects,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//teachers bhanne page ko lagi
export const getAllTeachers = async (req, res) => {
  try {
    const search = req.query.search || "";

    const teachers = await Teacher.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("name email activeStatus specialization");

    res.json({ success: true, teachers });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//teacher enable and disable thing
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
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//listing students by semester
export const getStudentsBySemester = async (req, res) => {
  try {
    const semester = Number(req.query.semester);
    const search = req.query.search || "";

    const query = {
      semester,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const students = await Student.find(query)
      .select("name email semester activeStatus team")
      .populate("team", "name");

    res.json({ success: true, students });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/*
//student enable disable
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
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
*/
