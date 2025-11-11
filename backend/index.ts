import express from "express";
import cors from "cors"
import authRoutes from "./routes/auth.routes";
import goalRoutes from "./routes/goals.routes";
import projectRoutes from "./routes/project.routes";
import timelogRoutes from "./routes/timelog.routes";

const app = express();

app.use(cors({
  origin: "https://timesheeter.vercel.app",
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/timelogs", timelogRoutes);

app.listen(4000, () => console.log("Server running on 4000"));
