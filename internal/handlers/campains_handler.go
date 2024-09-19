package handlers

import (
	"api/internal/models"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// CampaignRouter configura as rotas para o handler de campanhas
func CampaignRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Post("/", CreateCampaign(db))
	r.Get("/", GetAllCampaigns(db))
	r.Get("/{id}", GetCampaignByID(db))
	r.Put("/{id}", UpdateCampaign(db))
	r.Delete("/{id}", DeleteCampaign(db))
	return r
}

// CreateCampaign - Inserir nova campanha
func CreateCampaign(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var campaign models.Campaign

		if err := json.NewDecoder(r.Body).Decode(&campaign); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			log.Println("Error decoding JSON:", err)
			return
		}

		// Verificar se o status é válido
		validStatuses := map[string]bool{
			"Planned":   true,
			"Ongoing":   true,
			"Completed": true,
			"Cancelled": true,
		}

		if !validStatuses[campaign.Status] {
			http.Error(w, "Invalid status value", http.StatusBadRequest)
			log.Println("Invalid status value:", campaign.Status)
			return
		}

		tx, err := db.Begin(context.Background())
		if err != nil {
			http.Error(w, "Failed to begin transaction: "+err.Error(), http.StatusInternalServerError)
			log.Println("Failed to begin transaction:", err)
			return
		}
		defer tx.Rollback(context.Background())

		// Inserir campanha
		query := `
			INSERT INTO campaigns 
				(campaignname, startdate, enddate, teamname, location, equipmentused, objectives, contactperson, status, notes, description, campaign_image) 
			VALUES 
				($1, $2, $3, $4, ST_GeogFromText($5), $6, $7, $8, $9, $10, $11, $12)
			RETURNING campaignid
		`

		var campaignID string
		err = tx.QueryRow(
			context.Background(),
			query,
			campaign.Name,
			campaign.StartDate,
			campaign.EndDate,
			campaign.TeamName,
			campaign.Location,
			campaign.EquipmentUsed,
			campaign.Objectives,
			campaign.ContactPerson,
			campaign.Status,
			campaign.Notes,
			campaign.Description,
			campaign.CampaignImage,
		).Scan(&campaignID)

		if err != nil {
			http.Error(w, "Failed to insert campaign: "+err.Error(), http.StatusInternalServerError)
			log.Println("Failed to insert campaign:", err)
			return
		}

		// Associar equipamentos relacionados, se houver
		if len(campaign.EquipmentIDs) > 0 {
			for _, equipmentID := range campaign.EquipmentIDs {
				var exists bool
				err := tx.QueryRow(context.Background(), "SELECT EXISTS(SELECT 1 FROM equipments WHERE equipmentid=$1)", equipmentID).Scan(&exists)
				if err != nil || !exists {
					http.Error(w, "Equipment ID does not exist: "+equipmentID, http.StatusBadRequest)
					log.Println("Equipment ID does not exist:", equipmentID)
					return
				}

				_, err = tx.Exec(
					context.Background(),
					`INSERT INTO CampaignEquipment (campaignid, equipmentid) VALUES ($1, $2)`,
					campaignID, equipmentID,
				)
				if err != nil {
					http.Error(w, "Failed to associate equipment: "+err.Error(), http.StatusInternalServerError)
					log.Println("Failed to associate equipment:", err)
					return
				}
			}
		}

		if err = tx.Commit(context.Background()); err != nil {
			http.Error(w, "Failed to commit transaction: "+err.Error(), http.StatusInternalServerError)
			log.Println("Failed to commit transaction:", err)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"message": "Campaign successfully created", "campaign_id": campaignID})
	}
}

