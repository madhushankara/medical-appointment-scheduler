package models

import (
    "gorm.io/gorm"
)

type Message struct {
    Role    string `json:"role"`
    Content string `json:"content"`
}

type ChatSession struct {
    gorm.Model
    AppointmentID uint   `json:"appointment_id"`
    Messages      string `json:"messages"` // JSON array of messages
}