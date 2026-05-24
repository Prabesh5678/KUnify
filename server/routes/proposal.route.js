import express from "express";
import authStudent from "../middlewares/student.middleware.js";
import { upload } from "../configs/multer.config.js";
import { getProposal,uploadProposal,changeProposal } from "../controllers/proposal.control.js";

const proposalRouter = express.Router();
proposalRouter.post(
  "/upload/:teamId",
  upload.single("proposal"),
  uploadProposal
);
proposalRouter.patch(
  "/change/:teamId",
  upload.single("proposal"),
  changeProposal
);

proposalRouter.get('/:teamId',getProposal)
export default proposalRouter;
