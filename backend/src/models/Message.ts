import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    chatId: string;
    senderId: mongoose.Types.ObjectId;
    senderName: string;
    receiverId: mongoose.Types.ObjectId;
    receiverName: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'audio' | 'video';
    isEncrypted: boolean;
    isRead: boolean;
    timestamp: Date;
}

const MessageSchema: Schema = new Schema({
    chatId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverName: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'file', 'audio', 'video'], default: 'text' },
    isEncrypted: { type: Boolean, default: true },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);
