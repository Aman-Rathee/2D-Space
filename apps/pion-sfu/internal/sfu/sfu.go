package sfu

import (
	"sync"

	"github.com/pion/webrtc/v3"
)

type SFU struct {
	rooms  map[string]*Room
	config *webrtc.Configuration
	mu     sync.RWMutex
}

func NewSFU(config *webrtc.Configuration) *SFU {
	return &SFU{
		rooms:  make(map[string]*Room),
		config: config,
	}
}

func (s *SFU) GetOrCreateRoom(roomID string) *Room {
	s.mu.Lock()
	defer s.mu.Unlock()

	if room, exists := s.rooms[roomID]; exists {
		return room
	}

	room := NewRoom(roomID, s.config)
	s.rooms[roomID] = room
	return room
}

func (s *SFU) RemoveRoom(roomID string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if room, exists := s.rooms[roomID]; exists {
		room.Close()
		delete(s.rooms, roomID)
	}
}
