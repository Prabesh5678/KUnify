
import express from "express";
import { submitProposal } from "../controllers/proposal.control.js";
import { uploadProposalSingle } from "../utils/upload.utils.js";

const router = express.Router();

router.post(
  "/submit",
  uploadProposalSingle, 
  submitProposal
);

export default router;
