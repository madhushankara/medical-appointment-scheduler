package db

import (
	"os"

	"github.com/madhushankara/medical-appointment-scheduler/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// InitDB initializes the database connection
func InitDB() (*gorm.DB, error) {
	var db *gorm.DB
	var err error

	dbType := os.Getenv("DB_TYPE")
	dbURL := os.Getenv("DATABASE_URL")

	if dbType == "postgres" {
		// Production: Use PostgreSQL
		db, err = gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	} else {
		// Development: Use SQLite
		db, err = gorm.Open(sqlite.Open(dbURL), &gorm.Config{})
	}

	if err != nil {
		return nil, err
	}

	// Auto migrate the schema
	db.AutoMigrate(&models.User{}, &models.Doctor{}, &models.Patient{}, &models.Appointment{}, &models.ChatSession{})

	return db, nil
}
