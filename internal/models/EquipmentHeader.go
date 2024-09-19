package models

import (
	"time"
)

// EquipmentHeaders representa os cabeçalhos de dados de qualquer equipamento
type EquipmentHeader struct {
	HeaderID    string    `json:"header_id"`    // UUID do cabeçalho
	EquipmentID string    `json:"equipment_id"` // UUID do equipamento
	CampaignID  string    `json:"campaign_id"`  // UUID da campanha associada
	FileName    string    `json:"file_name"`    // Nome do arquivo de dados
	FileType    string    `json:"file_type"`    // Tipo de arquivo (RTD, STA, etc.)
	HeaderInfo  string    `json:"header_info"`  // JSONB contendo informações dos cabeçalhos
	UploadDate  time.Time `json:"upload_date"`  // Data de upload
}
