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

func ADCPDataRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Get("/", GetAllADCPData(db))
	r.Post("/", CreateADCPData(db))
	r.Get("/{id}", GetADCPDataByID(db))
	r.Put("/{id}", UpdateADCPData(db))
	r.Delete("/{id}", DeleteADCPData(db))
	return r
}

func GetAllADCPData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query(context.Background(), "SELECT id, equipmentid, timestamp, watercurrentspeed, watercurrentdirection, watertemperature, salinity, depth FROM adcpdata")
		if err != nil {
			http.Error(w, "Failed to query ADCP data", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []models.ADCPData
		for rows.Next() {
			var datum models.ADCPData
			err := rows.Scan(
				&datum.ID,
				&datum.EquipmentID,
				&datum.Timestamp,
				&datum.WaterCurrentSpeed,
				&datum.WaterCurrentDirection,
				&datum.WaterTemperature,
				&datum.Salinity,
				&datum.Depth,
			)
			if err != nil {
				http.Error(w, "Failed to scan ADCP data", http.StatusInternalServerError)
				return
			}
			data = append(data, datum)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

func GetADCPDataByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var datum models.ADCPData
		err = db.QueryRow(context.Background(), "SELECT id, equipmentid, timestamp, watercurrentspeed, watercurrentdirection, watertemperature, salinity, depth FROM adcpdata WHERE id=$1", id).Scan(
			&datum.ID,
			&datum.EquipmentID,
			&datum.Timestamp,
			&datum.WaterCurrentSpeed,
			&datum.WaterCurrentDirection,
			&datum.WaterTemperature,
			&datum.Salinity,
			&datum.Depth,
		)
		if err != nil {
			http.Error(w, "ADCP data not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(datum)
	}
}

func CreateADCPData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var datum models.ADCPData
		if err := json.NewDecoder(r.Body).Decode(&datum); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err := db.Exec(
			context.Background(),
			"INSERT INTO adcpdata (equipmentid, timestamp, watercurrentspeed, watercurrentdirection, watertemperature, salinity, depth) VALUES ($1, $2, $3, $4, $5, $6, $7)",
			datum.EquipmentID, datum.Timestamp, datum.WaterCurrentSpeed, datum.WaterCurrentDirection, datum.WaterTemperature, datum.Salinity, datum.Depth,
		)
		if err != nil {
			http.Error(w, "Failed to insert ADCP data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

func UpdateADCPData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var datum models.ADCPData
		if err := json.NewDecoder(r.Body).Decode(&datum); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(
			context.Background(),
			"UPDATE adcpdata SET equipmentid=$1, timestamp=$2, watercurrentspeed=$3, watercurrentdirection=$4, watertemperature=$5, salinity=$6, depth=$7 WHERE id=$8",
			datum.EquipmentID, datum.Timestamp, datum.WaterCurrentSpeed, datum.WaterCurrentDirection, datum.WaterTemperature, datum.Salinity, datum.Depth, id,
		)
		if err != nil {
			http.Error(w, "Failed to update ADCP data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

func DeleteADCPData(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(context.Background(), "DELETE FROM adcpdata WHERE id=$1", id)
		if err != nil {
			http.Error(w, "Failed to delete ADCP data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
