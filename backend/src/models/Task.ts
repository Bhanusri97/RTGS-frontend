import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    priority: 'High' | 'Medium' | 'Low';
    dueDate: Date;
    assignedTo: mongoose.Types.ObjectId; // User ID
    subtasks: {
        id: string;
        title: string;
        completed: boolean;
    }[];
    aiAnalysis?: {
        summary: string;
        actionItems: string[];
    };
}

const TaskSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    dueDate: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    subtasks: [{
        id: { type: String },
        title: { type: String },
        completed: { type: Boolean, default: false }
    }],
    aiAnalysis: {
        summary: { type: String },
        actionItems: [{ type: String }]
    }
}, { timestamps: true });

export default mongoose.model<ITask>('Task', TaskSchema);
