import { WebSocketServer } from 'ws';
import { User } from './manager/User';
import { MediaSoupSFU } from './manager/MediaSoupSFU';

const wss = new WebSocketServer({ port: 8081 });
const mediaSoupSFU = MediaSoupSFU.getInstance();

async function main() {
    await mediaSoupSFU.init();
    wss.on('connection', (ws) => {
        ws.on('error', console.error);
        console.log('Client connected');
        const user = new User(ws);

        ws.on('close', () => {
            user.cleanup();
            mediaSoupSFU.removeUserFromRoom(user);
        });
    });
}

main().catch(console.error)