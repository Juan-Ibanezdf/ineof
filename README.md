
# Configuração do Banco de Dados

Este projeto utiliza o PostgreSQL com as extensões **TimescaleDB** e **PostGIS** para gerenciar e processar dados espaciais e temporais. Abaixo, estão as instruções para a criação das tabelas e a configuração das extensões necessárias.

## Passo 1: Configurando Extensões

### Executando o Container PostgreSQL

Para habilitar as extensões necessárias no PostgreSQL, siga as etapas abaixo:

1.1 Acesse o terminal do seu container PostgreSQL:

```bash
docker exec -it datalakehouse-postgres bash
```

1.2 Dentro do container, acesse o PostgreSQL:

```bash
psql -U postgres -d datalake
```

1.3 Habilite as extensões **TimescaleDB** e **PostGIS** executando os seguintes comandos:

```sql
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Passo 2: Criação das Tabelas

A seguir, são definidas as tabelas principais que armazenam os dados de campanhas e equipamentos, bem como os dados específicos de cada tipo de equipamento.

```sql
-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),           -- Identificador único do usuário, gerado automaticamente
    nome_de_usuario VARCHAR(100) NOT NULL,                            -- Nome de usuário
    senha VARCHAR(256) NOT NULL,                                      -- Senha (armazenada em hash)
    email VARCHAR(100) UNIQUE NOT NULL,                               -- Email (deve ser único)
    nivel_acesso VARCHAR(50) NOT NULL CHECK (nivel_acesso IN ('basico', 'intermediario', 'avancado', 'admin', 'superadmin')) DEFAULT 'basico',  -- Nível de acesso do usuário
    nome_completo VARCHAR(200),                                       -- Nome completo
    perfil_imagem VARCHAR(300),                                       -- URL da imagem de perfil
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                 -- Data de criação do usuário
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- Data de atualização do usuário
    curriculo_lattes VARCHAR(255),                                    -- URL do currículo Lattes
    telefone VARCHAR(15),                                             -- Número de telefone
    ocupacao VARCHAR(255),                                            -- Ocupação do usuário
    termos_de_uso BOOLEAN NOT NULL,                                   -- Confirmação de aceite dos termos de uso
    descricao TEXT,                                                   -- Descrição adicional
    data_desativacao TIMESTAMP,                                       -- Data de desativação (se o usuário for desativado)
    status_ativacao BOOLEAN,                                          -- Status de ativação do usuário
    email_verificado BOOLEAN,                                         -- Status de verificação do email
    ultimo_login TIMESTAMP,                                           -- Data do último login
    ip_ultimo_login VARCHAR(45),                                      -- IP do último login
    pais VARCHAR(100),                                                -- País de residência
    estado VARCHAR(100),                                              -- Estado de residência
    cidade VARCHAR(100),                                              -- Cidade de residência
    matricula INT,                                                    -- Número de matrícula (se aplicável)
    instituicao VARCHAR(256)                                          -- Instituição de afiliação
);


-- Índice para nome de usuário
CREATE INDEX IF NOT EXISTS idx_usuarios_nome_de_usuario ON Usuarios (nome_de_usuario);


-- Tabela de Publicações
CREATE TABLE IF NOT EXISTS Publicacoes (
    id_publicacao UUID PRIMARY KEY DEFAULT uuid_generate_v4(),        -- Identificador único da publicação, gerado automaticamente
    titulo VARCHAR(255) UNIQUE NOT NULL,                              -- Título da publicação
    subtitulo VARCHAR(255),                                           -- Subtítulo da publicação
    palavras_chave VARCHAR(255),                                      -- Palavras-chave associadas à publicação
    banner VARCHAR(255),                                              -- URL do banner da publicação
    resumo TEXT,                                                      -- Resumo da publicação
    nome_de_usuario VARCHAR(255),                                     -- Nome de usuário (quem criou a publicação)
    categoria VARCHAR(255),                                           -- Categoria da publicação
    autores VARCHAR(255),                                             -- Lista de autores
    publicacoes VARCHAR(255),                                         -- Publicações relacionadas
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                 -- Data de criação da publicação
    data_modificacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- Data de modificação da publicação
    pdf BYTEA,                                                        -- Arquivo PDF da publicação
    link VARCHAR(255),                                                -- Link para o conteúdo da publicação
    visualizacoes INT DEFAULT 0,                                      -- Contador de visualizações
    revisado_por VARCHAR(255),                                        -- Nome do revisor (se aplicável)
    slug VARCHAR(255) UNIQUE,                                         -- Slug para a URL amigável, agora único
    identifier VARCHAR(255) UNIQUE,                                   -- Identificador único, agora único
    visibilidade BOOLEAN NOT NULL DEFAULT FALSE,                      -- Status de visibilidade (público/privado)
    notas TEXT,                                                       -- Notas adicionais
    id_usuario UUID,                                                  -- Chave estrangeira para o autor da publicação
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)          -- Chave estrangeira referenciando a tabela Usuarios
);

