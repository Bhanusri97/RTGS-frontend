import express from 'express';
import { getDocumentById, getDocuments, uploadDocument } from '../controllers/documentController';

const router = express.Router();

router.get('/', getDocuments);
router.post('/', uploadDocument);
router.get('/:id', getDocumentById);

export default router;
