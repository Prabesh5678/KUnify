import Proposal from "../models/proposal.model.js";
import Team from "../models/team.model.js";
import cloudinary from "../configs/cloudinary.config.js";

export const uploadProposal = async (req, res) => {
  try {
    const { title, abstract, keywords } = req.body;
    const {teamId}=req.params
    if(!teamId) return res.status(400).json({success:false, message: "An error occured!" });
    if (!title || !abstract || !keywords) {
      return res.status(400).json({success:false, message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({success:false, message: "PDF file is required" });
    }

    const team = await Team.findById(teamId)

    if (!team) {
      return res.status(403).json({success:false,
        message: "You are not part of any team",
      });
    }

    // if (team.leaderId.toString() !== studentId.toString()) {
    //   return res.status(403).json({
    //     message: "Only team leader can submit proposal",
    //   });
    // }

    if (team.proposal) {
      return res.json({success:false,
        message: "Proposal already submitted by your team",
      });
    }

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

    const proposal = await Proposal.create({
      projectTitle: title,
      abstract,
      projectKeyword: keywords,
      // submittedBy: studentId,
      team: team._id,
      proposalFile: {
        url: secureUrl,
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
    console.error(error.stack);
    return res.status(500).json({ message: "Server error" });
  }
};

// get /api/proposal/:teamId
export const getProposal =async (req,res) => {
  try {
    const {teamId}=req.params;
    if(!teamId) return res.json({success:false,message:"Couldnot get Team Id!"})

      const team= await Team.findById(teamId).populate('proposal');
      console.log(team)
      if(!team) return res.json({ success: false, message: "Couldnot find team!" });

      return res.json({success:true , team});
  } catch (error) {
    console.error(error.stack)
    return res.json({ success: false, message: "Couldnot get proposal!" });
  }
}