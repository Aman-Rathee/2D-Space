package sfu

import (
	"sync"

	"github.com/pion/webrtc/v3"
)

type Room struct {
	ID     string
	peers  map[string]*Peer
	mu     sync.RWMutex
	config *webrtc.Configuration
}

func NewRoom(id string, config *webrtc.Configuration) *Room {
	return &Room{
		ID:     id,
		peers:  make(map[string]*Peer),
		config: config,
	}
}

func (r *Room) AddPeer(id string) *Peer {
	r.mu.Lock()
	defer r.mu.Unlock()

	peer := NewPeer(id, r, r.config)
	r.peers[id] = peer
	return peer
}

func (r *Room) GetPeers() map[string]*Peer {
	r.mu.RLock()
	defer r.mu.RUnlock()

	peers := make(map[string]*Peer)
	for id, peer := range r.peers {
		peers[id] = peer
	}

	return peers
}

func (r *Room) Close() {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, peer := range r.peers {
		peer.Close()
	}
	r.peers = nil
}
