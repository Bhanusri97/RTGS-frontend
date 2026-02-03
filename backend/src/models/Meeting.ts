import mongoose, { Document, Schema } from 'mongoose';

export interface IMeeting extends Document {
    title: string;
    startTime: Date;
    endTime: Date;
    location: string;
    type: 'Physical' | 'Virtual';
    attendees: string[]; // List of names or emails
    agenda: string;
    host: mongoose.Types.ObjectId;
    aiSummary?: string;
}

const MeetingSchema: Schema = new Schema({
    title: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    location: { type: String },
    type: { type: String, enum: ['Physical', 'Virtual'], default: 'Physical' },
    attendees: [{ type: String }],
    agenda: { type: String },
    host: { type: Schema.Types.ObjectId, ref: 'User' },
    aiSummary: { type: String }
}, { timestamps: true });

export default mongoose.model<IMeeting>('Meeting', MeetingSchema);
