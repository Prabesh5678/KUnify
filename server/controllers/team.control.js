import mongoose from "mongoose";
import Team from "../models/team.model.js";
import Student from "../models/student.model.js";
import Teacher from "../models/teacher.model.js";
import proposalModel from "../models/proposal.model.js";
import LogEntry from "../models/logEntry.model.js";

const generateTeamCode = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};
// POST /api/team/create
export const createTeam = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const { name, subject } = req.body;
    const studentId = req.studentId;
    if (!studentId) throw new Error("StudentId Error!");
    if (!name || !subject) {
      throw new Error("All fields required!");
    }

    const leader = await Student.findById(studentId).session(session);
    if (leader.teamId) {
      throw new Error("Already in a team!");
    }

    const team = await Team.create(
      [
        {
          name,
          subject,
          code: generateTeamCode(),
          leaderId: studentId,
          members: [studentId],
        },
      ],
      { session },
    );
    console.log(team[0]);
    leader.teamId = team[0]._id;
    leader.isTeamLeader = true;
    leader.isApproved = true;
    // leader.lastTeamId = null;

    await leader.save({ session });
    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Team created successfully",
      team: team[0],
    });
  } catch (err) {
    if (session) await session.abortTransaction();
    console.error(err.stack);
    return res.json({
      success: false,
      message: err.message || "Failed to create team",
    });
  } finally {
    if (session) session.endSession();
  }
};

// POST /api/team/join
export const joinTeam = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const { code, subject } = req.body;
    const studentId = req.studentId;

    if (!code || !subject) {
      throw new Error("Something is missing");
    }

    const student = await Student.findById(studentId).session(session);
    if (student.teamId || student.isTeamLeader) {
      throw new Error("Already in a team!");
    }

    const team = await Team.findOne({ code, subject }).session(session);
    if (!team) {
      throw new Error("Invalid team code or select the valid subject!");
    }

    if(team.supervisorStatus==='underDeletion') 
      throw new Error("Team is under deletion process so unable to join!");

    team.members.addToSet(studentId);

    student.teamId = team._id;
    student.isApproved = false;
    student.isTeamLeader = false;

    await Promise.all([team.save({ session }), student.save({ session })]);
    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Joined team. Waiting for leader approval.",
    });
  } catch (err) {
    if (session) await session.abortTransaction();
    console.error(err.stack);
    return res.json({
      success: false,
      message: err.message || "Unable to join team",
    });
  } finally {
    if (session) session.endSession();
  }
};
// POST /api/team/leave
export const leaveTeam = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const studentId = req.studentId;
    const student = await Student.findById(studentId).session(session);

    if (!student || !student.teamId) {
      throw new Error("Not in any team!");
    }

    const team = await Team.findById(student.teamId).session(session);

    team.members.pull(studentId);

    // student.lastTeamId = student.teamId;
    student.teamId = null;
    student.isTeamLeader = false;
    student.isApproved = false;

    await Promise.all([team.save({ session }), student.save({ session })]);

    await session.commitTransaction();
    return res.json({ success: true, message: "Left team successfully" });
  } catch (err) {
    if (session) await session.abortTransaction();
    console.error(err.stack);
    return res.json({
      success: false,
      message: err.message || "Unable to leave team",
    });
  } finally {
    if (session) session.endSession();
  }
};

// GET /api/team/:teamId
export const teamInfo = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId)
      .populate("leaderId supervisor", "name email")
      .populate("members", "name email isApproved");

    if (!team) {
      return res.json({ success: false, message: "Team not found!" });
    }
    console.log(team);
    return res.json({ success: true, team });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Failed to fetch team info" });
  }
};

