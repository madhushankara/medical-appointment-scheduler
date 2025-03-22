package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/madhushankara/medical-appointment-scheduler/internal/models"
	"gorm.io/gorm"
)

func getAllPatientsHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var patients []models.Patient

		result := db.Preload("User").Find(&patients)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch patients"})
			return
		}

		c.JSON(http.StatusOK, patients)
	}
}

func getPatientHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var patient models.Patient
		if err := db.Preload("User").First(&patient, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
			return
		}

		c.JSON(http.StatusOK, patient)
	}
}
