package models

import (
    "gorm.io/gorm"
)

type Patient struct {
    gorm.Model
    UserID    uint   `json:"user_id"`
    User      User   `json:"user"`
    Phone     string `json:"phone"`
    Address   string `json:"address"`
    MedicalID string `json:"medical_id"`
}