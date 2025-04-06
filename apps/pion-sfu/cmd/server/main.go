package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/pion/webrtc/v3"

	"pion-sfu/internal/api"
	"pion-sfu/internal/config"
	"pion-sfu/internal/sfu"
	"pion-sfu/internal/signaling"
)

func main() {
	cfg, err := config.Load("config.yaml")
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	webrtcConfig := webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	}

	sfuInstance := sfu.NewSFU(&webrtcConfig)

	hub := signaling.NewHub()
	go hub.Run()

	app := fiber.New(fiber.Config{
		BodyLimit: 10 * 1024 * 1024,
	})

	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	app.Use("/ws/*", api.WebSocketUpgradeMiddleware())

	handler := api.NewHandler(sfuInstance, hub)
	handler.SetupRoutes(app)

	// Start server
	log.Printf("Starting server on %s", cfg.Server.Address)
	if err := app.Listen(cfg.Server.Address); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
