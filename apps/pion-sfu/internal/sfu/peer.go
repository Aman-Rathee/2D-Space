package sfu

import (
	"fmt"
	"sync"
	"time"

	"github.com/pion/rtcp"
	"github.com/pion/webrtc/v3"
)

type Peer struct {
	ID             string
	PC             *webrtc.PeerConnection
	incomingTracks map[string]*webrtc.TrackRemote
	outboundTracks map[string]*webrtc.TrackLocalStaticRTP
	room           *Room
	onICECandidate func(candidate *webrtc.ICECandidate)
	mu             sync.RWMutex
}

func NewPeer(id string, room *Room, config *webrtc.Configuration) *Peer {
	pc, err := webrtc.NewPeerConnection(*config)
	if err != nil {
		fmt.Printf("Failed to create peer connection: %v\n", err)
		return nil
	}

	peer := &Peer{
		ID:             id,
		PC:             pc,
		incomingTracks: make(map[string]*webrtc.TrackRemote, 0),
		outboundTracks: make(map[string]*webrtc.TrackLocalStaticRTP),
		room:           room,
	}

	pc.OnTrack(peer.handleTrack)

	pc.OnICECandidate(func(candidate *webrtc.ICECandidate) {
		if peer.onICECandidate != nil && candidate != nil {
			peer.onICECandidate(candidate)
		}
	})

	pc.OnICEConnectionStateChange(func(state webrtc.ICEConnectionState) {
		if state == webrtc.ICEConnectionStateFailed || state == webrtc.ICEConnectionStateClosed {
			fmt.Printf("ICEConnectionStateFailed Failed: %v\n", err)
		}
	})

	return peer
}

func (p *Peer) handleTrack(track *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
	p.mu.Lock()
	trackID := track.ID()
	if trackID == "" {
		trackID = fmt.Sprintf("%s-%d", track.Kind().String(), time.Now().UnixNano())
	}
	p.incomingTracks[trackID] = track
	p.mu.Unlock()

	fmt.Printf("Peer %s received track: %s\n", p.ID, trackID)

	trackLocal, err := webrtc.NewTrackLocalStaticRTP(track.Codec().RTPCodecCapability, trackID, p.ID)
	if err != nil {
		fmt.Printf("Failed to create local track: %v\n", err)
		return
	}

	otherPeers := p.room.GetPeers()
	for _, otherPeer := range otherPeers {
		if otherPeer.ID == p.ID {
			continue
		}

		fmt.Printf("Adding track %s to peer %s\n", trackID, otherPeer.ID)
		_, err := otherPeer.PC.AddTrack(trackLocal)
		if err != nil {
			fmt.Printf("Failed to add track to peer %s: %v\n", otherPeer.ID, err)
			continue
		}

		if track.Kind() == webrtc.RTPCodecTypeVideo {
			go func() {
				ticker := time.NewTicker(3 * time.Second)
				defer ticker.Stop()

				for range ticker.C {
					if otherPeer.PC.ConnectionState() == webrtc.PeerConnectionStateClosed {
						return
					}

					err := otherPeer.PC.WriteRTCP([]rtcp.Packet{
						&rtcp.PictureLossIndication{
							MediaSSRC: uint32(track.SSRC()),
						},
					})
					if err != nil {
						fmt.Printf("Failed to send PLI: %v\n", err)
						return
					}
				}
			}()
		}
	}
}

func (p *Peer) Close() {
	if p.PC != nil {
		p.PC.Close()
	}
}
