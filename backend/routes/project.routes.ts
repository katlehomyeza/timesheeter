import express from "express"
import { createNewProject, deleteProject, getAllProjects, getProjectTotalTimes, isUsersProject } from "../queries/project.queries";
import { authenticateToken } from "../middleware/auth";
import { deleteGoal, getGoalByProjectId } from "../queries/goals.queries";
import { deleteTimelog, getTimeLogs } from "../queries/timelogs.queries";

const router = express.Router();
router.use(authenticateToken)

router.post("/", async (req, res) => {
    try {
        const { 
            projectName, 
            colorHex, 
            description 
        } = req.body;
        const userId = req.authUser!.userId;
        const createdProject = await createNewProject(
            userId, 
            projectName, 
            colorHex, 
            description
        );
        res.status(201).json(createdProject);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", detail:error });
    }
});

router.get("/", async (req, res) => {
    try {
        const userId = req.authUser!.userId;
        const includeTotalTime = req.query.includeTotalTime?.toString().toLowerCase() === 'true';
        console.log(includeTotalTime)
        const projects = await ( includeTotalTime ? getProjectTotalTimes(userId) : getAllProjects(userId) );
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});


router.delete("/:projectId", async (req,res) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.authUser!;
        const isUserProject = await isUsersProject(userId, projectId);
        if ( isUserProject ) {
            const [associatedTimeLogs, associatedGoals] = await Promise.all([
            getTimeLogs(userId, projectId),
            getGoalByProjectId(userId, projectId),
            ]);

            await Promise.all([
            ...associatedTimeLogs.map(timelog => deleteTimelog(timelog.id)),
            ...associatedGoals.map(goal => deleteGoal(goal.id)),
            ]);
            const deletedProject = await deleteProject(projectId);
            res.status(200).json(deletedProject);
        } else {
            res.status(401).json({message:"You can only delete your own projects"});
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", detail: error});
    }
});

export default router;