-- Índices para melhorar a performance nas consultas
CREATE INDEX IF NOT EXISTS idx_publicacoes_titulo ON Publicacoes (titulo);
CREATE INDEX IF NOT EXISTS idx_publicacoes_palavras_chave ON Publicacoes (palavras_chave);


-- Tabela de Favoritos
CREATE TABLE IF NOT EXISTS Favoritos (
    id_favorito UUID PRIMARY KEY DEFAULT uuid_generate_v4(),                                   -- Identificador único do favorito
    id_usuario UUID,                                                  -- ID do usuário que favoritou
    id_publicacao UUID,                                               -- ID da publicação favoritada
    data_favorito TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                -- Data em que o favorito foi criado
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,  -- Chave estrangeira para Usuarios
    FOREIGN KEY (id_publicacao) REFERENCES Publicacoes(id_publicacao) ON DELETE CASCADE,  -- Chave estrangeira para Publicacoes
    UNIQUE (id_usuario, id_publicacao)                                -- Garante que um usuário não possa favoritar a mesma publicação mais de uma vez
);




-- Tabela de Notícias
CREATE TABLE IF NOT EXISTS Noticias (
    id_noticia UUID PRIMARY KEY DEFAULT uuid_generate_v4(),          -- Identificador único da notícia, agora como UUID
    titulo VARCHAR(255) UNIQUE NOT NULL,                             -- Título da notícia, deve ser único
    subtitulo VARCHAR(255),                                          -- Subtítulo da notícia
    data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- Data de publicação da notícia
    nome_autor VARCHAR(255),                                         -- Nome do autor
    imagem_noticia VARCHAR(255),                                     -- URL da imagem da notícia
    lead TEXT,                                                       -- Lead da notícia
    categoria VARCHAR(255),                                          -- Categoria da notícia
    data_revisao TIMESTAMP,                                          -- Data de revisão da notícia
    nome_revisor VARCHAR(255),                                       -- Nome do revisor
    slug VARCHAR(255) UNIQUE,                                        -- Slug para a URL amigável
    identifier VARCHAR(255) UNIQUE                                   -- Identificador único para a notícia
);


-- Índice para melhorar a performance nas consultas por título
CREATE INDEX idx_noticias_titulo ON Noticias (titulo);


-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS Notificacoes (
    id_notificacao UUID PRIMARY KEY DEFAULT uuid_generate_v4(),                                -- Identificador único da notificação
    titulo VARCHAR(255) NOT NULL,                                     -- Título da notificação
    mensagem TEXT NOT NULL,                                           -- Mensagem da notificação
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                   -- Data em que a notificação foi enviada
    id_noticia UUID,                                                  -- ID da notícia relacionada (UUID agora)
    tipo VARCHAR(50) CHECK (tipo IN ('sistema', 'marketing', 'atualizacao', 'noticia')),  -- Tipo de notificação
    id_usuario UUID,                                                  -- ID do usuário específico (UUID)
    enviado_para_todos BOOLEAN DEFAULT FALSE,                         -- Indica se a notificação é para todos os usuários
    FOREIGN KEY (id_noticia) REFERENCES Noticias(id_noticia) ON DELETE SET NULL,  -- Chave estrangeira para Noticias
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE    -- Chave estrangeira para Usuarios
);

-- Índice para melhorar a performance nas consultas por título
CREATE INDEX idx_notificacoes_titulo ON Notificacoes (titulo);

-- Tabela de Controle de Leitura de Notificações
CREATE TABLE IF NOT EXISTS NotificacoesUsuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),                                            -- Identificador único
    id_notificacao UUID NOT NULL,                                      -- ID da notificação
    id_usuario UUID NOT NULL,                                         -- ID do usuário
    lida BOOLEAN DEFAULT FALSE,                                       -- Indica se a notificação foi lida pelo usuário
    data_leitura TIMESTAMP,  
    oculta BOOLEAN DEFAULT FALSE,                                            -- Data em que a notificação foi lida
    FOREIGN KEY (id_notificacao) REFERENCES Notificacoes(id_notificacao) ON DELETE CASCADE,  -- Chave estrangeira para Notificacoes
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE               -- Chave estrangeira para Usuarios
);



