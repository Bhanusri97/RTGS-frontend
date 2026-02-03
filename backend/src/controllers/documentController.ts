import { Request, Response } from 'express';
import Document from '../models/Document';

export const getDocuments = async (req: Request, res: Response) => {
    try {
        const documents = await Document.find().sort({ createdAt: -1 });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const uploadDocument = async (req: Request, res: Response) => {
    try {
        // In a real app, handle file upload here (e.g., multer)
        // For PoC, we assume the URL is passed in body or generated
        const newDoc = new Document(req.body);
        const savedDoc = await newDoc.save();
        res.status(201).json(savedDoc);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getDocumentById = async (req: Request, res: Response) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
