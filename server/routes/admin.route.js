import express from "express";
import authAdmin from "../middlewares/admin.middleware.js";
import {
  adminLogin,
  adminLogout,
  getDashboardStats,
  getAllTeachers,
  toggleTeacherStatus,
  createVisitingTeacher,
  getStudentsBySemester,
  approveSupervisorRequest,
  declineSupervisorRequest,
  resetVisitingTeacherPassword,
} from "../controllers/admin.control.js";

const adminRouter = express.Router();

// Auth
adminRouter.post("/login", adminLogin);
adminRouter.post("/logout", authAdmin, adminLogout);

// Dashboard
adminRouter.get("/dashboard", authAdmin, getDashboardStats);

// Teachers
adminRouter.get("/get-teachers", authAdmin, getAllTeachers);
adminRouter.patch("/get-teachers/:id/status", authAdmin, toggleTeacherStatus);
adminRouter.post("/create-visiting-teacher", authAdmin, createVisitingTeacher);
adminRouter.post("/teacher/reset-password", authAdmin, resetVisitingTeacherPassword); 

// Students (authAdmin removed here)
adminRouter.get("/get-students", getStudentsBySemester);

// Admin supervisor requests(authAdmin is removed here too)
adminRouter.post("/supervisor/approve",  approveSupervisorRequest);
adminRouter.post("/supervisor/decline",  declineSupervisorRequest);

export default adminRouter;
