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

// SodarDataRouter configura as rotas para os handlers de SodarData
func SodarDataRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Get("/", GetAllSodarData(db))
	r.Post("/", CreateSodarData(db))
	r.Get("/{id}", GetSodarDataByID(db))
	r.Put("/{id}", UpdateSodarData(db))
	r.Delete("/{id}", DeleteSodarData(db))
	return r
}

// GetAllSodarData retorna todos os registros de dados de Sodar
func GetAllSodarData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query(context.Background(), "SELECT id, equipmentid, timestamp, windspeed, winddirection, temperature, humidity FROM sodardata")
		if err != nil {
			http.Error(w, "Failed to query sodar data", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []models.SodarData
		for rows.Next() {
			var datum models.SodarData
			err := rows.Scan(&datum.ID, &datum.EquipmentID, &datum.Timestamp, &datum.WindSpeed, &datum.WindDirection, &datum.Temperature, &datum.Humidity)
			if err != nil {
				http.Error(w, "Failed to scan sodar data", http.StatusInternalServerError)
				return
			}
			data = append(data, datum)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// GetSodarDataByID retorna um registro de dados de Sodar por ID
func GetSodarDataByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var datum models.SodarData
		err = db.QueryRow(context.Background(), "SELECT id, equipmentid, timestamp, windspeed, winddirection, temperature, humidity FROM sodardata WHERE id=$1", id).Scan(
			&datum.ID, &datum.EquipmentID, &datum.Timestamp, &datum.WindSpeed, &datum.WindDirection, &datum.Temperature, &datum.Humidity,
		)
		if err != nil {
			http.Error(w, "Sodar data not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(datum)
	}
}

// CreateSodarData cria um novo registro de dados de Sodar
func CreateSodarData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var datum models.SodarData
		if err := json.NewDecoder(r.Body).Decode(&datum); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err := db.Exec(
			context.Background(),
			"INSERT INTO sodardata (equipmentid, timestamp, windspeed, winddirection, temperature, humidity) VALUES ($1, $2, $3, $4, $5, $6)",
			datum.EquipmentID, datum.Timestamp, datum.WindSpeed, datum.WindDirection, datum.Temperature, datum.Humidity,
		)
		if err != nil {
			http.Error(w, "Failed to insert sodar data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// UpdateSodarData atualiza um registro de dados de Sodar existente
func UpdateSodarData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var datum models.SodarData
		if err := json.NewDecoder(r.Body).Decode(&datum); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(
			context.Background(),
			"UPDATE sodardata SET equipmentid=$1, timestamp=$2, windspeed=$3, winddirection=$4, temperature=$5, humidity=$6 WHERE id=$7",
			datum.EquipmentID, datum.Timestamp, datum.WindSpeed, datum.WindDirection, datum.Temperature, datum.Humidity, id,
		)
		if err != nil {
			http.Error(w, "Failed to update sodar data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// DeleteSodarData deleta um registro de dados de Sodar
func DeleteSodarData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(context.Background(), "DELETE FROM sodardata WHERE id=$1", id)
		if err != nil {
			http.Error(w, "Failed to delete sodar data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
