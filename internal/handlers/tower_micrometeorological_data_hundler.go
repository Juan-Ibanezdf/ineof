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

// TowerMicrometeorologicalDataRouter configura as rotas para os handlers de TowerMicrometeorologicalData
func TowerMicrometeorologicalDataRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Get("/", GetAllTowerMicrometeorologicalData(db))
	r.Post("/", CreateTowerMicrometeorologicalData(db))
	r.Get("/{id}", GetTowerMicrometeorologicalDataByID(db))
	r.Put("/{id}", UpdateTowerMicrometeorologicalData(db))
	r.Delete("/{id}", DeleteTowerMicrometeorologicalData(db))
	return r
}

// GetAllTowerMicrometeorologicalData retorna todos os registros de dados micrometeorológicos da torre
func GetAllTowerMicrometeorologicalData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query(context.Background(), "SELECT id, equipmentid, timestamp, windspeed, winddirection, temperature, humidity, solarradiation, barometricpressure FROM towermicrometeorologicaldata")
		if err != nil {
			http.Error(w, "Failed to query tower micrometeorological data", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []models.TowerMicrometeorologicalData
		for rows.Next() {
			var datum models.TowerMicrometeorologicalData
			err := rows.Scan(&datum.ID, &datum.EquipmentID, &datum.Timestamp, &datum.WindSpeed, &datum.WindDirection, &datum.Temperature, &datum.Humidity, &datum.SolarRadiation, &datum.BarometricPressure)
			if err != nil {
				http.Error(w, "Failed to scan tower micrometeorological data", http.StatusInternalServerError)
				return
			}
			data = append(data, datum)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// GetTowerMicrometeorologicalDataByID retorna um registro de dados micrometeorológicos da torre por ID
func GetTowerMicrometeorologicalDataByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var datum models.TowerMicrometeorologicalData
		err = db.QueryRow(context.Background(), "SELECT id, equipmentid, timestamp, windspeed, winddirection, temperature, humidity, solarradiation, barometricpressure FROM towermicrometeorologicaldata WHERE id=$1", id).Scan(
			&datum.ID, &datum.EquipmentID, &datum.Timestamp, &datum.WindSpeed, &datum.WindDirection, &datum.Temperature, &datum.Humidity, &datum.SolarRadiation, &datum.BarometricPressure,
		)
		if err != nil {
			http.Error(w, "Tower micrometeorological data not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(datum)
	}
}

// CreateTowerMicrometeorologicalData cria um novo registro de dados micrometeorológicos da torre
func CreateTowerMicrometeorologicalData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var datum models.TowerMicrometeorologicalData
		if err := json.NewDecoder(r.Body).Decode(&datum); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err := db.Exec(
			context.Background(),
			"INSERT INTO towermicrometeorologicaldata (equipmentid, timestamp, windspeed, winddirection, temperature, humidity, solarradiation, barometricpressure) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
			datum.EquipmentID, datum.Timestamp, datum.WindSpeed, datum.WindDirection, datum.Temperature, datum.Humidity, datum.SolarRadiation, datum.BarometricPressure,
		)
		if err != nil {
			http.Error(w, "Failed to insert tower micrometeorological data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// UpdateTowerMicrometeorologicalData atualiza um registro de dados micrometeorológicos da torre existente
func UpdateTowerMicrometeorologicalData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var datum models.TowerMicrometeorologicalData
		if err := json.NewDecoder(r.Body).Decode(&datum); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(
			context.Background(),
			"UPDATE towermicrometeorologicaldata SET equipmentid=$1, timestamp=$2, windspeed=$3, winddirection=$4, temperature=$5, humidity=$6, solarradiation=$7, barometricpressure=$8 WHERE id=$9",
			datum.EquipmentID, datum.Timestamp, datum.WindSpeed, datum.WindDirection, datum.Temperature, datum.Humidity, datum.SolarRadiation, datum.BarometricPressure, id,
		)
		if err != nil {
			http.Error(w, "Failed to update tower micrometeorological data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// DeleteTowerMicrometeorologicalData deleta um registro de dados micrometeorológicos da torre
func DeleteTowerMicrometeorologicalData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(context.Background(), "DELETE FROM towermicrometeorologicaldata WHERE id=$1", id)
		if err != nil {
			http.Error(w, "Failed to delete tower micrometeorological data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
