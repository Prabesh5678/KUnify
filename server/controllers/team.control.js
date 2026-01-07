import mongoose from "mongoose";
import Team from "../models/team.model.js";
import Student from "../models/student.model.js";

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

    if (!name || !subject) {
      return res.json({ success: false, message: "All fields required!" });
    }

    const leader = await Student.findById(studentId);
    if (leader.teamId) {
      return res.json({ success: false, message: "Already in a team!" });
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
      { session }
    );

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
    console.error(err);
    return res.json({ success: false, message: "Failed to create team" });
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

    const { code,subject } = req.body;
    const studentId = req.studentId;

    if (!code||!subject) {
      return res.json({ success: false, message: "Something is missing" });
    }

    const student = await Student.findById(studentId);
    if (student.teamId||student.isTeamLeader) {
      return res.json({ success: false, message: "Already in a team!" });
    }

    const team = await Team.findOne({ code,subject });
    if (!team) {
      return res.json({ success: false, message: "Invalid team code or select the valid subject!" });
    }

  
    const needsApproval =
      student.lastTeamId &&
      student.lastTeamId.toString() === team._id.toString();

    team.members.addToSet(studentId);
    await team.save({ session });

    student.teamId = team._id;
    student.isApproved = false;
    student.isTeamLeader = false;

    await student.save({ session });
    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Joined team. Waiting for leader approval.",
    });
  } catch (err) {
    if (session) await session.abortTransaction();
    console.error(err);
    return res.json({ success: false, message: "Unable to join team" });
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
    const student = await Student.findById(studentId);

    if (!student || !student.teamId) {
      return res.json({ success: false, message: "Not in any team!" });
    }

    const team = await Team.findById(student.teamId);

    team.members.pull(studentId);

    // student.lastTeamId = student.teamId;
    student.teamId = null;
    student.isTeamLeader = false;
    student.isApproved = false;

    await Promise.all([
      team.save({ session }),
      student.save({ session }),
    ]);

    await session.commitTransaction();
    return res.json({ success: true, message: "Left team successfully" });
  } catch (err) {
    if (session) await session.abortTransaction();
    console.error(err);
    return res.json({ success: false, message: "Unable to leave team" });
  } finally {
    if (session) session.endSession();
  }
};

// GET /api/team/:teamId
export const teamInfo = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId)
      .populate("leaderId", "name email")
      .populate("members", "name email isApproved");

    if (!team) {
      return res.json({ success: false, message: "Team not found!" });
    }

    return res.json({ success: true, team });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Failed to fetch team info" });
  }
};

// POST /api/team/approve/:teamId
export const memberApprove = async (req, res) => {
  try {
    const leaderId = req.studentId;
    const { teamId } = req.params;
    const { memberId, action } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.json({ success: false, message: "Team not found!" });
    }

    if (team.leaderId.toString() !== leaderId.toString()) {
      return res.json({
        success: false,
        message: "Only leader can approve members!",
      });
    }

    const member = await Student.findById(memberId);
    if (!member || member.teamId?.toString() !== teamId) {
      return res.json({ success: false, message: "Invalid member!" });
    }

    if (action === "approve") {
      member.isApproved = true;
      await member.save();
      return res.json({ success: true, message: "Member approved!" });
    }

    if (action === "decline") {
      team.members.pull(memberId);
      member.teamId = null;
      member.isApproved = false;
      // member.lastTeamId = teamId;

      await Promise.all([team.save(), member.save()]);
      return res.json({ success: true, message: "Member declined!" });
    }

    return res.json({ success: false, message: "Invalid action!" });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Approval failed" });
  }
};

// POST /api/team/delete
export const deleteTeam = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const studentId = req.studentId;
    const student = await Student.findById(studentId);

    if (!student || !student.teamId|| !student.isTeamLeader) {
      return res.json({ success: false, message: "Not in any team or isn't a teamleader!" });
    }

    const team = await Team.findById(student.teamId);
    const count=team.members.length;
    if(count>1 && team.leaderId.toString()!==studentId){
      return res.json({success:false,message:"Not a leader or more team members!"});
    }

    team.members.pull(studentId);

    // student.lastTeamId = student.teamId;
    student.teamId = null;
    student.isTeamLeader = false;
    student.isApproved = false;

    await Promise.all([
      team.deleteOne({ session }),
      student.save({ session }),
    ]);

    await session.commitTransaction();
    return res.json({ success: true, message: "Deleted team successfully" });
  } catch (err) {
    if (session) await session.abortTransaction();
    console.error(err);
    return res.json({ success: false, message: "Unable to delete team" });
  } finally {
    if (session) session.endSession();
  }
};