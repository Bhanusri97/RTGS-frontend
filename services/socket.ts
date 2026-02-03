import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5002';

class SocketService {
    socket: Socket | null = null;

    connect() {
        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        this.socket.on('connect_error', (err) => {
            console.log('Socket connection error:', err);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinChat(chatId: string) {
        if (this.socket) {
            this.socket.emit('join_chat', chatId);
        }
    }

    sendMessage(message: any) {
        if (this.socket) {
            this.socket.emit('send_message', message);
        }
    }

    onReceiveMessage(callback: (message: any) => void) {
        if (this.socket) {
            this.socket.on('receive_message', callback);
        }
    }

    offReceiveMessage() {
        if (this.socket) {
            this.socket.off('receive_message');
        }
    }
}

export const socketService = new SocketService();
