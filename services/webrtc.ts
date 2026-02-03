// import { mediaDevices, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import { socketService } from './socket';

// MOCK WebRTC for Expo Go (since native module is not available)
const mediaDevices = {
    getUserMedia: async (config: any) => null,
};
class RTCPeerConnection {
    onicecandidate: any;
    onaddstream: any;
    addStream(stream: any) { }
    createOffer(options?: any) { return Promise.resolve({ sdp: '' }); }
    setLocalDescription(desc: any) { }
    setRemoteDescription(desc: any) { }
    createAnswer(options?: any) { return Promise.resolve({ sdp: '' }); }
    addIceCandidate(candidate: any) { }
    close() { }
    constructor(config: any) { } // Added constructor for mock
}
class RTCSessionDescription {
    constructor(data: any) { }
}
class RTCIceCandidate {
    constructor(data: any) { }
}

class WebRTCService {
    peerConnection: RTCPeerConnection | null = null;
    localStream: any | null = null;
    remoteStream: any | null = null;
    otherUserId: string | null = null;
    onRemoteStream: ((stream: any) => void) | null = null;

    async startLocalStream() {
        try {
            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            this.localStream = stream;
            return stream;
        } catch (error) {
            console.error('Error getting user media', error);
            return null;
        }
    }

    async createOffer() {
        if (!this.peerConnection) {
            this.peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
            });
        }
        const offer = await this.peerConnection?.createOffer();
        await this.peerConnection?.setLocalDescription(offer);

        if (this.otherUserId) {
            socketService.sendMessage({
                type: 'offer',
                offer: offer,
                to: this.otherUserId,
            });
        }
    }

    async startCall(userId: string) {
        this.otherUserId = userId;
        this.peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        this.peerConnection.onicecandidate = (event: any) => {
            if (event.candidate) {
                socketService.sendMessage({
                    type: 'candidate',
                    candidate: event.candidate,
                    to: this.otherUserId,
                });
            }
        };

        this.peerConnection.onaddstream = (event: any) => {
            this.remoteStream = event.stream;
            if (this.onRemoteStream) {
                this.onRemoteStream(event.stream);
            }
        };

        if (this.localStream) {
            this.peerConnection.addStream(this.localStream);
        }

        // createOffer is called separately in video-call.tsx
    }

    async handleOffer(offer: any, userId: string) {
        this.otherUserId = userId;
        this.peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        this.peerConnection.onicecandidate = (event: any) => {
            if (event.candidate) {
                socketService.sendMessage({
                    type: 'candidate',
                    candidate: event.candidate,
                    to: this.otherUserId,
                });
            }
        };

        this.peerConnection.onaddstream = (event: any) => {
            this.remoteStream = event.stream;
            if (this.onRemoteStream) {
                this.onRemoteStream(event.stream);
            }
        };

        if (this.localStream) {
            this.peerConnection.addStream(this.localStream);
        }

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        socketService.sendMessage({
            type: 'answer',
            answer: answer,
            to: this.otherUserId,
        });
    }

    async handleAnswer(answer: any) {
        if (this.peerConnection) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    async handleCandidate(candidate: any) {
        if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    endCall() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        this.localStream = null;
        this.remoteStream = null;
        this.otherUserId = null;
    }
}

export const webrtcService = new WebRTCService();
