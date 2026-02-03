import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
    title: string;
    type: 'PDF' | 'Word' | 'Image';
    url: string; // Path or S3 URL
    uploadedBy: mongoose.Types.ObjectId;
    uploadDate: Date;
    status: 'Processing' | 'Analyzed' | 'Failed';
    aiAnalysis?: {
        summary: string;
        entities: {
            people: string[];
            places: string[];
            dates: string[];
        };
        category: string;
    };
}

const DocumentSchema: Schema = new Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    uploadDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Processing', 'Analyzed', 'Failed'], default: 'Processing' },
    aiAnalysis: {
        summary: { type: String },
        entities: {
            people: [{ type: String }],
            places: [{ type: String }],
            dates: [{ type: String }]
        },
        category: { type: String }
    }
}, { timestamps: true });

export default mongoose.model<IDocument>('Document', DocumentSchema);
