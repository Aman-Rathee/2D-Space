import { Scene } from "phaser";

export default class MultiplayerGame extends Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private ws!: WebSocket;
    private players: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
    private userId: string | null = null;
    private token: string | null;
    private spaceId: string | null;
    private lastDirection: string = 'down';
    private map!: Phaser.Tilemaps.Tilemap;

    constructor(id: string) {
        super("MultiplayerGame");
        this.token = localStorage.getItem("token");
        this.userId = decodeJWT(this.token!)
        this.spaceId = id;
    }

    preload() { }

    create() {
        this.createMap()
        this.createAnimation()
        this.ws = new WebSocket("ws://localhost:8080");

        this.ws.onopen = () => {
            console.log("Connected to WebSocket server");

            this.ws.send(JSON.stringify({
                type: "join",
                payload: {
                    token: this.token,
                    spaceId: this.spaceId,
                },
            })
            );
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleServerMessage(data);
        };

        this.ws.onclose = () => {
            console.log("Disconnected from WebSocket server");
        };

        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        } else {
            console.error("Keyboard input is not available.");
        }
    }

    update() {
        if (!this.cursors || !this.player) return;

        this.player.setVelocity(0);

        let moving = false;

        if (this.cursors.left?.isDown) {
            this.player.setVelocityX(-50);
            this.lastDirection = 'left';
            moving = true;
        } else if (this.cursors.right?.isDown) {
            this.player.setVelocityX(50);
            this.lastDirection = 'right';
            moving = true;
        }

        if (this.cursors.up?.isDown) {
            this.player.setVelocityY(-50);
            this.lastDirection = 'up';
            moving = true;
        } else if (this.cursors.down?.isDown) {
            this.player.setVelocityY(50);
            this.lastDirection = 'down';
            moving = true;
        }

        if (moving) {
            this.sendPlayerPosition();
            this.player.anims.play(`walk-${this.lastDirection}`, true);
        } else {
            this.player.anims.play(`idle-${this.lastDirection}`);
        }
    }

    private createMap() {
        this.map = this.make.tilemap({ key: 'spaceMap' })
        const tileSet = this.map.addTilesetImage('map1', 'tiles')!;

        this.map.createLayer('ground', tileSet, 0, 0);
        this.map.createLayer('flor', tileSet, 0, 0);
        this.map.createLayer('interior', tileSet, 0, 0);
    }

    private createAnimation() {
        this.anims.create({
            key: 'idle-left',
            frames: [{ key: 'character', frame: 1053 }]
        });

        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('character', { start: 1053, end: 1056 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'idle-right',
            frames: [{ key: 'character', frame: 975 }]
        });

        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('character', { start: 975, end: 978 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'idle-up',
            frames: [{ key: 'character', frame: 1014 }]
        });

        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('character', { start: 1014, end: 1017 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'idle-down',
            frames: [{ key: 'character', frame: 936 }]
        });

        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('character', { start: 936, end: 939 }),
            frameRate: 6,
            repeat: -1
        });
    }

    private handleServerMessage(data: any) {
        switch (data.type) {
            case "space-joined":
                this.spawnPlayer(data.payload.spawn.x, data.payload.spawn.y);

                data.payload.users.forEach((user: any) => {
                    this.addPlayer(user.id, user.x, user.y);
                });
                break;

            case "user-joined":
                this.addPlayer(data.payload.userId, data.payload.x, data.payload.y);
                break;

            case "user-left":
                this.removePlayer(data.payload.userId);
                break;

            case "player-moved":
                this.updatePlayerPosition(data.payload.userId, data.payload.x, data.payload.y, data.payload.direction);
                break;

            default:
                console.warn("Unknown message type:", data.type);
        }
    }

    private spawnPlayer(x: number, y: number) {
        console.log('x and y ', x, y)
        const spawnPointsLayer = this.map.getObjectLayer('spawn-point');
        const spawnPoints = spawnPointsLayer!.objects;
        const randomSpawnPoint = Phaser.Math.RND.pick(spawnPoints);
        const spawnX = randomSpawnPoint.x!;
        const spawnY = randomSpawnPoint.y!;

        this.player = this.physics.add.sprite(spawnX, spawnY, "character");
        this.player.setCollideWorldBounds(true);

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(2);
        this.cameras.main.setBackgroundColor('#141c36');

        const boundariesLayer = this.map.getObjectLayer('boundaries');
        const boundaries = this.physics.add.staticGroup();
        boundariesLayer!.objects.forEach((boundary: any) => {
            const { x, y, width, height } = boundary;
            boundaries.add(
                this.add.rectangle(x! + width! / 2, y! + height! / 2, width, height)
            );
        });
        if (this.player) {
            this.physics.add.collider(this.player, boundaries);
        }
    }

    private addPlayer(id: string, x: number, y: number) {
        const otherPlayer = this.physics.add.sprite(x, y, "character", 936);
        this.players.set(id, otherPlayer);
    }

    private removePlayer(id: string) {
        const player = this.players.get(id);
        if (player) {
            player.destroy();
            this.players.delete(id);
        }
    }

    private playerTimers: Map<string, number> = new Map();

    private updatePlayerPosition(id: string, x: number, y: number, direction: string) {
        const player = this.players.get(id);
        if (player) {
            if (this.playerTimers.has(id)) {
                clearTimeout(this.playerTimers.get(id)!);
            }

            const prevX = player.x;
            const prevY = player.y;
            const isMoving = prevX !== x || prevY !== y;

            if (isMoving) {
                player.setPosition(x, y);
                player.anims.play(`walk-${direction}`, true);
            }

            const idleTimer = setTimeout(() => {
                const currentAnim = player.anims.currentAnim?.key;
                if (currentAnim?.includes("walk")) {
                    const idleAnim = currentAnim.replace("walk", "idle");
                    player.anims.play(idleAnim, true);
                }
            }, 200);

            this.playerTimers.set(id, Number(idleTimer));
        }
    }

    private sendPlayerPosition() {
        if (!this.ws || !this.player || !this.userId) return;

        const position = {
            x: this.player.x,
            y: this.player.y,
            direction: this.lastDirection
        };

        this.ws.send(JSON.stringify({
            type: "player-moved",
            payload: {
                userId: this.userId,
                ...position,
            },
        })
        );
    }
}

function decodeJWT(token: string) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) {
            throw new Error("Invalid JWT structure");
        }
        const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        return payload;
    } catch (error) {
        console.error("Failed to decode JWT:", error);
        return null;
    }
}