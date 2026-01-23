import express from "express";
import authAdmin from "../middlewares/admin.middleware.js";
import {
  adminLogin,
  getDashboardStats,
  getAllTeachers,
  toggleTeacherStatus,
  getStudentsBySemester,
  toggleStudentStatus,
} from "../controllers/admin.control.js";

const adminRouter = express.Router();


adminRouter.post("/login", adminLogin);


adminRouter.get("/dashboard", authAdmin, getDashboardStats);


adminRouter.get("/get-teachers", authAdmin, getAllTeachers);
adminRouter.patch("/get-teachers/:id/status", authAdmin, toggleTeacherStatus);


adminRouter.get("/get-students", authAdmin, getStudentsBySemester);
adminRouter.patch("/get-students/:id/status", authAdmin, toggleStudentStatus);

export default adminRouter;
