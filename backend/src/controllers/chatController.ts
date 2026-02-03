import { Request, Response } from 'express';
import Chat from '../models/Chat';
import Message from '../models/Message';

export const getChats = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId;
        const chats = await Chat.find({ 'participants.userId': userId }).sort({ lastMessageTime: -1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getChatMessages = async (req: Request, res: Response) => {
    try {
        const { chatId } = req.params;
        const messages = await Message.find({ chatId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { chatId, senderId, senderName, receiverId, receiverName, content, type } = req.body;

        // Create message
        const newMessage = new Message({
            chatId,
            senderId,
            senderName,
            receiverId,
            receiverName,
            content,
            type: type || 'text',
            isEncrypted: true,
            timestamp: new Date()
        });

        const savedMessage = await newMessage.save();

        // Update or create chat
        await Chat.findOneAndUpdate(
            { chatId },
            {
                $set: {
                    lastMessage: content,
                    lastMessageTime: new Date()
                },
                $inc: { unreadCount: 1 },
                $setOnInsert: {
                    chatId,
                    participants: [
                        { userId: senderId, name: senderName },
                        { userId: receiverId, name: receiverName }
                    ],
                    isEncrypted: true
                }
            },
            { upsert: true, new: true }
        );

        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { chatId } = req.params;
        await Chat.findOneAndUpdate({ chatId }, { unreadCount: 0 });
        await Message.updateMany({ chatId, isRead: false }, { isRead: true });
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
