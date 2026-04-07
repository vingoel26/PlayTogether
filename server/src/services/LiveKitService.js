import { AccessToken } from 'livekit-server-sdk';
import dotenv from 'dotenv';
dotenv.config();

export class LiveKitService {
    constructor() {
        this.apiKey = process.env.LIVEKIT_API_KEY;
        this.apiSecret = process.env.LIVEKIT_API_SECRET;
    }

    createToken(roomCode, participantName, participantId, isHost) {
        if (!this.apiKey || !this.apiSecret) {
            throw new Error('LiveKit credentials missing. Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET in the server/.env file');
        }

        const at = new AccessToken(this.apiKey, this.apiSecret, {
            identity: participantId,
            name: participantName,
        });

        at.addGrant({
            roomJoin: true,
            room: roomCode,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
            // Optional: roomAdmin: isHost 
        });

        return Promise.resolve(at.toJwt());
    }
}
