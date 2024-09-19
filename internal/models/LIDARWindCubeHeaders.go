package models

import (
	"time"
)

// LIDARWindCubeHeaders representa os cabeçalhos dos dados do LIDAR WindCube
type LIDARWindCubeHeader struct {
	WindCubeHeaderID       string    `json:"windcube_header_id"`         // UUID do cabeçalho
	EquipmentID            string    `json:"equipment_id"`               // UUID do equipamento
	CampaignID             string    `json:"campaign_id"`                // UUID da campanha associada
	FileName               string    `json:"file_name"`                  // Nome do arquivo
	HeaderSize             int       `json:"header_size"`                // Tamanho do cabeçalho
	Version                string    `json:"version"`                    // Versão do arquivo
	IDSystem               string    `json:"id_system"`                  // ID do sistema
	IDClient               string    `json:"id_client"`                  // ID do cliente
	Location               string    `json:"location"`                   // Localização
	GPSLocation            string    `json:"gps_location"`               // Localização GPS
	Comments               string    `json:"comments"`                   // Comentários
	FCROption              string    `json:"fcr_option"`                 // Opção FCR
	Timezone               string    `json:"timezone"`                   // Fuso horário
	LaserDiodeCurrent      float64   `json:"laser_diode_current"`        // Corrente do diodo laser
	LOS                    float64   `json:"los"`                        // Linha de visão
	InstallationOffsetAGL  float64   `json:"installation_offset_agl"`    // Offset de instalação
	CNRThreshold           float64   `json:"cnr_threshold"`              // Threshold do CNR
	VrThreshold            string    `json:"vr_threshold"`               // Threshold do Vr
	SigmaFreqThreshold     string    `json:"sigma_freq_threshold"`       // Threshold de frequência sigma
	WiperCNRThreshold      float64   `json:"wiper_cnr_threshold"`        // Threshold do CNR do limpador
	WiperAltitude          float64   `json:"wiper_altitude"`             // Altitude do limpador
	WiperDuration          int       `json:"wiper_duration"`             // Duração do limpador
	AltitudesAGL           string    `json:"altitudes_agl"`              // Altitudes em AGL
	SamplingFrequency      string    `json:"sampling_frequency"`         // Frequência de amostragem
	RefFrequency           string    `json:"ref_frequency"`              // Frequência de referência
	PulsesPerLOS           string    `json:"pulses_per_los"`             // Pulsos por linha de visão
	SamplesPerPulse        string    `json:"samples_per_pulse"`          // Amostras por pulso
	ReflectedPulseStart    string    `json:"reflected_pulse_start"`      // Início do pulso refletido
	ReflectedPulseEnd      string    `json:"reflected_pulse_end"`        // Fim do pulso refletido
	RefPulseSamplesNb      string    `json:"ref_pulse_samples_nb"`       // Número de amostras do pulso refletido
	NbHighPassFilterPoints string    `json:"nb_high_pass_filter_points"` // Número de pontos do filtro passa-alta
	FFTWindowWidth         string    `json:"fft_window_width"`           // Largura da janela FFT
	PulseRepetitionRate    string    `json:"pulse_repetition_rate"`      // Taxa de repetição de pulso
	PulseDuration          string    `json:"pulse_duration"`             // Duração do pulso
	TriggerDelayTime       string    `json:"trigger_delay_time"`         // Tempo de atraso de trigger
	Wavelength             string    `json:"wavelength"`                 // Comprimento de onda
	ScanAngle              string    `json:"scan_angle"`                 // Ângulo de varredura
	DirectionOffset        float64   `json:"direction_offset"`           // Offset de direção
	Declination            string    `json:"declination"`                // Declinação
	PitchAngle             float64   `json:"pitch_angle"`                // Ângulo de pitch
	RollAngle              float64   `json:"roll_angle"`                 // Ângulo de roll
	UploadDate             time.Time `json:"upload_date"`                // Data de upload
}
