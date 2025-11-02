import express from "express";
import cors from "cors"
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";

const app = express();
app.use(cors())
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/projects", projectRoutes);

app.listen(4000, () => console.log("Server running on 4000"));
