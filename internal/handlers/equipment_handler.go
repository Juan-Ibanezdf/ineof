package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"api/internal/models"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// EquipmentRouter configura as rotas para o handler de equipamentos
func EquipmentRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Get("/", GetAllEquipments(db))
	r.Post("/", CreateEquipment(db))
	r.Get("/{id}", GetEquipmentByID(db))
	r.Put("/{id}", UpdateEquipment(db))
	r.Delete("/{id}", DeleteEquipment(db))
	return r
}

// CreateEquipment - Adiciona um novo equipamento
func CreateEquipment(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var equipment models.Equipment
		if err := json.NewDecoder(r.Body).Decode(&equipment); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		tx, err := db.Begin(context.Background())
		if err != nil {
			http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
			return
		}
		defer tx.Rollback(context.Background())

		// Inserir equipamento e retornar seu ID gerado
		var equipmentID string
		err = tx.QueryRow(
			context.Background(),
			`INSERT INTO equipments 
				(equipmentname, description, equipmenttype, serialnumber, model, manufacturer, frequency, calibrationdate, 
				lastmaintenancedate, maintainedby, manufacturingdate, acquisitiondate, datatypes, notes, 
				warrantyexpirationdate, operatingstatus, location, equipment_image) 
			VALUES 
				($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, ST_GeogFromText($17), $18)
			RETURNING equipmentid`,
			equipment.EquipmentName, equipment.Description, equipment.Type, equipment.SerialNumber, equipment.Model,
			equipment.Manufacturer, equipment.Frequency, equipment.CalibrationDate, equipment.LastMaintenanceDate,
			equipment.MaintainedBy, equipment.ManufacturingDate, equipment.AcquisitionDate, equipment.DataTypes,
			equipment.Notes, equipment.WarrantyExpirationDate, equipment.OperatingStatus, equipment.Location, // WKT
			equipment.EquipmentImage, // Novo campo EquipmentImage
		).Scan(&equipmentID)
		if err != nil {
			http.Error(w, "Failed to insert equipment", http.StatusInternalServerError)
			return
		}

		// Associar campanhas relacionadas, se houver
		if len(equipment.CampaignIDs) > 0 {
			for _, campaignID := range equipment.CampaignIDs {
				var exists bool
				err := tx.QueryRow(context.Background(), "SELECT EXISTS(SELECT 1 FROM campaigns WHERE campaignid=$1)", campaignID).Scan(&exists)
				if err != nil || !exists {
					http.Error(w, "Campaign ID does not exist: "+campaignID, http.StatusBadRequest)
					return
				}

				_, err = tx.Exec(
					context.Background(),
					`INSERT INTO CampaignEquipment (campaignid, equipmentid) VALUES ($1, $2)`,
					campaignID, equipmentID,
				)
				if err != nil {
					http.Error(w, "Failed to associate campaign", http.StatusInternalServerError)
					return
				}
			}
		}

		if err = tx.Commit(context.Background()); err != nil {
			http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"message": "Equipment successfully created", "equipment_id": equipmentID})
	}
}

func GetAllEquipments(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Consulta SQL para buscar apenas os campos necessários: equipmentid, equipmentname, description, equipment_image
		rows, err := db.Query(context.Background(), `
			SELECT 
				equipmentid, equipmentname, description, equipment_image
			FROM equipments
		`)
		if err != nil {
			http.Error(w, "Failed to query equipments", http.StatusInternalServerError)
			log.Println("Failed to query equipments:", err)
			return
		}
		defer rows.Close()

		var equipments []struct {
			ID             string         `json:"id"`              // ID do equipamento
			EquipmentName  string         `json:"equipment_name"`  // Nome do equipamento
			Description    sql.NullString `json:"description"`     // Descrição do equipamento, pode ser nulo
			EquipmentImage sql.NullString `json:"equipment_image"` // Caminho ou URL da imagem associada, pode ser nulo
		}

		for rows.Next() {
			var equipment struct {
				ID             string         `json:"id"`
				EquipmentName  string         `json:"equipment_name"`
				Description    sql.NullString `json:"description"`
				EquipmentImage sql.NullString `json:"equipment_image"`
			}

			// Faz o scan apenas dos campos necessários
			err := rows.Scan(
				&equipment.ID,
				&equipment.EquipmentName,
				&equipment.Description,
				&equipment.EquipmentImage,
			)
			if err != nil {
				http.Error(w, "Failed to scan equipment", http.StatusInternalServerError)
				log.Println("Failed to scan equipment:", err)
				return
			}

			// Adicionar o equipamento à lista
			equipments = append(equipments, equipment)
		}

		if err := rows.Err(); err != nil {
			http.Error(w, "Error iterating over equipment rows", http.StatusInternalServerError)
			log.Println("Error iterating over equipment rows:", err)
			return
		}

		// Responder com os equipamentos no formato JSON
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(equipments); err != nil {
			http.Error(w, "Failed to encode equipments to JSON", http.StatusInternalServerError)
			log.Println("Failed to encode equipments to JSON:", err)
		}
	}
}

func GetEquipmentByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		var equipment models.Equipment

		// Consulta SQL para buscar todos os detalhes do equipamento
		err := db.QueryRow(context.Background(), `
			SELECT 
				equipmentid, equipmentname, description, equipmenttype, serialnumber, model, 
				manufacturer, frequency, calibrationdate, lastmaintenancedate, maintainedby,
				manufacturingdate, acquisitiondate, datatypes, notes, 
				warrantyexpirationdate, operatingstatus, ST_AsText(location), equipment_image 
			FROM equipments WHERE equipmentid=$1`, id).Scan(
			&equipment.ID, &equipment.EquipmentName, &equipment.Description, &equipment.Type,
			&equipment.SerialNumber, &equipment.Model, &equipment.Manufacturer, &equipment.Frequency,
			&equipment.CalibrationDate, &equipment.LastMaintenanceDate, &equipment.MaintainedBy,
			&equipment.ManufacturingDate, &equipment.AcquisitionDate, &equipment.DataTypes, &equipment.Notes,
			&equipment.WarrantyExpirationDate, &equipment.OperatingStatus, &equipment.Location,
			&equipment.EquipmentImage, // Inclui o campo de imagem
		)
		if err != nil {
			http.Error(w, "Equipment not found", http.StatusNotFound)
			log.Println("Equipment not found:", err)
			return
		}

		// Obter IDs de campanhas associadas
		campaigns, err := db.Query(context.Background(), `
			SELECT campaignid FROM CampaignEquipment WHERE equipmentid=$1
		`, equipment.ID)
		if err != nil {
			http.Error(w, "Failed to get associated campaigns", http.StatusInternalServerError)
			log.Println("Failed to get associated campaigns:", err)
			return
		}
		defer campaigns.Close()

		var campaignIDs []string
		for campaigns.Next() {
			var campaignID string
			if err := campaigns.Scan(&campaignID); err != nil {
				http.Error(w, "Failed to scan campaign ID", http.StatusInternalServerError)
				log.Println("Failed to scan campaign ID:", err)
				return
			}
			campaignIDs = append(campaignIDs, campaignID)
		}

		equipment.CampaignIDs = campaignIDs

		// Responder com o equipamento no formato JSON
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(equipment); err != nil {
			http.Error(w, "Failed to encode equipment to JSON", http.StatusInternalServerError)
			log.Println("Failed to encode equipment to JSON:", err)
		}
	}
}

func UpdateEquipment(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		var equipment models.Equipment
		if err := json.NewDecoder(r.Body).Decode(&equipment); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		tx, err := db.Begin(context.Background())
		if err != nil {
			http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
			return
		}
		defer tx.Rollback(context.Background())

		_, err = tx.Exec(
			context.Background(),
			`UPDATE equipments SET 
				equipmentname=$1, description=$2, equipmenttype=$3, serialnumber=$4, model=$5, manufacturer=$6, 
				frequency=$7, calibrationdate=$8, lastmaintenancedate=$9, maintainedby=$10, 
				manufacturingdate=$11, acquisitiondate=$12, datatypes=$13, notes=$14, 
				warrantyexpirationdate=$15, operatingstatus=$16, location=ST_GeogFromText($17), equipment_image=$18 
			WHERE equipmentid=$19`,
			equipment.EquipmentName, equipment.Description, equipment.Type, equipment.SerialNumber, equipment.Model,
			equipment.Manufacturer, equipment.Frequency, equipment.CalibrationDate, equipment.LastMaintenanceDate,
			equipment.MaintainedBy, equipment.ManufacturingDate, equipment.AcquisitionDate, equipment.DataTypes,
			equipment.Notes, equipment.WarrantyExpirationDate, equipment.OperatingStatus, equipment.Location, // WKT
			equipment.EquipmentImage, // Novo campo EquipmentImage
			id,
		)
		if err != nil {
			http.Error(w, "Failed to update equipment", http.StatusInternalServerError)
			return
		}

		// Limpar associações antigas e adicionar novas associações de campanhas
		_, err = tx.Exec(context.Background(), `DELETE FROM CampaignEquipment WHERE equipmentid=$1`, id)
		if err != nil {
			http.Error(w, "Failed to clear old associations", http.StatusInternalServerError)
			return
		}

		for _, campaignID := range equipment.CampaignIDs {
			_, err = tx.Exec(
				context.Background(),
				`INSERT INTO CampaignEquipment (campaignid, equipmentid) VALUES ($1, $2)`,
				campaignID, id,
			)
			if err != nil {
				http.Error(w, "Failed to associate campaign", http.StatusInternalServerError)
				return
			}
		}

		if err = tx.Commit(context.Background()); err != nil {
			http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Equipment successfully updated", "equipment_id": id})
	}
}

// DeleteEquipment - Deleta um equipamento
func DeleteEquipment(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		tx, err := db.Begin(context.Background())
		if err != nil {
			http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
			log.Println("Failed to begin transaction:", err)
			return
		}
		defer tx.Rollback(context.Background())

		// Atualizar status do equipamento para "Deleted" em vez de excluí-lo fisicamente
		_, err = tx.Exec(context.Background(), `UPDATE equipments SET operatingstatus='Deleted' WHERE equipmentid=$1`, id)
		if err != nil {
			http.Error(w, "Failed to update equipment status", http.StatusInternalServerError)
			log.Println("Failed to update equipment status:", err)
			return
		}

		// Atualizar a tabela CampaignEquipment para marcar o equipamento como "excluído" ou não mais em uso
		_, err = tx.Exec(context.Background(), `UPDATE CampaignEquipment SET retrievaldate=now() WHERE equipmentid=$1 AND retrievaldate IS NULL`, id)
		if err != nil {
			http.Error(w, "Failed to update campaign equipment status", http.StatusInternalServerError)
			log.Println("Failed to update campaign equipment status:", err)
			return
		}

		if err = tx.Commit(context.Background()); err != nil {
			http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
			log.Println("Failed to commit transaction:", err)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Equipment successfully deleted", "equipment_id": id})
	}
}
