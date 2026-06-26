import jwt from "jsonwebtoken";
import Teacher from "../models/teacher.model.js";
import Team from "../models/team.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import LogEntry from "../models/logEntry.model.js";
import ProposalModel from "../models/proposal.model.js";
import Student from "../models/student.model.js";
import { enqueueLoginLog } from "../utils/loginQueue.js";
// POST /api/teacher/google-signin
export const googleSignIn = async (req, res) => {
  try {
    const credential = req.body.credential; // or { credential }
    if (!credential) {
      return res.json({ success: false, message: "No credential provided" });
    }

    // Check if teacher already exists
    let teacher = await Teacher.findOne({ email: credential.email });

    // Create teacher if not exists
    if (!teacher) {
      teacher = new Teacher({
        name: credential.name || "KU teacher",
        email: credential.email,
        googleId: credential.googleId,
        avatar: credential.picture,
        isProfileCompleted: false, // default
      });
    }
    teacher.lastLogin = new Date();
    await teacher.save();
enqueueLoginLog({ teacherId: teacher._id });
    // Generate JWT (FIXED: teacher._id, not student._id)
    const teacherToken = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Set cookie
    res.cookie("teacherToken", teacherToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });

    // Send proper user object
    return res.json({
      success: true,
      message: "Google sign-in successful",
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        avatar: teacher.avatar,
        role: "teacher",
        isProfileCompleted: teacher.isProfileCompleted,
      },
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Check if teacher is authenticated
export const isAuth = async (req, res) => {
  try {
    if (!req.teacherId) {
      return res.json({ success: false, message: "Not authenticated" });
    }
    const teacher = await Teacher.findById(req.teacherId);
    if (!teacher) {
      return res.json({ success: false, message: "Teacher not found" });
    }
    res.json({
      success: true,
      user: teacher,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// /api/teacher/setup-profile
export const profileCompletion = async (req, res) => {
  try {
    const teacherId = req.teacherId;
    const form = req.body;
    if (!form.phone || !form.specialization || !form.position) {
      return res.json({ success: false, message: "Provide all the details!" });
    } else {
      const teacher = await Teacher.findByIdAndUpdate(
        teacherId,
        {
          phone: form.phone,
          specialization: form.specialization,
          position: form.position,
          isProfileCompleted: true,
        },

        { runValidators: true, new: true },
      );
      return res.json({
        success: true,
        message: "Profile completed successfully",
        user: teacher,
      });
    }
  } catch (error) {
    console.error(error.stack);
    return res.json({
      success: false,
      message: "Couldnot complete the profile.",
    });
  }
};

// get /api/teacher/teams
export const teamRequest = async (req, res) => {
  try {
    const teacherId = req.teacherId;
    if (!teacherId) throw new Error("Couldnot find teacher id!");
    if (!req.query.get) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'get' is required",
      });
    }
    if (req.query.get === "request") {
      const requests = await Teacher.findById(teacherId)
        .select("pendingTeams")
        .populate({
          path: "pendingTeams",
          select: "name",
          populate: { path: "proposal", select: "-team" },
        });
      if (!requests)
        return res.json({ success: false, message: "Unable to find teacher!" });
      return res.json({ success: true, teams: requests.pendingTeams });
    } else if (req.query.get === "assigned") {
      const requests = await Teacher.findById(teacherId)
        .select("assignedTeams")
        .populate("assignedTeams");
      if (!requests)
        return res.json({ success: false, message: "Unable to find teacher!" });
      return res.json({ success: true, teams: requests.assignedTeams });
    } else if (req.query.get === "request-count") {
      const teacher = await Teacher.findById(teacherId).select("pendingTeams");
      const count = teacher?.pendingTeams?.length || 0;
      return res.json({ success: true, count });
    } else if (req.query.get === "all") {
      const requests = await Teacher.findById(teacherId)
        .select("assignedTeams approvedTeams pendingTeams -_id")
        .populate({
          path: "assignedTeams",
          populate: {
            path: "supervisor",
            select: "name",
          },
        });
      if (!requests)
        return res.json({ success: false, message: "Unable to find teacher!" });
      const totalLogs = await LogEntry.countDocuments({
        teamId: { $in: requests.assignedTeams },
      });
      return res.json({
        success: true,
        teams: requests,
        totalLogEntries: totalLogs,
      });
    } else if (req.query.get === "deletion") {
      const teacher = await Teacher.findById(teacherId)
        .select("deletionTeams")
        .populate({
          path: "deletionTeams",
          select: "name members supervisorStatus",
          populate: {         
        path: "members",
        select: "name",
      },
        });
      if (!teacher) {
        return res.json({ success: false, message: "Unable to find teacher!" });
      }
      const teams = teacher.deletionTeams;
      return res.json({ success: true, teams });
    } else {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'get' is invalid",
      });
    }
  } catch (error) {
    console.error(error.stack);
    return res.json({ success: false, message: "Unable to get team data!" });
  }
};

// post /api/teacher/team-request
export const teamApprove = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const teacherId = req.teacherId;
    if (!teacherId) throw new Error("Unable to get teacher id!");
    const { requestId } = req.body;
    if (!requestId) throw new Error("Unable to get team id!");
    const team = await Team.findById(requestId).session(session);
    if (!team) throw new Error("Unable to find team!");
    const teacher = await Teacher.findById(teacherId).session(session);
    if (!teacher || !teacher.pendingTeams.map(String).includes(requestId))
      throw new Error("Unable to find teacher or team is not in pending list!");

    if (req.query.action === "accept") {
      teacher.approvedTeams.addToSet(requestId);
      teacher.pendingTeams.pull(requestId);
      team.supervisorStatus = "teacherApproved";
      // mark which teacher requested/approved this team so admin can assign later
      team.requestedTeacher = teacherId;
      await Promise.all([teacher.save({ session }), team.save({ session })]);
      await session.commitTransaction();
      return res.json({ success: true, message: "Team accepted!" });
    } else if (req.query.action === "decline") {
      teacher.pendingTeams.pull(requestId);
      team.supervisorStatus = "rejected";
      team.supervisor = null;
      team.requestedTeacher = null;
      await Promise.all([teacher.save({ session }), team.save({ session })]);
      await session.commitTransaction();
      return res.json({ success: true, message: "Team declined!" });
    }
    throw new Error("Invalid action!");
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error(error.stack);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  } finally {
    if (session) session.endSession();
  }
};

