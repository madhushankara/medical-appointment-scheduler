package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/madhushankara/medical-appointment-scheduler/internal/api"
	"github.com/madhushankara/medical-appointment-scheduler/internal/db"
)

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Set default port if not specified
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize database
	database, err := db.InitDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize router
	router := gin.Default()

	// Configure CORS - fix to allow both local and production domains
	config := cors.DefaultConfig()

	// In production environment, use specific origins
	if os.Getenv("NODE_ENV") == "production" {
		config.AllowOrigins = []string{
			"https://medical-scheduler-client.herokuapp.com",
			"https://medical-scheduler-client-be935bd7ca55.herokuapp.com",
			"https://medical-scheduler-client-*.herokuapp.com", // Allow any Heroku app instance
		}
	} else {
		// In development environment, allow all origins
		config.AllowAllOrigins = true
	}

	// Common CORS settings
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	config.AllowCredentials = true

	router.Use(cors.New(config))

	// Setup health check endpoint
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":      "ok",
			"environment": os.Getenv("NODE_ENV"),
		})
	})

	// Setup routes
	api.SetupRoutes(router, database)

	// Start server
	log.Printf("Server starting on port %s", port)
	router.Run(":" + port)
}
