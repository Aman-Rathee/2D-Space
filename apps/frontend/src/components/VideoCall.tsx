import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Share, Video, VideoOff, MessageSquare, Settings } from "lucide-react"
import * as mediasoup from 'mediasoup-client';
import { useParams } from "react-router";


export const VideoCall = () => {
    const params = useParams();
    const [micOn, setMicOn] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [remoteStreams, setRemoteStreams] = useState<{ id: string; stream: MediaStream }[]>([]);

    const localStream = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const wsRef = useRef<WebSocket | null>(null)
    const deviceRef = useRef<mediasoup.Device | undefined>(undefined)
    const sendTransportRef = useRef<mediasoup.types.Transport<mediasoup.types.AppData> | undefined>(undefined);
    const receiveTransportRef = useRef<mediasoup.types.Transport<mediasoup.types.AppData> | undefined>(undefined);


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
            if (localStream) {
                localStream.current?.getTracks().forEach((track) => track.stop());
            }
        };
    }, [])

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStream.current = mediaStream
            if (localVideoRef.current) {
                localVideoRef.current!.srcObject = mediaStream;
            }
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'joinRoom',
                    roomId: params.id
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
                requestSendTransport()
                requestReceiveTransport()
                break;

            case 'sendTransportCreated':
                createSendTransport(message)
                break;

            case 'receiveTransportCreated':
                createReceiveTransport(message)
                break;

            case 'producersExist':
                message.producerId.map((id: string) => {
                    consumeProducer(id)
                })
                break;

            case 'newPeerProducer':
                consumeProducer(message.producerId)
                break;

            case 'mediaConsumed':
                handleMediaConsumed(message);
                break;
        }
    };

    const requestSendTransport = async () => {
        wsRef.current?.send(JSON.stringify({
            type: 'requestSendTransport'
        }));
    }

    const requestReceiveTransport = async () => {
        wsRef.current?.send(JSON.stringify({
            type: 'requestReceiveTransport'
        }));
    }

    const createSendTransport = async (message: any) => {
        const { transportOptions } = message;

        sendTransportRef.current = deviceRef.current?.createSendTransport(transportOptions);
        if (!sendTransportRef.current) return console.log('send transport is not created')
        sendTransportRef.current.on('connect', async ({ dtlsParameters }, callback) => {
            try {
                wsRef.current?.send(JSON.stringify({
                    type: 'connectProducerTransport',
                    transportId: sendTransportRef.current?.id,
                    dtlsParameters
                }));
                callback();
            } catch (error) {
                console.log('Error while connecting ', error)
            }
        });
        sendTransportRef.current.on('produce', async ({ kind, rtpParameters }, callback) => {
            try {
                wsRef.current?.send(JSON.stringify({
                    type: 'produceMedia',
                    transportId: sendTransportRef.current?.id,
                    kind,
                    rtpParameters
                }));
                // callback({ id: transportOptions.id });
            } catch (error) {
                console.log('Error while producing ', error)
            }
        });

        if (localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0];
            const audioTrack = localStream.current.getAudioTracks()[0];

            if (videoTrack) {
                try {
                    console.log('producing the video track')
                    await sendTransportRef.current.produce({ track: videoTrack });
                    console.log('video track produced');
                } catch (error) {
                    console.error('Error producing video track:', error);
                }
            }
            if (audioTrack) {
                await sendTransportRef.current.produce({ track: audioTrack });
                console.log('audio track produced')
            }
        }
    }

    const createReceiveTransport = async (message: any) => {
        const { transportOptions } = message;
        receiveTransportRef.current = deviceRef.current?.createRecvTransport(transportOptions);
        if (!receiveTransportRef.current) return console.log('Receive transport is not created')
        receiveTransportRef.current.on('connect', async ({ dtlsParameters }, callback) => {
            wsRef.current?.send(JSON.stringify({
                type: 'connectReceiveTransport',
                transportId: receiveTransportRef.current?.id,
                dtlsParameters
            }));
            callback();
        });
    }

    const consumeProducer = async (producerId: string) => {
        if (!receiveTransportRef.current) {
            return console.log('No receive transport ref is present ');
        }
        console.log('indie the consumeproducer', producerId)
        wsRef.current?.send(JSON.stringify({
            type: 'consumeMedia',
            transportId: receiveTransportRef.current?.id,
            producerId: producerId,
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
            const audioStream = new MediaStream([track]);
            const audio = new Audio();
            audio.srcObject = audioStream;
            audio.autoplay = true;
            // const audio = document.createElement('audio');
            // audio.srcObject = new MediaStream([track]);
            // audio.autoplay = true;
        } else if (kind === 'video') {
            const newStream = new MediaStream([track]);
            setRemoteStreams(prev => {
                const exists = prev.some(s => s.id === producerId);
                if (exists) return prev;

                return [...prev, { id: producerId, stream: newStream }];
            });
            wsRef.current?.send(JSON.stringify({
                type: 'resume',
                consumerId
            }))
        }
    };

    const toggleCamera = async () => {
        if (localStream.current) {
            const videoTracks = localStream.current.getVideoTracks();
            videoTracks.forEach((track) => {
                track.enabled = !cameraOn;
            });
            setCameraOn(videoTracks[0].enabled)
        }
    }

    const toggleMic = async () => {
        if (localStream.current) {
            const audioTracks = localStream.current.getAudioTracks();
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
            <div className="fixed top-4 left-4 grid grid-cols-3 lg:grid-cols-4 gap-2">
                {remoteStreams.map((remoteStream) => (
                    <div key={remoteStream.id} >
                        <RemoteVideo stream={remoteStream.stream} />
                    </div>
                ))}
            </div>
            {localStream && <div className="fixed left-0 bottom-12 bg-white">
                <video className="w-40" ref={localVideoRef} muted autoPlay playsInline />
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


const RemoteVideo = ({ stream }: { stream: MediaStream }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video ref={videoRef} autoPlay playsInline className="w-32 rounded-lg" />
    );
};