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

// EstacaoSolarimetricaDadosRouter configura as rotas para lidar com dados da Estação Solarimétrica
func EstacaoSolarimetricaDadosRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Get("/", GetAllEstacaoSolarimetricaDados(db))
	r.Post("/", CreateEstacaoSolarimetricaDados(db))
	r.Get("/{id}", GetEstacaoSolarimetricaDadosByID(db))
	r.Put("/{id}", UpdateEstacaoSolarimetricaDados(db))
	r.Delete("/{id}", DeleteEstacaoSolarimetricaDados(db))
	return r
}

// GetAllEstacaoSolarimetricaDados retorna todos os dados da Estação Solarimétrica
func GetAllEstacaoSolarimetricaDados(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query(context.Background(), `
			SELECT id, equipmentid, campaignid, timestamp, battv, ptemp_c, winddir, ws_ms_avg, ws_ms_max, ws_ms_min, airtc_avg, airtc_max, airtc_min, rh_max, rh_min, rh, rain_mm_tot, bp_mbar_avg, bp_mbar_max, bp_mbar_min, slrw_cmp10_horizontal_avg, slrw_cmp10_horizontal_max, slrw_cmp10_horizontal_min, slrkj_cmp10_horizontal_tot 
			FROM EstacaoSolarimetricaDados
		`)
		if err != nil {
			http.Error(w, "Failed to query Estacao Solarimétrica data", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []models.EstacaoSolarimetricaDados
		for rows.Next() {
			var datum models.EstacaoSolarimetricaDados
			err := rows.Scan(&datum.EstacaoSolarimetricaDadosID, &datum.EquipmentID, &datum.CampaignID, &datum.Timestamp, &datum.BattV, &datum.PTemp_C, &datum.WindDir, &datum.WS_ms_Avg, &datum.WS_ms_Max, &datum.WS_ms_Min, &datum.AirTC_Avg, &datum.AirTC_Max, &datum.AirTC_Min, &datum.RH_Max, &datum.RH_Min, &datum.RH, &datum.Rain_mm_Tot, &datum.BP_mbar_Avg, &datum.BP_mbar_Max, &datum.BP_mbar_Min, &datum.SlrW_CMP10_Horizontal_Avg, &datum.SlrW_CMP10_Horizontal_Max, &datum.SlrW_CMP10_Horizontal_Min, &datum.SlrkJ_CMP10_Horizontal_Tot)
			if err != nil {
				http.Error(w, "Failed to scan Estacao Solarimétrica data", http.StatusInternalServerError)
				return
			}
			data = append(data, datum)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// GetEstacaoSolarimetricaDadosByID retorna os dados da Estação Solarimétrica por ID
func GetEstacaoSolarimetricaDadosByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var datum models.EstacaoSolarimetricaDados
		err = db.QueryRow(context.Background(), `
			SELECT id, equipmentid, campaignid, timestamp, battv, ptemp_c, winddir, ws_ms_avg, ws_ms_max, ws_ms_min, airtc_avg, airtc_max, airtc_min, rh_max, rh_min, rh, rain_mm_tot, bp_mbar_avg, bp_mbar_max, bp_mbar_min, slrw_cmp10_horizontal_avg, slrw_cmp10_horizontal_max, slrw_cmp10_horizontal_min, slrkj_cmp10_horizontal_tot 
			FROM EstacaoSolarimetricaDados WHERE id=$1`, id).Scan(
			&datum.EstacaoSolarimetricaDadosID, &datum.EquipmentID, &datum.CampaignID, &datum.Timestamp, &datum.BattV, &datum.PTemp_C, &datum.WindDir, &datum.WS_ms_Avg, &datum.WS_ms_Max, &datum.WS_ms_Min, &datum.AirTC_Avg, &datum.AirTC_Max, &datum.AirTC_Min, &datum.RH_Max, &datum.RH_Min, &datum.RH, &datum.Rain_mm_Tot, &datum.BP_mbar_Avg, &datum.BP_mbar_Max, &datum.BP_mbar_Min, &datum.SlrW_CMP10_Horizontal_Avg, &datum.SlrW_CMP10_Horizontal_Max, &datum.SlrW_CMP10_Horizontal_Min, &datum.SlrkJ_CMP10_Horizontal_Tot,
		)
		if err != nil {
			http.Error(w, "Estacao Solarimétrica data not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(datum)
	}
}

// CreateEstacaoSolarimetricaDados cria novos dados da Estação Solarimétrica
func CreateEstacaoSolarimetricaDados(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var datum models.EstacaoSolarimetricaDados
		if err := json.NewDecoder(r.Body).Decode(&datum); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err := db.Exec(
			context.Background(),
			`INSERT INTO EstacaoSolarimetricaDados (equipmentid, campaignid, timestamp, battv, ptemp_c, winddir, ws_ms_avg, ws_ms_max, ws_ms_min, airtc_avg, airtc_max, airtc_min, rh_max, rh_min, rh, rain_mm_tot, bp_mbar_avg, bp_mbar_max, bp_mbar_min, slrw_cmp10_horizontal_avg, slrw_cmp10_horizontal_max, slrw_cmp10_horizontal_min, slrkj_cmp10_horizontal_tot) 
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
			datum.EquipmentID, datum.CampaignID, datum.Timestamp, datum.BattV, datum.PTemp_C, datum.WindDir, datum.WS_ms_Avg, datum.WS_ms_Max, datum.WS_ms_Min, datum.AirTC_Avg, datum.AirTC_Max, datum.AirTC_Min, datum.RH_Max, datum.RH_Min, datum.RH, datum.Rain_mm_Tot, datum.BP_mbar_Avg, datum.BP_mbar_Max, datum.BP_mbar_Min, datum.SlrW_CMP10_Horizontal_Avg, datum.SlrW_CMP10_Horizontal_Max, datum.SlrW_CMP10_Horizontal_Min, datum.SlrkJ_CMP10_Horizontal_Tot,
		)
		if err != nil {
			http.Error(w, "Failed to insert Estacao Solarimétrica data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// UpdateEstacaoSolarimetricaDados atualiza os dados da Estação Solarimétrica existentes
func UpdateEstacaoSolarimetricaDados(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		var datum models.EstacaoSolarimetricaDados
		if err := json.NewDecoder(r.Body).Decode(&datum); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(
			context.Background(),
			`UPDATE EstacaoSolarimetricaDados SET equipmentid=$1, campaignid=$2, timestamp=$3, battv=$4, ptemp_c=$5, winddir=$6, ws_ms_avg=$7, ws_ms_max=$8, ws_ms_min=$9, airtc_avg=$10, airtc_max=$11, airtc_min=$12, rh_max=$13, rh_min=$14, rh=$15, rain_mm_tot=$16, bp_mbar_avg=$17, bp_mbar_max=$18, bp_mbar_min=$19, slrw_cmp10_horizontal_avg=$20, slrw_cmp10_horizontal_max=$21, slrw_cmp10_horizontal_min=$22, slrkj_cmp10_horizontal_tot=$23 WHERE id=$24`,
			datum.EquipmentID, datum.CampaignID, datum.Timestamp, datum.BattV, datum.PTemp_C, datum.WindDir, datum.WS_ms_Avg, datum.WS_ms_Max, datum.WS_ms_Min, datum.AirTC_Avg, datum.AirTC_Max, datum.AirTC_Min, datum.RH_Max, datum.RH_Min, datum.RH, datum.Rain_mm_Tot, datum.BP_mbar_Avg, datum.BP_mbar_Max, datum.BP_mbar_Min, datum.SlrW_CMP10_Horizontal_Avg, datum.SlrW_CMP10_Horizontal_Max, datum.SlrW_CMP10_Horizontal_Min, datum.SlrkJ_CMP10_Horizontal_Tot, id,
		)
		if err != nil {
			http.Error(w, "Failed to update Estacao Solarimétrica data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// DeleteEstacaoSolarimetricaDados deleta os dados da Estação Solarimétrica pelo ID
func DeleteEstacaoSolarimetricaDados(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(context.Background(), "DELETE FROM EstacaoSolarimetricaDados WHERE id=$1", id)
		if err != nil {
			http.Error(w, "Failed to delete Estacao Solarimétrica data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
