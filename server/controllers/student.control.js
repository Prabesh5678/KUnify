import mongoose from "mongoose";
import Student from "../models/student.model.js";
import Teacher from "../models/teacher.model.js";
import jwt from "jsonwebtoken";
import { handleGoogleAuth } from "../utils/helperFunctions.js";

// Google Sign-In Controller: /api/student/google-signin
export const googleSignIn = async (req, res) => {
  try {
    const result = await handleGoogleAuth(req.body.credential);
    if (!result.success) return res.json(result); 
    const { googleId, email, name, avatar } = result;
 
   
    let student = await Student.findOne({ email});

    if (!student) {
      student = new Student({
        name: name || "KU Student",
        email,
        googleId,
        avatar
      });
      await student.save();
    }

    // // Generate JWT studentToken

    const studentToken = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // // Set cookie (adjust options based on your setup)
    res.cookie("studentToken", studentToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      message: "Google sign-in successful",
      student,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Check auth: api/student/is-auth
export const isAuth = async (req, res) => {
  try {
    // Get studentId from req object (set by middleware), not req.body
    const studentId = req.studentId;
    if (!studentId)
      return res.json({
        success: false,
        message: "Couldnot find student id. ",
      });
    let student;
    if (req.query.populateTeam === "true") {
        student = await Student.findById(studentId).populate("teamId");
    } else {
      student = await Student.findById(studentId);
    } 
    if(!student)
      return res.json({success:false,message:'Unale to find Student!'})
    return res.json({ success: true, student });
  } catch (error) {
    console.error(error.stack);
    res.json({ success: false, message: error.message });
  }
};
// /api/student/setup-profile
export const profileCompletion = async (req, res) => {
  try {
    const studentId = req.studentId;
    if(!studentId)
      return res.json({success:false,message:'Could not find student id.'})
    const form = req.body;
    if (
      !form.department ||
      !form.semester ||
      !form.rollNumber ||
      !form.subjectCode
    ) {
      return res.json({ success: false, message: "Provide all the details!" });
    } else {
      const student = await Student.findByIdAndUpdate(
        studentId,
        {
          department: form.department,
          semester: form.semester,
          rollNumber: form.rollNumber,
          subjectCode: form.subjectCode,
        },
        { runValidators: true, new: true }
      );
      if(!student)
        return res.json({success:false,message:'Could not update profile.'})
      return res.json({
        success: true,
        message: "Profile completed successfully",
        student,
      });
    }
  } catch (error) {
  return res.json({
    success: false,
    message: "Couldnot complete the profile.",
  });
}
};
// /api/profile-update
export const profileUpdate = async (req, res) => {
  try {
    const data = req.body;
    const studentId = req.studentId;
        if (!studentId)
          return res.json({
            success: false,
            message: "Couldnot find student id. ",
          });

    if (!data.department || !data.semester || !data.name || !data.subjectCode) {
      return res.json({ success: false, message: "Please provide all feilds" });
    } else {
      const student = await Student.findByIdAndUpdate(
        studentId,
        {
          department: data.department,
          semester: data.semester,
          name: data.name,
          subjectCode: data.subjectCode,
        },
        { runValidators: true, new: true }
      );
      return res.json({
        success: true,
        message: "Profile updated successfully!",
        student,
      });
    }
  } catch (error) {
    console.error(error.stack);
    return res.json({ success: false, message: "Can't update profile!" });
  }
};

// Get all teachers //api/student/get-teachers
export const getTeachers =async (_,res) => {
  try {
    const teachers = await Teacher.find(
      { activeStatus: true, isProfileCompleted: true },
      { name: 1, specialization: 1 },
    );
  return res.json({success:true,teachers})
  } catch (error) {
    console.error(error.stack);
    
        return res.json({
          success: false,
          message: "Unable to return teachers!",
        });

  }
}
