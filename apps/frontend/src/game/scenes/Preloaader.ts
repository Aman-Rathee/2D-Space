import { Scene } from "phaser";


export default class Preloader extends Scene {
    constructor() {
        super('preloader')
    }
    preload() {
        this.load.image('tiles', '/map1.png')
        this.load.tilemapTiledJSON('spaceMap', '/map.json')

        this.load.spritesheet('character', '/map1.png', {
            frameWidth: 16, 
            frameHeight: 16,
        });
    }
    create() {
        this.scene.start('MultiplayerGame')
    }
}