package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/madhushankara/medical-appointment-scheduler/internal/models"
	"gorm.io/gorm"
)

type AppointmentRequest struct {
	PatientID uint      `json:"patient_id" binding:"required"`
	DoctorID  uint      `json:"doctor_id" binding:"required"`
	DateTime  time.Time `json:"date_time" binding:"required"`
	Duration  int       `json:"duration" binding:"required,min=15"`
	Reason    string    `json:"reason" binding:"required"`
}

func getAllAppointmentsHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var appointments []models.Appointment

		result := db.Preload("Patient.User").Preload("Doctor.User").Find(&appointments)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments"})
			return
		}

		c.JSON(http.StatusOK, appointments)
	}
}

func getAppointmentHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var appointment models.Appointment
		if err := db.Preload("Patient.User").Preload("Doctor.User").First(&appointment, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
			return
		}

		c.JSON(http.StatusOK, appointment)
	}
}

func createAppointmentHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req AppointmentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		appointment := models.Appointment{
			PatientID: req.PatientID,
			DoctorID:  req.DoctorID,
			DateTime:  req.DateTime,
			Duration:  req.Duration,
			Reason:    req.Reason,
			Status:    models.StatusScheduled,
		}

		if result := db.Create(&appointment); result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create appointment"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"id": appointment.ID})
	}
}

func updateAppointmentHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var appointment models.Appointment
		if err := db.First(&appointment, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
			return
		}

		var req AppointmentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		appointment.PatientID = req.PatientID
		appointment.DoctorID = req.DoctorID
		appointment.DateTime = req.DateTime
		appointment.Duration = req.Duration
		appointment.Reason = req.Reason

		if result := db.Save(&appointment); result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update appointment"})
			return
		}

		c.JSON(http.StatusOK, appointment)
	}
}

func deleteAppointmentHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		if err := db.Delete(&models.Appointment{}, id).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete appointment"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted successfully"})
	}
}
