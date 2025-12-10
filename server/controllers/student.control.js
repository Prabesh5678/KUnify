import Student from '../models/student.model.js'
import jwt from "jsonwebtoken";
// import { OAuth2Client } from "google-auth-library";


// Google Sign-In Controller: /api/student/google-signin
export const googleSignIn = async (req, res) => {
  try {
    // const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    // console.log(req.body)
    const  credential  = req.body.credential; //or {credential}
// console.log(credential)
    if (!credential) {
      return res.json({ success: false, message: "No credential provided" });
    }

    // // Verify the Google userToken
    // const ticket = await client.verifyIdToken({
    //   idToken: credential,
    //   audience: process.env.GOOGLE_CLIENT_ID,
    // });

    // const payload = ticket.getPayload();
    // const { sub: googleId, email, name, picture } = payload;

    // if (!email) {
    //   return res.json({
    //     success: false,
    //     message: "Email not provided by Google",
    //   });
    // }

    // Check if student already exists
    let student = await Student.findOne({ email:credential.email });

    if (!student) {
       student = new Student({
         name: credential.name || "KU Student",
         email:credential.email,
         googleId:credential.googleId,
         avatar: credential.picture,
       });
       await student.save();
    }

    // // Generate JWT studentToken

    const studentToken = jwt.sign(
      { id: student._id }, 
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
    const student = await Student.findById(studentId).select("-password");
    return res.json({ success: true, student});

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Logout user: /api/student/logout
export const logout = async (_, res) => {
  try {
    res.clearCookie("studentToken", {
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
