import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Setting up CORS middleware
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

// Setting up JSON parsing middleware
app.use(express.json({ limit: "2mb" }));

// Setting up URL middleware
app.use(express.urlencoded({ extended: true, limit: "32kb" }));

// Setting up Static middleware for public resources
app.use(express.static("public"));

// Setting up cookie middleware
app.use(cookieParser());

// Route imports
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);

export { app };
