# FROM postgres:14

# # Adicionar repositório do TimescaleDB
# RUN apt-get update && apt-get install -y wget gnupg2 lsb-release \
#     && echo "deb https://packagecloud.io/timescale/timescaledb/debian/ $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/timescaledb.list \
#     && wget --quiet -O - https://packagecloud.io/timescale/timescaledb/gpgkey | apt-key add - \
#     && apt-get update

# # Instalar TimescaleDB, PostGIS, e postgresql-contrib para uuid-ossp
# RUN apt-get update && apt-get install -y \
#     timescaledb-2-postgresql-14 \
#     postgis postgresql-14-postgis-3 \
#     postgresql-contrib \
#     && apt-get clean \
#     && rm -rf /var/lib/apt/lists/*

# # Configurar o PostgreSQL para usar o TimescaleDB
# RUN echo "shared_preload_libraries='timescaledb'" >> /usr/share/postgresql/postgresql.conf.sample

# # Expor a porta do PostgreSQL
# EXPOSE 5432
FROM postgres:14

# Adicionar repositório do TimescaleDB
RUN apt-get update && apt-get install -y wget gnupg2 lsb-release \
    && echo "deb https://packagecloud.io/timescale/timescaledb/debian/ $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/timescaledb.list \
    && wget --quiet -O - https://packagecloud.io/timescale/timescaledb/gpgkey | apt-key add - \
    && apt-get update

# Instalar TimescaleDB, PostGIS, e postgresql-contrib para uuid-ossp
RUN apt-get update && apt-get install -y \
    timescaledb-2-postgresql-14 \
    postgis postgresql-14-postgis-3 \
    postgresql-contrib \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configurar o PostgreSQL para usar o TimescaleDB
RUN echo "shared_preload_libraries='timescaledb'" >> /usr/share/postgresql/postgresql.conf.sample

# Adicionar configuração do fuso horário ao PostgreSQL
RUN echo "timezone = 'America/Sao_Paulo'" >> /usr/share/postgresql/postgresql.conf.sample

# Expor a porta do PostgreSQL
EXPOSE 5432

# Inicializa o PostgreSQL e aplica as configurações
CMD ["postgres"]
