import { WebSocketServer } from 'ws';
import { User } from './manager/User';
import { MediaSoupSFU } from './manager/MediaSoupSFU';

const wss = new WebSocketServer({ port: 8080 });
const mediaSoupSFU = MediaSoupSFU.getInstance();

async function main() {
    await mediaSoupSFU.init();
    wss.on('connection', (ws) => {
        ws.on('error', console.error);
        console.log('Client connected');
        const user = new User(ws);

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
}

main().catch(console.error)