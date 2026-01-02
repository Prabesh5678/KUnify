import express from "express";
import authStudent from "../middlewares/student.middleware.js";
import { uploadProposal, getProposals } from "../controllers/proposal.control.js";
import { upload } from "../configs/multer.config.js";

const proposalRouter = express.Router();

// POST route - for uploading
proposalRouter.post(
  "/upload",
  authStudent,
  upload.single("proposal"),
  uploadProposal
);

// GET route - for fetching proposals
proposalRouter.get(
  "/", // This route will be: GET /api/proposal/
  authStudent,
  getProposals
);

export default proposalRouter;