package models

import (
	"database/sql"
)

// Equipment representa um equipamento
type Equipment struct {
	ID                     string          `json:"id"`                       // UUID do equipamento
	EquipmentName          string          `json:"equipment_name"`           // Nome do equipamento
	Description            sql.NullString  `json:"description"`              // Descrição do equipamento
	Type                   sql.NullString  `json:"type"`                     // Tipo do equipamento (e.g., LIDAR, ADCP)
	SerialNumber           sql.NullString  `json:"serial_number"`            // Número de série do equipamento
	Model                  sql.NullString  `json:"model"`                    // Modelo do equipamento
	Manufacturer           sql.NullString  `json:"manufacturer"`             // Fabricante do equipamento
	Frequency              sql.NullFloat64 `json:"frequency"`                // Frequência de operação (se aplicável)
	CalibrationDate        sql.NullTime    `json:"calibration_date"`         // Data da última calibração
	LastMaintenanceDate    sql.NullTime    `json:"last_maintenance_date"`    // Data da última manutenção
	MaintainedBy           sql.NullString  `json:"maintained_by"`            // Pessoa responsável pela última manutenção
	ManufacturingDate      sql.NullTime    `json:"manufacturing_date"`       // Data de fabricação
	AcquisitionDate        sql.NullTime    `json:"acquisition_date"`         // Data de aquisição
	DataTypes              sql.NullString  `json:"data_types"`               // Tipos de dados gerados (e.g., WindSpeed)
	Notes                  sql.NullString  `json:"notes"`                    // Notas adicionais
	WarrantyExpirationDate sql.NullTime    `json:"warranty_expiration_date"` // Data de expiração da garantia
	OperatingStatus        sql.NullString  `json:"operating_status"`         // Status operacional ('Em Operação', etc.)
	Location               sql.NullString  `json:"location"`                 // Localização (WKT)
	CampaignIDs            []string        `json:"campaign_ids"`             // IDs das campanhas associadas (UUID)
	EquipmentImage         sql.NullString  `json:"equipment_image"`          // Caminho ou URL da imagem do equipamento
}
