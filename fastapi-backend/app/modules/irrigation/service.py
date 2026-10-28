import math
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from app.modules.schemas import (
  IrrigationRecommendationInput,
  IrrigationRecommendationOut,
  ScheduleItem,
  IrrigationCalendarOut,
  WaterAnalyticsOut
)

class SmartIrrigationService:
  @staticmethod
  def estimate_et0(temp_c: float, humidity_pct: float, wind_speed_kmh: float, solar_rad: float) -> float:
    """
    Simplified Hargreaves/Penman-Monteith estimation of Reference Evapotranspiration (ET0) in mm/day.
    """
    # Hargreaves method approximation:
    # ET0 = 0.0023 * (Tmean + 17.8) * (Tmax - Tmin)^0.5 * Ra
    # We estimate Ra (extraterrestrial radiation) based on standard daily solar radiation.
    # Solar radiation in W/m2 to MJ/m2/day: rad * 0.0864
    solar_mj = solar_rad * 0.0864 if solar_rad > 0 else 15.0
    temp_factor = temp_c + 17.8
    humidity_factor = math.sqrt(max(0.1, 1.0 - (humidity_pct / 100.0)))
    wind_factor = 1.0 + 0.03 * wind_speed_kmh
    
    et0 = 0.0135 * temp_factor * solar_mj * humidity_factor * wind_factor
    return max(0.5, min(12.0, et0)) # Bound ET0 between 0.5mm and 12mm per day

  @staticmethod
  def get_crop_coefficient(crop_type: str, stage: str) -> float:
    """
    Returns the crop coefficient (Kc) based on crop growth stage.
    """
    stage_lower = stage.lower()
    # FAO standard growth stages: Initial, Vegetative, Flowering, Yield Formation, Ripening
    kc_map = {
      "initial": 0.35,
      "vegetative": 0.75,
      "flowering": 1.15,
      "yield formation": 0.85,
      "ripening": 0.45
    }
    
    # Crop specific adjustments
    crop_lower = crop_type.lower()
    base_kc = kc_map.get(stage_lower, 0.70)
    
    if "paddy" in crop_lower or "rice" in crop_lower:
      # Rice is highly water intensive
      return base_kc * 1.2
    elif "wheat" in crop_lower:
      return base_kc * 1.0
    elif "maize" in crop_lower or "corn" in crop_lower:
      return base_kc * 1.05
    elif "tomato" in crop_lower or "potato" in crop_lower:
      return base_kc * 0.95
    elif "sugarcane" in crop_lower:
      return base_kc * 1.25
    
    return base_kc

  @classmethod
  def calculate_irrigation_recommendation(
    cls, user_id: str, input_data: IrrigationRecommendationInput
  ) -> Dict[str, Any]:
    """
    Generates precision AI irrigation recommendation based on crop, soil, and weather vectors.
    """
    # 1. Fetch values
    temp = input_data.temperature if input_data.temperature is not None else 28.0
    humidity = input_data.humidity if input_data.humidity is not None else 60.0
    wind = input_data.wind_speed if input_data.wind_speed is not None else 8.0
    solar = input_data.solar_radiation if input_data.solar_radiation is not None else 450.0
    rainfall = input_data.rainfall if input_data.rainfall is not None else 0.0
    moisture = input_data.soil_moisture_pct
    field_size = input_data.field_size
    
    # 2. Calculate Reference ET0
    et0 = cls.estimate_et0(temp, humidity, wind, solar)
    kc = cls.get_crop_coefficient(input_data.crop_type, input_data.crop_stage)
    etc = et0 * kc # Crop Evapotranspiration in mm/day
    
    # 3. Water calculation based on soil depletion and ETc
    # Crop water requirement (mm to liters per acre: 1 mm = 4047 liters per acre)
    gross_water_needed_mm = max(0.0, etc - (rainfall * 0.8)) # 80% rainfall efficiency
    
    # Soil moisture depletion factor
    # Target moisture level: Loam: 60%, Clay: 70%, Sandy: 50%
    soil_lower = input_data.soil_type.lower()
    target_moisture = 60.0
    if "clay" in soil_lower:
      target_moisture = 75.0
    elif "sand" in soil_lower:
      target_moisture = 45.0
      
    moisture_depletion = max(0.0, (target_moisture - moisture) / target_moisture)
    
    # Calculate volume of water to apply
    liter_per_mm_per_acre = 4046.86
    base_requirement_liters = gross_water_needed_mm * field_size * liter_per_mm_per_acre
    depletion_requirement_liters = (target_moisture - moisture) * 0.1 * field_size * 20000.0 # Heuristic scaling
    
    total_water_liters = max(0.0, base_requirement_liters + depletion_requirement_liters)
    
    # Adjust for irrigation efficiency
    method = input_data.irrigation_method_pref
    efficiency = 0.90 # Drip default
    if method.lower() == "sprinkler":
      efficiency = 0.75
    elif method.lower() == "flood":
      efficiency = 0.50
      
    recommended_water = total_water_liters / efficiency
    
    # 4. Irrigation duration based on flow rate heuristic
    # Let's assume standard dripper discharge is 4 Liters per hour per meter
    # A standard pump flow rate for 1 acre: Drip: 15,000 L/h, Sprinkler: 25,000 L/h, Flood: 50,000 L/h
    flow_rates = {
      "drip": 15000.0,
      "sprinkler": 25000.0,
      "flood": 50000.0
    }
    pump_flow_rate = flow_rates.get(method.lower(), 15000.0)
    duration_hours = recommended_water / pump_flow_rate if recommended_water > 0 else 0
    duration_mins = int(math.ceil(duration_hours * 60))
    duration_mins = max(0, min(720, duration_mins)) # Cap at 12 hours
    
    # 5. Cost calculation
    # Electricity/diesel and water extraction cost approximation: Drip: 0.15 INR/L, Sprinkler: 0.20, Flood: 0.35
    cost_factors = {
      "drip": 0.05,
      "sprinkler": 0.08,
      "flood": 0.15
    }
    estimated_cost = recommended_water * cost_factors.get(method.lower(), 0.05)
    # Clamp cost according to farmer budget constraints
    if estimated_cost > input_data.farmer_budget:
      # Downscale recommendation or issue alternative watering suggestions
      recommended_water = recommended_water * (input_data.farmer_budget / estimated_cost)
      duration_mins = int(duration_mins * (input_data.farmer_budget / estimated_cost))
      estimated_cost = input_data.farmer_budget
      
    # 6. Confidence score
    # Lower confidence if weather forecast is missing or soil moisture values are extreme
    confidence = 0.95
    if moisture < 10.0 or moisture > 90.0:
      confidence -= 0.15
    if temp > 42.0 or temp < 5.0:
      confidence -= 0.10
      
    # 7. AI Explanation generation
    explanation_parts = [
      f"The recommended irrigation of {int(recommended_water):,} Liters is designed for your {input_data.crop_type} crop at the {input_data.crop_stage} stage.",
      f"Current soil moisture is {moisture}% against a target of {target_moisture}% for {input_data.soil_type} soil.",
      f"Reference crop evapotranspiration (ETc) is calculated as {etc:.2f} mm/day based on temperature ({temp}°C) and humidity ({humidity}%).",
      f"Using the {method} method, water is applied with {int(efficiency*100)}% efficiency."
    ]
    if rainfall > 0:
      explanation_parts.append(f"We deducted natural rain recharge ({rainfall} mm) from the active irrigation requirements.")
    if estimated_cost == input_data.farmer_budget and input_data.farmer_budget > 0:
      explanation_parts.append("The water quantity was optimized to fit within your specified budget constraints.")
      
    explanation = " ".join(explanation_parts)
    
    # Best watering time
    # Irrigate early morning (6:00 AM) or late evening (6:00 PM) to avoid high evaporation rates
    best_time = datetime.now(timezone.utc).replace(hour=18, minute=0, second=0, microsecond=0)
    if temp > 35.0:
      # If hot, early morning is better
      best_time = best_time.replace(hour=6)
    
    return {
      "user_id": user_id,
      "crop_id": input_data.crop_id,
      "crop_type": input_data.crop_type,
      "crop_stage": input_data.crop_stage,
      "soil_type": input_data.soil_type,
      "soil_moisture_pct": moisture,
      "recommended_water_liters": round(recommended_water, 1),
      "recommended_duration_minutes": duration_mins,
      "best_irrigation_time": best_time,
      "irrigation_method": method,
      "confidence_score": round(max(0.5, confidence), 2),
      "explanation": explanation
    }

  @staticmethod
  def calculate_soil_health_and_fertility(
    ph: float, moisture: float, temp: float, organic_matter: float,
    nitrogen: Optional[float], phosphorus: Optional[float], potassium: Optional[float],
    compaction: Optional[float], drainage: Optional[str]
  ) -> Dict[str, float]:
    """
    Precision agronomic scoring rules for Soil Health Index and Soil Fertility Index.
    """
    # 1. Soil Health Index (0 to 100)
    # Ideal pH: 6.0 to 7.2
    ph_score = 100.0 - abs(ph - 6.6) * 30.0
    ph_score = max(0.0, min(100.0, ph_score))
    
    # Ideal moisture: 40% to 70%
    if 40.0 <= moisture <= 70.0:
      moisture_score = 100.0
    else:
      moisture_score = 100.0 - min(80.0, abs(moisture - 55.0) * 2.0)
      
    # Organic matter target: >= 3.0%
    om = organic_matter if organic_matter is not None else 2.0
    om_score = min(100.0, (om / 3.0) * 100.0)
    
    # Compaction target: <= 150 PSI
    comp = compaction if compaction is not None else 120.0
    if comp <= 150.0:
      comp_score = 100.0
    else:
      comp_score = max(10.0, 100.0 - (comp - 150.0) * 0.4)
      
    # Drainage class
    drain_map = {"good": 100.0, "moderate": 80.0, "poor": 40.0}
    drain_score = drain_map.get((drainage or "good").lower(), 80.0)
    
    health_score = (
      0.25 * ph_score +
      0.25 * moisture_score +
      0.20 * om_score +
      0.15 * comp_score +
      0.15 * drain_score
    )
    
    # 2. Soil Fertility Index (0 to 100)
    # Reference targets: Nitrogen (N) = 80 kg/acre, Phosphorus (P) = 50 kg/acre, Potassium (K) = 60 kg/acre
    n_val = nitrogen if nitrogen is not None else 50.0
    p_val = phosphorus if phosphorus is not None else 30.0
    k_val = potassium if potassium is not None else 40.0
    
    n_score = min(100.0, (n_val / 80.0) * 100.0) if n_val > 0 else 40.0
    p_score = min(100.0, (p_val / 50.0) * 100.0) if p_val > 0 else 40.0
    k_score = min(100.0, (k_val / 60.0) * 100.0) if k_val > 0 else 40.0
    
    fertility_score = 0.4 * n_score + 0.3 * p_score + 0.3 * k_score
    
    return {
      "soil_health_score": round(health_score, 1),
      "soil_fertility_score": round(fertility_score, 1)
    }

  @classmethod
  def generate_irrigation_calendar(cls, crop_type: str, stage: str, field_size: float, method: str) -> Dict[str, List[ScheduleItem]]:
    """
    Generates personalized multi-scale calendars for normal, emergency, and developmental growth phases.
    """
    base_water = 12000.0 * field_size
    
    # Factor based on growth stages
    kc = cls.get_crop_coefficient(crop_type, stage)
    water_qty = round(base_water * kc, 0)
    
    daily = [
      ScheduleItem(day="Today", action=f"Irrigate at 6:00 PM ({method})", water_quantity_liters=water_qty, notes="Optimal soil moisture recharge window."),
      ScheduleItem(day="Tomorrow", action="Skip Irrigation", water_quantity_liters=0, notes="Maintain root zone aeration cycle.")
    ]
    
    weekly = [
      ScheduleItem(day="Monday", action=f"Irrigate ({method})", water_quantity_liters=water_qty, notes="Start of week deep watering."),
      ScheduleItem(day="Wednesday", action=f"Irrigate ({method})", water_quantity_liters=water_qty * 0.8, notes="Mid-week top-up watering."),
      ScheduleItem(day="Friday", action="Skip Irrigation", water_quantity_liters=0, notes="Evaluate soil compaction status.")
    ]
    
    monthly = [
      ScheduleItem(day="Week 1", action="Apply vegetative dosage", water_quantity_liters=water_qty * 3.5, notes="Align with early application schedules."),
      ScheduleItem(day="Week 2", action="Standard scheduling", water_quantity_liters=water_qty * 3, notes="Monitor soil reports regularly."),
      ScheduleItem(day="Week 3", action="Pre-flowering schedule", water_quantity_liters=water_qty * 4.2, notes="Ramp up moisture supply for bud formation."),
      ScheduleItem(day="Week 4", action="Skip-irrigation check", water_quantity_liters=0, notes="Prepare for growth transition checks.")
    ]
    
    seasonal = [
      ScheduleItem(day="Kharif Peak", action="Reduce canal water draft", water_quantity_liters=water_qty * 1.5, notes="Utilize natural monsoon moisture reserves."),
      ScheduleItem(day="Rabi Dry", action="Increase borewell pumping", water_quantity_liters=water_qty * 4, notes="Prevent high moisture stress during cold dry days.")
    ]
    
    growth_stage = [
      ScheduleItem(day="Initial Phase", action="Light misting drip", water_quantity_liters=water_qty * 0.4, notes="Protect early germinating seeds from root washouts."),
      ScheduleItem(day="Flowering Phase", action="Heavy saturation drip", water_quantity_liters=water_qty * 1.4, notes="Critical phase: drought now results in crop failure."),
      ScheduleItem(day="Ripening Phase", action="Dry down drying", water_quantity_liters=0, notes="Stop water to allow crop drying before harvest operations.")
    ]
    
    emergency = [
      ScheduleItem(day="Heat Wave Warning", action="Immediate extra cycle", water_quantity_liters=water_qty * 1.5, notes="Run sprinklers/drip early morning to reduce soil temperatures."),
      ScheduleItem(day="Heavy Rain Warning", action="Emergency Shutdown", water_quantity_liters=0, notes="Turn off irrigation controller immediately to prevent soil waterlogging.")
    ]
    
    return {
      "daily_schedule": daily,
      "weekly_schedule": weekly,
      "monthly_schedule": monthly,
      "seasonal_schedule": seasonal,
      "growth_stage_plan": growth_stage,
      "emergency_plan": emergency
    }

  @staticmethod
  def check_sensor_and_irrigation_alerts(
    latest_soil_moisture: Optional[float],
    weather_alert: Optional[str],
    tank_level: Optional[float],
    consecutive_constant_reads: int = 0
  ) -> List[Dict[str, str]]:
    """
    Analyzes physical metrics and compiles AI-driven diagnostic alerts.
    """
    alerts = []
    
    # 1. Soil alerts
    if latest_soil_moisture is not None:
      if latest_soil_moisture < 25.0:
        alerts.append({
          "type": "critical",
          "title": "Water Deficiency Alert",
          "message": f"Critical soil moisture depletion ({latest_soil_moisture}%). Fasal is showing signs of moisture stress. Activate irrigation immediately."
        })
      elif latest_soil_moisture < 40.0:
        alerts.append({
          "type": "warning",
          "title": "Under Irrigation Warning",
          "message": f"Soil moisture has dropped to {latest_soil_moisture}%. Schedule next irrigation cycle within 24 hours."
        })
      elif latest_soil_moisture > 85.0:
        alerts.append({
          "type": "warning",
          "title": "Over Irrigation Alert",
          "message": f"Excessive soil moisture ({latest_soil_moisture}%). Risk of root rot and oxygen deprivation. Suspend all watering."
        })
        
    # 2. Weather alerts
    if weather_alert:
      if "rain" in weather_alert.lower() or "monsoon" in weather_alert.lower():
        alerts.append({
          "type": "info",
          "title": "Rain Delay Triggered",
          "message": "Rainfall predicted. Delaying upcoming scheduled irrigation cycles by 24-48 hours to conserve water."
        })
      elif "heat" in weather_alert.lower() or "drought" in weather_alert.lower():
        alerts.append({
          "type": "critical",
          "title": "Drought / Heat Wave Warning",
          "message": "Heat wave warning active. Transpiration rates will spike. Apply extra soil cooling cycles."
        })
        
    # 3. Water tank alerts
    if tank_level is not None and tank_level < 20.0:
      alerts.append({
        "type": "critical",
        "title": "Water Tank Low",
        "message": f"Borewell/Water storage tank levels have dropped to {tank_level}%. Pump recharge cycle recommended."
      })
      
    # 4. Sensor status alerts
    if consecutive_constant_reads >= 5:
      alerts.append({
        "type": "critical",
        "title": "Sensor Failure Alert",
        "message": "Soil moisture sensor reports frozen readings. Inspect field cables and clean electrodes."
      })
      
    return alerts