//visiting faculty login
export const teacherLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.json({
        success: false,
        message: "Please provide all feilds!",
      });

    const teacher = await Teacher.findOne({ email }).select("+password").lean();

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: "Teacher not found!",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalidd credentials",
      });
    }
await Teacher.findByIdAndUpdate(teacher._id, { lastLogin: new Date() });
enqueueLoginLog({ teacherId: teacher._id });
    // create JWT
    const token = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // send cookie
    res.cookie("teacherToken", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });
    delete teacher.password;
    console.log(teacher);
    res.json({
      success: true,
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        avatar: teacher.avatar,
        role: "teacher",
        isProfileCompleted: teacher.isProfileCompleted,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Something wrong!" });
  }
};

// fetching logsheet
export const getTeamLogsheets = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { week, studentId } = req.query;

    const query = { teamId };

    if (week && week !== "all") query.week = week;
    if (studentId && studentId !== "all") query.createdBy = studentId;
    const logs = await LogEntry.find(query)
      .populate("createdBy", "name email semester rollNumber department")
      .populate("checkedBy", "name email")
      .populate("correctionRequestedBy", "name email")
      .populate("reviewTimeline.teacher", "name email")
      .lean();

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getReviewedLog = (logId) =>
  LogEntry.findById(logId)
    .populate("createdBy", "name email semester rollNumber department")
    .populate("checkedBy", "name email")
    .populate("correctionRequestedBy", "name email")
    .populate("reviewTimeline.teacher", "name email")
    .lean();

