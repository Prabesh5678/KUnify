import express from "express";
import authStudent from "../middlewares/student.middleware.js";
import { upload } from "../configs/multer.config.js";
import { uploadProposal } from "../controllers/proposal.control.js";

const router = express.Router();
router.post(
  "/upload",
  authStudent,
  upload.single("proposal"),
  uploadProposal
);

export default router;
