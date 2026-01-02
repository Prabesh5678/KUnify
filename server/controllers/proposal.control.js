import Proposal from "../models/proposal.model.js";
import cloudinary from "../configs/cloudinary.config.js";

export const uploadProposal = async (req, res) => {
  try {
    
    const { title, abstract, keywords } = req.body;

   
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    
    if (!req.studentId) {
      return res.status(401).json({ message: "Student authentication required" });
    }

    
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "kunify/proposals",
      resource_type: "raw",
    });

    
    const proposal = await Proposal.create({
      projectTitle: title,
      abstract: abstract,
      projectKeyword: keywords,
      proposalFile: {
        url: result.secure_url,
        publicId: result.public_id,
      },
      student: req.studentId,
    });

   
    return res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      proposal,
    });

  } catch (error) {
    console.error("Upload Proposal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
