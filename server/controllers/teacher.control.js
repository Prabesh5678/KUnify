import jwt from "jsonwebtoken";
import Teacher from "../models/teacher.model.js";
import Team from "../models/team.model.js";
import mongoose from "mongoose";

// POST /api/teacher/google-signin
export const googleSignIn = async (req, res) => {
  try {
    const credential = req.body.credential; // or { credential }

    if (!credential) {
      return res.json({ success: false, message: "No credential provided" });
    }

    // Check if teacher already exists
    let teacher = await Teacher.findOne({ email: credential.email });

    // Create teacher if not exists
    if (!teacher) {
      teacher = new Teacher({
        name: credential.name || "KU teacher",
        email: credential.email,
        googleId: credential.googleId,
        avatar: credential.picture,
        isProfileCompleted: false, // default
      });
      await teacher.save();
    }

    // Generate JWT (FIXED: teacher._id, not student._id)
    const teacherToken = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Set cookie
    res.cookie("teacherToken", teacherToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send proper user object
    return res.json({
      success: true,
      message: "Google sign-in successful",
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        avatar: teacher.avatar,
        role: "teacher",
        isProfileCompleted: teacher.isProfileCompleted,
      },
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Check if teacher is authenticated
export const isAuth = async (req, res) => {
  try {
    if (!req.teacherId) {
      return res.json({ success: false, message: "Not authenticated" });
    }
    const teacher = await Teacher.findById(req.teacherId);
    if (!teacher) {
      return res.json({ success: false, message: "Teacher not found" });
    }
    res.json({
      success: true,
      user: teacher,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// // Logout teacher
// export const logout = (req, res) => {
//   try {
//     res.clearCookie("teacherToken", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       //sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       sameSite: "lax",
//     });

//     res.json({
//       success: true,
//       message: "Logged out successfully",
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// /api/teacher/setup-profile
export const profileCompletion = async (req, res) => {
  try {
    const teacherId = req.teacherId;
    const form = req.body;
    if (!form.phone || !form.specialization) {
      return res.json({ success: false, message: "Provide all the details!" });
    } else {
      const teacher = await Teacher.findByIdAndUpdate(
        teacherId,
        {
          phone: form.phone,
          specialization: form.specialization,
          isProfileCompleted: true,
        },

        { runValidators: true, new: true },
      );
      return res.json({
        success: true,
        message: "Profile completed successfully",
        user: teacher,
      });
    }
  } catch (error) {
    console.error(error.stack);
    return res.json({
      success: false,
      message: "Couldnot complete the profile.",
    });
  }
};

// get /api/teacher/teams
export const teamRequest = async (req, res) => {
  try {
    const teacherId = req.teacherId;
    if (!teacherId)
      return res.json({
        success: false,
        message: "Couldnot find teacher id. ",
      });
    if (!req.query.get) {
      return res.status(400).json({
        success: false,
        message:
          "Query parameter 'get' is required",
      });
    }
    if (req.query.get === "request") {
      const requests = await Teacher.findById(teacherId)
        .select("pendingTeams")
        .populate({
          path: "pendingTeams",
          select: "name",
          populate: { path: "proposal", select: "-team" },
        });
      if (!requests)
        return res.json({ success: false, message: "Unable to find teacher!" });
      return res.json({ success: true, teams: requests.pendingTeams });
    } else if (req.query.get === "request-count") {
      const teacher = await Teacher.findById(teacherId).select("pendingTeams");
      const count = teacher?.pendingTeams?.length || 0;
      return res.json({ success: true, count });
    } 
    else if (req.query.get === "assigned") {
      const requests = await Teacher.findById(teacherId)
        .select("assignedTeams")
        .populate("assignedTeams");
      if (!requests)
        return res.json({ success: false, message: "Unable to find teacher!" });
      return res.json({ success: true, teams: requests.assignedTeams });
    }
    else if (req.query.get === "all") {
      const requests = await Teacher.findById(teacherId)
        .select("assignedTeams approvedTeams pendingTeams -_id");
      if (!requests)
        return res.json({ success: false, message: "Unable to find teacher!" });
      return res.json({ success: true, teams: requests });
    }
     return res.status(400).json({
       success: false,
       message: "Query parameter 'get' is required or invalid",
     });
  } catch (error) {
    console.error(error.stack);
    return res.json({ success: false, message: "Unable to get team data!" });
  }
};

// post /api/teacher/team-request
export const teamApprove = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const teacherId = req.teacherId;
    if (!teacherId) throw new Error("Unable to get teacher id!");
    const { requestId } = req.body;
    if (!requestId) throw new Error("Unable to get team id!");
    const team = await Team.findById(requestId);
    if (!team) throw new Error("Unable to find team!");
    const teacher = await Teacher.findById(teacherId);
    if (!teacher || !teacher.pendingTeams.map(String).includes(requestId))
      throw new Error("Unable to find teacher or team is not in pending list!");

    if (req.query.action === "accept") {
      teacher.approvedTeams.addToSet(requestId);
      teacher.pendingTeams.pull(requestId);
      team.supervisorStatus = "teacherApproved";
      await Promise.all([teacher.save({ session }), team.save({ session })]);
      await session.commitTransaction();
      return res.json({ success: true, message: "Team accepted!" });
    } else if (req.query.action === "decline") {
      teacher.pendingTeams.pull(requestId);
      team.supervisorStatus = "notApproved";
      team.supervisor = null;
      await Promise.all([teacher.save({ session }), team.save({ session })]);
      await session.commitTransaction();
      return res.json({ success: true, message: "Team declined!" });
    }
    throw new Error("Invalid Action!");
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error(error.stack);
    return res.status(500).json({ message: error.message || "Server error" });
  } finally {
    if (session) session.endSession();
  }
};