const ensureTeacherCanReviewLog = async (teacherId, logId) => {
  const log = await LogEntry.findById(logId);
  if (!log) {
    return { error: "Log not found" };
  }

  const team = await Team.findById(log.teamId);
  if (!team) {
    return { error: "Team not found" };
  }

  if (!team.supervisor || team.supervisor.toString() !== teacherId) {
    return { error: "You are not allowed to review this log" };
  }

  return { log };
};

// PATCH /api/teacher/logs/:logId/check
export const checkLogEntry = async (req, res) => {
  try {
    const teacherId = req.teacherId;
    const { logId } = req.params;
    const mark = Number(req.body.mark);

    if (!Number.isInteger(mark) || mark < 0 || mark > 5) {
      return res.json({
        success: false,
        message: "Please provide a mark from 0 to 5",
      });
    }

    const { log, error } = await ensureTeacherCanReviewLog(teacherId, logId);
    if (error) {
      return res.json({ success: false, message: error });
    }
    if (log.isChecked) {
  return res.json({ success: false, message: "Cannot request correction on an already checked log" });
}

    log.isChecked = true;
    log.checkedBy = teacherId;
    log.checkedAt = new Date();
    log.mark = mark;
    log.correctionRequested = false;
    log.correctionNote = "";
    log.correctionRequestedBy = null;
    log.correctionRequestedAt = null;
    log.reviewTimeline.push({
      action: "checked",
      mark,
      teacher: teacherId,
      at: log.checkedAt,
    });

    await log.save();

    const checkedLog = await getReviewedLog(log._id);

    return res.json({
      success: true,
      message: "Log checked successfully",
      log: checkedLog,
    });
  } catch (error) {
    console.error(error.stack);
    return res.json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

// PATCH /api/teacher/logs/:logId/request-correction
export const requestLogCorrection = async (req, res) => {
  try {
    const teacherId = req.teacherId;
    const { logId } = req.params;
    const { correctionNote } = req.body;

    if (!correctionNote || !correctionNote.trim()) {
      return res.json({
        success: false,
        message: "Please provide a correction note",
      });
    }

    const { log, error } = await ensureTeacherCanReviewLog(teacherId, logId);
    if (error) {
      return res.json({ success: false, message: error });
    }

    log.isChecked = false;
    log.checkedBy = null;
    log.checkedAt = null;
    log.mark = null;
    log.correctionRequested = true;
    log.correctionNote = correctionNote.trim();
    log.correctionRequestedBy = teacherId;
    log.correctionRequestedAt = new Date();
    log.reviewTimeline.push({
      action: "correction_requested",
      note: log.correctionNote,
      teacher: teacherId,
      at: log.correctionRequestedAt,
    });

    await log.save();

    const correctionLog = await getReviewedLog(log._id);

    return res.json({
      success: true,
      message: "Correction requested successfully",
      log: correctionLog,
    });
  } catch (error) {
    console.error(error.stack);
    return res.json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

// /api/teacher/delete-team/:teamId
export const deleteTeam = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const action = req.query.action;
    const teacherId = req.teacherId;
    const { teamId } = req.params;
    if (!teacherId) throw new Error("Unable to get teacher id!");
    const teacher = await Teacher.findById(teacherId).session(session);
    if (!teacher) throw new Error("Unable to find teacher!");
    if (!teamId) throw new Error("Unable to get team id!");
    const team = await Team.findById(teamId)
      .populate("leaderId")
      .session(session);
    if (!team || !team.leaderId)
      throw new Error("Unable to find team or leader!");
    const leader = team.leaderId;
    if (team.supervisorStatus !== "underDeletion") {
      throw new Error("Team is not marked for deletion!");
    }
    if (team.supervisor && team.supervisor._id.toString() !== teacherId) {
      throw new Error("You are not the supervisor of this team!");
    }

    if (action === "cancel") {
      team.supervisorStatus = "adminApproved";
      teacher.deletionTeams.pull(teamId);
      await Promise.all([team.save({ session }), teacher.save({ session })]);
      await session.commitTransaction();
      return res.json({ success: true, message: "Team deletion cancelled!" });
    } else if (action === "confirm") {
      if (team.members.length > 1)
        throw new Error("Team still has members! Unable to delete!");
      teacher.deletionTeams.pull(teamId);
      teacher.pendingTeams.pull(teamId);
      teacher.approvedTeams.pull(teamId);
      teacher.activeCount>=0? teacher.activeCount -= 1 : null;
      await Student.findByIdAndUpdate(
        team.leaderId._id,
        {
          $set: {
            teamId: null,
            isTeamLeader: false,
            isApproved: false,
          },
        },
        { session },
      );
      await LogEntry.deleteMany({ teamId }, { session });
      await ProposalModel.deleteMany({ team: teamId }, { session });

      await Promise.all([
        team.deleteOne({ session }),
        teacher.save({ session }),
      ]);
      await session.commitTransaction();
      return res.json({ success: true, message: "Team deleted successfully!" });
    } else {
      throw new Error("Invalid action!");
    }
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error(error);
    res.json({ success: false, message: error.message||"Unable to delete team" });
  }
};


// POST /api/teacher/my-projects
export const createMyProject = async (req, res) => {
  try {
    const { title, description, technologies } = req.body;

    if (!title || !description) {
      return res.json({ success: false, message: "Title and description are required!" });
    }

    const project = new TeacherProject({
      teacher: req.teacherId,
      title,
      description,
      technologies: technologies || [],
    });

    await project.save();

    return res.json({ success: true, message: "Project created!", project });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// GET /api/teacher/my-projects
export const getMyProjects = async (req, res) => {
  try {
    const projects = await TeacherProject.find({ teacher: req.teacherId }).sort({ createdAt: -1 });

    return res.json({ success: true, projects });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// GET /api/teacher/my-projects/:projectId/applicants
export const getProjectApplicants = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find all students who applied to this project
    const students = await Student.find({
      "appliedProjects.project": projectId,
    }).select("name email rollNumber semester department appliedProjects");

    // Return only the relevant application info per student
    const applicants = students.map((student) => {
      const application = student.appliedProjects.find(
        (a) => a.project.toString() === projectId
      );
      return {
        studentId: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        semester: student.semester,
        status: application.status,
        appliedAt: application.appliedAt,
      };
    });

    return res.json({ success: true, applicants });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// PUT /api/teacher/my-projects/:projectId
export const updateMyProject = async (req, res) => {
  try {
    const { title, description, technologies, status } = req.body;

    const project = await TeacherProject.findOneAndUpdate(
      { _id: req.params.projectId, teacher: req.teacherId },
      { title, description, technologies, status },
      { new: true }
    );

    if (!project) {
      return res.json({ success: false, message: "Project not found!" });
    }

    return res.json({ success: true, message: "Project updated!", project });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// DELETE /api/teacher/my-projects/:projectId
export const deleteMyProject = async (req, res) => {
  try {
    const project = await TeacherProject.findOneAndDelete({
      _id: req.params.projectId,
      teacher: req.teacherId,
    });

    if (!project) {
      return res.json({ success: false, message: "Project not found!" });
    }

    return res.json({ success: true, message: "Project deleted!" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// POST /api/teacher/my-projects/:projectId/applicants/:studentId?action=accept
// POST /api/teacher/my-projects/:projectId/applicants/:studentId?action=reject
export const handleStudentApplication = async (req, res) => {
  try {
    const { projectId, studentId } = req.params;
    const { action } = req.query;

    if (action !== "accept" && action !== "reject") {
      return res.json({ success: false, message: "Action must be 'accept' or 'reject'" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.json({ success: false, message: "Student not found!" });
    }

    // Find this project in the student's appliedProjects
    const application = student.appliedProjects.find(
      (a) => a.project.toString() === projectId
    );

    if (!application) {
      return res.json({ success: false, message: "Student has not applied to this project!" });
    }

    if (application.status !== "pending") {
      return res.json({ success: false, message: "This application is already processed!" });
    }

    if (action === "accept") {
      if (student.teamId) {
        return res.json({ success: false, message: "This student already joined a team!" });
      }
      application.status = "accepted";
    } else {
      application.status = "rejected";
    }

    await student.save();

    return res.json({ success: true, message: `Student ${action}ed successfully!` });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};