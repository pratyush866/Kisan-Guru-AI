import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
  return str(uuid.uuid4())

class User(Base):
  __tablename__ = "users"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  phone = Column(String(20), unique=True, index=True, nullable=False)
  hashed_password = Column(String(128), nullable=False)
  role = Column(String(20), default="farmer", nullable=False)  # 'farmer', 'student', 'vet', 'helper', 'owner', 'admin'
  name = Column(String(100), nullable=False)
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

  crops = relationship("Crop", back_populates="user", cascade="all, delete-orphan")
  diagnostics = relationship("DiagnosticReport", back_populates="user", cascade="all, delete-orphan")
  listings = relationship("RentalListing", back_populates="owner", cascade="all, delete-orphan")
  bookings = relationship("RentalBooking", foreign_keys="[RentalBooking.tenant_id]", back_populates="tenant", cascade="all, delete-orphan")
  chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
  recommendation_histories = relationship("RecommendationHistory", back_populates="user", cascade="all, delete-orphan")
  water_records = relationship("WaterRecord", back_populates="user", cascade="all, delete-orphan")
  soil_reports = relationship("SoilReport", back_populates="user", cascade="all, delete-orphan")
  irrigation_histories = relationship("IrrigationHistory", back_populates="user", cascade="all, delete-orphan")
  irrigation_recommendations = relationship("IrrigationRecommendation", back_populates="user", cascade="all, delete-orphan")


class Crop(Base):
  __tablename__ = "crops"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  name = Column(String(100), nullable=False)
  variety = Column(String(100), nullable=True)
  sowing_date = Column(DateTime, nullable=False)
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

  user = relationship("User", back_populates="crops")
  diagnostics = relationship("DiagnosticReport", back_populates="crop")
  water_records = relationship("WaterRecord", back_populates="crop", cascade="all, delete-orphan")
  irrigation_histories = relationship("IrrigationHistory", back_populates="crop", cascade="all, delete-orphan")
  irrigation_recommendations = relationship("IrrigationRecommendation", back_populates="crop", cascade="all, delete-orphan")


class DiagnosticReport(Base):
  __tablename__ = "diagnostic_reports"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  crop_id = Column(String(36), ForeignKey("crops.id", ondelete="SET NULL"), nullable=True)
  image_url = Column(String(512), nullable=False)
  disease_detected = Column(String(200), nullable=False)
  confidence = Column(Float, nullable=False)
  remedy = Column(String(2000), nullable=False) # JSON or text details of the remedy card
  severity = Column(String(50), nullable=True) # 'Low', 'Medium', 'High', 'Critical'
  affected_area = Column(Float, nullable=True) # Percentage
  location_latitude = Column(Float, nullable=True)
  location_longitude = Column(Float, nullable=True)
  is_favorite = Column(Boolean, default=False, nullable=False)
  notes = Column(String(1000), nullable=True)
  report_json = Column(String(8000), nullable=True) # Detailed JSON payload storing extra annotations & treatments
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

  user = relationship("User", back_populates="diagnostics")
  crop = relationship("Crop", back_populates="diagnostics")


class RentalListing(Base):
  __tablename__ = "rental_listings"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  title = Column(String(200), nullable=False)
  description = Column(String(1000), nullable=False)
  price_per_hour = Column(Float, nullable=False)
  latitude = Column(Float, nullable=False)
  longitude = Column(Float, nullable=False)
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

  owner = relationship("User", back_populates="listings")
  bookings = relationship("RentalBooking", back_populates="listing", cascade="all, delete-orphan")


class RentalBooking(Base):
  __tablename__ = "rental_bookings"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  listing_id = Column(String(36), ForeignKey("rental_listings.id", ondelete="CASCADE"), nullable=False)
  tenant_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  status = Column(String(30), default="created", nullable=False)  # 'created', 'approved', 'paid', 'active', 'completed', 'reviewed'
  start_time = Column(DateTime, nullable=False)
  end_time = Column(DateTime, nullable=False)
  total_price = Column(Float, nullable=False)
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

  listing = relationship("RentalListing", back_populates="bookings")
  tenant = relationship("User", foreign_keys=[tenant_id], back_populates="bookings")


