import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
    chatId: string;
    participants: {
        userId: mongoose.Types.ObjectId;
        name: string;
    }[];
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
    isEncrypted: boolean;
}

const ChatSchema: Schema = new Schema({
    chatId: { type: String, required: true, unique: true },
    participants: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String }
    }],
    lastMessage: { type: String },
    lastMessageTime: { type: Date, default: Date.now },
    unreadCount: { type: Number, default: 0 },
    isEncrypted: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IChat>('Chat', ChatSchema);