-- Tabela de Campanhas
CREATE TABLE IF NOT EXISTS Campaigns (
    CampaignID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),            -- Identificador único da campanha
    CampaignName VARCHAR(255) NOT NULL,                                -- Nome da campanha
    StartDate TIMESTAMP,                                               -- Data e hora de início da campanha
    EndDate TIMESTAMP,                                                 -- Data e hora de término da campanha
    TeamName VARCHAR(255),                                             -- Nome da equipe responsável pela campanha
    Location GEOGRAPHY(Point, 4326),                                   -- Localização da campanha como um ponto geográfico (latitude e longitude)
    EquipmentUsed JSONB,                                               -- Equipamentos utilizados, armazenados como uma lista de objetos (pode incluir nome e ID)
    EquipmentIDs UUID[],                                               -- IDs dos equipamentos associados à campanha
    Objectives TEXT,                                                   -- Objetivos da campanha
    ContactPerson VARCHAR(255),                                        -- Pessoa de contato para a campanha
    Status VARCHAR(50) CHECK (Status IN ('Planned', 'Ongoing', 'Completed', 'Cancelled')),  -- Status da campanha
    Notes TEXT,                                                        -- Notas adicionais ou comentários sobre a campanha
    Description TEXT                                                   -- Descrição da campanha
);

-- Tabela de Equipamentos
CREATE TABLE IF NOT EXISTS Equipments (
    EquipmentID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),                    -- Identificador único do equipamento
    EquipmentName VARCHAR(255) NOT NULL,                                        -- Nome do equipamento
    Description TEXT,                                                           -- Descrição do equipamento
    EquipmentType VARCHAR(255) NOT NULL,                                        -- Tipo de equipamento (e.g., Lidar, ADCP, etc.)
    SerialNumber VARCHAR(255) UNIQUE NOT NULL,                                  -- Número de série único do equipamento
    Model VARCHAR(255),                                                         -- Modelo do equipamento
    Manufacturer VARCHAR(255),                                                  -- Fabricante do equipamento
    Frequency FLOAT,                                                            -- Frequência de operação do equipamento (se aplicável)
    CalibrationDate DATE,                                                       -- Data da última calibração
    LastMaintenanceDate DATE,                                                   -- Data da última manutenção
    MaintainedBy VARCHAR(255),                                                  -- Nome da pessoa responsável pela última manutenção
    ManufacturingDate DATE,                                                     -- Data de fabricação do equipamento
    AcquisitionDate DATE,                                                       -- Data de aquisição do equipamento
    DataTypes VARCHAR(255),                                                     -- Tipos de dados gerados pelo equipamento (e.g., WindSpeed, Temperature)
    Notes TEXT,                                                                 -- Notas ou observações adicionais sobre o equipamento
    WarrantyExpirationDate DATE,                                                -- Data de expiração da garantia
    OperatingStatus VARCHAR(50) CHECK (OperatingStatus IN ('Em Operação', 'Parado', 'Em Uso', 'Em Manutenção')),  -- Status operacional do equipamento
    Location GEOGRAPHY(Point, 4326),                                            -- Local onde o equipamento está instalado ou armazenado
    CampaignIDs UUID[],                                                         -- IDs das campanhas associadas ao equipamento
    EquipmentImage VARCHAR(255)                                                 -- Caminho para imagem do equipamento
);

-- Tabela de Relacionamento entre Campanhas e Equipamentos com Nome
CREATE TABLE IF NOT EXISTS CampaignEquipment (
    CampaignEquipmentID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),            -- Identificador único da relação
    CampaignID UUID REFERENCES Campaigns(CampaignID) ON DELETE CASCADE,         -- Referência à campanha
    EquipmentID UUID REFERENCES Equipments(EquipmentID) ON DELETE CASCADE,      -- Referência ao ID do equipamento
    EquipmentName VARCHAR(255) REFERENCES Equipments(EquipmentName),            -- Referência ao nome do equipamento (para consultas diretas)
    DeploymentDate DATE,                                                        -- Data de início da utilização do equipamento na campanha
    RetrievalDate DATE                                                          -- Data de término da utilização do equipamento na campanha
);




-- Tabela de Histórico de Manutenções
CREATE TABLE IF NOT EXISTS MaintenanceHistory (
    MaintenanceID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),                 -- Identificador único da manutenção
    EquipmentID UUID REFERENCES Equipments(EquipmentID) ON DELETE CASCADE,  -- Referência ao equipamento
    MaintenanceDate DATE NOT NULL,                    -- Data da manutenção
    PerformedBy VARCHAR(255),                         -- Nome da pessoa que realizou a manutenção
    Description TEXT,                                 -- Descrição do que foi feito na manutenção
    Notes TEXT                                        -- Notas adicionais ou observações sobre a manutenção
);

