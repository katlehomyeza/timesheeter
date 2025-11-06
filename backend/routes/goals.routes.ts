import express from "express";
import { authenticateToken } from "../middleware/auth";
import { createGoal, getGoalPeriods, getGoals, isUserGoal, updateGoal } from "../queries/goals.queries";

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) =>{
    try {
        const userId = req.authUser!.userId;
        const goals = await getGoals(userId);
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({message:"Oops, something went wrong"});
    }
});

router.get('/periods', async (req, res) =>{
    try {
        const goalPeriods = await getGoalPeriods();
        res.status(200).json(goalPeriods);
    } catch (error) {
        res.status(500).json({message:"Oops, something went wrong"});
    }
});

router.patch('/', async (req, res) =>{
    try {
        const userId = req.authUser!.userId
        const { goalId, periodId, targetHours } = req.body;
        const isUsersGoal = await isUserGoal(userId, goalId)
        if(isUsersGoal){
            const updatedGoal = await updateGoal(goalId, periodId, targetHours)
            res.status(200).json(updatedGoal)
        } else {
            res.status(400).json({message:'You may only edit your own goals'})
        }
    } catch (error) {
        res.status(500).json({message:"Oops, something went wrong"});
    }
});

router.post('/', async (req, res) =>{
    try {
        const userId = req.authUser!.userId
        const { projectId, periodId, targetHours, title } = req.body;
        const createdGoal = await createGoal( userId, periodId, title, targetHours, projectId );
        res.status(201).json(createdGoal);
    } catch (error) {
        res.status(500).json({message:"Oops, something went wrong"});
    }
});

export default router;
