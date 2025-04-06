package config

import (
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server struct {
		Address string `yaml:"address"`
		CORS    struct {
			AllowedOrigins []string `yaml:"allowed_origins"`
		} `yaml:"cors"`
	} `yaml:"server"`
	WebRTC struct {
		ICEServers []struct {
			URLs []string `yaml:"urls"`
		} `yaml:"ice_servers"`
	} `yaml:"webrtc"`
}

func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	return &config, nil
}
