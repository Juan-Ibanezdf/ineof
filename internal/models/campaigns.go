package models

import "time"

// Campaign representa uma campanha
type Campaign struct {
	ID            string    `json:"id"`             // UUID da campanha
	Name          string    `json:"name"`           // Nome da campanha
	StartDate     time.Time `json:"start_date"`     // Data de início da campanha
	EndDate       time.Time `json:"end_date"`       // Data de término da campanha
	TeamName      string    `json:"team_name"`      // Nome da equipe responsável
	Location      string    `json:"location"`       // Localização (em formato WKT)
	EquipmentUsed string    `json:"equipment_used"` // Equipamentos utilizados (JSONB)
	Objectives    string    `json:"objectives"`     // Objetivos da campanha
	ContactPerson string    `json:"contact_person"` // Pessoa de contato
	Status        string    `json:"status"`         // Status da campanha ('Planned', 'Ongoing', etc.)
	Notes         string    `json:"notes"`          // Notas adicionais
	Description   string    `json:"description"`    // Descrição detalhada da campanha
	EquipmentIDs  []string  `json:"equipment_ids"`  // IDs de equipamentos relacionados (UUID)
	CampaignImage string    `json:"campaign_image"` // Caminho ou URL para a imagem da campanha
}
