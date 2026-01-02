import Proposal from "../models/proposal.model.js";
import cloudinary from "../configs/cloudinary.config.js";

// Function 1: Upload Proposal
export const uploadProposal = async (req, res) => {
  try {
    // Get data from frontend (frontend sends: title, abstract, keywords)
    const { title, abstract, keywords } = req.body;

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    // Check if student is authenticated (from middleware)
    if (!req.studentId) {
      return res.status(401).json({ message: "Student authentication required" });
    }

    // Upload PDF to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "kunify/proposals",
      resource_type: "raw", // For PDF files
    });

    // Save proposal to database
    const proposal = await Proposal.create({
      projectTitle: title,        // Map 'title' to 'projectTitle'
      abstract: abstract,         // Keep same name
      projectKeyword: keywords,   // Map 'keywords' to 'projectKeyword'
      proposalFile: {
        url: result.secure_url,   // Cloudinary URL
        publicId: result.public_id, // Cloudinary public ID
      },
      student: req.studentId,     // Student ID from middleware
    });

    // Success response
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

// Function 2: Get Proposals for current student
export const getProposals = async (req, res) => {
  try {
    // Check if student is authenticated
    if (!req.studentId) {
      return res.status(401).json({
        success: false,
        message: "Student authentication required",
      });
    }

    // Find all proposals for this student
    const proposals = await Proposal.find({ student: req.studentId })
      .sort({ createdAt: -1 }) // Show newest first
      .select("-__v"); // Remove version key

    // Success response
    return res.status(200).json({
      success: true,
      message: "Proposals fetched successfully",
      proposals,
      count: proposals.length,
    });

  } catch (error) {
    console.error("Get Proposals Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};