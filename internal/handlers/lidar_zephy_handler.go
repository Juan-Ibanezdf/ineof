package handlers

import (
	"api/internal/models"
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// LidarZephyDataRouter configura as rotas para lidar com dados de Lidar Zephy
func LidarZephyDataRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Get("/", GetAllLidarZephyData(db))
	r.Post("/", CreateLidarZephyData(db))
	r.Get("/{id}", GetLidarZephyDataByID(db))
	r.Put("/{id}", UpdateLidarZephyData(db))
	r.Delete("/{id}", DeleteLidarZephyData(db))
	return r
}

// GetAllLidarZephyData retorna todos os dados de Lidar Zephy
func GetAllLidarZephyData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query(context.Background(), "SELECT id, equipmentid, timestamp, windspeed, winddirection, temperature FROM lidarzephydata")
		if err != nil {
			http.Error(w, "Failed to query lidar zephy data", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []models.LidarZephyData
		for rows.Next() {
			var datum models.LidarZephyData
			err := rows.Scan(&datum.ID, &datum.EquipmentID, &datum.Timestamp, &datum.WindSpeed, &datum.WindDirection, &datum.Temperature)
			if err != nil {
				http.Error(w, "Failed to scan lidar zephy data", http.StatusInternalServerError)
				return
			}
			data = append(data, datum)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// GetLidarZephyDataByID retorna os dados de Lidar Zephy por ID
func GetLidarZephyDataByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var datum models.LidarZephyData
		err = db.QueryRow(context.Background(), "SELECT id, equipmentid, timestamp, windspeed, winddirection, temperature FROM lidarzephydata WHERE id=$1", id).Scan(
			&datum.ID, &datum.EquipmentID, &datum.Timestamp, &datum.WindSpeed, &datum.WindDirection, &datum.Temperature,
		)
		if err != nil {
			http.Error(w, "Lidar zephy data not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(datum)
	}
}

// CreateLidarZephyData cria novos dados de Lidar Zephy
func CreateLidarZephyData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var datum models.LidarZephyData
		if err := json.NewDecoder(r.Body).Decode(&datum); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err := db.Exec(
			context.Background(),
			"INSERT INTO lidarzephydata (equipmentid, timestamp, windspeed, winddirection, temperature) VALUES ($1, $2, $3, $4, $5)",
			datum.EquipmentID, datum.Timestamp, datum.WindSpeed, datum.WindDirection, datum.Temperature,
		)
		if err != nil {
			http.Error(w, "Failed to insert lidar zephy data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// UpdateLidarZephyData atualiza os dados de Lidar Zephy existentes
func UpdateLidarZephyData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var datum models.LidarZephyData
		if err := json.NewDecoder(r.Body).Decode(&datum); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(
			context.Background(),
			"UPDATE lidarzephydata SET equipmentid=$1, timestamp=$2, windspeed=$3, winddirection=$4, temperature=$5 WHERE id=$6",
			datum.EquipmentID, datum.Timestamp, datum.WindSpeed, datum.WindDirection, datum.Temperature, id,
		)
		if err != nil {
			http.Error(w, "Failed to update lidar zephy data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// DeleteLidarZephyData deleta os dados de Lidar Zephy pelo ID
func DeleteLidarZephyData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(context.Background(), "DELETE FROM lidarzephydata WHERE id=$1", id)
		if err != nil {
			http.Error(w, "Failed to delete lidar zephy data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
