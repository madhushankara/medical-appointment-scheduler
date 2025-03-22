package models

import (
    "gorm.io/gorm"
)

type UserRole string

const (
    RoleAdmin  UserRole = "admin"
    RoleDoctor UserRole = "doctor"
    RolePatient UserRole = "patient"
)

type User struct {
    gorm.Model
    Email    string   `gorm:"unique;not null" json:"email"`
    Password string   `json:"-"` // Password is never returned in JSON
    Name     string   `json:"name"`
    Role     UserRole `json:"role"`
}