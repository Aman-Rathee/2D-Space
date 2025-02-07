import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Share, Video, VideoOff, MessageSquare, Settings } from "lucide-react"
import * as mediasoup from 'mediasoup-client';
import { useParams } from "react-router";



export const VideoCall = () => {
    const params = useParams();
    const [micOn, setMicOn] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [consumingTransports, setConsumingTransports] = useState<string[]>([]);

    const stream = useRef<MediaStream | null>(null);
    const remoteStream = useRef<MediaStream | null>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const wsRef = useRef<WebSocket | null>(null)
    const deviceRef = useRef<mediasoup.Device | undefined>(undefined)
    const sendTransportRef = useRef<mediasoup.types.Transport<mediasoup.types.AppData> | undefined>(undefined);
    const receiveTransportRef = useRef<mediasoup.types.Transport<mediasoup.types.AppData> | undefined>(undefined);
    const audioProducerRef = useRef<mediasoup.types.Producer | undefined>()
    const videoProducerRef = useRef<mediasoup.types.Producer | undefined>()


    useEffect(() => {
        wsRef.current = new WebSocket('ws://localhost:8081')
        wsRef.current.onopen = async () => {
            await startCamera()
        }

        wsRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            handleServerMessage(message);
        };

        wsRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        wsRef.current.onclose = () => {
            console.log('WebSocket connection closed');
            // Todo, attempt to reconnect here
        };
        return () => {
            if (stream) {
                stream.current?.getTracks().forEach((track) => track.stop());
            }
        };
    }, [])


    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            stream.current = mediaStream
            if (localVideoRef.current) {
                localVideoRef.current!.srcObject = mediaStream;
            }
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'joinRoom',
                    payload: {
                        roomId: params.id,
                    }
                }));
            }
        } catch (error) {
            console.error("Camera/Microphone access denied", error);
        }
    };

    const handleServerMessage = async (message: any) => {
        console.log('Received message:', message);
        switch (message.type) {
            case 'roomJoined':
                deviceRef.current = new mediasoup.Device();
                await deviceRef.current?.load({ routerRtpCapabilities: message.rtpCapabilities });
                createSendTransport()
                break;

            case 'transportCreated':
                await handleTransportCreated(message);
                break;

            case 'transportConnected':
                await startProducing(message);
                break;

            case 'mediaProduced':
                if (message.producersExists) {
                    consumeProducer(message);
                }
                break;

            case 'newPeerProducer':
                consumeProducer(message)
                break;

            case 'mediaConsumed':
                handleMediaConsumed(message);
                break;
        }
    };

    const createSendTransport = async () => {
        wsRef.current?.send(JSON.stringify({
            type: 'createTransport',
            direction: 'send'
        }));
        wsRef.current?.send(JSON.stringify({
            type: 'createTransport',
            direction: 'receive'
        }));
    }

    const handleTransportCreated = async (message: any) => {
        const { direction, transportOptions } = message;

        if (direction === 'send') {
            sendTransportRef.current = deviceRef.current?.createSendTransport(transportOptions);

            sendTransportRef.current?.on('connect', async ({ dtlsParameters }, callback) => {
                wsRef.current?.send(JSON.stringify({
                    type: 'connectTransport',
                    transportId: transportOptions.id,
                    dtlsParameters
                }));
                callback();
            });

            sendTransportRef.current?.on('produce', async ({ kind, rtpParameters }, callback) => {
                wsRef.current?.send(JSON.stringify({
                    type: 'produceMedia',
                    transportId: transportOptions.id,
                    kind,
                    rtpParameters
                }));
                callback({ id: 'temp-producer-id' });
            });

            const videoTrack = stream.current?.getVideoTracks()[0]
            const audioTrack = stream.current?.getAudioTracks()[0]

            const videoTrackParams = { track: videoTrack };
            const audioTrackParams = { track: audioTrack };
            await sendTransportRef.current?.produce(videoTrackParams);
            // audioProducerRef.current = await sendTransportRef.current?.produce(audioTrackParams);

            audioProducerRef.current?.on('trackended', () => {
                console.log('audio track ended')

                // close audio track
            })

            audioProducerRef.current?.on('transportclose', () => {
                console.log('audio transport ended')

                // close audio track
            })

            videoProducerRef.current?.on('trackended', () => {
                console.log('video track ended')

                // close video track
            })

            videoProducerRef.current?.on('transportclose', () => {
                console.log('video transport ended')

                // close video track
            })
        } else {
            receiveTransportRef.current = deviceRef.current?.createRecvTransport(transportOptions);

            receiveTransportRef.current?.on('connect', async ({ dtlsParameters }, callback) => {
                if (isConnected) return
                wsRef.current?.send(JSON.stringify({
                    type: 'connectTransport',
                    transportId: transportOptions.id,
                    dtlsParameters
                }));
                callback();
            });
        }
    };

    const startProducing = async (message: any) => {
        try {
            // const userStream = await navigator.mediaDevices.getUserMedia({
            //     video: true,
            //     audio: true
            // });

            // stream.current = userStream
            console.log('insdie tstart producing ', message);

            const videoTrack = stream.current?.getVideoTracks()[0];
            const audioTrack = stream.current?.getAudioTracks()[0];

            if (sendTransportRef.current) {
                await sendTransportRef.current.produce({ track: videoTrack });
                await sendTransportRef.current.produce({ track: audioTrack });
            }
            setIsConnected(true)
        } catch (error) {
            console.error('Error producing media:', error);
        }
    };

    const consumeProducer = async (message: any) => {
        setConsumingTransports(message.producerId)
        if (!receiveTransportRef) {
            wsRef.current?.send(JSON.stringify({
                type: 'createTransport',
                direction: 'receive'
            }));
            return
        }

        wsRef.current?.send(JSON.stringify({
            type: 'consumeMedia',
            transportId: receiveTransportRef.current?.id,
            producerId: message.producerId,
            rtpCapabilities: deviceRef.current?.rtpCapabilities
        }));
    };

    const handleMediaConsumed = async (message: any) => {
        const { consumerId, producerId, kind, rtpParameters } = message;
        const consumer = await receiveTransportRef.current?.consume({
            id: consumerId,
            producerId,
            kind,
            rtpParameters
        });

        if (!consumer) {
            console.error("Failed to create consumer");
            return
        }
        const track = consumer.track;
        if (kind === 'audio') {
            const audio = document.createElement('audio');
            audio.srcObject = new MediaStream([track]);
            audio.autoplay = true;
        } else if (kind === 'video') {
            if (remoteVideoRef.current) {
                remoteVideoRef.current!.srcObject = new MediaStream([track]);
            }
        }
    };

    const toggleCamera = async () => {
        if (stream.current) {
            const videoTracks = stream.current.getVideoTracks();
            videoTracks.forEach((track) => {
                track.enabled = !cameraOn;
            });
            setCameraOn(videoTracks[0].enabled)
        }
    }

    const toggleMic = async () => {
        if (stream.current) {
            const audioTracks = stream.current.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setMicOn(audioTracks[0].enabled)
        }
    }

    const controls = [
        {
            icon: micOn ? Mic : MicOff,
            label: micOn ? 'Mute' : 'Unmute',
            onClick: () => toggleMic(),
            isActive: micOn,
            color: 'bg-red-600 hover:bg-red-500'
        },
        {
            icon: cameraOn ? Video : VideoOff,
            label: cameraOn ? 'Stop Video' : 'Start Video',
            onClick: () => toggleCamera(),
            isActive: cameraOn,
            color: 'bg-red-600 hover:bg-red-500'
        },
        {
            icon: Share,
            label: 'Screen Share',
            onClick: () => setIsSharing(!isSharing),
            isActive: true,
        },
        {
            icon: MessageSquare,
            label: 'Chat',
            onClick: () => console.log('Open chat'),
            isActive: true,
        },
        {
            icon: Settings,
            label: 'Settings',
            onClick: () => console.log('Open settings'),
            isActive: true,
        },
    ];


    return (
        <>
            {stream && <div className="fixed left-0 bottom-12 bg-white">
                <video className="w-40" ref={localVideoRef} autoPlay playsInline />
            </div>}
            {remoteStream && <div className="fixed top-10 left-12 bg-white">
                <video className="w-40" ref={remoteVideoRef} autoPlay playsInline />
            </div>}
            <div className="fixed bottom-0 left-0 right-0 border-t border-slate-700 bg-slate-900 text-white">
                <div className="px-4 py-1">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 flex items-center justify-center gap-2">
                            {controls.map(({ icon: Icon, label, onClick, isActive, color }) => (
                                <button key={label} onClick={onClick} className={`flex flex-col items-center p-2 rounded-full transition-colors ${isActive ? 'bg-slate-700 hover:bg-slate-600' : color}`}>
                                    <Icon className="w-6 h-6" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
