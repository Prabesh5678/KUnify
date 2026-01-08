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

// import connectCloudinary from './configs/cloudinary.config.js';

const app=express();
const port = 3000;

await connectDB();
// await connectCloudinary();


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
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
app.use('/api/team',teamRouter);
app.use("/api/log", logRouter);
app.use('/api/proposal', proposalRouter);


// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