class ChatSession(Base):
  __tablename__ = "chat_sessions"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  title = Column(String(200), nullable=False)
  category = Column(String(50), default="General", nullable=False)
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

  user = relationship("User", back_populates="chat_sessions")
  messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
  __tablename__ = "chat_messages"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  session_id = Column(String(36), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
  sender = Column(String(10), nullable=False)  # 'user' or 'bot'
  text = Column(String(2000), nullable=False)
  data_json = Column(String(4000), nullable=True)  # Obfuscated or structured diagnostic JSON
  timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

  session = relationship("ChatSession", back_populates="messages")


class RecommendationHistory(Base):
  __tablename__ = "recommendation_histories"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  inputs_json = Column(String(4000), nullable=False)
  results_json = Column(String(4000), nullable=False)
  is_favorite = Column(Boolean, default=False, nullable=False)
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

  user = relationship("User", back_populates="recommendation_histories")


class WaterRecord(Base):
  __tablename__ = "water_records"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  crop_id = Column(String(36), ForeignKey("crops.id", ondelete="SET NULL"), nullable=True)
  water_applied_liters = Column(Float, nullable=False)
  irrigation_method = Column(String(50), nullable=False) # 'Drip', 'Sprinkler', 'Flood'
  source = Column(String(50), nullable=False) # 'Borewell', 'Canal', 'Rainwater', 'Water Tank'
  cost = Column(Float, default=0.0)
  duration_minutes = Column(Integer, nullable=False)
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

  user = relationship("User", back_populates="water_records")
  crop = relationship("Crop", back_populates="water_records")


class SoilReport(Base):
  __tablename__ = "soil_reports"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  soil_type = Column(String(50), nullable=False)
  moisture_pct = Column(Float, nullable=False)
  temperature_c = Column(Float, nullable=False)
  nitrogen = Column(Float, nullable=True)
  phosphorus = Column(Float, nullable=True)
  potassium = Column(Float, nullable=True)
  ph = Column(Float, nullable=False)
  organic_matter_pct = Column(Float, nullable=True)
  compaction_psi = Column(Float, nullable=True)
  drainage_class = Column(String(50), nullable=True) # 'Good', 'Moderate', 'Poor'
  water_holding_capacity_pct = Column(Float, nullable=True)
  soil_health_score = Column(Float, nullable=False)
  soil_fertility_score = Column(Float, nullable=False)
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

  user = relationship("User", back_populates="soil_reports")


class SensorData(Base):
  __tablename__ = "sensor_data"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  device_id = Column(String(100), nullable=False, index=True)
  sensor_type = Column(String(50), nullable=False) # 'moisture', 'temperature', 'humidity', 'water_level', 'flow_meter'
  value = Column(Float, nullable=False)
  timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class IrrigationHistory(Base):
  __tablename__ = "irrigation_histories"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  crop_id = Column(String(36), ForeignKey("crops.id", ondelete="SET NULL"), nullable=True)
  scheduled_time = Column(DateTime, nullable=True)
  actual_time = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
  water_applied_liters = Column(Float, nullable=False)
  status = Column(String(30), default="completed", nullable=False) # 'completed', 'skipped', 'delayed'
  notes = Column(String(500), nullable=True)

  user = relationship("User", back_populates="irrigation_histories")
  crop = relationship("Crop", back_populates="irrigation_histories")


class WeatherHistory(Base):
  __tablename__ = "weather_histories"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  location_name = Column(String(100), nullable=False)
  temperature_c = Column(Float, nullable=False)
  humidity_pct = Column(Float, nullable=False)
  wind_speed_kmh = Column(Float, nullable=False)
  solar_radiation_wm2 = Column(Float, nullable=True)
  rainfall_mm = Column(Float, default=0.0)
  evaporation_rate_mm = Column(Float, default=0.0)
  alert_type = Column(String(50), nullable=True) # 'Heavy Rain', 'Drought', 'Heat Wave', 'Cold Wave', etc.
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class IrrigationRecommendation(Base):
  __tablename__ = "irrigation_recommendations"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  crop_id = Column(String(36), ForeignKey("crops.id", ondelete="SET NULL"), nullable=True)
  crop_type = Column(String(100), nullable=False)
  crop_stage = Column(String(100), nullable=False)
  soil_type = Column(String(50), nullable=False)
  soil_moisture_pct = Column(Float, nullable=False)
  recommended_water_liters = Column(Float, nullable=False)
  recommended_duration_minutes = Column(Integer, nullable=False)
  best_irrigation_time = Column(DateTime, nullable=False)
  irrigation_method = Column(String(50), nullable=False)
  confidence_score = Column(Float, nullable=False)
  explanation = Column(String(2000), nullable=False) # Detailed description
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

  user = relationship("User", back_populates="irrigation_recommendations")
  crop = relationship("Crop", back_populates="irrigation_recommendations")

