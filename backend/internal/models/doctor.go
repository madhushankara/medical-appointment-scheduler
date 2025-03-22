package models

import (
    "gorm.io/gorm"
)

type Doctor struct {
    gorm.Model
    UserID      uint   `json:"user_id"`
    User        User   `json:"user"`
    Specialty   string `json:"specialty"`
    Description string `json:"description"`
}