-- Tabela de Histórico de Localizações
CREATE TABLE IF NOT EXISTS LocationHistory (
    LocationHistoryID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),             -- Identificador único do histórico de localização
    EquipmentID UUID REFERENCES Equipments(EquipmentID) ON DELETE CASCADE,  -- Referência ao equipamento
    Location GEOGRAPHY(Point, 4326) NOT NULL,         -- Localização do equipamento como um ponto geográfico
    StartDate DATE NOT NULL,                          -- Data de início nessa localização
    EndDate DATE,                                     -- Data de término nessa localização (NULL se ainda estiver nesse local)
    Notes TEXT                                        -- Notas ou observações sobre a localização
);

-- Tabela de Documentos Relacionados aos Equipamentos
CREATE TABLE IF NOT EXISTS EquipmentDocuments (
    DocumentID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),                     -- Identificador único do documento
    EquipmentID UUID REFERENCES Equipments(EquipmentID) ON DELETE CASCADE,  -- Referência ao equipamento
    DocumentName VARCHAR(255) NOT NULL,                -- Nome ou título do documento
    DocumentType VARCHAR(100),                         -- Tipo de documento (e.g., Manual, Certificado)
    Path VARCHAR(255) NOT NULL,                        -- Caminho para o arquivo armazenado no sistema (deve ser um arquivo PDF)
    DocumentLink VARCHAR(255),                         -- Link para o documento na web ou em outro sistema
    UploadedBy VARCHAR(255),                           -- Nome da pessoa que fez o upload do documento
    UploadDate DATE NOT NULL,                          -- Data de upload do documento
    Notes TEXT                                         -- Notas ou observações adicionais sobre o documento
);
```

## Tabelas de Headers dos Equipamentos

Cada tipo de equipamento possui uma tabela específica para armazenar os seus headers

```sql

-- Tabelas de Headers dos Equipamentos

-- Tabela Genérica para Cabeçalhos de Equipamentos
CREATE TABLE IF NOT EXISTS EquipmentHeaders (
    HeaderID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),              -- Identificador único do cabeçalho
    EquipmentID UUID REFERENCES Equipments(EquipmentID),               -- Referência ao equipamento
    CampaignID UUID REFERENCES Campaigns(CampaignID),                  -- Referência à campanha associada
    FileName VARCHAR(255),                                             -- Nome do arquivo de dados
    FileType VARCHAR(50),                                              -- Tipo de arquivo (e.g., RTD, STA)
    HeaderInfo JSONB,                                                  -- Informações dos cabeçalhos em formato JSON
    UploadDate TIMESTAMPTZ DEFAULT now()                               -- Data de upload do arquivo
);

