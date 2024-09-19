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

// EquipmentDocumentsRouter configura as rotas para os handlers de documentos de equipamentos
func EquipmentDocumentsRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Get("/", GetAllEquipmentDocuments(db))
	r.Post("/", CreateEquipmentDocument(db))
	r.Get("/{id}", GetEquipmentDocumentByID(db))
	r.Put("/{id}", UpdateEquipmentDocument(db))
	r.Delete("/{id}", DeleteEquipmentDocument(db))
	return r
}

// GetAllEquipmentDocuments retorna todos os documentos de equipamentos
func GetAllEquipmentDocuments(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query(context.Background(), `
			SELECT documentid, equipmentid, documentname, documenttype, path, uploadedby, uploaddate, notes
			FROM EquipmentDocuments
		`)
		if err != nil {
			http.Error(w, "Failed to query equipment documents", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var documents []models.EquipmentDocuments
		for rows.Next() {
			var document models.EquipmentDocuments
			err := rows.Scan(&document.DocumentID, &document.EquipmentID, &document.DocumentName, &document.DocumentType, &document.Path, &document.UploadedBy, &document.UploadDate, &document.Notes)
			if err != nil {
				http.Error(w, "Failed to scan equipment document", http.StatusInternalServerError)
				return
			}
			documents = append(documents, document)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(documents)
	}
}

// GetEquipmentDocumentByID retorna um documento de equipamento pelo ID
func GetEquipmentDocumentByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid document ID", http.StatusBadRequest)
			return
		}

		var document models.EquipmentDocuments
		err = db.QueryRow(context.Background(), `
			SELECT documentid, equipmentid, documentname, documenttype, path, uploadedby, uploaddate, notes
			FROM EquipmentDocuments WHERE documentid=$1
		`, id).Scan(&document.DocumentID, &document.EquipmentID, &document.DocumentName, &document.DocumentType, &document.Path, &document.UploadedBy, &document.UploadDate, &document.Notes)
		if err != nil {
			http.Error(w, "Document not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(document)
	}
}

// CreateEquipmentDocument cria um novo documento de equipamento
func CreateEquipmentDocument(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var document models.EquipmentDocuments
		if err := json.NewDecoder(r.Body).Decode(&document); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err := db.Exec(
			context.Background(),
			`INSERT INTO EquipmentDocuments (equipmentid, documentname, documenttype, path, uploadedby, uploaddate, notes)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			document.EquipmentID, document.DocumentName, document.DocumentType, document.Path, document.UploadedBy, document.UploadDate, document.Notes,
		)
		if err != nil {
			http.Error(w, "Failed to create equipment document", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// UpdateEquipmentDocument atualiza um documento de equipamento existente
func UpdateEquipmentDocument(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid document ID", http.StatusBadRequest)
			return
		}

		var document models.EquipmentDocuments
		if err := json.NewDecoder(r.Body).Decode(&document); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(
			context.Background(),
			`UPDATE EquipmentDocuments SET equipmentid=$1, documentname=$2, documenttype=$3, path=$4, uploadedby=$5, uploaddate=$6, notes=$7
			WHERE documentid=$8`,
			document.EquipmentID, document.DocumentName, document.DocumentType, document.Path, document.UploadedBy, document.UploadDate, document.Notes, id,
		)
		if err != nil {
			http.Error(w, "Failed to update equipment document", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// DeleteEquipmentDocument deleta um documento de equipamento existente
func DeleteEquipmentDocument(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "Invalid document ID", http.StatusBadRequest)
			return
		}

		_, err = db.Exec(context.Background(), "DELETE FROM EquipmentDocuments WHERE documentid=$1", id)
		if err != nil {
			http.Error(w, "Failed to delete equipment document", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
