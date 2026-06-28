import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.config.js";
import cookieParser from "cookie-parser";
import studentRouter from "./routes/student.route.js";
import teacherRouter from "./routes/teacher.route.js";
import teamRouter from "./routes/team.route.js";
import logRouter from "./routes/log.route.js";
import proposalRouter from './routes/proposal.route.js';
import adminRouter from "./routes/admin.route.js";
import historyRouter from "./routes/loginHistory.route.js";

// import connectCloudinary from './configs/cloudinary.config.js';

const app=express();
const port = 3000;

await connectDB();
// await connectCloudinary();


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://spmp.ku.edu.np",
  "https://spmp.ku.edu.np",
  "https://staging.spmp.ku.edu.np",
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // required for cookies/auth
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


app.get("/", (_, res) => res.send("API is working"));

app.use('/api/student',studentRouter);
app.use('/api/teacher',teacherRouter);
app.use('/api/admin',adminRouter);
app.use("/api/login-history", historyRouter);
app.use('/api/team',teamRouter);
app.use("/api/log", logRouter);
app.use('/api/proposal', proposalRouter);
app.get('/api/logout', (_,res)=>{
  try {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    };
    res.clearCookie("studentToken", options);
    res.clearCookie("teacherToken", options);
    res.clearCookie("adminToken", options);
    return res.json({ success: true, message: "logged out" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
});


//  Start server
app.listen(port,"0.0.0.0", () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
