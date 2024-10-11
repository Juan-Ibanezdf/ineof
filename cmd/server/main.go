package main

import (
	"api/internal/configs"
	"api/internal/handlers"
	"api/internal/middleware"
	"api/internal/store"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func main() {
	// Carrega as variáveis de ambiente
	configs.LoadEnv()

	// Conecta ao banco de dados usando um pool de conexões
	conn, err := store.NewDB(configs.GetDatabaseURL())
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer conn.Close()

	// Configura o roteador
	r := chi.NewRouter()

	// Configura o middleware CORS para permitir requisições de qualquer origem
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Permitir a origem do frontend
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true, // Permitir o envio de cookies com credenciais
		MaxAge:           300,
	}))

	// Rotas públicas (sem autenticação)
	r.Post("/api/auth/login", handlers.LoginUser(conn))
	r.Post("/api/auth/register", handlers.RegisterUser(conn))
	r.Post("/api/auth/refresh", handlers.RefreshToken(conn))
	r.Get("/api/publicacoes", handlers.GetPublicacoesComFiltro(conn))
	r.Get("/api/publicacoes/{identifier}/{slug}", handlers.GetPublicacaoByIdentifierESlug(conn))
	r.Get("/api/noticias", handlers.GetAllNoticiasComFiltro(conn))
	r.Get("/api/noticias/{id}", handlers.GetNoticiaByID(conn))
	r.Get("/usuarios/cargo/{cargo_id}", handlers.GetUsuariosByCargo(conn))
	// Adiciona a rota de validação de token
	r.Get("/api/auth/validate-token", handlers.ValidateToken)

	// Agrupa rotas que necessitam de autenticação
	r.Route("/api", func(r chi.Router) {

		// Rotas protegidas para níveis Básico e superiores
		r.Route("/auth", func(r chi.Router) {
			r.Use(middleware.AuthorizationMiddleware("leitor")) // Verifica se o nível mínimo é 'basico'
			r.Get("/me", handlers.Me)
			r.Get("/profile", handlers.GetPerfilUsuarioByID(conn))
			// Rotas que exigem CSRF Token
			r.With(middleware.ValidateCSRFToken).Post("/logout", handlers.LogoutUser(conn))
			r.With(middleware.ValidateCSRFToken).Put("/profile", handlers.UpdatePerfilUsuario(conn))
			r.With(middleware.ValidateCSRFToken).Post("/auth/refresh-token", handlers.RefreshToken(conn))

		})

		// Definindo as rotas de leitura (não precisam de validação CSRF)
		r.Route("/publicacoes", func(r chi.Router) {
			// Nova rota para buscar publicações do usuário autenticado
			r.Get("/usuario", handlers.GetPublicacoesByUsuario(conn))

			// Rota para buscar publicações com filtros e paginação
			r.Get("/filtro", handlers.GetPublicacoesComFiltro(conn))

			// // Rota para buscar publicações com filtros e paginação
			// r.Get("/", handlers.GetPublicacoesSemFiltro(conn))

			// Rota para buscar uma publicação específica do usuário usando identifier e slug
			r.Get("/usuario/{identifier}/{slug}", handlers.GetPublicacaoByIdentifierESlugDoUsuario(conn))

			// Apenas rotas que alteram o estado precisam de validação CSRF
			r.With(middleware.AuthorizationMiddleware("colaborador")).With(middleware.ValidateCSRFToken).Group(func(r chi.Router) {
				r.Post("/", handlers.CreatePublicacao(conn))       // Cria uma nova publicação
				r.Put("/{id}", handlers.UpdatePublicacao(conn))    // Atualiza uma publicação existente
				r.Delete("/{id}", handlers.DeletePublicacao(conn)) // Deleta uma publicação por ID
			})
		})

		// Rotas de favoritos
		r.Route("/favoritos", func(r chi.Router) {
			r.Use(middleware.AuthorizationMiddleware("leitor"))
			r.Use(middleware.ValidateCSRFToken) // Adicionar validação de CSRF em todas as requisições dentro de favoritos (se necessário)
			r.Mount("/", handlers.FavoritosRouter(conn))
		})

		// Rotas de notificações (divididas por nível de acesso)
		r.Route("/notificacoes", func(r chi.Router) {
			// Rotas de leitura para nível Básico e superiores
			r.With(middleware.AuthorizationMiddleware("leitor")).Get("/", handlers.GetAllNotifications(conn))
			r.With(middleware.AuthorizationMiddleware("leitor")).Get("/{id}", handlers.GetNotificationByID(conn))

			// Rotas de modificação que exigem CSRF e níveis Básico/Admin
			r.With(middleware.AuthorizationMiddleware("leitor")).With(middleware.ValidateCSRFToken).Delete("/{id}", handlers.DeleteNotification(conn))
			r.With(middleware.AuthorizationMiddleware("gestor_conteudo")).With(middleware.ValidateCSRFToken).Post("/", handlers.CreateNotification(conn))
			r.With(middleware.AuthorizationMiddleware("gestor_conteudo")).With(middleware.ValidateCSRFToken).Put("/{id}", handlers.UpdateNotification(conn))
		})

		// Rotas de campanhas
		r.Route("/campaigns", func(r chi.Router) {
			// Rotas de leitura para nível Avançado e superiores
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/", handlers.GetAllCampaigns(conn))
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/{id}", handlers.GetCampaignByID(conn))

			// Rotas de modificação que exigem CSRF e nível Admin
			r.With(middleware.AuthorizationMiddleware("administrador_campanhas")).With(middleware.ValidateCSRFToken).Post("/", handlers.CreateCampaign(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_campanhas")).With(middleware.ValidateCSRFToken).Put("/{id}", handlers.UpdateCampaign(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_campanhas")).With(middleware.ValidateCSRFToken).Delete("/{id}", handlers.DeleteCampaign(conn))
		})

		// Rotas de equipamentos
		r.Route("/equipments", func(r chi.Router) {
			// Rotas de leitura para nível Avançado e superiores
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/", handlers.GetAllEquipments(conn))
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/{id}", handlers.GetEquipmentByID(conn))

			// Rotas de modificação que exigem CSRF e nível Admin
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Post("/", handlers.CreateEquipment(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Put("/{id}", handlers.UpdateEquipment(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Delete("/{id}", handlers.DeleteEquipment(conn))
		})

		// Rotas para Dados de Lidar Zephy
		r.Route("/lidarzephydata", func(r chi.Router) {
			// Rotas de leitura para nível Avançado e superiores
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/", handlers.GetAllLidarZephyData(conn))
			r.With(middleware.AuthorizationMiddleware("avancado")).Get("/{id}", handlers.GetLidarZephyDataByID(conn))
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/{id}", handlers.GetLidarZephyDataByID(conn))
			// Rotas de escrita para nível Admin e superiores
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Post("/", handlers.CreateLidarZephyData(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Put("/{id}", handlers.UpdateLidarZephyData(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Delete("/{id}", handlers.DeleteLidarZephyData(conn))
		})

		// Rotas para Dados de Lidar Windcobe
		r.Route("/lidarwindcobedata", func(r chi.Router) {
			// Rotas de leitura para nível Avançado e superiores
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/", handlers.GetAllLidarWindcobeData(conn))
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/{id}", handlers.GetLidarWindcobeDataByID(conn))

			// Rotas de escrita para nível Admin e superiores
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Post("/", handlers.CreateLidarWindcobeData(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Put("/{id}", handlers.UpdateLidarWindcobeData(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Delete("/{id}", handlers.DeleteLidarWindcobeData(conn))
		})

		// Rotas para Dados de Sodar
		r.Route("/sodardata", func(r chi.Router) {
			// Rotas de leitura para nível Avançado e superiores
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/", handlers.GetAllSodarData(conn))
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/{id}", handlers.GetSodarDataByID(conn))

			// Rotas de escrita para nível Admin e superiores
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Post("/", handlers.CreateSodarData(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Put("/{id}", handlers.UpdateSodarData(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Delete("/{id}", handlers.DeleteSodarData(conn))
		})

		// Rotas para Dados de Torre Micrometeorológica
		r.Route("/towermicrometeorologicaldata", func(r chi.Router) {
			// Rotas de leitura para nível Avançado e superiores
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/", handlers.GetAllTowerMicrometeorologicalData(conn))
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/{id}", handlers.GetTowerMicrometeorologicalDataByID(conn))

			// Rotas de escrita para nível Admin e superiores
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Post("/", handlers.CreateTowerMicrometeorologicalData(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Put("/{id}", handlers.UpdateTowerMicrometeorologicalData(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Delete("/{id}", handlers.DeleteTowerMicrometeorologicalData(conn))
		})

		// Rotas para Dados de ADCP
		r.Route("/adcpdata", func(r chi.Router) {
			// Rotas de leitura para nível Avançado e superiores
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/", handlers.GetAllADCPData(conn))
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/{id}", handlers.GetADCPDataByID(conn))

			// Rotas de escrita para nível Admin e superiores
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Post("/", handlers.CreateADCPData(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Put("/{id}", handlers.UpdateADCPData(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Delete("/{id}", handlers.DeleteADCPData(conn))
		})

		// Rotas para Histórico de Manutenção
		r.Route("/maintenancehistory", func(r chi.Router) {
			// Rotas de leitura para nível Avançado e superiores
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/", handlers.GetAllMaintenanceHistory(conn))
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/{id}", handlers.GetMaintenanceHistoryByID(conn))

			// Rotas de escrita para nível Admin e superiores
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Post("/", handlers.CreateMaintenanceHistory(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Put("/{id}", handlers.UpdateMaintenanceHistory(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Delete("/{id}", handlers.DeleteMaintenanceHistory(conn))
		})

		// Rotas para Histórico de Localização
		r.Route("/locationhistory", func(r chi.Router) {
			// Rotas de leitura para nível Avançado e superiores
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/", handlers.GetAllLocationHistory(conn))
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/{id}", handlers.GetLocationHistoryByID(conn))

			// Rotas de escrita para nível Admin e superiores
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Post("/", handlers.CreateLocationHistory(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Put("/{id}", handlers.UpdateLocationHistory(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Delete("/{id}", handlers.DeleteLocationHistory(conn))
		})

		// Rotas para Documentos de Equipamentos
		r.Route("/equipmentdocuments", func(r chi.Router) {
			// Rotas de leitura para nível Avançado e superiores
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/", handlers.GetAllEquipmentDocuments(conn))
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/{id}", handlers.GetEquipmentDocumentByID(conn))

			// Rotas de escrita para nível Admin e superiores
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Post("/", handlers.CreateEquipmentDocument(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Put("/{id}", handlers.UpdateEquipmentDocument(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Delete("/{id}", handlers.DeleteEquipmentDocument(conn))
		})

		// Rotas protegidas para notícias
		r.Route("/noticias", func(r chi.Router) {
			// Rotas de escrita para nível Admin e superiores
			r.With(middleware.AuthorizationMiddleware("gestor_conteudo")).With(middleware.ValidateCSRFToken).Post("/", handlers.CreateNoticia(conn))
			r.With(middleware.AuthorizationMiddleware("gestor_conteudo")).With(middleware.ValidateCSRFToken).Put("/{id}", handlers.UpdateNoticia(conn))
			r.With(middleware.AuthorizationMiddleware("gestor_conteudo")).With(middleware.ValidateCSRFToken).Delete("/{id}", handlers.DeleteNoticia(conn))
		})

		// Rotas protegidas para dados da Estação Solarimétrica
		r.Route("/estacao-solarimetrica", func(r chi.Router) {
			// Rotas de leitura para nível Avançado e superiores
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/", handlers.GetAllEstacaoSolarimetricaDados(conn))
			r.With(middleware.AuthorizationMiddleware("colaborador")).Get("/{id}", handlers.GetEstacaoSolarimetricaDadosByID(conn))

			// Rotas de escrita para nível Admin e superiores
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Post("/", handlers.CreateEstacaoSolarimetricaDados(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Put("/{id}", handlers.UpdateEstacaoSolarimetricaDados(conn))
			r.With(middleware.AuthorizationMiddleware("administrador_equipamentos")).With(middleware.ValidateCSRFToken).Delete("/{id}", handlers.DeleteEstacaoSolarimetricaDados(conn))
		})

		r.Route("/usuarios", func(r chi.Router) {
			r.Use(middleware.AuthorizationMiddleware("superusuario")) // Acesso restrito a Superadmin
			r.Mount("/", handlers.UsuariosRouter(conn))
		})
	})

	// Inicia o servidor
	log.Println("Server running on port 8080")
	http.ListenAndServe(":8080", r)
}
