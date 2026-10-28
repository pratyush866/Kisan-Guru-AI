from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# --- AUTHENTICATION SCHEMAS ---

class UserCreate(BaseModel):
  phone: str = Field(..., example="+919876543210")
  password: str = Field(..., min_length=6, example="my_secure_password_123")
  name: str = Field(..., example="Ramesh Kumar")
  role: Optional[str] = Field("farmer", description="One of: farmer, student, vet, helper, owner, admin")

class UserLogin(BaseModel):
  phone: str = Field(..., example="+919876543210")
  password: str = Field(..., example="my_secure_password_123")

class UserOut(BaseModel):
  id: str
  phone: str
  name: str
  role: str
  created_at: datetime

  class Config:
    from_attributes = True

class Token(BaseModel):
  access_token: str
  refresh_token: str
  token_type: str = "bearer"

class TokenRefresh(BaseModel):
  refresh_token: str


# --- CROP & DIAGNOSTICS SCHEMAS ---

class CropCreate(BaseModel):
  name: str = Field(..., example="Wheat")
  variety: Optional[str] = Field(None, example="HD-2967")
  sowing_date: datetime

class CropOut(BaseModel):
  id: str
  user_id: str
  name: str
  variety: Optional[str]
  sowing_date: datetime
  created_at: datetime

  class Config:
    from_attributes = True

class DiagnosticCreate(BaseModel):
  crop_id: Optional[str] = None
  image_url: str
  disease_detected: str
  confidence: float
  remedy: str
  severity: Optional[str] = "Medium"
  affected_area: Optional[float] = 0.0
  location_latitude: Optional[float] = None
  location_longitude: Optional[float] = None
  notes: Optional[str] = None
  report_json: Optional[str] = None

class DiagnosticOut(BaseModel):
  id: str
  user_id: str
  crop_id: Optional[str]
  image_url: str
  disease_detected: str
  confidence: float
  remedy: str
  severity: Optional[str]
  affected_area: Optional[float]
  location_latitude: Optional[float]
  location_longitude: Optional[float]
  is_favorite: bool
  notes: Optional[str]
  report_json: Optional[str]
  created_at: datetime

  class Config:
    from_attributes = True

class DiagnosticUpdate(BaseModel):
  notes: Optional[str] = None
  is_favorite: Optional[bool] = None

class DiseaseLibraryItem(BaseModel):
  id: str
  crop: str
  disease: str
  description: str
  cause: str
  symptoms: str
  organic_treatment: str
  chemical_treatment: str
  pesticide_name: str
  pesticide_dosage: str
  application_timing: str
  preventive_measures: str
  recovery_time: str
  yield_impact: str

class AnalyticsSummary(BaseModel):
  total_scans: int
  healthy_count: int
  infected_count: int
  average_confidence: float
  disease_counts: dict
  severity_counts: dict
  crop_distribution: dict
  recent_alerts: List[dict]
  trend_data: List[dict]


# --- RENTAL SCHEMAS ---

class RentalListingCreate(BaseModel):
  title: str = Field(..., example="Mahindra Tractor 575 DI")
  description: str = Field(..., example="Available with rota-vator for plowing. Good condition.")
  price_per_hour: float = Field(..., example=800.0)
  latitude: float = Field(..., example=25.5941)
  longitude: float = Field(..., example=85.1376)

class RentalListingOut(BaseModel):
  id: str
  owner_id: str
  title: str
  description: str
  price_per_hour: float
  latitude: float
  longitude: float
  created_at: datetime

  class Config:
    from_attributes = True

class RentalBookingCreate(BaseModel):
  listing_id: str
  start_time: datetime
  end_time: datetime

class RentalBookingOut(BaseModel):
  id: str
  listing_id: str
  tenant_id: str
  status: str
  start_time: datetime
  end_time: datetime
  total_price: float
  created_at: datetime

  class Config:
    from_attributes = True


# --- AI ASSISTANT SCHEMAS ---

class ChatQuery(BaseModel):
  query: str = Field(..., example="Why are my wheat leaves turning yellow?")
  language: str = Field("english", example="hindi")
  api_key: Optional[str] = Field(None, description="Optional user-provided Gemini API key")


