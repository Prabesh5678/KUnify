import Proposal from "../models/proposal.model.js";
import Team from "../models/team.model.js";
import cloudinary from "../configs/cloudinary.config.js";
import Teacher from "../models/teacher.model.js";
import mongoose from "mongoose";
import proposalModel from "../models/proposal.model.js";

// post /api/proposal/upload
export const uploadProposal = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const { title, abstract, keywords, supervisor } = req.body;
    const { teamId } = req.params;
    if (!teamId) throw new Error("An error occured!");

    if (!title || !abstract || !keywords || !supervisor)
      throw new Error("All fields are required!");

    if (!req.file) throw new Error("PDF file is required");

    const team = await Team.findById(teamId);

    if (!team) throw new Error("You are not part of any team!");

    // if (team.leaderId.toString() !== studentId.toString()) {
    //   return res.status(403).json({
    //     message: "Only team leader can submit proposal",
    //   });
    // }

    // if (req.query.edit!=='yes'&&team.proposal) {
    if (team.proposal) {
      throw new Error("Proposal already submitted by your team");
    }
    const teacher = await Teacher.findById(supervisor);
    if (!teacher) throw new Error("Unable to find teacher!");
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
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
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

export const uploadOrEditProposal = async (req, res) => {
  let session;

  try {
    const { title, abstract, keywords, supervisor } = req.body;
    const { teamId } = req.params;
    const isEdit = req.query.edit === "yes";

    // ✅ Validate first (before transaction)
    if (!teamId)
      return res
        .status(400)
        .json({ success: false, message: "Invalid team id" });

    if (!title || !abstract || !keywords || !supervisor)
      throw new Error("All fields are required");

    if (!isEdit && !req.file)
      return res
        .status(400)
        .json({ success: false, message: "PDF file is required" });

    session = await mongoose.startSession();
    session.startTransaction();

    // ✅ Fetch team
    const team = await Team.findById(teamId).session(session);
    if (!team) throw new Error("Team not found");

    // ==========================
    // 📌 UPLOAD MODE
    // ==========================
    if (!isEdit) {
      if (team.proposal) throw new Error("Proposal already submitted");

      const teacher = await Teacher.findById(supervisor).session(session);
      if (!teacher) throw new Error("Supervisor not found");

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
        [
          {
            projectTitle: title,
            abstract,
            projectKeyword: keywords,
            team: team._id,
            proposalFile: {
              url: secureUrl,
              publicId: result.public_id,
            },
          },
        ],
        { session },
      );

      team.proposal = proposal._id;
      team.supervisor = supervisor;
      team.supervisorStatus = "pending";

      teacher.pendingTeams.addToSet(teamId);

      await Promise.all([team.save({ session }), teacher.save({ session })]);

      await session.commitTransaction();

      return res.status(201).json({
        success: true,
        message: "Proposal submitted successfully",
        proposal,
      });
    }

    // ==========================
    // ✏️ EDIT MODE
    // ==========================
    if (!team.proposal) throw new Error("No proposal found to edit");

    const proposal = await Proposal.findById(team.proposal).session(session);
    if (!proposal) throw new Error("Proposal not found");

    const newTeacher = await Teacher.findById(supervisor).session(session);
    if (!newTeacher) throw new Error("Supervisor not found");

    // 🔁 Supervisor change handling
    if (!team.supervisor || team.supervisor.toString() !== supervisor) {
      const oldTeacher = await Teacher.findById(team.supervisor).session(
        session,
      );
      if (oldTeacher) {
        oldTeacher.pendingTeams.pull(teamId);
        oldTeacher.approvedTeams.pull(teamId);
        await oldTeacher.save({ session });
      }

      newTeacher.pendingTeams.addToSet(teamId);
      team.supervisor = supervisor;
      team.supervisorStatus = "pending";
    }

    // 📄 Optional PDF replacement
    if (req.file) {
      if (proposal.proposalFile?.publicId) {
        await cloudinary.uploader.destroy(proposal.proposalFile.publicId, {
          resource_type: "raw",
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
      if (secureUrl.includes("/upload/")) {
        secureUrl = secureUrl.replace("/upload/", "/upload/fl_attachment/");
      }

      proposal.proposalFile = {
        url: secureUrl,
        publicId: result.public_id,
      };
    }

    // ✍️ Update fields
    proposal.projectTitle = title;
    proposal.abstract = abstract;
    proposal.projectKeyword = keywords;

    await Promise.all([
      proposal.save({ session }),
      team.save({ session }),
      newTeacher.save({ session }),
    ]);

    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Proposal updated successfully",
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
