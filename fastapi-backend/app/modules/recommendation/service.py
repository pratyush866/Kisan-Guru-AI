import math
from typing import List, Dict, Any
from app.modules.schemas import RecommendationInput, CropRecommendationDetail

# Comprehensive knowledge database of Indian crops
CROP_PROFILES = [
  {
    "crop_name": "Rice (Paddy)",
    "season": "Kharif",
    "min_pH": 5.5,
    "max_pH": 7.0,
    "min_temp": 20.0,
    "max_temp": 38.0,
    "min_rainfall": 1200.0,
    "max_rainfall": 2500.0,
    "ideal_N": 100.0,
    "ideal_P": 50.0,
    "ideal_K": 50.0,
    "suitable_soils": ["Clay", "Loam", "Clayey Loam", "Silt Clay"],
    "water_requirement": "High",
    "growing_duration": "115 - 130 Days",
    "difficulty_level": "Medium",
    "base_investment": 15000.0, # INR per acre
    "base_yield": 2.2, # Tons per acre
    "mandi_price": 2183.0, # INR per quintal (1 Ton = 10 Quintals)
    "mandi_trend": "up",
    "historical_prices": [2040, 2080, 2120, 2150, 2183],
    "risk_level": "Medium (Pest Blight Risk)",
    "organic_suitability": "High",
    "government_support": "MSP Guaranteed procurement under NFSM, PM-FBY crop insurance cover.",
    "why_this_crop": "Excellent match for high-humidity monsoon parameters with clay/loam soils that retain water well.",
    "fertilizer_plan": "Basal dose: 50% N + 100% P + 100% K during transplanting. Remaining 50% N in two equal splits at tillering and panicle initiation.",
    "selling_advice": "Sell directly to Government APMC Mandis to lock in guaranteed MSP rates or store in dry grain stores if market price surges.",
    "storage_recommendation": "Store in hermetic bags. Keep moisture level below 13% to prevent toxic fungal grain mold."
  },
  {
    "crop_name": "Wheat",
    "season": "Rabi",
    "min_pH": 6.0,
    "max_pH": 7.5,
    "min_temp": 12.0,
    "max_temp": 25.0,
    "min_rainfall": 400.0,
    "max_rainfall": 800.0,
    "ideal_N": 120.0,
    "ideal_P": 60.0,
    "ideal_K": 50.0,
    "suitable_soils": ["Loam", "Clayey Loam", "Sandy Loam"],
    "water_requirement": "Medium",
    "growing_duration": "120 - 135 Days",
    "difficulty_level": "Low",
    "base_investment": 13000.0,
    "base_yield": 2.0,
    "mandi_price": 2275.0,
    "mandi_trend": "up",
    "historical_prices": [2125, 2150, 2200, 2250, 2275],
    "risk_level": "Low (Cold weather limits pests)",
    "organic_suitability": "Medium",
    "government_support": "Seed subsidy under Rashtriya Krishi Vikas Yojana (RKVY), MSP procurement.",
    "why_this_crop": "Matches cool-weather Rabi conditions. Highly resilient with robust market demand.",
    "fertilizer_plan": "Basal dose: 50% N + 100% P + 100% K during sowing. Top-dress remaining N at first irrigation (21 days) and jointing stage.",
    "selling_advice": "Wait for 2-3 months post-harvest; wheat prices typically appreciate by 15% in late summer.",
    "storage_recommendation": "Use dry, clean metal silos. Treat with standard bio-pesticides to prevent weevil infestations."
  },
  {
    "crop_name": "Cotton",
    "season": "Kharif",
    "min_pH": 6.0,
    "max_pH": 8.0,
    "min_temp": 22.0,
    "max_temp": 35.0,
    "min_rainfall": 500.0,
    "max_rainfall": 1000.0,
    "ideal_N": 100.0,
    "ideal_P": 50.0,
    "ideal_K": 40.0,
    "suitable_soils": ["Black Soil", "Black Cotton Soil", "Clayey Loam", "Loam"],
    "water_requirement": "Medium",
    "growing_duration": "150 - 180 Days",
    "difficulty_level": "High",
    "base_investment": 22000.0,
    "base_yield": 1.0,
    "mandi_price": 7020.0,
    "mandi_trend": "down",
    "historical_prices": [7500, 7400, 7250, 7100, 7020],
    "risk_level": "High (Pest susceptibility like Pink Bollworm)",
    "organic_suitability": "Low",
    "government_support": "CCI (Cotton Corporation of India) purchasing support, subsidy on certified Bt seeds.",
    "why_this_crop": "Ideally suited for deep black soils with good moisture retention during hot growing months.",
    "fertilizer_plan": "Basal dose: 30% N + 100% P + 100% K. Spray foliar nutrients during flowering for boll retention.",
    "selling_advice": "Sell to ginning mills when international fiber indexes rise. Avoid storing for over 6 months.",
    "storage_recommendation": "Store in elevated, dry, covered sheds. Keep free from any moisture to avoid fiber rotting or staining."
  },
  {
    "crop_name": "Maize",
    "season": "Kharif",
    "min_pH": 5.5,
    "max_pH": 7.5,
    "min_temp": 18.0,
    "max_temp": 32.0,
    "min_rainfall": 500.0,
    "max_rainfall": 1000.0,
    "ideal_N": 120.0,
    "ideal_P": 60.0,
    "ideal_K": 40.0,
    "suitable_soils": ["Loam", "Sandy Loam", "Clayey Loam"],
    "water_requirement": "Medium",
    "growing_duration": "95 - 110 Days",
    "difficulty_level": "Low",
    "base_investment": 11000.0,
    "base_yield": 2.4,
    "mandi_price": 2090.0,
    "mandi_trend": "up",
    "historical_prices": [1960, 2000, 2040, 2060, 2090],
    "risk_level": "Low",
    "organic_suitability": "High",
    "government_support": "PM-AASHA price support schemes, subsidized feed production licenses.",
    "why_this_crop": "Fast growing, low risk, and highly suitable for well-drained loam lands.",
    "fertilizer_plan": "Basal: 33% N + 100% P + 100% K. Apply remaining Nitrogen in two splits at knee-high and tasseling stages.",
    "selling_advice": "Can be sold to starch factories or poultry feed manufacturers directly for quick returns.",
    "storage_recommendation": "Dry to 14% moisture before packaging. Store in raised platforms to prevent rodent damage."
  },
  {
    "crop_name": "Potato",
    "season": "Rabi",
    "min_pH": 5.0,
    "max_pH": 6.5,
    "min_temp": 15.0,
    "max_temp": 22.0,
    "min_rainfall": 350.0,
    "max_rainfall": 600.0,
    "ideal_N": 120.0,
    "ideal_P": 80.0,
    "ideal_K": 120.0,
    "suitable_soils": ["Sandy Loam", "Silt Loam", "Loam"],
    "water_requirement": "Medium",
    "growing_duration": "90 - 110 Days",
    "difficulty_level": "Medium",
    "base_investment": 26000.0,
    "base_yield": 10.0, # Yield in tons is very high for tubers
    "mandi_price": 1450.0,
    "mandi_trend": "down",
    "historical_prices": [1650, 1600, 1550, 1500, 1450],
    "risk_level": "Medium (Late Blight fungus risk)",
    "organic_suitability": "Medium",
    "government_support": "Cold storage infrastructure subsidies (up to 35% capital cost) under MIDH scheme.",
    "why_this_crop": "Thrives in cool climates and sandy loam soils. Excellent choice for high-yield commercial farming.",
    "fertilizer_plan": "Apply 100% P, 50% N, and 50% K as basal. Balance N and K at earthing-up (30-35 days after planting).",
    "selling_advice": "Store in cold chain storage when supply saturates during harvest, then sell in summer when prices double.",
    "storage_recommendation": "Store in certified cold storages at 3°C - 4°C with 90% relative humidity."
  },
  {
    "crop_name": "Mustard",
    "season": "Rabi",
    "min_pH": 6.0,
    "max_pH": 7.5,
    "min_temp": 10.0,
    "max_temp": 25.0,
    "min_rainfall": 250.0,
    "max_rainfall": 500.0,
    "ideal_N": 80.0,
    "ideal_P": 40.0,
    "ideal_K": 30.0,
    "suitable_soils": ["Sandy Loam", "Loam", "Sandy"],
    "water_requirement": "Low",
    "growing_duration": "110 - 125 Days",
    "difficulty_level": "Low",
    "base_investment": 8000.0,
    "base_yield": 0.8,
    "mandi_price": 5450.0,
    "mandi_trend": "up",
    "historical_prices": [5050, 5150, 5250, 5380, 5450],
    "risk_level": "Low (Highly drought resistant)",
    "organic_suitability": "High",
    "government_support": "Drought support packages, seeds kits under National Mission on Oilseeds and Oil Palm.",
    "why_this_crop": "Requires very little water. Perfect for dry sandy-loam tracts with low winter rainfall.",
    "fertilizer_plan": "Basal: 100% P + 100% K + 50% N. Top dress remaining N during first irrigation at 30 days.",
    "selling_advice": "Oil millers buy directly at mandi gates; clean well to keep moisture below 8% for maximum price.",
    "storage_recommendation": "Store in dry gunny bags in ventilated, damp-proof structures."
  },
  {
    "crop_name": "Tomato",
    "season": "Rabi",
    "min_pH": 6.0,
    "max_pH": 7.0,
    "min_temp": 16.0,
    "max_temp": 28.0,
    "min_rainfall": 400.0,
    "max_rainfall": 800.0,
    "ideal_N": 100.0,
    "ideal_P": 60.0,
    "ideal_K": 80.0,
    "suitable_soils": ["Loam", "Sandy Loam", "Clayey Loam"],
    "water_requirement": "Medium",
    "growing_duration": "100 - 120 Days",
    "difficulty_level": "High",
    "base_investment": 30000.0,
    "base_yield": 12.0,
    "mandi_price": 2000.0,
    "mandi_trend": "up",
    "historical_prices": [1200, 1500, 1800, 2200, 2000],
    "risk_level": "High (Pest and price volatility)",
    "organic_suitability": "High",
    "government_support": "Subsidy on micro-irrigation lines under PMKSY, greenhouses infrastructure schemes.",
    "why_this_crop": "High value horticultural asset, responds exceptionally to micro-irrigation systems.",
    "fertilizer_plan": "Apply 100% P + 50% N + 50% K as basal. Balance N and K in weekly fertigations via drip irrigation.",
    "selling_advice": "Highly perishable. Tie up with processing units or retail distribution chains before harvesting.",
    "storage_recommendation": "Store at 10°C - 13°C. Do not store below 5°C to prevent chilling injury."
  },
  {
    "crop_name": "Chickpea (Gram)",
    "season": "Rabi",
    "min_pH": 6.0,
    "max_pH": 8.0,
    "min_temp": 15.0,
    "max_temp": 25.0,
    "min_rainfall": 300.0,
    "max_rainfall": 500.0,
    "ideal_N": 20.0, # Nitrogen fixing pulse!
    "ideal_P": 50.0,
    "ideal_K": 30.0,
    "suitable_soils": ["Clayey", "Loam", "Clayey Loam"],
    "water_requirement": "Low",
    "growing_duration": "110 - 120 Days",
    "difficulty_level": "Low",
    "base_investment": 9000.0,
    "base_yield": 0.8,
    "mandi_price": 5335.0,
    "mandi_trend": "up",
    "historical_prices": [4900, 5050, 5150, 5250, 5335],
    "risk_level": "Low (Enriches soil with Nitrogen)",
    "organic_suitability": "High",
    "government_support": "MSP procurement, pulses production incentive subsidy from NFSM.",
    "why_this_crop": "Low nitrogen requirement due to natural root nodule fixation. Excellent choice for rotation.",
    "fertilizer_plan": "Basal dose: 100% P + 100% K + 100% N. No top-dressing of nitrogen is required.",
    "selling_advice": "Sell directly at MSP to government portals. Storing for 3-4 months is safe if grain weevils are managed.",
    "storage_recommendation": "Store in hermetic silos. Maintain moisture under 10% to prevent pulse beetle attacks."
  }
]

