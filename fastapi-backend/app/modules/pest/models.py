import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class PestReport(Base):
    __tablename__ = "pest_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(512), nullable=False)
    pest_detected = Column(String(200), index=True, nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String(50), nullable=False) # 'Low', 'Medium', 'High', 'Critical'
    damage_description = Column(String(1000), nullable=True)
    spread_risk_percentage = Column(Float, nullable=False)
    treatment_plan_json = Column(String(4000), nullable=False) # Stores organic, chemical, biological, mechanical control details
    crop_loss_percentage = Column(Float, nullable=False)
    urgency_level = Column(String(50), nullable=False) # 'Low', 'Medium', 'High', 'Immediate'
    location_latitude = Column(Float, nullable=True)
    location_longitude = Column(Float, nullable=True)
    is_favorite = Column(Boolean, default=False, nullable=False)
    notes = Column(String(1000), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User")

class PestLibraryItem(Base):
    __tablename__ = "pest_library"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    pest_name = Column(String(100), unique=True, index=True, nullable=False)
    scientific_name = Column(String(150), nullable=False)
    description = Column(String(1000), nullable=False)
    damage_symptoms = Column(String(1000), nullable=False)
    organic_control = Column(String(1000), nullable=False)
    chemical_control = Column(String(1000), nullable=False)
    biological_control = Column(String(1000), nullable=False)
    mechanical_control = Column(String(1000), nullable=False)
    ipm_strategy = Column(String(1000), nullable=False)
    pesticide_name = Column(String(200), nullable=False)
    pesticide_dosage = Column(String(200), nullable=False)
    application_timing = Column(String(200), nullable=False)
    safety_precautions = Column(String(1000), nullable=False)
    waiting_period_days = Column(Integer, default=7, nullable=False)
    crop_vulnerability = Column(String(500), nullable=False)