// POST /api/team/approve/:teamId
export const memberApprove = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const leaderId = req.studentId;
    const { teamId } = req.params;
    const { memberId, action, memberCount } = req.body;
    const team = await Team.findById(teamId).session(session);
    if (!team) {
      throw new Error("Team not found!");
    }

    if (team.leaderId.toString() !== leaderId.toString()) {
      throw new Error("Only leader can approve members!");
    }

    const member = await Student.findById(memberId).session(session);
    if (!member || member.teamId?.toString() !== teamId) {
      throw new Error("Invalid member!");
    }

    if (action === "approve") {
      if (memberCount >= 5) throw new Error("Max member reached!");
      member.isApproved = true;
      await member.save({ session });
      await session.commitTransaction();
      return res.json({ success: true, message: "Member approved!" });
    }

    if (action === "decline") {
      team.members.pull(memberId);
      member.teamId = null;
      member.isApproved = false;
      // member.lastTeamId = teamId;

      await Promise.all([team.save({ session }), member.save({ session })]);
      await session.commitTransaction();
      return res.json({ success: true, message: "Member declined!" });
    }

    throw new Error("Invalid action!");
  } catch (err) {
    if (session) await session.abortTransaction();
    console.error(err.stack);
    return res.json({
      success: false,
      message: err.message || "Approval failed!",
    });
  } finally {
    if (session) session.endSession();
  }
};

// POST /api/team/delete
export const deleteTeam = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const studentId = req.studentId;
    const student = await Student.findById(studentId).session(session);

    if (!student || !student.teamId || !student.isTeamLeader) {
      throw new Error("Not in any team or isn't a teamleader!");
    }

    const team = await Team.findById(student.teamId)
      .populate("supervisor")
      .session(session);
    if (!team) throw new Error("Team not found!");
    // if (team.supervisorStatus === "adminApproved")
    //   throw new Error("Supervisor already allocated so unable to delete team!");
    const count = team.members.length;
    if (count > 1 || team.leaderId.toString() !== studentId) {
      throw new Error("Not a leader or more team members!");
    }
    if (team.supervisor) {
      const teacher = team.supervisor;
      if (team.supervisorStatus === "adminApproved") {
        teacher.deletionTeams.addToSet(student.teamId);
        team.supervisorStatus = "underDeletion";
        await Promise.all([team.save({ session }), teacher.save({ session })]);
        await session.commitTransaction();
        return res.json({
          success: true,
          message: "Team marked for deletion. Waiting for teacher's approval!",
        });
      }
      teacher.pendingTeams.pull(student.teamId);
      teacher.approvedTeams.pull(student.teamId);
      await teacher.save({ session });
    }

    (await proposalModel.deleteMany({ team: student.teamId }, { session }),
      await LogEntry.deleteMany({ teamId: student.teamId }, { session }),
      team.members.pull(studentId));

    // student.lastTeamId = student.teamId;
    student.teamId = null;
    student.isTeamLeader = false;
    student.isApproved = false;

    await Promise.all([team.deleteOne({ session }), student.save({ session })]);

    await session.commitTransaction();
    return res.json({ success: true,deleted:true, message: "Deleted team successfully" });
  } catch (err) {
    if (session) await session.abortTransaction();
    console.error(err.stack);
    return res.json({
      success: false,
      message: err.message || "Unable to delete team",
    });
  } finally {
    if (session) session.endSession();
  }
};

// put //api/team/req-supervisor
export const requestSupervisor = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const { teamId, teacherId } = req.body;

    if (!teamId || !teacherId) {
      throw new Error("Team and Teacher are required");
    }

    const team = await Team.findById(teamId)
      .populate("proposal")
      .session(session);

    if (!team) {
      throw new Error("Team not found");
    }

    if (!team.proposal || !team.proposal.abstract) {
      throw new Error("Team must submit proposal first");
    }

    if (!["rejected", "notRequested"].includes(team.supervisorStatus)) {
      throw new Error("Supervisor request not allowed at this stage");
    }

    const teacher = await Teacher.findById(teacherId).session(session);

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    team.supervisorStatus = "pending";
    team.supervisor = teacherId;

    teacher.pendingTeams.addToSet(teamId);

    await Promise.all([team.save({ session }), teacher.save({ session })]);

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Supervisor request sent successfully",
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error(error);
    return res.json({
      success: false,
      message: error.message || "Server error!",
    });
  } finally {
    if (session) session.endSession();
  }
};
