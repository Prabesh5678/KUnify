import express from "express";
import authAdmin from "../middlewares/admin.middleware.js";
import {
  adminLogin,
  isAuth,
  getDashboardStats,
  getAllTeachers,
  toggleTeacherStatus,
  createVisitingTeacher,
  getStudentsBySemester,
  getSupervisorRequests,
  approveSupervisorRequest,
  declineSupervisorRequest,
  resetVisitingTeacherPassword,
  getAllTeams,
  getTeamLogsheets,
  getTeacherSimilarity ,
} from "../controllers/admin.control.js";

const adminRouter = express.Router();
// Auth
adminRouter.post("/login", adminLogin);

// Dashboard
adminRouter.get("/dashboard", authAdmin, getDashboardStats);
adminRouter.get("/is-auth", authAdmin, isAuth);

// Teachers
adminRouter.get("/get-teachers", authAdmin, getAllTeachers);
adminRouter.patch("/get-teachers/:id/status", authAdmin, toggleTeacherStatus);
adminRouter.post("/create-visiting-teacher", authAdmin, createVisitingTeacher);
adminRouter.post("/teacher/reset-password", authAdmin, resetVisitingTeacherPassword); 

// Students
adminRouter.get("/get-students", authAdmin, getStudentsBySemester);

// Admin supervisor requests
adminRouter.get("/supervisor/pending", authAdmin, getSupervisorRequests);
adminRouter.post("/supervisor/approve", authAdmin, approveSupervisorRequest);
adminRouter.post("/supervisor/decline", authAdmin, declineSupervisorRequest);

//fetching all teams
adminRouter.get("/teams", authAdmin, getAllTeams);
//fetching logsheets of a team
adminRouter.get("/teams/:teamId/logsheets", authAdmin, getTeamLogsheets);

adminRouter.get("/teacher-similarity", getTeacherSimilarity);
export default adminRouter;
