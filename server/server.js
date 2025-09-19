import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

await connectCloudinary();
console.log(process.env.CLIENT_URL)

app.use(cors(
  {
    origin: process.env.CLIENT_URL,
    credentials: true,
  }
));
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
