import express from "express";
import { getTeacherLoginHistory } from "../controllers/loginHistory.control.js";
import authAdmin from "../middlewares/admin.middleware.js";

const historyRouter = express.Router();
historyRouter.get("/teacher/:teacherId", authAdmin, getTeacherLoginHistory);

export default historyRouter;