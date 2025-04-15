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

    async createOrJoinRoom(user: User, roomId: string) {
        const room = this.rooms.get(roomId);

        if (room) {
            room.users.add(user);
            user.send({ type: 'roomJoined', rtpCapabilities: room.router.rtpCapabilities });
        } else {
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
                        clockRate: 90000,
                        parameters: {
                            'x-google-start-bitrate': 1000
                        }
                    }
                ]
            });
            this.rooms.set(roomId, { router, users: new Set([user]) });
            user.send({ type: 'roomJoined', rtpCapabilities: router.rtpCapabilities });
        }
    }

    async createSendWebRTCTransport(user: User) {
        const room = this.findRoomForUser(user);
        if (!room) return;

        const transport = await room.router.createWebRtcTransport({
            listenIps: [{ ip: '127.0.0.1', announcedIp: '127.0.0.1' }],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true
        });
        user.addTransport(transport.id, transport);

        user.send({
            type: 'sendTransportCreated',
            transportOptions: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            }
        });
    }

    async createReceiveWebRTCTransport(user: User) {
        const room = this.findRoomForUser(user);
        if (!room) return;

        const transport = await room.router.createWebRtcTransport({
            listenIps: [{ ip: '127.0.0.1', announcedIp: '127.0.0.1' }],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true
        });
        user.addTransport(transport.id, transport);
        user.send({
            type: 'receiveTransportCreated',
            transportOptions: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            }
        });
    }

    async connectProducerTransport(user: User, data: any) {
        const transport = user.getTransport(data.transportId);
        if (!transport) return console.log('transport not found of produce');
        try {
            await transport.connect({ dtlsParameters: data.dtlsParameters });
        } catch (error) {
            console.error('Error connecting producer transport:', error);
        }
    }

    async connectReceiveTransport(user: User, data: any) {
        const transport = user.getTransport(data.transportId)
        if (!transport) return console.log('transport not found of receive ');
        try {
            await transport.connect({ dtlsParameters: data.dtlsParameters });
        } catch (error) {
            console.error('Error connecting receive transport:', error);
        }
    }

    async produceMedia(user: User, data: any) {
        const transport = user.getTransport(data.transportId);
        if (!transport) return console.log('transport not found while creating producer');
        try {
            const producer = await transport.produce({
                kind: data.kind,
                rtpParameters: data.rtpParameters
            });
            if (!producer) return console.log('Producer is not created')
            user.addProducer(producer.id, producer);
            const room = this.findRoomForUser(user);
            if (!room) return console.log('Room not found');

            room.users.forEach(peer => {
                if (peer !== user) {
                    peer.send({
                        type: 'newPeerProducer',
                        producerId: producer.id,
                        kind: data.kind
                    });
                }
            });
            room.users.forEach(peer => {
                if (peer !== user) {
                    user.send({
                        type: 'producersExist',
                        producerId: peer.getProducersId(),
                    })
                }
            })
        } catch (error) {
            console.error('Error while producing ', error)
        }
    }

    async consumeMedia(user: User, data: any) {
        const room = this.findRoomForUser(user);
        if (!room) return;

        const transport = user.getTransport(data.transportId);
        if (!transport) return;

        const canConsume = room.router.canConsume({ producerId: data.producerId, rtpCapabilities: data.rtpCapabilities, });

        if (!canConsume) {
            console.error('Cannot consume: Incompatible RTP capabilities');
            return;
        }

        const consumer = await transport.consume({
            producerId: data.producerId,
            rtpCapabilities: data.rtpCapabilities,
            paused: true
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

    async resume(user: User, data: any) {
        let consumer = user.getConsumer(data.consumerId)
        if (!consumer) {
            console.error('Consumer not found:', data.consumerId);
            return;
        }
        try {
            consumer.resume()
        } catch (error) {
            console.error(error)
        }
    }

    async broadCastMessage(user: User, msg: string) {
        const room = this.findRoomForUser(user);
        if (!room) return
        room.users.forEach(peer => {
            if (peer !== user) {
                peer.send({
                    type: 'message',
                    user: user.id,
                    text: msg
                });
            }
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

    async removeUserFromRoom(user: User) {
        const room = this.findRoomForUser(user);
        if (!room) return
        let producersId = user.getProducersId()
        room.users.delete(user);
        room.users.forEach(peer => {
            peer.send({ type: 'userLeft', producersId });
        });
        if (room.users.size === 0) {
            for (const [roomId, r] of this.rooms.entries()) {
                if (r === room) {
                    this.rooms.delete(roomId);
                    break;
                }
            }
        }
    }
}