// GetAllCampaigns retorna todas as campanhas no formato resumido
func GetAllCampaigns(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type CampaignSummary struct {
			ID            string    `json:"id"`
			Name          string    `json:"name"`
			Description   string    `json:"description"`
			StartDate     time.Time `json:"start_date"`
			EndDate       time.Time `json:"end_date"`
			CampaignImage string    `json:"campaign_image"`
		}

		var campaigns []CampaignSummary

		rows, err := db.Query(context.Background(), `
			SELECT campaignid, campaignname, description, startdate, enddate, campaign_image
			FROM campaigns
		`)
		if err != nil {
			http.Error(w, "Failed to query campaigns", http.StatusInternalServerError)
			log.Println("Failed to query campaigns:", err)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var campaign CampaignSummary
			err := rows.Scan(&campaign.ID, &campaign.Name, &campaign.Description, &campaign.StartDate, &campaign.EndDate, &campaign.CampaignImage)
			if err != nil {
				http.Error(w, "Failed to scan campaign", http.StatusInternalServerError)
				log.Println("Failed to scan campaign:", err)
				return
			}

			campaigns = append(campaigns, campaign)
		}

		if err := rows.Err(); err != nil {
			http.Error(w, "Error iterating over campaign rows", http.StatusInternalServerError)
			log.Println("Error iterating over campaign rows:", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(campaigns); err != nil {
			http.Error(w, "Failed to encode campaigns to JSON", http.StatusInternalServerError)
			log.Println("Failed to encode campaigns to JSON:", err)
		}
	}
}

// GetCampaignByID retorna uma campanha específica pelo ID
func GetCampaignByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		var campaign models.Campaign

		err := db.QueryRow(context.Background(), `
			SELECT campaignid, campaignname, startdate, enddate, teamname, ST_AsText(location), equipmentused, 
			objectives, contactperson, status, notes, description, campaign_image
			FROM campaigns WHERE campaignid=$1
		`, id).Scan(
			&campaign.ID, &campaign.Name, &campaign.StartDate, &campaign.EndDate,
			&campaign.TeamName, &campaign.Location, &campaign.EquipmentUsed, &campaign.Objectives,
			&campaign.ContactPerson, &campaign.Status, &campaign.Notes, &campaign.Description, &campaign.CampaignImage,
		)
		if err != nil {
			http.Error(w, "Failed to query campaign", http.StatusInternalServerError)
			log.Println("Failed to query campaign:", err)
			return
		}

		equipmentRows, err := db.Query(context.Background(), `
			SELECT equipmentid 
			FROM CampaignEquipment 
			WHERE campaignid=$1`, campaign.ID)
		if err != nil {
			http.Error(w, "Failed to get associated equipments", http.StatusInternalServerError)
			log.Println("Failed to get associated equipments:", err)
			return
		}
		defer equipmentRows.Close()

		var equipmentIDs []string
		for equipmentRows.Next() {
			var equipmentID string
			if err := equipmentRows.Scan(&equipmentID); err != nil {
				http.Error(w, "Failed to scan equipment ID", http.StatusInternalServerError)
				log.Println("Failed to scan equipment ID:", err)
				return
			}
			equipmentIDs = append(equipmentIDs, equipmentID)
		}

		campaign.EquipmentIDs = equipmentIDs

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(campaign); err != nil {
			http.Error(w, "Failed to encode campaign to JSON", http.StatusInternalServerError)
			log.Println("Failed to encode campaign to JSON:", err)
		}
	}
}

// UpdateCampaign atualiza uma campanha existente
func UpdateCampaign(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		var campaign models.Campaign

		if err := json.NewDecoder(r.Body).Decode(&campaign); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			log.Println("Error decoding JSON:", err)
			return
		}

		tx, err := db.Begin(context.Background())
		if err != nil {
			http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
			log.Println("Failed to begin transaction:", err)
			return
		}
		defer tx.Rollback(context.Background())

		_, err = tx.Exec(
			context.Background(),
			`UPDATE campaigns SET campaignname=$1, startdate=$2, enddate=$3, teamname=$4, location=ST_GeogFromText($5), equipmentused=$6, objectives=$7, contactperson=$8, status=$9, notes=$10, description=$11, campaign_image=$12 WHERE campaignid=$13`,
			campaign.Name,
			campaign.StartDate,
			campaign.EndDate,
			campaign.TeamName,
			campaign.Location,
			campaign.EquipmentUsed,
			campaign.Objectives,
			campaign.ContactPerson,
			campaign.Status,
			campaign.Notes,
			campaign.Description,
			campaign.CampaignImage,
			id,
		)
		if err != nil {
			http.Error(w, "Failed to update campaign", http.StatusInternalServerError)
			log.Println("Failed to update campaign:", err)
			return
		}

		_, err = tx.Exec(context.Background(), `DELETE FROM CampaignEquipment WHERE campaignid=$1`, id)
		if err != nil {
			http.Error(w, "Failed to clear old associations", http.StatusInternalServerError)
			log.Println("Failed to clear old associations:", err)
			return
		}

		for _, equipmentID := range campaign.EquipmentIDs {
			_, err = tx.Exec(
				context.Background(),
				`INSERT INTO CampaignEquipment (campaignid, equipmentid) VALUES ($1, $2)`,
				id, equipmentID,
			)
			if err != nil {
				http.Error(w, "Failed to associate equipment", http.StatusInternalServerError)
				log.Println("Failed to associate equipment:", err)
				return
			}
		}

		if err = tx.Commit(context.Background()); err != nil {
			http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
			log.Println("Failed to commit transaction:", err)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Campaign successfully updated", "campaign_id": id})
	}
}

// DeleteCampaign deleta uma campanha
func DeleteCampaign(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		tx, err := db.Begin(context.Background())
		if err != nil {
			http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
			log.Println("Failed to begin transaction:", err)
			return
		}
		defer tx.Rollback(context.Background())

		_, err = tx.Exec(context.Background(), "DELETE FROM CampaignEquipment WHERE campaignid=$1", id)
		if err != nil {
			http.Error(w, "Failed to delete campaign equipment association", http.StatusInternalServerError)
			log.Println("Failed to delete campaign equipment association:", err)
			return
		}

		_, err = tx.Exec(context.Background(), "DELETE FROM campaigns WHERE campaignid=$1", id)
		if err != nil {
			http.Error(w, "Failed to delete campaign", http.StatusInternalServerError)
			log.Println("Failed to delete campaign:", err)
			return
		}

		if err = tx.Commit(context.Background()); err != nil {
			http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
			log.Println("Failed to commit transaction:", err)
			return
		}

		w.WriteHeader(http.StatusOK)
		log.Println("Campaign successfully deleted:", id)
	}
}
