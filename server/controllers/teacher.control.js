import Teacher from "../models/teacher.model.js";
// post /api/teacher/google-signin
export const googleSignIn = async (req, res) => {
  try {
    const credential = req.body.credential; //or {credential}
    if (!credential) {
      return res.json({ success: false, message: "No credential provided" });
    }


    // Check if student already exists
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

    // // Generate JWT studentToken

    const teacherToken = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
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
      student,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
