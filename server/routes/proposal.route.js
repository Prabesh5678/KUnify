import express from "express";
import authStudent from "../middlewares/student.middleware.js";
import { upload } from "../configs/multer.config.js";
import { getProposal, uploadOrEditProposal } from "../controllers/proposal.control.js";

const proposalRouter = express.Router();
proposalRouter.post(
  "/upload/:teamId",
  upload.single("proposal"),
  uploadOrEditProposal
);

proposalRouter.get('/:teamId',getProposal)
export default proposalRouter;