class AdviceDetail(BaseModel):
  problem: str
  reason: str
  solution: str
  prevention: str
  cost: str
  expectedResult: str
  expertTip: str
  warning: str

class ChatResponse(BaseModel):
  category: str
  data: AdviceDetail
  timestamp: str


# --- CROP RECOMMENDATION SCHEMAS ---

class RecommendationInput(BaseModel):
  name: str = Field(..., example="Ramgarh Farm")
  state: str = Field(..., example="Bihar")
  district: str = Field(..., example="Patna")
  farm_size: float = Field(..., gt=0.0, example=2.5)
  soil_type: str = Field(..., example="Loam")
  pH: float = Field(..., ge=0.0, le=14.0, example=6.5)
  N: float = Field(..., ge=0.0, example=80.0)
  P: float = Field(..., ge=0.0, example=50.0)
  K: float = Field(..., ge=0.0, example=50.0)
  temperature: float = Field(..., example=28.0)
  humidity: float = Field(..., ge=0.0, le=100.0, example=70.0)
  rainfall: float = Field(..., ge=0.0, example=1200.0)
  season: str = Field(..., example="Kharif")
  water_source: str = Field(..., example="Borewell")
  irrigation: str = Field(..., example="yes")
  budget: float = Field(..., ge=0.0, example=15000.0)
  organic_pref: str = Field(..., example="organic")
  prev_crop: str = Field(..., example="Wheat")
  notes: Optional[str] = Field(None, example="High pest reports in nearby fields.")

class CropRecommendationDetail(BaseModel):
  crop_name: str
  confidence: float
  why_this_crop: str
  expected_yield: str
  estimated_investment: str
  estimated_profit: str
  growing_duration: str
  suitable_soil: str
  water_requirement: str
  fertilizer_plan: str
  market_demand: str
  risk_level: str
  difficulty_level: str
  organic_suitability: str
  government_support: str
  explainable_ai: dict
  selling_advice: str
  storage_recommendation: str
  mandi_price: str
  price_trend: str
  historical_prices: List[float]

class RecommendationResponse(BaseModel):
  id: str
  recommendations: List[CropRecommendationDetail]
  created_at: datetime

  class Config:
    from_attributes = True

class RecommendationHistoryOut(BaseModel):
  id: str
  inputs: dict
  results: dict
  is_favorite: bool
  created_at: datetime

  class Config:
    from_attributes = True

class RecommendationFavoriteIn(BaseModel):
  is_favorite: bool


# --- SMART IRRIGATION & WATER MANAGEMENT SCHEMAS ---

class WaterRecordCreate(BaseModel):
  crop_id: Optional[str] = None
  water_applied_liters: float = Field(..., gt=0.0, example=500.0)
  irrigation_method: str = Field(..., example="Drip") # Drip, Sprinkler, Flood
  source: str = Field(..., example="Borewell") # Borewell, Canal, Rainwater, Water Tank
  cost: Optional[float] = Field(0.0, example=150.0)
  duration_minutes: int = Field(..., gt=0, example=30)

class WaterRecordOut(BaseModel):
  id: str
  user_id: str
  crop_id: Optional[str]
  water_applied_liters: float
  irrigation_method: str
  source: str
  cost: float
  duration_minutes: int
  created_at: datetime

  class Config:
    from_attributes = True

class SoilReportCreate(BaseModel):
  soil_type: str = Field(..., example="Loam")
  moisture_pct: float = Field(..., ge=0.0, le=100.0, example=45.2)
  temperature_c: float = Field(..., example=24.5)
  nitrogen: Optional[float] = Field(None, example=45.0)
  phosphorus: Optional[float] = Field(None, example=35.0)
  potassium: Optional[float] = Field(None, example=30.0)
  ph: float = Field(..., ge=0.0, le=14.0, example=6.8)
  organic_matter_pct: Optional[float] = Field(None, example=2.5)
  compaction_psi: Optional[float] = Field(None, example=150.0)
  drainage_class: Optional[str] = Field(None, example="Good") # Good, Moderate, Poor
  water_holding_capacity_pct: Optional[float] = Field(None, example=60.0)

