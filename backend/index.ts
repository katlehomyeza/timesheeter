import express from "express";
import cors from "cors"
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/auth.routes";

const app = express();
app.use(cors())

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.listen(4000, () => console.log("Server running on 4000"));
