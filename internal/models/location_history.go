package models

import "time"

type LocationHistory struct {
	LocationHistoryID string     `json:"location_history_id"` // Alterado para string para UUID
	EquipmentID       string     `json:"equipment_id"`        // Alterado para string para UUID
	Location          string     `json:"location"`            // WKT (Well-Known Text) representation
	StartDate         time.Time  `json:"start_date"`
	EndDate           *time.Time `json:"end_date,omitempty"` // Optional, use omitempty to skip if zero value
	Notes             string     `json:"notes"`
}
