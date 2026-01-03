import Proposal from "../models/proposal.model.js";
import Team from "../models/team.model.js";
import cloudinary from "../configs/cloudinary.config.js";

export const uploadProposal = async (req, res) => {
  try {
    const { title, abstract, keywords } = req.body;

    if (!title || !abstract || !keywords) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

   
    const studentId = req.studentId;

    const team = await Team.findOne({
      $or: [{ leaderId: studentId }, { members: studentId }],
    });

    if (!team) {
      return res.status(403).json({
        message: "You are not part of any team",
      });
    }

    if (team.leaderId.toString() !== studentId.toString()) {
      return res.status(403).json({
        message: "Only team leader can submit proposal",
      });
    }

    if (team.proposal) {
      return res.status(400).json({
        message: "Proposal already submitted by your team",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "kunify/proposals",
      resource_type: "raw",
    });

    const proposal = await Proposal.create({
      projectTitle: title,
      abstract,
      projectKeyword: keywords,
      submittedBy: studentId,
      team: team._id,
      proposalFile: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });

    team.proposal = proposal._id;
    await team.save();

    return res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      proposal,
    });
  } catch (error) {
    console.error("Upload Proposal Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
