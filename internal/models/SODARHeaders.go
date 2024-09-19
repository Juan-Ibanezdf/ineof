package models

import (
	"time"
)

// SODARHeaders representa os cabeçalhos dos dados do SODAR
type SODARHeader struct {
	SODARHeaderID       string    `json:"sodar_header_id"`        // UUID do cabeçalho
	EquipmentID         string    `json:"equipment_id"`           // UUID do equipamento
	CampaignID          string    `json:"campaign_id"`            // UUID da campanha associada
	FileName            string    `json:"file_name"`              // Nome do arquivo
	DeviceSerialNumber  string    `json:"device_serial_number"`   // Número de série do dispositivo
	StationCode         string    `json:"station_code"`           // Código da estação
	SoftwareVersion     string    `json:"software_version"`       // Versão do software
	AntennaAzimuthAngle float64   `json:"antenna_azimuth_angle"`  // Ângulo de azimute da antena
	HeightAboveGround   float64   `json:"height_above_ground"`    // Altura acima do solo
	HeightAboveSeaLevel float64   `json:"height_above_sea_level"` // Altura acima do nível do mar
	UploadDate          time.Time `json:"upload_date"`            // Data de upload
}
