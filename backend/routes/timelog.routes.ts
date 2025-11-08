import express from "express";
import { authenticateToken } from "../middleware/auth";
import { createManualTimeLog, createTimeLog, deleteTimelog, getTimeLogs, getTimeLogsByCreatedAt, isUserTimeLog } from "../queries/timelogs.queries";
import type { TimeLog } from "@shared/types/project.types";

const router = express.Router();
router.use(authenticateToken)

router.get("/", async (req, res) => {
  try {
    const userId = req.authUser!.userId;
    const { date } = req.query;
    if(!date) {
        res.status(400).json({message: "Please insert a date"});
    } else {
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);
        const timeLogs = await getTimeLogsByCreatedAt(userId, startOfDay, endOfDay);
        res.status(200).json(timeLogs);
    }
  } catch (error) {
    console.error("Error fetching timelogs for day:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/:projectId", async (req, res) =>{
    try {
        const userId = req.authUser!.userId;
        const { projectId } = req.params;
        const timeLogs = await getTimeLogs(userId, projectId);
        res.status(200).json(timeLogs);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});


router.post("/", async (req, res) =>{
    try {
        const { 
            projectId, 
            durationMinutes,
            startTime, 
            endTime, 
            note, 
            isManualEntry, 
            goalId 
        } = req.body;
        const userId = req.authUser!.userId;
        const manual = isManualEntry === true || isManualEntry === 'true';
        let createdTimeLog: TimeLog;
        if ( manual ) {
            createdTimeLog = await createManualTimeLog(
                userId,
                projectId,
                durationMinutes,
                note,
                goalId
            );
        } else {
            createdTimeLog = await createTimeLog(
                userId,
                projectId,
                startTime,
                endTime,
                note,
                goalId
            );
        }
        res.status(201).json(createdTimeLog);
    } catch (error) {
        res.status(500).json({ message: (error) });
    }
});

router.delete("/:timeLogId", async (req, res) =>{
    try {
        const { timeLogId } = req.params;
        const { userId } = req.authUser!;
        const isUsersTimeLog = await isUserTimeLog(timeLogId, userId);
        if ( isUsersTimeLog ) {
            const deletedTimelog = await deleteTimelog(timeLogId);
            res.status(200).json(deletedTimelog);
        } else {
            res.status(401).json({message:"You can only delete your own timelogs"});
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

export default router;