-- Tabela de Cabeçalhos para Dados da Estação Solarimétrica
CREATE TABLE IF NOT EXISTS EstacaoSolarimetricaHeaders (
    SolarimetricaHeaderID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    EquipmentID UUID REFERENCES Equipments(EquipmentID),
    CampaignID UUID REFERENCES Campaigns(CampaignID),
    FileName VARCHAR(255),
    SolarRadiationHeader VARCHAR(255),                                 -- Cabeçalho específico para Solar Radiation
    TemperatureHeader VARCHAR(255),                                    -- Cabeçalho específico para Temperatura
    BarometricPressureHeader VARCHAR(255),                             -- Cabeçalho específico para Pressão Barométrica
    UploadDate TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS LIDARWindCubeHeaders (
    WindCubeHeaderID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    EquipmentID UUID REFERENCES Equipments(EquipmentID),
    CampaignID UUID REFERENCES Campaigns(CampaignID),
    FileName VARCHAR(255),
    HeaderSize INTEGER,
    Version VARCHAR(50),
    IDSystem VARCHAR(50),
    IDClient VARCHAR(50),
    Location VARCHAR(50),
    GPSLocation VARCHAR(100),
    Comments TEXT,
    FCROption VARCHAR(50),
    Timezone VARCHAR(10),
    LaserDiodeCurrent FLOAT,
    LOS FLOAT,
    InstallationOffsetAGL FLOAT,
    CNRThreshold FLOAT,
    VrThreshold VARCHAR(50),  -- Alterado para VARCHAR(50)
    SigmaFreqThreshold VARCHAR(50),  -- Alterado para VARCHAR(50)
    WiperCNRThreshold FLOAT,
    WiperAltitude FLOAT,
    WiperDuration INTEGER,
    AltitudesAGL TEXT,
    SamplingFrequency VARCHAR(50),
    RefFrequency VARCHAR(50),
    PulsesPerLOS VARCHAR(50),
    SamplesPerPulse VARCHAR(50),
    ReflectedPulseStart VARCHAR(50),
    ReflectedPulseEnd VARCHAR(50),
    RefPulseSamplesNb VARCHAR(50),
    NbHighPassFilterPoints VARCHAR(50),
    FFTWindowWidth VARCHAR(50),
    PulseRepetitionRate VARCHAR(50),
    PulseDuration VARCHAR(50),
    TriggerDelayTime VARCHAR(50),
    Wavelength VARCHAR(50),
    ScanAngle VARCHAR(50),
    DirectionOffset FLOAT,
    Declination VARCHAR(50),
    PitchAngle FLOAT,
    RollAngle FLOAT,
    UploadDate TIMESTAMPTZ DEFAULT now()
);




-- Tabela de Cabeçalhos para Dados do SODAR
CREATE TABLE IF NOT EXISTS SODARHeaders (
    SODARHeaderID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    EquipmentID UUID REFERENCES Equipments(EquipmentID),
    CampaignID UUID REFERENCES Campaigns(CampaignID),
    FileName VARCHAR(255),
    DeviceSerialNumber VARCHAR(50),
    StationCode VARCHAR(50),
    SoftwareVersion VARCHAR(50),
    AntennaAzimuthAngle FLOAT,
    HeightAboveGround FLOAT,
    HeightAboveSeaLevel FLOAT,
    UploadDate TIMESTAMPTZ DEFAULT now()
);




```

## Tabelas de Dados de Equipamentos

Cada tipo de equipamento possui uma tabela específica para armazenar seus dados:

```sql

CREATE TABLE IF NOT EXISTS EstacaoSolarimetricaDados (
    EstacaoSolarimetricaDadosID SERIAL PRIMARY KEY,
    EquipmentID UUID REFERENCES Equipments(EquipmentID),  -- Referência ao equipamento
    CampaignID UUID REFERENCES Campaigns(CampaignID),     -- Referência à campanha
    timestamp TIMESTAMPTZ NOT NULL,                       -- Timestamp da leitura
    BattV FLOAT,                                          -- Bateria em volts
    PTemp_C FLOAT,                                        -- Temperatura do painel em graus Celsius
    WindDir FLOAT,                                        -- Direção do vento em graus
    WS_ms_Avg FLOAT,                                      -- Velocidade média do vento em metros/segundo
    WS_ms_Max FLOAT,                                      -- Velocidade máxima do vento em metros/segundo
    WS_ms_Min FLOAT,                                      -- Velocidade mínima do vento em metros/segundo
    AirTC_Avg FLOAT,                                      -- Temperatura média do ar em graus Celsius
    AirTC_Max FLOAT,                                      -- Temperatura máxima do ar em graus Celsius
    AirTC_Min FLOAT,                                      -- Temperatura mínima do ar em graus Celsius
    RH_Max FLOAT,                                         -- Umidade relativa máxima (%)
    RH_Min FLOAT,                                         -- Umidade relativa mínima (%)
    RH FLOAT,                                             -- Umidade relativa média (%)
    Rain_mm_Tot FLOAT,                                    -- Precipitação total em milímetros
    BP_mbar_Avg FLOAT,                                    -- Pressão barométrica média em mbar
    BP_mbar_Max FLOAT,                                    -- Pressão barométrica máxima em mbar
    BP_mbar_Min FLOAT,                                    -- Pressão barométrica mínima em mbar
    SlrW_CMP10_Horizontal_Avg FLOAT,                      -- Radiação solar horizontal média (W/m²)
    SlrW_CMP10_Horizontal_Max FLOAT,                      -- Radiação solar horizontal máxima (W/m²)
    SlrW_CMP10_Horizontal_Min FLOAT,                      -- Radiação solar horizontal mínima (W/m²)
    SlrkJ_CMP10_Horizontal_Tot FLOAT,                     -- Radiação solar horizontal total (kJ/m²)
    SlrW_CMP10_Inclinado_Avg FLOAT,                       -- Radiação solar inclinada média (W/m²)
    SlrW_CMP10_Inclinado_Max FLOAT,                       -- Radiação solar inclinada máxima (W/m²)
    SlrW_CMP10_Inclinado_Min FLOAT,                       -- Radiação solar inclinada mínima (W/m²)
    SlrkJ_CMP10_Inclinado_Tot FLOAT,                      -- Radiação solar inclinada total (kJ/m²)
    SlrW_CHP1_Avg FLOAT,                                  -- Radiação do sensor CHP1 média (W/m²)
    SlrW_CHP1_Max FLOAT,                                  -- Radiação do sensor CHP1 máxima (W/m²)
    SlrW_CHP1_Min FLOAT,                                  -- Radiação do sensor CHP1 mínima (W/m²)
    SlrkJ_CHP1_Tot FLOAT,                                 -- Radiação total medida pelo sensor CHP1 (kJ/m²)
    SolarAzimuth FLOAT,                                   -- Azimute solar em graus
    SunElevation FLOAT,                                   -- Elevação do sol em graus
    HourAngle FLOAT,                                      -- Ângulo horário do sol
    Declination FLOAT,                                    -- Declinação solar
    AirMass FLOAT                                         -- Massa de ar
);

-- Criar uma hypertable no TimescaleDB para particionamento dos dados por mês
SELECT create_hypertable('EstacaoSolarimetricaDados', 'timestamp', chunk_time_interval => interval '1 month');


-- Tabela de Dados do LIDAR WindCube
CREATE TABLE IF NOT EXISTS LIDARWindCubeDados (
    LIDARWindCubeDadosID SERIAL PRIMARY KEY,
    EquipmentID UUID REFERENCES Equipments(EquipmentID),
    CampaignID UUID REFERENCES Campaigns(CampaignID),
    timestamp TIMESTAMPTZ NOT NULL,
    IntTemp FLOAT,  -- Temperatura interna (°C)
    ExtTemp FLOAT,  -- Temperatura externa (°C)
    Pressure FLOAT,  -- Pressão (hPa)
    RelHumidity FLOAT,  -- Umidade relativa (%)
    WiperCount INTEGER,
    Vbatt FLOAT,  -- Tensão da bateria (V)
    
    -- Dados de 40m
    WindSpeed_40m FLOAT,
    WindSpeedDispersion_40m FLOAT,
    WindSpeedMin_40m FLOAT,
    WindSpeedMax_40m FLOAT,
    WindDirection_40m FLOAT,
    ZWind_40m FLOAT,
    ZWindDispersion_40m FLOAT,
    CNR_40m FLOAT,
    CNRMin_40m FLOAT,
    DoppSpectBroad_40m FLOAT,
    DataAvailability_40m FLOAT,
    
    -- Dados de 50m
    WindSpeed_50m FLOAT,
    WindSpeedDispersion_50m FLOAT,
    WindSpeedMin_50m FLOAT,
    WindSpeedMax_50m FLOAT,
    WindDirection_50m FLOAT,
    ZWind_50m FLOAT,
    ZWindDispersion_50m FLOAT,
    CNR_50m FLOAT,
    CNRMin_50m FLOAT,
    DoppSpectBroad_50m FLOAT,
    DataAvailability_50m FLOAT,

    -- Dados de 60m
    WindSpeed_60m FLOAT,
    WindSpeedDispersion_60m FLOAT,
    WindSpeedMin_60m FLOAT,
    WindSpeedMax_60m FLOAT,
    WindDirection_60m FLOAT,
    ZWind_60m FLOAT,
    ZWindDispersion_60m FLOAT,
    CNR_60m FLOAT,
    CNRMin_60m FLOAT,
    DoppSpectBroad_60m FLOAT,
    DataAvailability_60m FLOAT,

    -- Dados de 70m
    WindSpeed_70m FLOAT,
    WindSpeedDispersion_70m FLOAT,
    WindSpeedMin_70m FLOAT,
    WindSpeedMax_70m FLOAT,
    WindDirection_70m FLOAT,
    ZWind_70m FLOAT,
    ZWindDispersion_70m FLOAT,
    CNR_70m FLOAT,
    CNRMin_70m FLOAT,
    DoppSpectBroad_70m FLOAT,
    DataAvailability_70m FLOAT,
    
    -- Dados de 80m
    WindSpeed_80m FLOAT,
    WindSpeedDispersion_80m FLOAT,
    WindSpeedMin_80m FLOAT,
    WindSpeedMax_80m FLOAT,
    WindDirection_80m FLOAT,
    ZWind_80m FLOAT,
    ZWindDispersion_80m FLOAT,
    CNR_80m FLOAT,
    CNRMin_80m FLOAT,
    DoppSpectBroad_80m FLOAT,
    DataAvailability_80m FLOAT,

    -- Dados de 90m
    WindSpeed_90m FLOAT,
    WindSpeedDispersion_90m FLOAT,
    WindSpeedMin_90m FLOAT,
    WindSpeedMax_90m FLOAT,
    WindDirection_90m FLOAT,
    ZWind_90m FLOAT,
    ZWindDispersion_90m FLOAT,
    CNR_90m FLOAT,
    CNRMin_90m FLOAT,
    DoppSpectBroad_90m FLOAT,
    DataAvailability_90m FLOAT,

    -- Dados de 100m
    WindSpeed_100m FLOAT,
    WindSpeedDispersion_100m FLOAT,
    WindSpeedMin_100m FLOAT,
    WindSpeedMax_100m FLOAT,
    WindDirection_100m FLOAT,
    ZWind_100m FLOAT,
    ZWindDispersion_100m FLOAT,
    CNR_100m FLOAT,
    CNRMin_100m FLOAT,
    DoppSpectBroad_100m FLOAT,
    DataAvailability_100m FLOAT,

    -- Dados de 110m
    WindSpeed_110m FLOAT,
    WindSpeedDispersion_110m FLOAT,
    WindSpeedMin_110m FLOAT,
    WindSpeedMax_110m FLOAT,
    WindDirection_110m FLOAT,
    ZWind_110m FLOAT,
    ZWindDispersion_110m FLOAT,
    CNR_110m FLOAT,
    CNRMin_110m FLOAT,
    DoppSpectBroad_110m FLOAT,
    DataAvailability_110m FLOAT,

    -- Dados de 120m
    WindSpeed_120m FLOAT,
    WindSpeedDispersion_120m FLOAT,
    WindSpeedMin_120m FLOAT,
    WindSpeedMax_120m FLOAT,
    WindDirection_120m FLOAT,
    ZWind_120m FLOAT,
    ZWindDispersion_120m FLOAT,
    CNR_120m FLOAT,
    CNRMin_120m FLOAT,
    DoppSpectBroad_120m FLOAT,
    DataAvailability_120m FLOAT,

    -- Dados de 130m
    WindSpeed_130m FLOAT,
    WindSpeedDispersion_130m FLOAT,
    WindSpeedMin_130m FLOAT,
    WindSpeedMax_130m FLOAT,
    WindDirection_130m FLOAT,
    ZWind_130m FLOAT,
    ZWindDispersion_130m FLOAT,
    CNR_130m FLOAT,
    CNRMin_130m FLOAT,
    DoppSpectBroad_130m FLOAT,
    DataAvailability_130m FLOAT,

    -- Dados de 140m
    WindSpeed_140m FLOAT,
    WindSpeedDispersion_140m FLOAT,
    WindSpeedMin_140m FLOAT,
    WindSpeedMax_140m FLOAT,
    WindDirection_140m FLOAT,
    ZWind_140m FLOAT,
    ZWindDispersion_140m FLOAT,
    CNR_140m FLOAT,
    CNRMin_140m FLOAT,
    DoppSpectBroad_140m FLOAT,
    DataAvailability_140m FLOAT,

    -- Dados de 150m
    WindSpeed_150m FLOAT,
    WindSpeedDispersion_150m FLOAT,
    WindSpeedMin_150m FLOAT,
    WindSpeedMax_150m FLOAT,
    WindDirection_150m FLOAT,
    ZWind_150m FLOAT,
    ZWindDispersion_150m FLOAT,
    CNR_150m FLOAT,
    CNRMin_150m FLOAT,
    DoppSpectBroad_150m FLOAT,
    DataAvailability_150m FLOAT,

    -- Dados de 160m
    WindSpeed_160m FLOAT,
    WindSpeedDispersion_160m FLOAT,
    WindSpeedMin_160m FLOAT,
    WindSpeedMax_160m FLOAT,
    WindDirection_160m FLOAT,
    ZWind_160m FLOAT,
    ZWindDispersion_160m FLOAT,
    CNR_160m FLOAT,
    CNRMin_160m FLOAT,
    DoppSpectBroad_160m FLOAT,
    DataAvailability_160m FLOAT,

    -- Dados de 170m
    WindSpeed_170m FLOAT,
    WindSpeedDispersion_170m FLOAT,
    WindSpeedMin_170m FLOAT,
    WindSpeedMax_170m FLOAT,
    WindDirection_170m FLOAT,
    ZWind_170m FLOAT,
    ZWindDispersion_170m FLOAT,
    CNR_170m FLOAT,
    CNRMin_170m FLOAT,
    DoppSpectBroad_170m FLOAT,
    DataAvailability_170m FLOAT,

    -- Dados de 180m
    WindSpeed_180m FLOAT,
    WindSpeedDispersion_180m FLOAT,
    WindSpeedMin_180m FLOAT,
    WindSpeedMax_180m FLOAT,
    WindDirection_180m FLOAT,
    ZWind_180m FLOAT,
    ZWindDispersion_180m FLOAT,
    CNR_180m FLOAT,
    CNRMin_180m FLOAT,
    DoppSpectBroad_180m FLOAT,
    DataAvailability_180m FLOAT,

    -- Dados de 190m
    WindSpeed_190m FLOAT,
    WindSpeedDispersion_190m FLOAT,
    WindSpeedMin_190m FLOAT,
    WindSpeedMax_190m FLOAT,
    WindDirection_190m FLOAT,
    ZWind_190m FLOAT,
    ZWindDispersion_190m FLOAT,
    CNR_190m FLOAT,
    CNRMin_190m FLOAT,
    DoppSpectBroad_190m FLOAT,
    DataAvailability_190m FLOAT,

    -- Dados de 200m
    WindSpeed_200m FLOAT,
    WindSpeedDispersion_200m FLOAT,
    WindSpeedMin_200m FLOAT,
    WindSpeedMax_200m FLOAT,
    WindDirection_200m FLOAT,
    ZWind_200m FLOAT,
    ZWindDispersion_200m FLOAT,
    CNR_200m FLOAT,
    CNRMin_200m FLOAT,
    DoppSpectBroad_200m FLOAT,
    DataAvailability_200m FLOAT,

    -- Dados de 220m
    WindSpeed_220m FLOAT,
    WindSpeedDispersion_220m FLOAT,
    WindSpeedMin_220m FLOAT,
    WindSpeedMax_220m FLOAT,
    WindDirection_220m FLOAT,
    ZWind_220m FLOAT,
    ZWindDispersion_220m FLOAT,
    CNR_220m FLOAT,
    CNRMin_220m FLOAT,
    DoppSpectBroad_220m FLOAT,
    DataAvailability_220m FLOAT,

    -- Dados de 240m
    WindSpeed_240m FLOAT,
    WindSpeedDispersion_240m FLOAT,
    WindSpeedMin_240m FLOAT,
    WindSpeedMax_240m FLOAT,
    WindDirection_240m FLOAT,
    ZWind_240m FLOAT,
    ZWindDispersion_240m FLOAT,
    CNR_240m FLOAT,
    CNRMin_240m FLOAT,
    DoppSpectBroad_240m FLOAT,
    DataAvailability_240m FLOAT,

    -- Dados de 260m
    WindSpeed_260m FLOAT,
    WindSpeedDispersion_260m FLOAT,
    WindSpeedMin_260m FLOAT,
    WindSpeedMax_260m FLOAT,
    WindDirection_260m FLOAT,
    ZWind_260m FLOAT,
    ZWindDispersion_260m FLOAT,
    CNR_260m FLOAT,
    CNRMin_260m FLOAT,
    DoppSpectBroad_260m FLOAT,
    DataAvailability_260m FLOAT
);




-- Tabela de Dados do SODAR
CREATE TABLE IF NOT EXISTS SODARDados (
    SODARDadosID SERIAL PRIMARY KEY,
    EquipmentID UUID REFERENCES Equipments(EquipmentID),
    CampaignID UUID REFERENCES Campaigns(CampaignID),
    timestamp TIMESTAMPTZ NOT NULL,
    Height FLOAT,
    WindSpeed FLOAT,
    WindDirection FLOAT,
    U_Geo FLOAT,
    V_Geo FLOAT,
    U FLOAT,
    V FLOAT,
    W FLOAT,
    SigmaU FLOAT,
    SigmaU_Radial FLOAT,
    SigmaV FLOAT,
    SigmaV_Radial FLOAT,
    SigmaW FLOAT,
    WindShear FLOAT,
    WindShearDirection FLOAT,
    SigmaSpeed FLOAT,
    SigmaLateral FLOAT,
    SigmaPhi FLOAT,
    SigmaTheta FLOAT,
    TurbulenceIntensity FLOAT,
    PGz INT,
    TKE FLOAT,
    EDR FLOAT,
    BackscatterRaw FLOAT,
    Backscatter FLOAT,
    BackscatterID INT,
    CT2 FLOAT
);

-- Criação da Hypertable para SODARDados
SELECT create_hypertable('SODARDados', 'timestamp', chunk_time_interval => interval '1 month');


```

## Passo 3: Executando o Projeto com Docker

Para construir e iniciar o projeto utilizando Docker, execute os comandos abaixo na raiz do projeto:

### Build do Projeto

```bash
docker compose build
```

### Iniciando os Contêineres

```bash
docker compose up
```

### Parando os Contêineres

Para parar os contêineres, execute:

```bash
docker compose down
```

### Acessando a Aplicação

Após executar o `docker compose up`, a aplicação estará disponível na porta `8080`. Utilize ferramentas como **Insomnia** ou **Postman** para realizar requisições HTTP e testar as APIs.
