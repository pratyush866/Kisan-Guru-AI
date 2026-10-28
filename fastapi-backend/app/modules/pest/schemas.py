from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class PestReportCreate(BaseModel):
    crop_name: str = Field(..., example="Wheat")
    model_arch: Optional[str] = Field("efficientnet", example="yolo") # 'cnn', 'resnet', 'efficientnet', 'yolo', 'vit'
    location_lat: Optional[float] = Field(None, example=25.5941)
    location_lon: Optional[float] = Field(None, example=85.1376)

class PestReportOut(BaseModel):
    id: str
    user_id: str
    image_url: str
    pest_detected: str
    confidence: float
    severity: str
    damage_description: Optional[str]
    spread_risk_percentage: float
    treatment_plan_json: str # JSON details of controls
    crop_loss_percentage: float
    urgency_level: str
    location_latitude: Optional[float]
    location_longitude: Optional[float]
    is_favorite: bool
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class PestUpdate(BaseModel):
    notes: Optional[str] = None
    is_favorite: Optional[bool] = None

class PestFavoriteIn(BaseModel):
    is_favorite: bool

class PestLibraryItemOut(BaseModel):
    id: str
    pest_name: str
    scientific_name: str
    description: str
    damage_symptoms: str
    organic_control: str
    chemical_control: str
    biological_control: str
    mechanical_control: str
    ipm_strategy: str
    pesticide_name: str
    pesticide_dosage: str
    application_timing: str
    safety_precautions: str
    waiting_period_days: int
    crop_vulnerability: str

    class Config:
        from_attributes = True

class PestAnalyticsSummary(BaseModel):
    total_scans: int
    critical_count: int
    warning_count: int
    average_confidence: float
    pest_counts: Dict[str, int]
    severity_counts: Dict[str, int]
    crop_distribution: Dict[str, int]
    recent_alerts: List[Dict[str, Any]]
    trend_data: List[Dict[str, Any]]
