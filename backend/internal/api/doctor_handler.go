package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/madhushankara/medical-appointment-scheduler/internal/models"
	"gorm.io/gorm"
)

func getAllDoctorsHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var doctors []models.Doctor

		result := db.Preload("User").Find(&doctors)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch doctors"})
			return
		}

		c.JSON(http.StatusOK, doctors)
	}
}

func getDoctorHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var doctor models.Doctor
		if err := db.Preload("User").First(&doctor, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Doctor not found"})
			return
		}

		c.JSON(http.StatusOK, doctor)
	}
}
