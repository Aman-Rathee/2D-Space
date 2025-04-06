package api

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"

	"pion-sfu/internal/sfu"
	"pion-sfu/internal/signaling"
)

type Handler struct {
	SFU *sfu.SFU
	Hub *signaling.Hub
}

func NewHandler(sfu *sfu.SFU, hub *signaling.Hub) *Handler {
	return &Handler{
		SFU: sfu,
		Hub: hub,
	}
}

func (h *Handler) CreateRoom(c *fiber.Ctx) error {
	roomID := uuid.New().String()
	room := h.SFU.GetOrCreateRoom(roomID)

	return c.JSON(fiber.Map{
		"roomID": room.ID,
	})
}

func (h *Handler) JoinRoom(c *websocket.Conn) {
	ctx := c.Locals("ctx").(*fiber.Ctx)
	roomID := ctx.Params("roomID")
	if roomID == "" {
		c.WriteMessage(websocket.TextMessage, []byte("Room ID is required"))
		c.Close()
		return
	}

	userID := ctx.Query("userID")
	if userID == "" {
		userID = uuid.New().String()
	}

	room := h.SFU.GetOrCreateRoom(roomID)
	if room == nil {
		c.WriteMessage(websocket.TextMessage, []byte("Room not found"))
		c.Close()
		return
	}

	peer := room.AddPeer(userID)
	if peer == nil {
		c.Close()
		return
	}

	client := &signaling.Client{
		Hub:  h.Hub,
		Conn: c,
		Send: make(chan []byte, 256),
		ID:   userID,
		Room: roomID,
	}

	h.Hub.Register <- client

	go client.WritePump()
	client.ReadPump()
}

func (h *Handler) SetupRoutes(app *fiber.App) {
	api := app.Group("/api")
	api.Post("/rooms", h.CreateRoom)

	app.Get("/ws/rooms/:roomID", websocket.New(h.JoinRoom))
}
