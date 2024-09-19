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

// LocationHistoryRouter configura as rotas para o handler de histórico de localização
func LocationHistoryRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Get("/", GetAllLocationHistory(db))
	r.Post("/", CreateLocationHistory(db))
	r.Get("/{id}", GetLocationHistoryByID(db))
	r.Put("/{id}", UpdateLocationHistory(db))
	r.Delete("/{id}", DeleteLocationHistory(db))
	return r
}

// GetAllLocationHistory retorna todo o histórico de localização
func GetAllLocationHistory(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query(context.Background(), `
			SELECT locationhistoryid, equipmentid, ST_AsText(location), startdate, enddate, notes
			FROM LocationHistory
		`)
		if err != nil {
			http.Error(w, "Failed to query location history", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var history []models.LocationHistory
		for rows.Next() {
			var record models.LocationHistory
			err := rows.Scan(&record.LocationHistoryID, &record.EquipmentID, &record.Location, &record.StartDate, &record.EndDate, &record.Notes)
			if err != nil {
				http.Error(w, "Failed to scan location history", http.StatusInternalServerError)
				return
			}
			history = append(history, record)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(history)
	}
}

// GetLocationHistoryByID retorna o histórico de localização por ID
func GetLocationHistoryByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid location history ID", http.StatusBadRequest)
			return
		}

		var record models.LocationHistory
		err = db.QueryRow(context.Background(), `
			SELECT locationhistoryid, equipmentid, ST_AsText(location), startdate, enddate, notes
			FROM LocationHistory WHERE locationhistoryid=$1
		`, id).Scan(&record.LocationHistoryID, &record.EquipmentID, &record.Location, &record.StartDate, &record.EndDate, &record.Notes)
		if err != nil {
			http.Error(w, "Location history record not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(record)
	}
}

// CreateLocationHistory cria um novo histórico de localização
func CreateLocationHistory(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var record models.LocationHistory
		if err := json.NewDecoder(r.Body).Decode(&record); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err := db.Exec(
			context.Background(),
			`INSERT INTO LocationHistory (equipmentid, location, startdate, enddate, notes)
			 VALUES ($1, ST_GeogFromText($2), $3, $4, $5)`,
			record.EquipmentID, record.Location, record.StartDate, record.EndDate, record.Notes,
		)
		if err != nil {
			http.Error(w, "Failed to create location history record", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// UpdateLocationHistory atualiza um registro de histórico de localização existente
func UpdateLocationHistory(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid location history ID", http.StatusBadRequest)
			return
		}

		var record models.LocationHistory
		if err := json.NewDecoder(r.Body).Decode(&record); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(
			context.Background(),
			`UPDATE LocationHistory SET equipmentid=$1, location=ST_GeogFromText($2), startdate=$3, enddate=$4, notes=$5
			WHERE locationhistoryid=$6`,
			record.EquipmentID, record.Location, record.StartDate, record.EndDate, record.Notes, id,
		)
		if err != nil {
			http.Error(w, "Failed to update location history record", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// DeleteLocationHistory deleta um registro de histórico de localização
func DeleteLocationHistory(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid location history ID", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(context.Background(), "DELETE FROM LocationHistory WHERE locationhistoryid=$1", id)
		if err != nil {
			http.Error(w, "Failed to delete location history record", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
