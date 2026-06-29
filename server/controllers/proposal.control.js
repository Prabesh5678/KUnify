import Proposal from "../models/proposal.model.js";
import Team from "../models/team.model.js";
import cloudinary from "../configs/cloudinary.config.js";
import Teacher from "../models/teacher.model.js";
import mongoose from "mongoose";
import { uploadFile,deleteFile } from "../utils/helperFunctions.js";

// post /api/proposal/upload/:teamId
export const uploadProposal = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const { title, abstract, keywords, supervisor } = req.body;
    const { teamId } = req.params;

    if (!teamId) throw new Error("An error occured!");
    if (!title || !abstract || !keywords)
      throw new Error("All fields are required!");
    if (!req.file) throw new Error("PDF file is required");
    if (req.file.mimetype !== "application/pdf")
      throw new Error("Only PDF files are allowed");

    const team = await Team.findById(teamId);
    if (!team) throw new Error("You are not part of any team!");
    if (team.proposal)
      throw new Error("Proposal already submitted by your team");
    if (team.supervisorStatus === "adminApproved")
      throw new Error("Supervisor Already Assigned!");

    let teacher = null;
    if (supervisor && supervisor !== "") {
      teacher = await Teacher.findById(supervisor).session(session);
      if (!teacher) throw new Error("Supervisor not found");
    }

     const { url, publicId } = await uploadFile(req.file, "proposals");

    const [proposal] = await Proposal.create(
      [
        {
          projectTitle: title,
          abstract,
          projectKeyword: keywords,
          team: team._id,
          proposalFile: {
            url,
            publicId,
          },
        },
      ],
      { session },
    );

    team.proposal = proposal._id;
    team.keywords = keywords;
    if (teacher) {
      teacher.pendingTeams.addToSet(teamId);
      team.supervisor = supervisor;
      team.supervisorStatus = "pending";
    }

    await Promise.all([
      team.save({ session }),
      teacher ? teacher.save({ session }) : null,
    ]);

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      proposal,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("Full error: ", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (session) session.endSession();
  }
};

export const getProposal = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!teamId)
      return res.json({ success: false, message: "Could not get Team Id!" });

    const team = await Team.findById(teamId).populate("proposal");
    if (!team)
      return res.json({ success: false, message: "Could not find team!" });

    return res.json({ success: true, team });
  } catch (error) {
    console.error(error.stack);
    return res.json({ success: false, message: "Could not get proposal!" });
  }
};

//patch /api/proposal/change/:teamId
export const changeProposal = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!req.file) throw new Error("PDF file is required");
    if (req.file.mimetype !== "application/pdf")
      throw new Error("Only PDF files are allowed");
    if (!teamId)
      return res
        .status(400)
        .json({ success: false, message: "Invalid team id" });
    const team = await Team.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    if (!team.proposal)
      return res
        .status(404)
        .json({ success: false, message: "No proposal found for this team" });
    const proposal = await Proposal.findById(team.proposal);
    if (!proposal)
      return res
        .status(404)
        .json({ success: false, message: "Proposal not found" });
    const oldPublicId = proposal.proposalFile?.publicId;
    const oldUrl = proposal.proposalFile?.url;
    if (!oldUrl||!oldPublicId)
      throw new Error("No existing proposal file found to replace");
    res.json({ success: true, message: "Proposal file update in progress" });
   const {url, publicId} = await uploadFile(req.file, "proposals");
    proposal.proposalFile = { url, publicId };
    await proposal.save();
    deleteFile(oldUrl, oldPublicId);
    return;
  
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to update proposal file" });
  }
};
