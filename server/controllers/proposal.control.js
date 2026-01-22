import Proposal from "../models/proposal.model.js";
import Team from "../models/team.model.js";
import cloudinary from "../configs/cloudinary.config.js";
import Teacher from "../models/teacher.model.js";
import mongoose from "mongoose";

// post /api/proposal/upload
export const uploadProposal = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const { title, abstract, keywords, supervisor } = req.body;
    const { teamId } = req.params;
    if (!teamId)
      return res
        .status(400)
        .json({ success: false, message: "An error occured!" });
    if (!title || !abstract || !keywords || !supervisor) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "PDF file is required" });
    }

    const team = await Team.findById(teamId);

    if (!team) {
      return res
        .status(403)
        .json({ success: false, message: "You are not part of any team" });
    }

    // if (team.leaderId.toString() !== studentId.toString()) {
    //   return res.status(403).json({
    //     message: "Only team leader can submit proposal",
    //   });
    // }

    if (req.query.edit!=='yes'&&team.proposal) {
      return res.json({
        success: false,
        message: "Proposal already submitted by your team",
      });
    }
    const teacher = await Teacher.findById(supervisor);
    if (!teacher)
      return res.json({ success: false, message: "Unable to find teacher!" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "kunify/proposals",
      resource_type: "raw",
      type: "upload",
      access_mode: "public",
      flags: "attachment",
      transformation: [{ flags: "attachment" }],
    });
    let secureUrl = result.secure_url;

    // If URL contains /upload/, inject fl_attachment flag
    if (secureUrl.includes("/upload/")) {
      secureUrl = secureUrl.replace("/upload/", "/upload/fl_attachment/");
    }

    const proposal = await Proposal.create(
      [
        {
          projectTitle: title,
          abstract,
          projectKeyword: keywords,
          // submittedBy: studentId,
          team: team._id,
          proposalFile: {
            url: secureUrl,
            publicId: result.public_id,
          },
        },
      ],
      { session },
    );

    team.proposal = proposal[0]._id;
    team.supervisorStatus = "pending";
    team.supervisor = supervisor;

    teacher.pendingTeams.addToSet(teamId);
    await Promise.all([team.save({ session }), teacher.save({ session })]);
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      proposal: proposal[0],
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error(error.stack);
    return res.status(500).json({ message: "Server error" });
  } finally {
    if (session) session.endSession();
  }
};

// get /api/proposal/:teamId
export const getProposal = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!teamId)
      return res.json({ success: false, message: "Couldnot get Team Id!" });

    const team = await Team.findById(teamId).populate("proposal");
    if (!team)
      return res.json({ success: false, message: "Couldnot find team!" });

    return res.json({ success: true, team });
  } catch (error) {
    console.error(error.stack);
    return res.json({ success: false, message: "Couldnot get proposal!" });
  }
};
