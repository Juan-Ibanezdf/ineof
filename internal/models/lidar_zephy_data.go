package models

import "time"

type LidarZephyData struct {
	ID            int       `json:"id"`
	EquipmentID   string    `json:"equipment_id"` // Alterado para string para UUID
	Timestamp     time.Time `json:"timestamp"`
	WindSpeed     float64   `json:"wind_speed"`
	WindDirection float64   `json:"wind_direction"`
	Temperature   float64   `json:"temperature"`
}
