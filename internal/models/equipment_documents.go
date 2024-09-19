package models

import "time"

type EquipmentDocuments struct {
	DocumentID   string    `json:"document_id"`  // Alterado para string para UUID
	EquipmentID  string    `json:"equipment_id"` // Alterado para string para UUID
	DocumentName string    `json:"document_name"`
	DocumentType string    `json:"document_type"`
	Path         string    `json:"path,omitempty"`          // Caminho para o arquivo PDF
	DocumentLink string    `json:"document_link,omitempty"` // URL opcional para o documento
	UploadedBy   string    `json:"uploaded_by"`
	UploadDate   time.Time `json:"upload_date"`
	Notes        string    `json:"notes"`
}
