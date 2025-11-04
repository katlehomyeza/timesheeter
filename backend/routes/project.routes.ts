import express from "express"
import { createNewProject, deleteProject, getAllProjects, isUsersProject } from "../queries/project.queries";
import { authenticateToken } from "../middleware/auth";

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
        const projects = await getAllProjects(userId);
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
            const deletedProject = await deleteProject(projectId);
            res.status(200).json(deletedProject);
        } else {
            res.status(401).json({message:"You can only delete your own projects"});
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

export default router;