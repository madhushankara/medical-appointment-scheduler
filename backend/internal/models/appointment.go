package models

import (
    "time"

    "gorm.io/gorm"
)

type AppointmentStatus string

const (
    StatusScheduled AppointmentStatus = "scheduled"
    StatusCancelled AppointmentStatus = "cancelled"
    StatusCompleted AppointmentStatus = "completed"
)

type Appointment struct {
    gorm.Model
    PatientID    uint              `json:"patient_id"`
    Patient      Patient           `json:"patient"`
    DoctorID     uint              `json:"doctor_id"`
    Doctor       Doctor            `json:"doctor"`
    DateTime     time.Time         `json:"date_time"`
    Duration     int               `json:"duration"` // in minutes
    Status       AppointmentStatus `json:"status"`
    Reason       string            `json:"reason"`
    Notes        string            `json:"notes"`
    ChatSessionID uint              `json:"chat_session_id,omitempty"`
}