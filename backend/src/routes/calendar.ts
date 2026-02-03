import express from 'express';
import { createMeeting, getMeetings, updateMeeting } from '../controllers/calendarController';

const router = express.Router();

router.get('/', getMeetings);
router.post('/', createMeeting);
router.put('/:id', updateMeeting);

export default router;
