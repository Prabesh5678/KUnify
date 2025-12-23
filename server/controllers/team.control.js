
import Team from "../models/team.model.js";
import Student from "../models/student.model.js";
import mongoose from "mongoose";

const generateTeamCode = () => {
  // Include ALL characters as you wanted: 0-9, A-Z, a-z
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  // Generate 6 random characters
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars.charAt(randomIndex);
  }

  return code;
};

// /api/team/create
export const createTeam = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const { name, subject } = req.body;
    const studentId = req.studentId;
    if (!name || !subject) {
      return res.json({ success: false, message: "Please provide all feild!" });
    }
    const leader = await Student.findById(studentId);
    // if(leader.isTeamLeader && leader.teamId)
    //   return res.json({success:false,message:"Already in a team!"})
    const code = generateTeamCode();
    console.log({ name, subject, code,leaderId:leader._id,studentId });
    const team = await Team.create(
     [ {
        name,
        subject,
        code,
        leaderId: studentId,
        members: [studentId],
      }],
      { session }
    );
    const student = await Student.updateOne(
      { _id: studentId },
      { $set: { isTeamLeader: true, teamId: team[0]._id } },
      { session }
    );
    if (!student.modifiedCount)
      return res.json({
        success: false,
        message: "Failed to update student as team leader",
      });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Successfully created team",
      team,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error.stack);
    return res.json({
      success: false,
      message: "Unable to create team",
    });
  } finally {
    session.endSession();
  }
};

// /api/team/join
export const joinTeam = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const { code } = req.body;
    if(!code)
      return res.json({success:false, message:"Please provide code!"});
    const studentId = req.studentId;
    const student = await Student.findById(studentId);
    if (student.isTeamLeader && student.teamId)
      return res.json({ success: false, message: "Already in a team!" });

    const team = await Team.findOneAndUpdate(
      { code },
      { $addToSet: { members: studentId } },
      { new: true, session }
    );
    if (!team)
      return res.json({ success: false, message: "Better Luck Next time 😉" });
    const updatedStudent = await Student.updateOne(
      { _id: studentId },
      { $set: { teamId: team._id } },
      { session }
    );
    if (!updatedStudent.modifiedCount)
      return res.json({
        success: false,
        message: "Failed to update!",
      });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Successfully joined team",
      team,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error.stack);
    return res.json({
      success: false,
      message: "Unable to join team",
    });
  } finally {
    session.endSession();
  }
};

// /api/team/leave
export const leaveTeam = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const studentId = req.studentId;
    const student = await Student.findById(studentId).populate("teamId");
    if (!student || !student.teamId)
      return res.json({
        success: false,
        message: "Student doesnot belong to this team.",
      });
    const team = student.teamId;
    team.members.pull(student._id);
    student.teamId = null;
    student.isTeamLeader=false;
    await Promise.all([student.save({ session }), team.save({ session })]);

    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Team leaved successfully",
      team,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error.stack);
    return res.json({
      success: false,
      message: "Unable to leave team",
    });
  } finally {
    session.endSession();
  }
};
// /api/team/{params}
export const teamInfo=async (req,res) => {
  try {
    const { teamId } = req.params;
    if(!teamId) return res.json({success:false,message:"Failed to get Team Id!"})
const team = await Team.findById(teamId)
  .populate({
    path: "members", 
    select: "name email",
  })
  .populate({
    path: "leaderId",
    select: "name email",
  });
      if (!team && !team.members && !team.leaderId)
        return res.json({ success: false, message: "Failed to get Team" });
      return res.json({success:true,team})
  } catch (error) {
    console.error(error.stack)
    return res.json({success:false,message:error.message})
  }
}