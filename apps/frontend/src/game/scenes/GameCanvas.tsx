import Phaser from "phaser";
import { useEffect, useRef } from "react";
import Preloader from "./Preloaader";
import MultiplayerGame from "./Multiplayer";
import { useParams } from "react-router";

function GameCanvas() {
    const params = useParams();
    const gameContainerRef = useRef(null)

    useEffect(() => {
        const game = new Phaser.Game({
            type: Phaser.AUTO,
            parent: 'phaser-game',
            width: 1024,
            height: 768,
            scene: [Preloader, new MultiplayerGame(params.id!)],
            scale: {
                zoom: 1
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 }
                }
            }
        });

        return () => {
            game.destroy(true);
        }
    }, [])

    return (
        <>
            <div id="phaser-game" className="flex bg-black justify-center" key='phaser-gamer' ref={gameContainerRef} />
        </>
    )
}

export default GameCanvas