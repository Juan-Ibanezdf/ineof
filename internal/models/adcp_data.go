package models

import "time"

type ADCPData struct {
	ID                    int       `json:"id"`
	EquipmentID           string    `json:"equipment_id"` // Alterado para string para UUID
	Timestamp             time.Time `json:"timestamp"`
	WaterCurrentSpeed     float64   `json:"water_current_speed"`
	WaterCurrentDirection float64   `json:"water_current_direction"`
	WaterTemperature      float64   `json:"water_temperature"`
	Salinity              float64   `json:"salinity"`
	Depth                 float64   `json:"depth"`
}
