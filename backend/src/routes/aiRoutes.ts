import express from 'express';
import { chat } from '../controllers/aiController';

const router = express.Router();

router.post('/assistant', chat);

export default router;
