package signaling

import (
	"encoding/json"
	"sync"
)

type Hub struct {
	clients    map[*Client]bool
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan []byte
	rooms      map[string]map[*Client]bool
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan []byte),
		rooms:      make(map[string]map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.addClientToRoom(client)
		case client := <-h.Unregister:
			h.unregisterClient(client)
		case message := <-h.Broadcast:
			var msg map[string]interface{}
			if err := json.Unmarshal(message, &msg); err != nil {
				continue
			}
		}
	}
}

func (h *Hub) addClientToRoom(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	h.clients[client] = true

	if client.Room != "" {
		if _, ok := h.rooms[client.Room]; !ok {
			h.rooms[client.Room] = make(map[*Client]bool)
		}
		h.rooms[client.Room][client] = true

		h.notifyRoomOfNewPeer(client)
	}
}

func (h *Hub) unregisterClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, ok := h.clients[client]; ok {
		delete(h.clients, client)
		close(client.Send)

		if client.Room != "" {
			if room, ok := h.rooms[client.Room]; ok {
				delete(room, client)
				if len(room) == 0 {
					delete(h.rooms, client.Room)
				} else {
					h.notifyRoomOfPeerLeaving(client)
				}
			}
		}
	}
}

func (h *Hub) notifyRoomOfNewPeer(client *Client) {
	if room, ok := h.rooms[client.Room]; ok {
		peers := make([]string, 0)
		for peer := range room {
			if peer.ID != client.ID {
				peers = append(peers, peer.ID)
			}
		}

		if peerMsg, err := json.Marshal(map[string]interface{}{
			"type":  "peers",
			"peers": peers,
		}); err == nil {
			client.Send <- peerMsg
		}

		if newPeerMsg, err := json.Marshal(map[string]interface{}{
			"type":   "new-peer",
			"peerID": client.ID,
			"roomID": client.Room,
		}); err == nil {
			for peer := range room {
				if peer.ID != client.ID {
					select {
					case peer.Send <- newPeerMsg:
					default:
						close(peer.Send)
						delete(h.clients, peer)
					}
				}
			}
		}
	}
}

func (h *Hub) notifyRoomOfPeerLeaving(client *Client) {
	if room, ok := h.rooms[client.Room]; ok {
		if peerLeaveMsg, err := json.Marshal(map[string]interface{}{
			"type":   "peer-leave",
			"peerID": client.ID,
			"roomID": client.Room,
		}); err == nil {
			for peer := range room {
				select {
				case peer.Send <- peerLeaveMsg:
				default:
					close(peer.Send)
					delete(h.clients, peer)
				}
			}
		}
	}
}
