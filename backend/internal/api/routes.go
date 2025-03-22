package api

import (
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

// SetupRoutes configures all API endpoints
func SetupRoutes(r *gin.Engine, db *gorm.DB) {
    // API group
    api := r.Group("/api")
    
    // Auth routes
    auth := api.Group("/auth")
    auth.POST("/register", registerHandler(db))
    auth.POST("/login", loginHandler(db))
    
    // Appointment routes
    appointments := api.Group("/appointments")
    appointments.GET("/", getAllAppointmentsHandler(db))
    appointments.GET("/:id", getAppointmentHandler(db))
    appointments.POST("/", createAppointmentHandler(db))
    appointments.PUT("/:id", updateAppointmentHandler(db))
    appointments.DELETE("/:id", deleteAppointmentHandler(db))
    
    // Doctors routes
    doctors := api.Group("/doctors")
    doctors.GET("/", getAllDoctorsHandler(db))
    doctors.GET("/:id", getDoctorHandler(db))
    
    // Patients routes
    patients := api.Group("/patients")
    patients.GET("/", getAllPatientsHandler(db))
    patients.GET("/:id", getPatientHandler(db))
    
    // AI Assistant routes
    assistant := api.Group("/assistant")
    assistant.POST("/chat", chatWithAssistantHandler(db))
}