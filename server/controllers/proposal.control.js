import Proposal from "../models/proposal.model.js";
import { uploadProposalToCloudinary } from "../utils/upload.utils.js";

export const submitProposal = async (req, res) => {
  try {

    const { projectTitle, projectKeyword } = req.body;

  
    if (!projectTitle || !projectKeyword) {
      return res.status(400).json({
        message: "Project title and keyword are required",
      });
    }

   
    if (!req.file) {
      return res.status(400).json({
        message: "Proposal PDF is required",
      });
    }

    const uploadResult = await uploadProposalToCloudinary(
      req.file.buffer
    );


    const proposal = new Proposal({
      projectTitle,
      projectKeyword,
      proposal: uploadResult.secure_url,
    });

    await proposal.save();

  
    res.status(201).json({
      message: "Proposal submitted successfully",
      data: proposal,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};
