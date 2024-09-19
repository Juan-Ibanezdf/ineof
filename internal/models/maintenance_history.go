package models

import "time"

type MaintenanceHistory struct {
	MaintenanceID   string    `json:"maintenance_id"` // Alterado para string para UUID
	EquipmentID     string    `json:"equipment_id"`   // Alterado para string para UUID
	MaintenanceDate time.Time `json:"maintenance_date"`
	PerformedBy     string    `json:"performed_by"`
	Description     string    `json:"description"`
	Notes           string    `json:"notes"`
}
