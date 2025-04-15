import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Share, Video, VideoOff, MessageSquare, Settings } from "lucide-react"
import * as mediasoup from 'mediasoup-client';
import { useParams } from "react-router";
import { Chat } from "./Chat";


export const VideoCall = () => {
    const params = useParams();
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [isSharing, setIsSharing] = useState(false);
    const [remoteStreams, setRemoteStreams] = useState<{ id: string; stream: MediaStream }[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false)

    const localStream = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const wsRef = useRef<WebSocket | null>(null)
    const deviceRef = useRef<mediasoup.Device | undefined>(undefined)
    const sendTransportRef = useRef<mediasoup.types.Transport<mediasoup.types.AppData> | undefined>(undefined);
    const receiveTransportRef = useRef<mediasoup.types.Transport<mediasoup.types.AppData> | undefined>(undefined);
    const videoProducerRef = useRef<mediasoup.types.Producer | null>(null);
    const audioProducerRef = useRef<mediasoup.types.Producer | null>(null);


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
            setRemoteStreams([]);
            // Todo, attempt to reconnect here
        };
        return () => {
            wsRef.current?.close();
            if (localStream) {
                localStream.current?.getTracks().forEach((track) => track.stop());
            }
            setRemoteStreams([]);
        };
    }, [])

    const startCamera = async () => {
        try {
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

            case 'userLeft':
                message.producersId.map((id: string) => {
                    removePeerVideo(id)
                })
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
        if (!sendTransportRef.current) return console.warn('send transport is not created')
        sendTransportRef.current.on('connect', async ({ dtlsParameters }, callback) => {
            try {
                wsRef.current?.send(JSON.stringify({
                    type: 'connectProducerTransport',
                    transportId: sendTransportRef.current?.id,
                    dtlsParameters
                }));
                callback();
            } catch (error) {
                console.error('Error while connecting ', error)
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
                callback({ id: transportOptions.id });
            } catch (error) {
                console.error('Error while producing ', error)
            }
        });

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStream.current = mediaStream
            if (localVideoRef.current) {
                localVideoRef.current!.srcObject = mediaStream;
            }
        } catch (error) {
            if (error === 'NotAllowedError: Permission denied') {
                console.warn('Camera Permission denied')
            } else {
                console.error('Error while getting user media', error)
            }
        }
        if (localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0];
            const audioTrack = localStream.current.getAudioTracks()[0];

            if (sendTransportRef.current) {
                if (videoTrack) {
                    try {
                        videoProducerRef.current = await sendTransportRef.current.produce({ track: videoTrack });
                    } catch (error) {
                        console.error('Error producing video track:', error);
                    }
                }
                if (audioTrack) {
                    try {
                        audioProducerRef.current = await sendTransportRef.current.produce({ track: audioTrack });
                    } catch (error) {
                        console.error('Error producing audio track:', error);
                    }
                }
            }
        }
    }

    const createReceiveTransport = async (message: any) => {
        const { transportOptions } = message;
        receiveTransportRef.current = deviceRef.current?.createRecvTransport(transportOptions);
        if (!receiveTransportRef.current) return console.warn('Receive transport is not created')
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
            return console.warn('No receive transport ref is present ');
        }
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
            const newAudioStream = new MediaStream([track]);
            setRemoteStreams(prev => {
                const exists = prev.some(s => s.id === producerId);
                if (exists) return prev

                return [...prev, { id: producerId, stream: newAudioStream }];
            });
            wsRef.current?.send(JSON.stringify({
                type: 'resume',
                consumerId
            }))
        } else if (kind === 'video') {
            const newVideoStream = new MediaStream([track]);
            setRemoteStreams(prev => {
                const exists = prev.some(s => s.id === producerId);
                if (exists) return prev

                return [...prev, { id: producerId, stream: newVideoStream }];
            });
            wsRef.current?.send(JSON.stringify({
                type: 'resume',
                consumerId
            }))
        }
    };

    const removePeerVideo = (producerId: string) => {
        console.log('remote stream ', remoteStreams)
        setRemoteStreams(prevStreams => prevStreams.filter(stream => stream.id !== producerId));
    };

    const toggleCamera = async () => {
        try {
            if (cameraOn && videoProducerRef.current) {
                await videoProducerRef.current.pause();
                const videoTrack = localStream.current?.getVideoTracks()[0];
                if (videoTrack) videoTrack.stop();
            } else if (!cameraOn && sendTransportRef.current) {
                const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                const newVideoTrack = newStream.getVideoTracks()[0];
                localStream.current = newStream;
                if (localVideoRef.current) {
                    localVideoRef.current!.srcObject = newStream;
                }
                if (videoProducerRef.current) {
                    await videoProducerRef.current.replaceTrack({ track: newVideoTrack });
                    await videoProducerRef.current.resume();
                } else {
                    videoProducerRef.current = await sendTransportRef.current.produce({ track: newVideoTrack });
                }
            }
            setCameraOn(!cameraOn)
        } catch (error) {
            console.error("Error toggling camera:", error);
        }
    }

    const toggleMic = async () => {
        try {
            if (micOn && audioProducerRef.current) {
                await audioProducerRef.current.pause();
                const audioTrack = localStream.current?.getAudioTracks()[0];
                if (audioTrack) audioTrack.stop();
                setMicOn(false)
            } else if (!micOn && sendTransportRef.current) {
                const newAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const newAudioTrack = newAudioStream.getAudioTracks()[0];
                if (audioProducerRef.current) {
                    await audioProducerRef.current.replaceTrack({ track: newAudioTrack });
                    await audioProducerRef.current.resume();
                } else {
                    audioProducerRef.current = await sendTransportRef.current.produce({ track: newAudioTrack });
                }
            }
            setMicOn(!micOn)
        } catch (error) {
            console.error("Error toggling mic:", error);
        }
    }

    const controls = [
        {
            icon: micOn ? Mic : MicOff,
            label: micOn ? 'Mute' : 'Unmute',
            onClick: () => toggleMic(),
            isActive: micOn,
            color: 'bg-green-600 hover:bg-green-500'
        },
        {
            icon: cameraOn ? Video : VideoOff,
            label: cameraOn ? 'Stop Video' : 'Start Video',
            onClick: () => toggleCamera(),
            isActive: cameraOn,
            color: 'bg-green-600 hover:bg-green-500'
        },
        {
            icon: Share,
            label: 'Screen Share',
            onClick: () => setIsSharing(!isSharing),
            isActive: false,
        },
        {
            icon: MessageSquare,
            label: 'Chat',
            onClick: () => setIsChatOpen(prev => !prev),
            isActive: isChatOpen,
            color: 'bg-green-600 hover:bg-green-500'
        },
        {
            icon: Settings,
            label: 'Settings',
            onClick: () => console.log('Open settings'),
            isActive: false,
        },
    ];


    return (
        <>
            <div className="fixed top-3 left-3 grid grid-cols-3 lg:grid-cols-4 gap-2">
                {remoteStreams.map((remoteStream) => (
                    <div key={remoteStream.id} >
                        <RemoteVideo stream={remoteStream.stream} />
                    </div>
                ))}
            </div>
            {localStream && <div className="fixed left-3 bottom-14 z-1">
                <video className="w-32 rounded-lg" ref={localVideoRef} muted autoPlay playsInline />
            </div>}
            <div className="fixed bottom-0 left-0 right-0 border-t z-1 border-slate-700 bg-slate-900 text-white">
                <div className="px-4 py-1">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 flex items-center justify-center gap-2">
                            {controls.map(({ icon: Icon, label, onClick, isActive, color }) => (
                                <button key={label} onClick={onClick} className={`flex flex-col items-center p-2 rounded-full transition-colors ${isActive ? color : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    <Icon className="w-6 h-6" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {wsRef.current && < Chat ws={wsRef.current} className={isChatOpen ? 'fixed' : "hidden"} setIsChatOpen={setIsChatOpen} />}
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