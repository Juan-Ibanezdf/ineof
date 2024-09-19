package store

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NewDB(databaseURL string) (*pgxpool.Pool, error) {
	conn, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		return nil, err
	}
	return conn, nil
}
