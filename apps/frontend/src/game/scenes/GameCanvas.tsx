import Phaser from "phaser";
import { useEffect, useRef } from "react";
import Preloader from "./Preloaader";
import MultiplayerGame from "./Multiplayer";
import { useParams } from "react-router";
import { VideoCall } from "../../components/VideoCall";

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
            <div className="h-screen w-screen flex items-center justify-center overflow-hidden">
                <div id="phaser-game" key='phaser-gamer' ref={gameContainerRef} />
                <VideoCall />
            </div>
        </>
    )
}

export default GameCanvas