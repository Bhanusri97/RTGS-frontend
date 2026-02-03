import { Request, Response } from 'express';
import Task from '../models/Task';

export const getTasks = async (req: Request, res: Response) => {
    console.log('[getTasks] Request received');
    try {
        console.log('[getTasks] Executing Task.find()...');
        const tasks = await Task.find().sort({ createdAt: -1 }).maxTimeMS(5000);
        console.log(`[getTasks] Found ${tasks.length} tasks`);
        res.json(tasks);
    } catch (error) {
        console.error('[getTasks] Error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const createTask = async (req: Request, res: Response) => {
    try {
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
