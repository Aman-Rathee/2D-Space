import { Scene } from "phaser";


export default class Preloader extends Scene {
    constructor() {
        super('preloader')
    }
    preload() {
        this.load.image('tiles', '/maps/map1/tileset.png')
        this.load.tilemapTiledJSON('spaceMap', '/maps/map1/map.json')

        this.load.spritesheet('character', '/maps/map1/tileset.png', {
            frameWidth: 16,
            frameHeight: 16,
        });
    }
    create() {
        this.scene.start('MultiplayerGame')
    }
}