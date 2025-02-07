import { WebSocket } from 'ws';
import { Consumer, Producer, Transport } from 'mediasoup/node/lib/types';
import { MediaSoupSFU } from './MediaSoupSFU';

export class User {
    private ws: WebSocket
    public id: string;
    private consumers: Map<string, Consumer>;
    private producers: Map<string, Producer>;
    private transports: Map<string, Transport>;
    private mediaSoupSFU: MediaSoupSFU;

    constructor(ws: WebSocket) {
        this.ws = ws;
        this.id = Math.random().toString(36).substring(7);
        this.consumers = new Map();
        this.producers = new Map();
        this.transports = new Map();
        this.mediaSoupSFU = MediaSoupSFU.getInstance();
        this.init()
    }

    init() {
        this.ws.on("message", async (data) => {
            try {
                const parsedData = JSON.parse(data.toString());
                console.log('Received message:', parsedData);

                switch (parsedData.type) {
                    case "joinRoom":
                        await this.mediaSoupSFU.createOrJoinRoom(this, parsedData.roomId);
                        break;
                    case "createTransport":
                        await this.mediaSoupSFU.createWebRTCTransport(this, parsedData.direction);
                        break;
                    case "connectTransport":
                        await this.mediaSoupSFU.connectTransport(this, parsedData);
                        break;
                    case "produceMedia":
                        await this.mediaSoupSFU.produceMedia(this, parsedData);
                        break;
                    case "consumeMedia":
                        await this.mediaSoupSFU.consumeMedia(this, parsedData);
                        break;
                    default:
                        console.warn('Unknown message type:', parsedData.type);
                }
            } catch (error) {
                console.error('Error handling message:', error);
                this.send({ type: 'error', message: 'Internal server error' });
            }
        })
    }

    public send(message: any): void {
        this.ws.send(JSON.stringify(message));
    }

    public addTransport(id: string, transport: Transport): void {
        this.transports.set(id, transport);
    }

    public getTransport(id: string): Transport | undefined {
        return this.transports.get(id);
    }

    public addProducer(id: string, producer: Producer): void {
        this.producers.set(id, producer);
    }

    public addConsumer(id: string, consumer: Consumer): void {
        this.consumers.set(id, consumer);
    }

    public cleanup(): void {
        this.consumers.forEach(consumer => consumer.close());
        this.producers.forEach(producer => producer.close());
        this.transports.forEach(transport => transport.close());

        this.consumers.clear();
        this.producers.clear();
        this.transports.clear();
    }
}