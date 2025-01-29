import { types } from 'mediasoup';
import * as mediasoup from 'mediasoup';
import { User } from './User';

interface Room {
    router: types.Router;
    users: Set<User>;
}

export class MediaSoupSFU {
    private worker!: types.Worker;
    private rooms: Map<string, Room>;
    private static instance: MediaSoupSFU;

    constructor() {
        this.rooms = new Map();
    }

    public static getInstance(): MediaSoupSFU {
        if (!MediaSoupSFU.instance) {
            MediaSoupSFU.instance = new MediaSoupSFU();
        }
        return MediaSoupSFU.instance;
    }

    async init() {
        this.worker = await mediasoup.createWorker({
            rtcMinPort: 2000,
            rtcMaxPort: 3000
        });

        this.worker.on('died', () => {
            console.error('MediaSoup worker died, exiting...');
            process.exit(1);
        });
    }

    async createRoom(user: User, roomId: string) {
        if (this.rooms.has(roomId)) {
            user.send({ type: 'roomExists' });
            return;
        }

        const router = await this.worker.createRouter({
            mediaCodecs: [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000
                }
            ]
        });

        this.rooms.set(roomId, { router, users: new Set([user]) });
        user.send({ type: 'roomCreated', roomId });
    }

    async joinRoom(user: User, roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            user.send({ type: 'roomNotFound' });
            return;
        }

        room.users.add(user);
        user.send({ type: 'roomJoined', roomId });
    }

    async createWebRTCTransport(user: User, direction: string) {
        const room = this.findRoomForUser(user);
        if (!room) return;

        const transport = await room.router.createWebRtcTransport({
            listenIps: [{ ip: '0.0.0.0', announcedIp: undefined }],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true
        });

        user.addTransport(transport.id, transport);
        user.send({
            type: 'transportCreated',
            direction,
            transportOptions: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            }
        });
    }

    async connectTransport(user: User, data: any) {
        const transport = user.getTransport(data.transportId);
        if (!transport) return;

        await transport.connect({ dtlsParameters: data.dtlsParameters });
        user.send({ type: 'transportConnected' });
    }

    async produceMedia(user: User, data: any) {
        const transport = user.getTransport(data.transportId);
        if (!transport) return;

        const producer = await transport.produce({
            kind: data.kind,
            rtpParameters: data.rtpParameters
        });

        user.addProducer(producer.id, producer);
        user.send({
            type: 'mediaProduced',
            producerId: producer.id
        });

        const room = this.findRoomForUser(user);
        if (!room) return;

        room.users.forEach(peer => {
            if (peer !== user) {
                peer.send({
                    type: 'newPeerProducer',
                    producerId: producer.id,
                    kind: data.kind
                });
            }
        });
    }

    async consumeMedia(user: User, data: any) {
        const room = this.findRoomForUser(user);
        if (!room) return;

        const transport = user.getTransport(data.transportId);
        if (!transport) return;

        const consumer = await transport.consume({
            producerId: data.producerId,
            rtpCapabilities: data.rtpCapabilities
        });

        user.addConsumer(consumer.id, consumer);
        user.send({
            type: 'mediaConsumed',
            consumerId: consumer.id,
            producerId: data.producerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters
        });
    }

    private findRoomForUser(user: User): Room | undefined {
        for (const room of this.rooms.values()) {
            if (room.users.has(user)) {
                return room;
            }
        }
        return undefined;
    }
}