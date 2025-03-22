package api

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/madhushankara/medical-appointment-scheduler/internal/models"
	"github.com/madhushankara/medical-appointment-scheduler/internal/services"
	"gorm.io/gorm"
)

type ChatRequest struct {
	AppointmentID uint   `json:"appointment_id"`
	Message       string `json:"message" binding:"required"`
}

type ChatResponse struct {
	Response string `json:"response"`
}

func chatWithAssistantHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req ChatRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Get AI response from Hugging Face
		aiResponse, err := services.GetMedicalAssistantResponse(req.Message)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get AI response: " + err.Error()})
			return
		}

		// If appointment ID is provided, store this conversation
		if req.AppointmentID > 0 {
			// Check if a chat session exists for this appointment
			var chatSession models.ChatSession
			result := db.Where("appointment_id = ?", req.AppointmentID).First(&chatSession)

			if result.Error == nil {
				// Chat session exists, append to it
				var messages []models.Message
				json.Unmarshal([]byte(chatSession.Messages), &messages)

				// Add user message
				messages = append(messages, models.Message{Role: "user", Content: req.Message})
				// Add AI response
				messages = append(messages, models.Message{Role: "assistant", Content: aiResponse})

				// Update in database
				messagesJSON, _ := json.Marshal(messages)
				chatSession.Messages = string(messagesJSON)
				db.Save(&chatSession)
			} else {
				// Create new chat session
				messages := []models.Message{
					{Role: "user", Content: req.Message},
					{Role: "assistant", Content: aiResponse},
				}
				messagesJSON, _ := json.Marshal(messages)

				newChatSession := models.ChatSession{
					AppointmentID: req.AppointmentID,
					Messages:      string(messagesJSON),
				}
				db.Create(&newChatSession)
			}
		}

		c.JSON(http.StatusOK, ChatResponse{
			Response: aiResponse,
		})
	}
}
