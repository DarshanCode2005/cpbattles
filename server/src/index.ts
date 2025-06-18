import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { agenda } from "./config/agenda";
import authRoutes from "./routes/auth";
import battleRoutes from "./routes/battles";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api", authRoutes);
app.use("/api", battleRoutes);

agenda.on("ready", () => {
  agenda.start();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function graceful() {
  agenda.stop().then(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);
