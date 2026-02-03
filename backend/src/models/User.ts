import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string; // Optional for mock auth if needed, but good for real auth
    role: string;
    designation: string;
    location: string;
    avatar?: string;
    preferences: {
        language: string;
        notifications: boolean;
    };
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'officer' },
    designation: { type: String, required: true },
    location: { type: String, required: true },
    avatar: { type: String },
    preferences: {
        language: { type: String, default: 'en' },
        notifications: { type: Boolean, default: true },
    },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
