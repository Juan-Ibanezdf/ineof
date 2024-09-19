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

// LidarWindcobeDataRouter configura as rotas para lidar com dados de Lidar Windcobe
func LidarWindcobeDataRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Get("/", GetAllLidarWindcobeData(db))
	r.Post("/", CreateLidarWindcobeData(db))
	r.Get("/{id}", GetLidarWindcobeDataByID(db))
	r.Put("/{id}", UpdateLidarWindcobeData(db))
	r.Delete("/{id}", DeleteLidarWindcobeData(db))
	return r
}

// GetAllLidarWindcobeData retorna todos os dados de Lidar Windcobe
func GetAllLidarWindcobeData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query(context.Background(), "SELECT id, equipmentid, timestamp, windspeed, winddirection, pressure FROM lidarwindcobedata")
		if err != nil {
			http.Error(w, "Failed to query lidar windcobe data", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []models.LidarWindcobeData
		for rows.Next() {
			var datum models.LidarWindcobeData
			err := rows.Scan(&datum.ID, &datum.EquipmentID, &datum.Timestamp, &datum.WindSpeed, &datum.WindDirection, &datum.Pressure)
			if err != nil {
				http.Error(w, "Failed to scan lidar windcobe data", http.StatusInternalServerError)
				return
			}
			data = append(data, datum)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// GetLidarWindcobeDataByID retorna os dados de Lidar Windcobe por ID
func GetLidarWindcobeDataByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var datum models.LidarWindcobeData
		err = db.QueryRow(context.Background(), "SELECT id, equipmentid, timestamp, windspeed, winddirection, pressure FROM lidarwindcobedata WHERE id=$1", id).Scan(
			&datum.ID, &datum.EquipmentID, &datum.Timestamp, &datum.WindSpeed, &datum.WindDirection, &datum.Pressure,
		)
		if err != nil {
			http.Error(w, "Lidar windcobe data not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(datum)
	}
}

// CreateLidarWindcobeData cria novos dados de Lidar Windcobe
func CreateLidarWindcobeData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var datum models.LidarWindcobeData
		if err := json.NewDecoder(r.Body).Decode(&datum); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err := db.Exec(
			context.Background(),
			"INSERT INTO lidarwindcobedata (equipmentid, timestamp, windspeed, winddirection, pressure) VALUES ($1, $2, $3, $4, $5)",
			datum.EquipmentID, datum.Timestamp, datum.WindSpeed, datum.WindDirection, datum.Pressure,
		)
		if err != nil {
			http.Error(w, "Failed to insert lidar windcobe data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// UpdateLidarWindcobeData atualiza os dados de Lidar Windcobe existentes
func UpdateLidarWindcobeData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var datum models.LidarWindcobeData
		if err := json.NewDecoder(r.Body).Decode(&datum); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(
			context.Background(),
			"UPDATE lidarwindcobedata SET equipmentid=$1, timestamp=$2, windspeed=$3, winddirection=$4, pressure=$5 WHERE id=$6",
			datum.EquipmentID, datum.Timestamp, datum.WindSpeed, datum.WindDirection, datum.Pressure, id,
		)
		if err != nil {
			http.Error(w, "Failed to update lidar windcobe data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// DeleteLidarWindcobeData deleta os dados de Lidar Windcobe pelo ID
func DeleteLidarWindcobeData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(context.Background(), "DELETE FROM lidarwindcobedata WHERE id=$1", id)
		if err != nil {
			http.Error(w, "Failed to delete lidar windcobe data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