class CropRecommendationService:

  @staticmethod
  def calculate_recommendations(inputs: RecommendationInput) -> List[CropRecommendationDetail]:
    results = []
    
    # Extract input values
    in_season = inputs.season.strip().lower()
    in_pH = inputs.pH
    in_N = inputs.N
    in_P = inputs.P
    in_K = inputs.K
    in_temp = inputs.temperature
    in_hum = inputs.humidity
    in_rain = inputs.rainfall
    in_soil = inputs.soil_type.strip().lower()
    in_irrigation = inputs.irrigation.strip().lower() == "yes" or inputs.irrigation.strip().lower() == "true"
    in_budget = inputs.budget
    in_organic = inputs.organic_pref.strip().lower()

    for crop in CROP_PROFILES:
      # 1. Season Filter check
      crop_season = crop["season"].strip().lower()
      # If season doesn't match, give a severe penalty but don't hard crash (unless totally incompatible)
      season_score = 1.0 if in_season == crop_season else 0.1
      
      # 2. pH Score (15% Weight)
      # Tolerance range is typically 0.5 around the min and max
      mid_pH = (crop["min_pH"] + crop["max_pH"]) / 2.0
      range_len = crop["max_pH"] - crop["min_pH"]
      deviation_pH = abs(in_pH - mid_pH)
      max_allowed_dev = (range_len / 2.0) + 1.0
      ph_score = max(0.0, 1.0 - (deviation_pH / max_allowed_dev))
      
      # 3. NPK Score (25% Weight)
      # RMS Normalized deviation
      dev_N = abs(in_N - crop["ideal_N"]) / max(crop["ideal_N"], 50.0)
      dev_P = abs(in_P - crop["ideal_P"]) / max(crop["ideal_P"], 30.0)
      dev_K = abs(in_K - crop["ideal_K"]) / max(crop["ideal_K"], 30.0)
      npk_error = math.sqrt((dev_N**2 + dev_P**2 + dev_K**2) / 3.0)
      npk_score = max(0.0, 1.0 - npk_error)

      # 4. Temperature Score (15% Weight)
      mid_temp = (crop["min_temp"] + crop["max_temp"]) / 2.0
      temp_range = crop["max_temp"] - crop["min_temp"]
      dev_temp = abs(in_temp - mid_temp)
      max_allowed_temp_dev = (temp_range / 2.0) + 5.0
      temp_score = max(0.0, 1.0 - (dev_temp / max_allowed_temp_dev))

      # 5. Rainfall Score (20% Weight)
      # If irrigation is YES, the rainfall deficit penalty is reduced by 70%
      mid_rain = (crop["min_rainfall"] + crop["max_rainfall"]) / 2.0
      rain_range = crop["max_rainfall"] - crop["min_rainfall"]
      dev_rain = abs(in_rain - mid_rain)
      
      if in_irrigation and in_rain < crop["min_rainfall"]:
        # Farmer can supply water water deficit
        effective_dev = dev_rain * 0.3
      else:
        effective_dev = dev_rain
        
      max_allowed_rain_dev = (rain_range / 2.0) + 300.0
      rain_score = max(0.0, 1.0 - (effective_dev / max_allowed_rain_dev))

      # 6. Soil Type Compatibility (15% Weight)
      # Check if input soil matches crop requirements
      soil_matches = [s.lower() for s in crop["suitable_soils"]]
      if in_soil in soil_matches:
        soil_score = 1.0
      elif any(in_soil in s or s in in_soil for s in soil_matches):
        soil_score = 0.6
      else:
        soil_score = 0.1

      # 7. Water availability & irrigation match (10% Weight)
      # If crop water needs are High and irrigation is NO, penalize
      if crop["water_requirement"].lower() == "high" and not in_irrigation:
        water_score = 0.2
      else:
        water_score = 1.0

      # Weighted Score Calculation
      weighted_score = (
        (season_score * 0.10) +
        (ph_score * 0.15) +
        (npk_score * 0.25) +
        (temp_score * 0.15) +
        (rain_score * 0.15) +
        (soil_score * 0.10) +
        (water_score * 0.10)
      )

      # Scale to 0-100% confidence
      confidence = round(weighted_score * 100.0, 1)
      if confidence > 99.0:
        confidence = 99.0
      elif confidence < 10.0:
        confidence = 10.0

      # Economics adjustments
      # Tweak investment details for farm size (all estimates are per acre)
      acres = inputs.farm_size
      total_investment = crop["base_investment"] * acres
      total_yield = crop["base_yield"] * acres
      
      # 1 Ton = 10 Quintals. Yield in Quintals = total_yield * 10
      yield_quintals = total_yield * 10.0
      gross_revenue = yield_quintals * crop["mandi_price"]
      net_profit = gross_revenue - total_investment

      # Factor in organic preference adjustments to profit and cost
      if in_organic == "organic":
        # Organic crops command 20% premium price, but investment drops by 15% (cheaper compost vs fertilizers)
        adjusted_investment = total_investment * 0.85
        adjusted_profit = (gross_revenue * 1.2) - adjusted_investment
        organic_suitability = "High (responds well to compost manure)"
      else:
        adjusted_investment = total_investment
        adjusted_profit = net_profit
        organic_suitability = crop["organic_suitability"]

      # Explainable AI matching flags
      xai_flags = {
        "pH_match": "Ideal" if (crop["min_pH"] <= in_pH <= crop["max_pH"]) else ("Acidic" if in_pH < crop["min_pH"] else "Alkaline"),
        "soil_match": "Compatible" if soil_score >= 0.6 else "Suboptimal",
        "rainfall_match": "Sufficient" if (in_rain >= crop["min_rainfall"] or in_irrigation) else "Deficit",
        "N_status": "Balanced" if (crop["ideal_N"] * 0.8 <= in_N <= crop["ideal_N"] * 1.2) else ("Low" if in_N < crop["ideal_N"] else "Excess"),
        "P_status": "Balanced" if (crop["ideal_P"] * 0.8 <= in_P <= crop["ideal_P"] * 1.2) else ("Low" if in_P < crop["ideal_P"] else "Excess"),
        "K_status": "Balanced" if (crop["ideal_K"] * 0.8 <= in_K <= crop["ideal_K"] * 1.2) else ("Low" if in_K < crop["ideal_K"] else "Excess"),
        "temperature_match": "Optimal" if (crop["min_temp"] <= in_temp <= crop["max_temp"]) else "Suboptimal",
        "season_match": "Matches" if season_score > 0.5 else "Incompatible"
      }

      # Budget check warning
      if adjusted_investment > in_budget:
        xai_flags["budget_warning"] = f"Estimated cost (₹{adjusted_investment:,.2f}) exceeds your budget (₹{in_budget:,.2f}). Seek crop loan subsidy."

      detail = CropRecommendationDetail(
        crop_name=crop["crop_name"],
        confidence=confidence,
        why_this_crop=crop["why_this_crop"],
        expected_yield=f"{crop['base_yield']:.1f} - {crop['base_yield'] + 0.5:.1f} Tons / Acre (Total: {total_yield:.1f} - {total_yield + (0.5 * acres):.1f} Tons)",
        estimated_investment=f"₹{crop['base_investment']:,.0f} / Acre (Total: ₹{adjusted_investment:,.0f})",
        estimated_profit=f"₹{adjusted_profit / acres:,.0f} / Acre (Total Net: ₹{adjusted_profit:,.0f})",
        growing_duration=crop["growing_duration"],
        suitable_soil=", ".join(crop["suitable_soils"]),
        water_requirement=crop["water_requirement"],
        fertilizer_plan=crop["fertilizer_plan"],
        market_demand="High" if crop["mandi_trend"] == "up" else "Moderate",
        risk_level=crop["risk_level"],
        difficulty_level=crop["difficulty_level"],
        organic_suitability=organic_suitability,
        government_support=crop["government_support"],
        explainable_ai=xai_flags,
        selling_advice=crop["selling_advice"],
        storage_recommendation=crop["storage_recommendation"],
        mandi_price=f"₹{crop['mandi_price']:,.0f} / Quintal",
        price_trend=crop["mandi_trend"],
        historical_prices=[float(p) for p in crop["historical_prices"]]
      )
      results.append(detail)

    # Sort results by confidence score in descending order
    results.sort(key=lambda x: x.confidence, reverse=True)
    return results[:3] # Return top 3 ranked recommendations
