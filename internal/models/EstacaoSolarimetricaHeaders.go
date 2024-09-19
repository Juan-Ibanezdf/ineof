package models

import (
	"time"
)

// EstacaoSolarimetricaHeaders representa os cabeçalhos para os dados da estação solarimétrica
type EstacaoSolarimetricaHeader struct {
	SolarimetricaHeaderID    string    `json:"solarimetrica_header_id"`    // UUID do cabeçalho
	EquipmentID              string    `json:"equipment_id"`               // UUID do equipamento
	CampaignID               string    `json:"campaign_id"`                // UUID da campanha associada
	FileName                 string    `json:"file_name"`                  // Nome do arquivo
	SolarRadiationHeader     string    `json:"solar_radiation_header"`     // Cabeçalho específico para radiação solar
	TemperatureHeader        string    `json:"temperature_header"`         // Cabeçalho específico para temperatura
	BarometricPressureHeader string    `json:"barometric_pressure_header"` // Cabeçalho específico para pressão barométrica
	UploadDate               time.Time `json:"upload_date"`                // Data de upload
}
