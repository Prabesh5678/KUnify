import express from "express";
import { getTeacherLoginHistory, exportTeacherLoginHistory } from "../controllers/loginHistory.control.js";
import authAdmin from "../middlewares/admin.middleware.js";

const historyRouter = express.Router();

historyRouter.get("/teacher/:teacherId", authAdmin, getTeacherLoginHistory);
historyRouter.get("/teacher/:teacherId/export", authAdmin, exportTeacherLoginHistory);

export default historyRouter;