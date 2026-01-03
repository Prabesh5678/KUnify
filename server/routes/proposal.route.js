/*import express from "express";
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
*/
import express from "express";
import authStudent from "../middlewares/student.middleware.js";
import { upload } from "../configs/multer.config.js";
import { uploadProposal } from "../controllers/proposal.control.js";

const router = express.Router();

// ⚠️ "proposal" MUST match frontend FormData key
router.post(
  "/upload",
  authStudent,
  upload.single("proposal"),
  uploadProposal
);

export default router;
