package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"api/internal/models"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// MaintenanceHistoryRouter configura as rotas para o handler de histórico de manutenção
func MaintenanceHistoryRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Get("/", GetAllMaintenanceHistory(db))
	r.Post("/", CreateMaintenanceHistory(db))
	r.Get("/{id}", GetMaintenanceHistoryByID(db))
	r.Put("/{id}", UpdateMaintenanceHistory(db))
	r.Delete("/{id}", DeleteMaintenanceHistory(db))
	return r
}

// GetAllMaintenanceHistory retorna todo o histórico de manutenção
func GetAllMaintenanceHistory(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query(context.Background(), `
			SELECT maintenanceid, equipmentid, maintenancedate, performedby, description, notes
			FROM MaintenanceHistory
		`)
		if err != nil {
			http.Error(w, "Failed to query maintenance history", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var history []models.MaintenanceHistory
		for rows.Next() {
			var record models.MaintenanceHistory
			err := rows.Scan(&record.MaintenanceID, &record.EquipmentID, &record.MaintenanceDate, &record.PerformedBy, &record.Description, &record.Notes)
			if err != nil {
				http.Error(w, "Failed to scan maintenance record", http.StatusInternalServerError)
				return
			}
			history = append(history, record)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(history)
	}
}

// GetMaintenanceHistoryByID retorna o histórico de manutenção por ID
func GetMaintenanceHistoryByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid maintenance ID", http.StatusBadRequest)
			return
		}

		var record models.MaintenanceHistory
		err = db.QueryRow(context.Background(), `
			SELECT maintenanceid, equipmentid, maintenancedate, performedby, description, notes
			FROM MaintenanceHistory WHERE maintenanceid=$1
		`, id).Scan(&record.MaintenanceID, &record.EquipmentID, &record.MaintenanceDate, &record.PerformedBy, &record.Description, &record.Notes)
		if err != nil {
			http.Error(w, "Maintenance record not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(record)
	}
}

// CreateMaintenanceHistory cria um novo registro de histórico de manutenção
func CreateMaintenanceHistory(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var record models.MaintenanceHistory
		if err := json.NewDecoder(r.Body).Decode(&record); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err := db.Exec(
			context.Background(),
			`INSERT INTO MaintenanceHistory (equipmentid, maintenancedate, performedby, description, notes)
			 VALUES ($1, $2, $3, $4, $5)`,
			record.EquipmentID, record.MaintenanceDate, record.PerformedBy, record.Description, record.Notes,
		)
		if err != nil {
			http.Error(w, "Failed to create maintenance record", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// UpdateMaintenanceHistory atualiza um registro de histórico de manutenção existente
func UpdateMaintenanceHistory(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid maintenance ID", http.StatusBadRequest)
			return
		}

		var record models.MaintenanceHistory
		if err := json.NewDecoder(r.Body).Decode(&record); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(
			context.Background(),
			`UPDATE MaintenanceHistory SET equipmentid=$1, maintenancedate=$2, performedby=$3, description=$4, notes=$5 WHERE maintenanceid=$6`,
			record.EquipmentID, record.MaintenanceDate, record.PerformedBy, record.Description, record.Notes, id,
		)
		if err != nil {
			http.Error(w, "Failed to update maintenance record", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// DeleteMaintenanceHistory deleta um registro de histórico de manutenção
func DeleteMaintenanceHistory(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid maintenance ID", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(context.Background(), "DELETE FROM MaintenanceHistory WHERE maintenanceid=$1", id)
		if err != nil {
			http.Error(w, "Failed to delete maintenance record", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
