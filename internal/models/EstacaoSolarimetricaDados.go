package models

import (
	"time"
)

type EstacaoSolarimetricaDados struct {
	EstacaoSolarimetricaDadosID int       `json:"estacao_solarimetrica_dados_id"` // ID dos dados
	EquipmentID                 string    `json:"equipment_id"`                   // UUID do equipamento
	CampaignID                  string    `json:"campaign_id"`                    // UUID da campanha associada
	Timestamp                   time.Time `json:"timestamp"`                      // Timestamp da leitura
	BattV                       float64   `json:"batt_v"`                         // Bateria em volts
	PTemp_C                     float64   `json:"ptemp_c"`                        // Temperatura do painel em graus Celsius
	WindDir                     float64   `json:"wind_dir"`                       // Direção do vento em graus
	WS_ms_Avg                   float64   `json:"ws_ms_avg"`                      // Velocidade média do vento em metros/segundo
	WS_ms_Max                   float64   `json:"ws_ms_max"`                      // Velocidade máxima do vento em metros/segundo
	WS_ms_Min                   float64   `json:"ws_ms_min"`                      // Velocidade mínima do vento em metros/segundo
	AirTC_Avg                   float64   `json:"airtc_avg"`                      // Temperatura média do ar em graus Celsius
	AirTC_Max                   float64   `json:"airtc_max"`                      // Temperatura máxima do ar em graus Celsius
	AirTC_Min                   float64   `json:"airtc_min"`                      // Temperatura mínima do ar em graus Celsius
	RH_Max                      float64   `json:"rh_max"`                         // Umidade relativa máxima (%)
	RH_Min                      float64   `json:"rh_min"`                         // Umidade relativa mínima (%)
	RH                          float64   `json:"rh"`                             // Umidade relativa média (%)
	Rain_mm_Tot                 float64   `json:"rain_mm_tot"`                    // Precipitação total em milímetros
	BP_mbar_Avg                 float64   `json:"bp_mbar_avg"`                    // Pressão barométrica média em mbar
	BP_mbar_Max                 float64   `json:"bp_mbar_max"`                    // Pressão barométrica máxima em mbar
	BP_mbar_Min                 float64   `json:"bp_mbar_min"`                    // Pressão barométrica mínima em mbar
	SlrW_CMP10_Horizontal_Avg   float64   `json:"slrw_cmp10_horizontal_avg"`      // Radiação solar horizontal média (W/m²)
	SlrW_CMP10_Horizontal_Max   float64   `json:"slrw_cmp10_horizontal_max"`      // Radiação solar horizontal máxima (W/m²)
	SlrW_CMP10_Horizontal_Min   float64   `json:"slrw_cmp10_horizontal_min"`      // Radiação solar horizontal mínima (W/m²)
	SlrkJ_CMP10_Horizontal_Tot  float64   `json:"slrk_cmp10_horizontal_tot"`      // Radiação solar horizontal total (kJ/m²)
	SlrW_CMP10_Inclinado_Avg    float64   `json:"slrw_cmp10_inclinado_avg"`       // Radiação solar inclinada média (W/m²)
	SlrW_CMP10_Inclinado_Max    float64   `json:"slrw_cmp10_inclinado_max"`       // Radiação solar inclinada máxima (W/m²)
	SlrW_CMP10_Inclinado_Min    float64   `json:"slrw_cmp10_inclinado_min"`       // Radiação solar inclinada mínima (W/m²)
	SlrkJ_CMP10_Inclinado_Tot   float64   `json:"slrk_cmp10_inclinado_tot"`       // Radiação solar inclinada total (kJ/m²)
	SlrW_CHP1_Avg               float64   `json:"slrw_chp1_avg"`                  // Radiação do sensor CHP1 média (W/m²)
	SlrW_CHP1_Max               float64   `json:"slrw_chp1_max"`                  // Radiação do sensor CHP1 máxima (W/m²)
	SlrW_CHP1_Min               float64   `json:"slrw_chp1_min"`                  // Radiação do sensor CHP1 mínima (W/m²)
	SlrkJ_CHP1_Tot              float64   `json:"slrk_chp1_tot"`                  // Radiação total medida pelo sensor CHP1 (kJ/m²)
	SolarAzimuth                float64   `json:"solar_azimuth"`                  // Azimute solar em graus
	SunElevation                float64   `json:"sun_elevation"`                  // Elevação do sol em graus
	HourAngle                   float64   `json:"hour_angle"`                     // Ângulo horário do sol
	Declination                 float64   `json:"declination"`                    // Declinação solar
	AirMass                     float64   `json:"air_mass"`                       // Massa de ar
}
