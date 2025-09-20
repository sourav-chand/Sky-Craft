import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

await connectCloudinary();
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://sky-craft.vercel.app", // production frontend
  "https://sky-craft-git-main-sourav-chands-projects.vercel.app" // preview frontend
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(clerkMiddleware());

// dotenv.config()

app.get("/", (req, res) => res.send("Server is Live!"));

app.use(requireAuth());

app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is running in port", PORT);
});
