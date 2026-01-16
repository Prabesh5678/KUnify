import Teacher from "../models/teacher.model.js";
import jwt from "jsonwebtoken";

// post /api/teacher/google-signin
export const googleSignIn = async (req, res) => {
  try {
    const credential = req.body.credential; //or {credential}
    if (!credential) {
      return res.json({ success: false, message: "No credential provided" });
    }


    // Check if teacher already exists
    let teacher = await Teacher.findOne({ email: credential.email });

    if (!teacher) {
      teacher = new Teacher({
        name: credential.name || "KU teacher",
        email: credential.email,
        googleId: credential.googleId,
        avatar: credential.picture,
      });
      await teacher.save();
    }

    // // Generate JWT teacherToken

    const teacherToken = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // // Set cookie (adjust options based on your setup)
    res.cookie("teacherToken", teacherToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      message: "Google sign-in successful",
      teacher,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Check auth: api/teacher/is-auth
export const isAuth = async (req, res) => {
  try {
    // Get teacherId from req object (set by middleware), not req.body
    const teacherId = req.teacherId;
    let teacher;
    if (req.query.populateTeam === "true") {
      teacher = await Teacher.findById(teacherId).populate("teamId");
    } else {
      teacher = await Teacher.findById(teacherId);
    }
    return res.json({ success: true, teacher });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Logout user: /api/teacher/logout
export const logout = async (_, res) => {
  try {
    res.clearCookie("teacherToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "logged out" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
// /api/teacher/setup-profile
export const profileCompletion = async (req, res) => {
  try {
    console.log("hi");
    const teacherId = req.teacherId;
    console.log(req.body);
    const form = req.body;
    console.log(form);
    if (
      !form.phone||!form.specialization
    ) {
      return res.json({ success: false, message: "Provide all the details!" });
    } else {
      const teacher = await Teacher.findByIdAndUpdate(
        teacherId,
        {
          phone: form.phone,
          specialization: form.specialization,
        },
        { runValidators: true, new: true }
      );
      console.log(teacher);
      return res.json({
        success: true,
        message: "Profile completed successfully",
        teacher,
      });
    }
  } catch (error) {
    console.error(error.stack)
  return res.json({
    success: false,
    message: "Couldnot complete the profile."
  });
}};