
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

    if (!teamId) throw new Error("An error occured!");
    if (!title || !abstract || !keywords)
      throw new Error("All fields are required!");
    if (!req.file) throw new Error("PDF file is required");

    const team = await Team.findById(teamId);
    if (!team) throw new Error("You are not part of any team!");
    if (team.proposal) throw new Error("Proposal already submitted by your team");
    if (team.supervisorStatus === 'adminApproved')
      throw new Error("Supervisor Already Assigned!");

    let teacher = null;
    if (supervisor && supervisor !== "") {
      teacher = await Teacher.findById(supervisor).session(session);
      if (!teacher) throw new Error("Supervisor not found");
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
    if (secureUrl.includes("/upload/")) {
      secureUrl = secureUrl.replace("/upload/", "/upload/fl_attachment/");
    }

    const [proposal] = await Proposal.create(
      [{
        projectTitle: title,
        abstract,
        projectKeyword: keywords,
        team: team._id,
        proposalFile: {
          url: secureUrl,
          publicId: result.public_id,
        },
      }],
      { session }
    );

    team.proposal = proposal._id;
    team.keywords = keywords;
    if (teacher) {
      teacher.pendingTeams.addToSet(teamId);
      team.supervisor = supervisor;
      team.supervisorStatus = "pending";
    }

    await Promise.all([team.save({ session }), teacher ? teacher.save({ session }) : null]);

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      proposal,
    });

  } catch (error) {
    if (session) await session.abortTransaction();
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
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

export const uploadOrEditProposal = async (req, res) => {
  let session;
  try {
    const { title, abstract, keywords, supervisor } = req.body;
    const { teamId } = req.params;
    const isEdit = req.query.edit === "yes";

    if (!teamId) return res.status(400).json({ success: false, message: "Invalid team id" });
    if (!title || !abstract || !keywords) throw new Error("All fields are required");
    if (!isEdit && !req.file) return res.status(400).json({ success: false, message: "PDF file is required" });

    session = await mongoose.startSession();
    session.startTransaction();

    const team = await Team.findById(teamId).session(session);
    if (!team) throw new Error("Team not found");

    if (!isEdit) {
      if (team.proposal) throw new Error("Proposal already submitted");

      let teacher = null;
      if (supervisor && supervisor !== "") {
        teacher = await Teacher.findById(supervisor).session(session);
        if (!teacher) throw new Error("Supervisor not found");
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
      if (secureUrl.includes("/upload/")) secureUrl = secureUrl.replace("/upload/", "/upload/fl_attachment/");

      const [proposal] = await Proposal.create(
        [{
          projectTitle: title,
          abstract,
          projectKeyword: keywords,
          team: team._id,
          proposalFile: {
            url: secureUrl,
            publicId: result.public_id,
          },
        }],
        { session }
      );

      team.proposal = proposal._id;
      team.keywords = keywords;
      if (teacher) {
        teacher.pendingTeams.addToSet(teamId);
        team.supervisor = supervisor;
        team.supervisorStatus = "pending";
      }

      await Promise.all([team.save({ session }), teacher ? teacher.save({ session }) : null]);
      await session.commitTransaction();

      return res.status(201).json({ success: true, message: "Proposal submitted successfully", proposal });
    }

    // Editing an existing proposal
    if (!team.proposal) throw new Error("No proposal found to edit");

    const proposal = await Proposal.findById(team.proposal).session(session);
    if (!proposal) throw new Error("Proposal not found");

    let newTeacher = null;
    if (supervisor && supervisor !== "") {
      newTeacher = await Teacher.findById(supervisor).session(session);
      if (!newTeacher) throw new Error("Supervisor not found");
    }

    if (supervisor && supervisor !== "" && (!team.supervisor || team.supervisor.toString() !== supervisor)) {
      const oldTeacher = team.supervisor ? await Teacher.findById(team.supervisor).session(session) : null;
      if (oldTeacher) {
        oldTeacher.pendingTeams.pull(teamId);
        oldTeacher.approvedTeams.pull(teamId);
        await oldTeacher.save({ session });
      }
      if (newTeacher) newTeacher.pendingTeams.addToSet(teamId);
      team.supervisor = supervisor;
      team.supervisorStatus = "pending";
    }

    if (req.file) {
      if (proposal.proposalFile?.publicId) {
        await cloudinary.uploader.destroy(proposal.proposalFile.publicId, { resource_type: "raw" });
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
      if (secureUrl.includes("/upload/")) secureUrl = secureUrl.replace("/upload/", "/upload/fl_attachment/");
      proposal.proposalFile = { url: secureUrl, publicId: result.public_id };
    }

    proposal.projectTitle = title;
    proposal.abstract = abstract;
    proposal.projectKeyword = keywords;
    team.keywords = keywords;

    await Promise.all([
      proposal.save({ session }),
      team.save({ session }),
      newTeacher ? newTeacher.save({ session }) : null,
    ]);

    await session.commitTransaction();

    return res.json({ success: true, message: "Proposal updated successfully", proposal });

  } catch (error) {
    if (session) await session.abortTransaction();
    console.error(error.stack);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  } finally {
    if (session) session.endSession();
  }
};