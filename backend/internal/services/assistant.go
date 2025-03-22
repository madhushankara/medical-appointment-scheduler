package services

import (
    "bytes"
    "encoding/json"
    "errors"
    "fmt"
    "net/http"
    "os"
)

type HuggingFaceRequest struct {
    Inputs string `json:"inputs"`
}

type HuggingFaceResponse struct {
    GeneratedText string `json:"generated_text"`
}

// GetMedicalAssistantResponse calls Hugging Face API to get response from medical model
func GetMedicalAssistantResponse(userMessage string) (string, error) {
    apiKey := os.Getenv("HUGGINGFACE_API_KEY")
    if apiKey == "" {
        return "", errors.New("HUGGINGFACE_API_KEY is not set")
    }

    // Use a medical model that's optimized for medical conversations
    // You can replace this with a specific medical model
    modelEndpoint := "https://api-inference.huggingface.co/models/medalpaca/medical-assistant"

    // Create request payload
    promptText := fmt.Sprintf("User: %s\nMedical Assistant:", userMessage)
    requestBody := HuggingFaceRequest{
        Inputs: promptText,
    }
    
    jsonData, err := json.Marshal(requestBody)
    if err != nil {
        return "", err
    }

    // Create HTTP request
    req, err := http.NewRequest("POST", modelEndpoint, bytes.NewBuffer(jsonData))
    if err != nil {
        return "", err
    }

    req.Header.Set("Authorization", "Bearer "+apiKey)
    req.Header.Set("Content-Type", "application/json")

    // Send request
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    // Check response status
    if resp.StatusCode != http.StatusOK {
        return "", fmt.Errorf("API request failed with status code: %d", resp.StatusCode)
    }

    // Parse response
    var response []HuggingFaceResponse
    if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
        return "", err
    }

    if len(response) == 0 {
        return "", errors.New("empty response from API")
    }

    return response[0].GeneratedText, nil
}