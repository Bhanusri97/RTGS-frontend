import { Request, Response } from 'express';
import Meeting from '../models/Meeting';

export const getMeetings = async (req: Request, res: Response) => {
    try {
        const meetings = await Meeting.find().sort({ startTime: 1 });
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const createMeeting = async (req: Request, res: Response) => {
    try {
        const newMeeting = new Meeting(req.body);
        const savedMeeting = await newMeeting.save();
        res.status(201).json(savedMeeting);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateMeeting = async (req: Request, res: Response) => {
    try {
        const updatedMeeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedMeeting);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
