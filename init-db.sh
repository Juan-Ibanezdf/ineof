#!/bin/bash
set -e

# Atualiza a configuração do PostgreSQL
psql -U postgres -d datalake -c "ALTER DATABASE datalake SET timezone TO 'America/Sao_Paulo';"