class SoilReportOut(BaseModel):
  id: str
  user_id: str
  soil_type: str
  moisture_pct: float
  temperature_c: float
  nitrogen: Optional[float]
  phosphorus: Optional[float]
  potassium: Optional[float]
  ph: float
  organic_matter_pct: Optional[float]
  compaction_psi: Optional[float]
  drainage_class: Optional[str]
  water_holding_capacity_pct: Optional[float]
  soil_health_score: float
  soil_fertility_score: float
  created_at: datetime

  class Config:
    from_attributes = True

class SensorDataCreate(BaseModel):
  device_id: str = Field(..., example="ESP32_FIELD_A_01")
  sensor_type: str = Field(..., example="moisture") # moisture, temperature, humidity, water_level, flow_meter
  value: float = Field(..., example=42.5)

class SensorDataOut(BaseModel):
  id: str
  device_id: str
  sensor_type: str
  value: float
  timestamp: datetime

  class Config:
    from_attributes = True

class WeatherHistoryCreate(BaseModel):
  location_name: str = Field(..., example="Patna")
  temperature_c: float = Field(..., example=31.2)
  humidity_pct: float = Field(..., example=72.0)
  wind_speed_kmh: float = Field(..., example=12.5)
  solar_radiation_wm2: Optional[float] = Field(None, example=650.0)
  rainfall_mm: float = Field(0.0, example=5.0)
  evaporation_rate_mm: float = Field(0.0, example=4.2)
  alert_type: Optional[str] = Field(None, example="None")

class WeatherHistoryOut(BaseModel):
  id: str
  location_name: str
  temperature_c: float
  humidity_pct: float
  wind_speed_kmh: float
  solar_radiation_wm2: Optional[float]
  rainfall_mm: float
  evaporation_rate_mm: float
  alert_type: Optional[str]
  created_at: datetime

  class Config:
    from_attributes = True

class IrrigationRecommendationInput(BaseModel):
  crop_id: Optional[str] = Field(None, example="crop-uuid-999")
  crop_type: str = Field(..., example="Wheat")
  crop_stage: str = Field(..., example="Vegetative") # Initial, Vegetative, Flowering, Yield Formation, Ripening
  soil_type: str = Field(..., example="Loam")
  soil_moisture_pct: float = Field(..., ge=0.0, le=100.0, example=35.0)
  temperature: Optional[float] = Field(None, example=30.0)
  humidity: Optional[float] = Field(None, example=65.0)
  rainfall: Optional[float] = Field(None, example=0.0)
  wind_speed: Optional[float] = Field(None, example=10.0)
  solar_radiation: Optional[float] = Field(None, example=500.0)
  field_size: float = Field(..., gt=0.0, example=2.5) # in acres
  water_availability: float = Field(..., gt=0.0, example=10000.0) # in liters
  ground_water_level: Optional[float] = Field(None, example=15.0) # in meters
  canal_water: bool = Field(default=False)
  irrigation_method_pref: str = Field("Drip", example="Drip") # Drip, Sprinkler, Flood
  farmer_budget: float = Field(..., ge=0.0, example=5000.0)

class IrrigationRecommendationOut(BaseModel):
  id: str
  user_id: str
  crop_id: Optional[str]
  crop_type: str
  crop_stage: str
  soil_type: str
  soil_moisture_pct: float
  recommended_water_liters: float
  recommended_duration_minutes: int
  best_irrigation_time: datetime
  irrigation_method: str
  confidence_score: float
  explanation: str
  created_at: datetime

  class Config:
    from_attributes = True

class ScheduleItem(BaseModel):
  day: str # e.g. "Monday", "Growth Stage Day 10"
  action: str # "Irrigate for 30 mins", "No Irrigation"
  water_quantity_liters: float
  notes: str

class IrrigationCalendarOut(BaseModel):
  daily_schedule: List[ScheduleItem]
  weekly_schedule: List[ScheduleItem]
  monthly_schedule: List[ScheduleItem]
  seasonal_schedule: List[ScheduleItem]
  growth_stage_plan: List[ScheduleItem]
  emergency_plan: List[ScheduleItem]

class WaterAnalyticsOut(BaseModel):
  total_water_used_liters: float
  total_water_saved_liters: float
  water_efficiency_score: float # 0 to 100
  expected_savings_pct: float
  monthly_usage_liters: List[float] # usage values for past months
  crop_wise_usage: dict
  farm_wise_usage: dict


