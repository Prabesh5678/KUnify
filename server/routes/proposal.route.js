import express from "express";
import authStudent from "../middlewares/student.middleware.js";
import { uploadProposal } from "../controllers/proposal.control.js";
import { upload } from "../configs/multer.config.js";

const proposalRouter = express.Router();
proposalRouter.post(
  "/upload",
  authStudent,
  upload.single("proposal"),
  uploadProposal
);



export default proposalRouter;