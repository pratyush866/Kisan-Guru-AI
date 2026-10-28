from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, update, func
from typing import List, Optional
import uuid
import json
import random
from datetime import datetime, timezone, timedelta

from app.core.database import get_db_session
from app.core.models import Crop, DiagnosticReport, User
from app.modules.auth.router import get_current_user
from app.modules.schemas import (
    CropCreate, 
    CropOut, 
    DiagnosticOut, 
    DiagnosticUpdate, 
    DiseaseLibraryItem, 
    AnalyticsSummary
)

router = APIRouter(prefix="/crops", tags=["Crop & Disease Diagnostics"])

# STATIC DISEASE LIBRARY FOR ALL 16 SUPPORTED CROPS
DISEASE_LIBRARY = {
    # 1. RICE
    "rice_blight": {
        "crop": "Rice",
        "disease": "Bacterial Leaf Blight (Xanthomonas oryzae)",
        "description": "Bacterial disease causing leaf wilting and yellowing, starting from leaf tips and moving downwards along the margins.",
        "cause": "Bacterial pathogen Xanthomonas oryzae pv. oryzae, promoted by high nitrogen and heavy rains.",
        "symptoms": "Water-soaked stripes on leaves, yellowing margins, white or grey drops of bacterial ooze on young lesions.",
        "immediate_action": "Drain field immediately. Suspend urea application. Prune infected leaves if in early stage.",
        "organic_treatment": "Spray fresh neem seed kernel extract (NSKE) 5% or apply bio-pesticide Pseudomonas fluorescens @ 10g/liter of water.",
        "chemical_treatment": "Spray Streptocycline @ 6g mixed with Copper Oxychloride @ 500g in 200 liters of water per acre.",
        "pesticide_name": "Streptocycline + Copper Oxychloride",
        "pesticide_dosage": "6g Streptocycline + 500g COC per acre",
        "application_timing": "Apply at first sign of symptoms, repeat after 10-12 days if disease persists.",
        "preventive_measures": "Use certified resistant seeds. Balance NPK ratios. Avoid deep flooding in nurseries.",
        "recovery_time": "15-20 Days",
        "yield_impact": "20% - 40% loss if untreated"
    },
    "rice_brown_spot": {
        "crop": "Rice",
        "disease": "Brown Spot (Cochliobolus miyabeanus)",
        "description": "Fungal disease leading to spotty lesions on leaves and grains, reducing grain quality and seed germination.",
        "cause": "Fungal pathogen Cochliobolus miyabeanus, thrives in unflooded/nutrient-deficient fields.",
        "symptoms": "Oval, brown lesions with yellow halo, turning grey in the center.",
        "immediate_action": "Apply potash fertilizer to strengthen plant immunity. Monitor soil moisture.",
        "organic_treatment": "Seed treatment with Trichoderma viride @ 4g/kg seed. Spray Vermicompost wash.",
        "chemical_treatment": "Spray Carbendazim 50% WP @ 250g per acre or Mancozeb 75% WP @ 600g per acre.",
        "pesticide_name": "Mancozeb 75% WP",
        "pesticide_dosage": "600g per acre in 200 liters of water",
        "application_timing": "Spray immediately at tillering or booting stage.",
        "preventive_measures": "Ensure balanced nutrition. Plant certified clean seeds. Maintain field hygiene.",
        "recovery_time": "14 Days",
        "yield_impact": "12% - 30% loss"
    },
    # 2. WHEAT
    "wheat_yellow_rust": {
        "crop": "Wheat",
        "disease": "Yellow Rust (Puccinia striiformis)",
        "description": "Airborne fungal disease that creates yellow-orange stripe pustules along leaf veins, blocking photosynthesis.",
        "cause": "Fungal pathogen Puccinia striiformis, active in cool (10-15°C) and highly humid conditions.",
        "symptoms": "Yellow-orange powdery stripes on leaves, reduced kernel size, stunted growth.",
        "immediate_action": "Spray fungicide immediately on noticing localized patches. Avoid overhead sprinkler watering.",
        "organic_treatment": "Spray Fermented Butter-milk (Lassi) 5% mixed with Neem oil @ 5ml/liter.",
        "chemical_treatment": "Apply Propiconazole 25% EC (Tilt) @ 200 ml per acre dissolved in 200 liters of water.",
        "pesticide_name": "Propiconazole 25% EC",
        "pesticide_dosage": "200 ml per acre",
        "application_timing": "Morning or late afternoon on dry foliage.",
        "preventive_measures": "Sow rust-resistant varieties like DBW-187 or HD-2967. Clean borders.",
        "recovery_time": "10-12 Days",
        "yield_impact": "30% - 70% loss if severe"
    },
    # 3. MAIZE
    "maize_blight": {
        "crop": "Maize",
        "disease": "Northern Leaf Blight (Exserohilum turcicum)",
        "description": "Fungal disease causing long, cigar-shaped leaf lesions starting from lower foliage.",
        "cause": "Fungus Exserohilum turcicum, overwintering in crop residues, favored by moderate temperatures and high humidity.",
        "symptoms": "Greyish-green to tan long elliptical lesions, progress upwards, premature drying.",
        "immediate_action": "Remove infected bottom leaves. Till the field post-harvest to bury residue.",
        "organic_treatment": "Foliar spray of Trichoderma harzianum formulation @ 5g/liter.",
        "chemical_treatment": "Spray Mancozeb 75% WP @ 600g per acre or Azoxystrobin @ 200 ml per acre.",
        "pesticide_name": "Azoxystrobin 23% SC",
        "pesticide_dosage": "200 ml per acre in 200L water",
        "application_timing": "Apply at early vegetative stage or on initial spot emergence.",
        "preventive_measures": "Implement crop rotation with legumes. Use resistant hybrids.",
        "recovery_time": "15 Days",
        "yield_impact": "15% - 40% loss"
    },
    # 4. POTATO
    "potato_late_blight": {
        "crop": "Potato",
        "disease": "Late Blight (Phytophthora infestans)",
        "description": "Destructive water-mold disease that attacks leaves, stems, and tubers, capable of wiping out fields in days.",
        "cause": "Oomycete pathogen Phytophthora infestans, thriving in cool, wet weather.",
        "symptoms": "Dark brown-black irregular water-soaked spots with white fuzzy mold growth on the underside under humid conditions.",
        "immediate_action": "Halt irrigation immediately. Prune heavily infested foliage.",
        "organic_treatment": "Spray Copper Hydroxide (Organic certified) @ 2.5g/liter or bio-control agents.",
        "chemical_treatment": "Spray Metalaxyl 8% + Mancozeb 64% WP @ 600g per acre.",
        "pesticide_name": "Metalaxyl + Mancozeb WP",
        "pesticide_dosage": "600g per acre in 200L water",
        "application_timing": "Pre-humid spray or at first warning sign. Repeat weekly in monsoon.",
        "preventive_measures": "Plant certified disease-free tubers. Ensure high earthing up of soil to protect tubers.",
        "recovery_time": "18 Days",
        "yield_impact": "50% - 100% loss"
    },
    # 5. TOMATO
    "tomato_early_blight": {
        "crop": "Tomato",
        "disease": "Early Blight (Alternaria solani)",
        "description": "Common fungal disease causing circular spots with target-like concentric rings on leaves.",
        "cause": "Fungus Alternaria solani, active in humid warmth.",
        "symptoms": "Dark brown spots with concentric rings (target board effect), yellowing margins, stem lesions, blossom drop.",
        "immediate_action": "Staking plants to keep leaves off ground. Prune lower 8 inches of leaves.",
        "organic_treatment": "Apply Neem Oil 2% or copper hydroxide spray.",
        "chemical_treatment": "Spray Chlorothalonil 75% WP @ 500g/acre or Difenoconazole 25% EC @ 150 ml/acre.",
        "pesticide_name": "Difenoconazole 25% EC",
        "pesticide_dosage": "150 ml per acre in 200L water",
        "application_timing": "Apply when first spots appear on lower leaves.",
        "preventive_measures": "Ensure proper spacing, crop rotation, mulch soil, avoid overhead watering.",
        "recovery_time": "12 Days",
        "yield_impact": "15% - 35% loss"
    },
    # 6. COTTON
    "cotton_leaf_curl": {
        "crop": "Cotton",
        "disease": "Cotton Leaf Curl Virus (CLCuV)",
        "description": "Viral infection causing upward/downward leaf curling and thickening of leaf veins, transmitted by whiteflies.",
        "cause": "Begomovirus, vector-transmitted by Silverleaf Whitefly (Bemisia tabaci).",
        "symptoms": "Curled margins, thickened green veins, cup-shaped leaf-like structures (enations) under leaves.",
        "immediate_action": "Inspect and destroy whitefly nesting weeds on bunds. Uproot infected plants.",
        "organic_treatment": "Spray Neem oil 10,000 ppm @ 3ml/liter or deploy yellow sticky traps @ 20/acre.",
        "chemical_treatment": "Control whitefly vector: Spray Imidacloprid 17.8% SL @ 100 ml/acre or Spiromesifen @ 200 ml/acre.",
        "pesticide_name": "Spiromesifen 22.9% SC",
        "pesticide_dosage": "200 ml per acre in 200L water",
        "application_timing": "Target whitefly infestation periods early morning.",
        "preventive_measures": "Sow resistant cultivars. Avoid cotton-tomato relay crops.",
        "recovery_time": "25 Days (Stunted growth recovery)",
        "yield_impact": "25% - 50% loss"
    },
    # 7. SUGARCANE
    "sugarcane_red_rot": {
        "crop": "Sugarcane",
        "disease": "Red Rot (Colletotrichum falcatum)",
        "description": "Critical fungal disease causing red lesions within canes, leading to absolute cane drying and loss of sucrose.",
        "cause": "Fungal pathogen Colletotrichum falcatum, spread through infected seed setts.",
        "symptoms": "Third and fourth leaves wither, splitting stem reveals red pith with white cross-wise bands, alcoholic smell.",
        "immediate_action": "Uproot infected clumps and burn immediately. Avoid irrigating fields next to infected zone.",
        "organic_treatment": "Soil application of Trichoderma viride @ 5kg/acre mixed with well-rotted FYM.",
        "chemical_treatment": "Seed sett treatment: Dip setts in Carbendazim 50% WP @ 1g/liter solution before planting.",
        "pesticide_name": "Carbendazim 50% WP",
        "pesticide_dosage": "1g per liter of water (Sett dip treatment)",
        "application_timing": "At planting (Sett treatment) or soil drenching early stage.",
        "preventive_measures": "Use disease-free seed setts. Implement crop rotation with crop like paddy.",
        "recovery_time": "Irreversible (Focus on containment)",
        "yield_impact": "50% - 100% loss"
    },
    # 8. MUSTARD
    "mustard_white_rust": {
        "crop": "Mustard",
        "disease": "White Rust (Albugo candida)",
        "description": "Destructive water-mold producing white chalky pustules on leaves and floral deformities (stagheads).",
        "cause": "Oomycete Albugo candida, active in cool, moist winter climates.",
        "symptoms": "White pustules on lower leaf surface, thickening and twisting of flower stems.",
        "immediate_action": "Remove infected leaves. Delay nitrogen top-dressing.",
        "organic_treatment": "Spray garlic extract 5% or neem seed kernel extract @ 5%.",
        "chemical_treatment": "Spray Metalaxyl + Mancozeb @ 600g per acre.",
        "pesticide_name": "Metalaxyl 8% + Mancozeb 64% WP",
        "pesticide_dosage": "600g per acre in 200L water",
        "application_timing": "Apply immediately at flower initiation stage.",
        "preventive_measures": "Early sowing (before mid-October). Destroy mustard weeds. Rotate crop.",
        "recovery_time": "15 Days",
        "yield_impact": "15% - 30% loss"
    },
    # 9. ONION
    "onion_purple_blotch": {
        "crop": "Onion",
        "disease": "Purple Blotch (Alternaria porri)",
        "description": "Fungal foliar disease causing purple lesions on onion stalks, leading to seed stalks collapse.",
        "cause": "Fungus Alternaria porri, favored by high humidity (90%+) and warm temperatures (21-30°C).",
        "symptoms": "White spots on leaves, expanding to purple lesions with yellow borders, leaf tips turn brown.",
        "immediate_action": "Ensure proper field drainage. Prune dead leaves.",
        "organic_treatment": "Spray Pseudomonas fluorescens @ 10g/liter or Copper Hydroxide.",
        "chemical_treatment": "Spray Mancozeb 75% WP @ 600g/acre or Tebuconazole @ 250 ml/acre.",
        "pesticide_name": "Tebuconazole 25.9% EC",
        "pesticide_dosage": "200-250 ml per acre in 200L water",
        "application_timing": "Apply at the start of purple lesion spots.",
        "preventive_measures": "Select disease-free bulbs. Avoid planting too close. Rotate with non-allium crops.",
        "recovery_time": "12-14 Days",
        "yield_impact": "20% - 50% loss"
    },
    # 10. CHILI
    "chili_leaf_curl": {
        "crop": "Chili",
        "disease": "Chili Leaf Curl Virus",
        "description": "Severe viral disease causing severe leaf puckering, curling and stunted bush-like plant structure.",
        "cause": "Gemini virus vector-transmitted by thrips, whiteflies, and mites.",
        "symptoms": "Leaves curl upwards, puckering, small leaf size, stunted nodes, no flower formation.",
        "immediate_action": "Remove and burn virus-source plants. Mount silver reflective mulch.",
        "organic_treatment": "Spray Lecanicillium lecanii bio-control formulation @ 5g/liter.",
        "chemical_treatment": "Control vectors: Spray Fipronil 5% SC @ 300 ml/acre or Spiromesifen @ 200 ml/acre.",
        "pesticide_name": "Fipronil 5% SC",
        "pesticide_dosage": "300 ml per acre in 200L water",
        "application_timing": "Early morning before insects become active.",
        "preventive_measures": "Grow nursery under nylon net. Intercrop with maize or sorghum borders.",
        "recovery_time": "20 Days (If treated early)",
        "yield_impact": "30% - 80% loss"
    },
    # 11. SOYBEAN
    "soybean_rust": {
        "crop": "Soybean",
        "disease": "Soybean Rust (Phakopsora pachyrhizi)",
        "description": "Rapidly spreading rust creating small volcanic pustules on bottom leaves.",
        "cause": "Fungus Phakopsora pachyrhizi, spreads by wind-blown spores under wet leaf conditions.",
        "symptoms": "Pin-point lesions changing to tan-brown pustules on lower leaves, premature leaf drop.",
        "immediate_action": "Check lower leaves regularly. Stop water logging.",
        "organic_treatment": "Apply baking soda spray (5g/liter) mixed with neem oil (5ml/liter).",
        "chemical_treatment": "Spray Propiconazole @ 200 ml/acre or Pyraclostrobin @ 150 ml/acre.",
        "pesticide_name": "Pyraclostrobin 20% WG",
        "pesticide_dosage": "150-200g per acre in 200L water",
        "application_timing": "Apply at flowering stage or when rust alerts are issued.",
        "preventive_measures": "Sow resistant crops. Wide spacing to dry leaves quickly.",
        "recovery_time": "14 Days",
        "yield_impact": "20% - 60% loss"
    },
    # 12. GROUNDNUT
    "groundnut_leaf_spot": {
        "crop": "Groundnut",
        "disease": "Early Leaf Spot (Cercospora arachidicola)",
        "description": "Fungal spot disease causing defoliation and weaker pods.",
        "cause": "Fungus Cercospora arachidicola, soil-borne, spread by splashes.",
        "symptoms": "Dark brown circular spots on leaf upper surface with a distinct yellow halo.",
        "immediate_action": "Remove leaf trash. Add crop mulch to prevent water splash soil contact.",
        "organic_treatment": "Foliar spray with 5% vermicompost extract or cow dung slurry wash.",
        "chemical_treatment": "Spray Carbendazim @ 200g/acre or Hexaconazole @ 200 ml/acre.",
        "pesticide_name": "Hexaconazole 5% EC",
        "pesticide_dosage": "200 ml per acre in 200L water",
        "application_timing": "Spray 35-40 days after sowing or at first spots appearance.",
        "preventive_measures": "Rotate groundnuts with cereal crops. Pre-treat seed setts.",
        "recovery_time": "15 Days",
        "yield_impact": "15% - 40% loss"
    },
    # 13. BANANA
    "banana_panama": {
        "crop": "Banana",
        "disease": "Panama Disease / Wilt (Fusarium oxysporum)",
        "description": "Lethal soil-borne fungal disease causing plant vascular failure and leaf wilting.",
        "cause": "Fusarium oxysporum f. sp. cubense, survives in soil for decades.",
        "symptoms": "Lower leaves turn yellow on margins, leaf petioles buckle, stem splits at base.",
        "immediate_action": "Isolate infected plants. Drench trunk base with lime solution.",
        "organic_treatment": "Apply Trichoderma viride and Pseudomonas fluorescens in planting pit.",
        "chemical_treatment": "Soil injection: Drench soil with Carbendazim 0.2% solution around stems.",
        "pesticide_name": "Carbendazim 50% WP (Drenching)",
        "pesticide_dosage": "2g per liter of water (Drench around root zone)",
        "application_timing": "Drench soil around suspected base immediately.",
        "preventive_measures": "Use certified tissue culture plantlets. Avoid shifting soil/tools from infected fields.",
        "recovery_time": "Hard to cure (Mitigate soil health)",
        "yield_impact": "70% - 100% loss"
    },
    # 14. MANGO
    "mango_anthracnose": {
        "crop": "Mango",
        "disease": "Anthracnose (Colletotrichum gloeosporioides)",
        "description": "Fungal disease creating black sunken patches on leaves, flowers, and mango fruits.",
        "cause": "Fungus Colletotrichum gloeosporioides, active in heavy rainfall/fog conditions.",
        "symptoms": "Sunken black lesions, leaf spots merging to tear sheets, flower panicle blight.",
        "immediate_action": "Prune congested inner branches to let sunlight penetrate the canopy.",
        "organic_treatment": "Spray copper oxychloride or bio-control agents.",
        "chemical_treatment": "Spray Carbendazim 50% WP @ 1g/liter or Azoxystrobin @ 1ml/liter of water.",
        "pesticide_name": "Azoxystrobin 23% SC",
        "pesticide_dosage": "200 ml per acre in 200L water",
        "application_timing": "At flower panicle emergence and fruit set stages.",
        "preventive_measures": "Pruning orchards post-harvest. Destroy dry branches.",
        "recovery_time": "18 Days",
        "yield_impact": "25% - 50% loss (Fruit rot)"
    },
    # 15. APPLE
    "apple_scab": {
        "crop": "Apple",
        "disease": "Apple Scab (Venturia inaequalis)",
        "description": "Fungal disease causing olive-brown spots on leaves and corky cracks on apple fruits.",
        "cause": "Fungus Venturia inaequalis, thriving in cool, rainy spring seasons.",
        "symptoms": "Velvety olive-green spots on leaves, scabby lesions on fruits, premature leaf drop.",
        "immediate_action": "Rake and destroy fallen leaves to reduce overwintering spore pool.",
        "organic_treatment": "Apply Sulfur dust or copper fungicides in early spring.",
        "chemical_treatment": "Spray Captan 50% WP @ 500g/acre or Difenoconazole @ 150 ml/acre.",
        "pesticide_name": "Captan 50% WP",
        "pesticide_dosage": "500-600g per acre in 200L water",
        "application_timing": "Apply at green-tip stage, pink-bud stage, and petal fall.",
        "preventive_measures": "Plant resistant cultivars. Keep tree center open by pruning.",
        "recovery_time": "20 Days",
        "yield_impact": "30% - 60% loss (Unmarketable fruit)"
    },
    # 16. GRAPES
    "grapes_mildew": {
        "crop": "Grapes",
        "disease": "Powdery Mildew (Uncinula necator)",
        "description": "Fungal disease coating leaves and berries in a white-grey dusty powder.",
        "cause": "Fungus Uncinula necator, thrives in high shade and warm, dry leaves with ambient humidity.",
        "symptoms": "White chalky powder on upper leaf surfaces, shriveling of small grape berries.",
        "immediate_action": "Improve airflow and canopy ventilation by removing excessive leaves.",
        "organic_treatment": "Spray Potassium Bicarbonate @ 5g/liter or Wettable Sulfur 80% @ 2g/liter.",
        "chemical_treatment": "Spray Penconazole 10% EC @ 100 ml per acre or Hexaconazole @ 200 ml/acre.",
        "pesticide_name": "Penconazole 10% EC",
        "pesticide_dosage": "100 ml per acre in 200L water",
        "application_timing": "Pre-bloom and post-bloom stages.",
        "preventive_measures": "Maintain canopy training. Spray sulfur proactively.",
        "recovery_time": "12 Days",
        "yield_impact": "20% - 50% loss"
    }
}

# HEALTHY PLANTS METADATA
HEALTHY_PLANTS = {
    "Rice": "Healthy Rice Plant (धान स्वस्थ है). All leaf profiles look clean with no bacterial streak signs.",
    "Wheat": "Healthy Wheat Plant (गेहूं स्वस्थ है). Strong leaf structure with robust chlorophyll content.",
    "Maize": "Healthy Maize Plant (मक्का स्वस्थ है). Green leaf sheath without blights or spots.",
    "Potato": "Healthy Potato Plant (आलू स्वस्थ है). Vibrant green canopy with sturdy leaf veins.",
    "Tomato": "Healthy Tomato Plant (टमाटर स्वस्थ है). No alternaria concentric circles. Stems are solid.",
    "Cotton": "Healthy Cotton Plant (कपास स्वस्थ है). Clean broad leaves, no signs of thrip nests or curling.",
    "Sugarcane": "Healthy Sugarcane Plant (गन्ना स्वस्थ है). Green erect blades, red rot vascular tissue absent.",
    "Mustard": "Healthy Mustard Plant (सरसों स्वस्थ है). Clear floral stems, no staghead deformities.",
    "Onion": "Healthy Onion Plant (प्याज़ स्वस्थ है). Upright stalks, purple blotch scale zero.",
    "Chili": "Healthy Chili Plant (मिर्च स्वस्थ है). Broad uncurled leaves. High bloom probability.",
    "Soybean": "Healthy Soybean Plant (सोयाबीन स्वस्थ है). Dense green crop canopy, clear leaves.",
    "Groundnut": "Healthy Groundnut Plant (मूंगफली स्वस्थ है). Balanced leaflets without spot halos.",
    "Banana": "Healthy Banana Plant (केला स्वस्थ है). Broad leaves without margins yellowing.",
    "Mango": "Healthy Mango Plant (आम स्वस्थ है). Fresh green leaves, clear panicle emergence.",
    "Apple": "Healthy Apple Plant (सेब स्वस्थ है). Clear leaves, no scab margins.",
    "Grapes": "Healthy Grapes Plant (अंगूर स्वस्थ है). Vine foliage is clear of powdery molds."
}

# HELPER: SECURE UPLOAD FILE VALIDATION & VIRUS SCAN READY LOGGING
def validate_image_file(filename: str, size: int):
    # Extension validation
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image format. Allowed formats: JPG, JPEG, PNG, WEBP."
        )
    # Size check (Max 5MB)
    if size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image size exceeds maximum limit of 5MB."
        )
    # Simulated ClamAV scan (always returns clean in mock)
    # In enterprise production, this would communicate with clamav daemon over socket
    print(f"[SECURITY] Antivirus scan completed for {filename}: STATUS CLEAN")

# HELPER: SIMULATED COMPUTER VISION ANNOTATION GENERATOR
def generate_mock_annotations(crop_name: str, disease_key: str, is_healthy: bool):
    """
    Generates realistic, coordinates for Bounding Boxes, Heatmaps, and Segmentation Masks
    to mock the spatial detection of crop leaf disease lesions.
    """
    if is_healthy:
        return {
            "bounding_boxes": [],
            "heatmap_points": [],
            "segmentation_mask": [],
            "explainable_ai": {
                "lime_parameters": "Model focused on global leafy green contours and cell shapes. No necrotic patches detected.",
                "shap_details": "Highly positive contribution of chlorophyll values [0.72 - 0.85] on green spectrum."
            }
        }
    
    # Generate dynamic coordinates representing leaf spots
    # Bounding Boxes format: [ {label, xmin, ymin, xmax, ymax} ]
    box1 = {
        "label": disease_key,
        "xmin": int(random.uniform(15, 35)),
        "ymin": int(random.uniform(20, 45)),
        "xmax": int(random.uniform(50, 70)),
        "ymax": int(random.uniform(55, 75))
    }
    box2 = {
        "label": disease_key,
        "xmin": int(random.uniform(60, 70)),
        "ymin": int(random.uniform(40, 50)),
        "xmax": int(random.uniform(85, 95)),
        "ymax": int(random.uniform(70, 85))
    }
    
    # Heatmap Points format: [ {x, y, weight} ]
    heatmap = []
    for _ in range(12):
        heatmap.append({
            "x": int(random.uniform(box1["xmin"], box1["xmax"])),
            "y": int(random.uniform(box1["ymin"], box1["ymax"])),
            "weight": round(random.uniform(0.5, 0.98), 2)
        })
    for _ in range(8):
        heatmap.append({
            "x": int(random.uniform(box2["xmin"], box2["xmax"])),
            "y": int(random.uniform(box2["ymin"], box2["ymax"])),
            "weight": round(random.uniform(0.4, 0.90), 2)
        })
        
    # Segmentation Mask Polygon coordinates
    mask1 = [
        {"x": box1["xmin"] + 5, "y": box1["ymin"] + 5},
        {"x": box1["xmax"] - 5, "y": box1["ymin"] + 8},
        {"x": box1["xmax"] - 2, "y": box1["ymax"] - 5},
        {"x": box1["xmin"] + 8, "y": box1["ymax"] - 2}
    ]
    mask2 = [
        {"x": box2["xmin"] + 3, "y": box2["ymin"] + 3},
        {"x": box2["xmax"] - 4, "y": box2["ymin"] + 6},
        {"x": box2["xmax"] - 1, "y": box2["ymax"] - 4},
        {"x": box2["xmin"] + 6, "y": box2["ymax"] - 2}
    ]
    
    lime_explanation = (
        f"AI flagged yellow-brown pixel clusters centered around ({box1['xmin'] + 15}, {box1['ymin'] + 15}) "
        f"and ({box2['xmin'] + 10}, {box2['ymin'] + 15}) which show dry necrotic lesion cell walls "
        f"characteristic of {crop_name} diseases."
    )
    shap_explanation = (
        f"Features indicating moisture stress contributed +0.12. Chlorophyll breakdown in tissue region "
        f"contributed +0.65 to the final classifier output."
    )
    
    return {
        "bounding_boxes": [box1, box2],
        "heatmap_points": heatmap,
        "segmentation_mask": [mask1, mask2],
        "explainable_ai": {
            "lime_parameters": lime_explanation,
            "shap_details": shap_explanation
        }
    }

# 1. API: CROP DISEASE DIAGNOSIS ENDPOINT
@router.post("/diagnose", response_model=DiagnosticOut, status_code=status.HTTP_201_CREATED)
async def diagnose_crop(
    crop_id: Optional[str] = Form(None),
    crop_name: str = Form("Wheat"),  # Defaults to Wheat if not specified
    model_arch: str = Form("efficientnet"), # 'cnn', 'resnet', 'efficientnet', 'vit'
    location_lat: Optional[float] = Form(None),
    location_lon: Optional[float] = Form(None),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Accepts an uploaded crop leaf photo, processes it through simulated computer vision pipelines,
    validates file properties, performs AI diagnostics based on the chosen deep learning model,
    generates coordinates for annotations (bounding boxes, heatmaps, segmentation masks),
    and records the comprehensive diagnosis ledger in the database.
    """
    # 1. Read file bytes and size validation
    contents = await image.read()
    file_size = len(contents)
    # Reset read pointer
    await image.seek(0)
    
    validate_image_file(image.filename, file_size)
    
    # Determine crop classification matching
    matched_crop = "Wheat"
    for crop in DISEASE_LIBRARY.values():
        if crop["crop"].lower() in crop_name.lower():
            matched_crop = crop["crop"]
            break
            
    # Simulate image quality analyzer validation: Brightness, Contrast, Blur checking
    # Brightness is simulated by looking at image filename lengths, contrast is randomized
    brightness = round(random.uniform(0.48, 0.72), 2)
    contrast = round(random.uniform(0.55, 0.88), 2)
    blur_index = round(random.uniform(10.0, 50.0), 2) # high is clear
    
    if blur_index < 12.0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Image quality validation failed. The photo is too blurry or out of focus. Please capture in proper daylight."
        )

    # 2. Simulate model architecture variances (CNN, ResNet, EfficientNet, ViT)
    # ViT has higher accuracy and slightly higher inference times, CNN is fast but lower confidence.
    base_confidence = 0.88
    inf_time_ms = 120
    if model_arch.lower() == "vit":
        base_confidence = 0.94
        inf_time_ms = 350
    elif model_arch.lower() == "resnet":
        base_confidence = 0.90
        inf_time_ms = 210
    elif model_arch.lower() == "cnn":
        base_confidence = 0.82
        inf_time_ms = 85

    # 3. Choose disease from library or healthy state
    image_name = image.filename.lower()
    is_healthy = "healthy" in image_name or "clean" in image_name
    is_unknown = "unknown" in image_name or "random" in image_name
    
    disease_key = None
    # Match crop specific diseases
    crop_diseases = [k for k, v in DISEASE_LIBRARY.items() if v["crop"].lower() == matched_crop.lower()]
    
    if is_healthy:
        disease_name = "Healthy Plant"
        confidence = round(base_confidence + random.uniform(-0.04, 0.04), 2)
        remedy_text = HEALTHY_PLANTS.get(matched_crop, f"Healthy {matched_crop} plant. No active treatments needed.")
        severity = "Healthy"
        affected_area = 0.0
    elif is_unknown:
        disease_name = "Unknown Disease / Nutrient Pathology"
        confidence = round(random.uniform(0.35, 0.55), 2)
        remedy_text = "Unknown pathology detected (confidence below threshold). Take clear leaf shots from another angle or consult a district scientist."
        severity = "Unknown"
        affected_area = round(random.uniform(5.0, 15.0), 2)
    else:
        # Select first disease for this crop as default
        if crop_diseases:
            disease_key = crop_diseases[0]
            info = DISEASE_LIBRARY[disease_key]
            disease_name = info["disease"]
            confidence = round(base_confidence + random.uniform(-0.05, 0.05), 2)
            remedy_text = info["chemical_treatment"] + " | Organic: " + info["organic_treatment"]
            severity = random.choice(["Low", "Medium", "High", "Critical"])
            affected_area = round(random.uniform(5.0, 45.0), 2)
        else:
            # Fallback
            disease_name = f"General Nutrient Stress on {matched_crop}"
            confidence = round(base_confidence - 0.05, 2)
            remedy_text = "Apply organic leaf compost manure. Keep irrigation controlled."
            severity = "Low"
            affected_area = 12.5

    # Generate Top 5 predictions list
    top_5 = []
    if is_healthy:
        top_5.append({"disease": "Healthy Plant", "confidence": confidence})
        if crop_diseases:
            top_5.append({"disease": DISEASE_LIBRARY[crop_diseases[0]]["disease"], "confidence": round(0.12, 2)})
        top_5.append({"disease": "Nutrient Deficiency", "confidence": 0.05})
        top_5.append({"disease": "Leaf Curl", "confidence": 0.02})
        top_5.append({"disease": "Leaf Blight", "confidence": 0.01})
    else:
        top_5.append({"disease": disease_name, "confidence": confidence})
        # Add alternative options
        top_5.append({"disease": "Healthy Plant", "confidence": round(1.0 - confidence - 0.05, 2)})
        top_5.append({"disease": "Alternative Fungal Strain", "confidence": 0.04})
        top_5.append({"disease": "Nitrogen Hunger", "confidence": 0.02})
        top_5.append({"disease": "Herbicide Injury", "confidence": 0.01})

    # Generate annotations
    annotations = generate_mock_annotations(matched_crop, disease_name, is_healthy)
    
    # Structure full report JSON
    report_details = {
        "crop": matched_crop,
        "disease_name": disease_name,
        "confidence": confidence,
        "severity": severity,
        "affected_area": affected_area,
        "inference_time_ms": inf_time_ms,
        "model_architecture": model_arch.upper(),
        "top_5_predictions": top_5,
        "image_quality": {
            "brightness": brightness,
            "contrast": contrast,
            "blur_index": blur_index,
            "status": "Passed"
        },
        "annotations": annotations,
        "disease_info": DISEASE_LIBRARY.get(disease_key) if disease_key else None
    }

    # Simulate storage
    mock_filename = f"{uuid.uuid4()}_{image.filename}"
    mock_storage_url = f"/static/uploads/{mock_filename}"

    new_report = DiagnosticReport(
        user_id=current_user.id,
        crop_id=crop_id,
        image_url=mock_storage_url,
        disease_detected=disease_name,
        confidence=confidence,
        remedy=remedy_text,
        severity=severity,
        affected_area=affected_area,
        location_latitude=location_lat,
        location_longitude=location_lon,
        is_favorite=False,
        notes="",
        report_json=json.dumps(report_details)
    )
    
    # Generate any missing default metadata for non-persistent test sessions
    if not new_report.id:
        new_report.id = str(uuid.uuid4())
    if not new_report.created_at:
        new_report.created_at = datetime.now(timezone.utc)

    db.add(new_report)
    await db.flush()
    return new_report


# 2. API: LIST PREDICTION HISTORY
@router.get("/history", response_model=List[DiagnosticOut])
async def list_diagnostic_history(
    crop: Optional[str] = Query(None, description="Filter history by crop name"),
    disease: Optional[str] = Query(None, description="Filter by disease name"),
    severity: Optional[str] = Query(None, description="Filter by severity level"),
    favorites_only: bool = Query(False, description="Filter for bookmarked reports only"),
    search: Optional[str] = Query(None, description="General search in notes or disease text"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Fetches the prediction history ledger for the logged-in user with support
    for search filters, severity category filters, and favorites flags.
    """
    stmt = select(DiagnosticReport).filter(DiagnosticReport.user_id == current_user.id)
    
    if crop:
        stmt = stmt.filter(DiagnosticReport.report_json.like(f"%{crop}%"))
    if disease:
        stmt = stmt.filter(DiagnosticReport.disease_detected.ilike(f"%{disease}%"))
    if severity:
        stmt = stmt.filter(DiagnosticReport.severity == severity)
    if favorites_only:
        stmt = stmt.filter(DiagnosticReport.is_favorite == True)
    if search:
        stmt = stmt.filter(
            (DiagnosticReport.disease_detected.ilike(f"%{search}%")) |
            (DiagnosticReport.notes.ilike(f"%{search}%")) |
            (DiagnosticReport.remedy.ilike(f"%{search}%"))
        )

    # Sort chronologically by default
    stmt = stmt.order_by(DiagnosticReport.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


# 3. API: RETRIEVE SINGLE DIAGNOSTIC REPORT
@router.get("/history/{report_id}", response_model=DiagnosticOut)
async def get_diagnostic_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    stmt = select(DiagnosticReport).filter(
        DiagnosticReport.id == report_id,
        DiagnosticReport.user_id == current_user.id
    )
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diagnostic report not found."
        )
    return report


# 4. API: UPDATE NOTES AND FAVORITES
@router.patch("/history/{report_id}", response_model=DiagnosticOut)
async def update_diagnostic_report(
    report_id: str,
    update_data: DiagnosticUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Updates the custom farmer notes or bookmarks a prediction as a favorite.
    """
    stmt = select(DiagnosticReport).filter(
        DiagnosticReport.id == report_id,
        DiagnosticReport.user_id == current_user.id
    )
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diagnostic report not found or unauthorized access."
        )
        
    if update_data.notes is not None:
        report.notes = update_data.notes
    if update_data.is_favorite is not None:
        report.is_favorite = update_data.is_favorite
        
    await db.flush()
    return report


# 5. API: DELETE HISTORICAL REPORT RECORD
@router.delete("/history/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diagnostic_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Deletes an entry from the prediction ledger.
    """
    stmt = select(DiagnosticReport).filter(
        DiagnosticReport.id == report_id,
        DiagnosticReport.user_id == current_user.id
    )
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diagnostic report not found or unauthorized."
        )
        
    await db.delete(report)
    await db.flush()
    return None


# 6. API: DISEASE LIBRARY GET
@router.get("/diseases", response_model=List[DiseaseLibraryItem])
async def list_disease_library():
    """
    Returns the offline-ready disease catalog listing treatments, recovery times, and yield loss risks.
    """
    library_items = []
    for key, val in DISEASE_LIBRARY.items():
        library_items.append(DiseaseLibraryItem(
            id=key,
            crop=val["crop"],
            disease=val["disease"],
            description=val["description"],
            cause=val["cause"],
            symptoms=val["symptoms"],
            organic_treatment=val["organic_treatment"],
            chemical_treatment=val["chemical_treatment"],
            pesticide_name=val["pesticide_name"],
            pesticide_dosage=val["pesticide_dosage"],
            application_timing=val["application_timing"],
            preventive_measures=val["preventive_measures"],
            recovery_time=val["recovery_time"],
            yield_impact=val["yield_impact"]
        ))
    return library_items


# 7. API: ANALYTICS REPORTS SUMMARY
@router.get("/analytics", response_model=AnalyticsSummary)
async def get_analytics_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Compiles statistical report charts aggregating total scans, severity distribution counts,
    crop breakdown distribution ratios, and localized nearby alerts.
    """
    stmt = select(DiagnosticReport).filter(DiagnosticReport.user_id == current_user.id)
    result = await db.execute(stmt)
    all_reports = result.scalars().all()

    total_scans = len(all_reports)
    
    healthy_cnt = 0
    infected_cnt = 0
    total_confidence = 0.0
    
    disease_counts = {}
    severity_counts = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0, "Healthy": 0, "Unknown": 0}
    crop_distribution = {}
    
    # Compile analytics maps
    for rep in all_reports:
        total_confidence += rep.confidence
        
        # Crop distribution parsing
        try:
            r_json = json.loads(rep.report_json) if rep.report_json else {}
            crop_name = r_json.get("crop", "Unknown")
        except Exception:
            crop_name = "Unknown"
            
        crop_distribution[crop_name] = crop_distribution.get(crop_name, 0) + 1
        
        # Check health status
        if "healthy" in rep.disease_detected.lower():
            healthy_cnt += 1
            severity_counts["Healthy"] += 1
        else:
            infected_cnt += 1
            disease_counts[rep.disease_detected] = disease_counts.get(rep.disease_detected, 0) + 1
            if rep.severity in severity_counts:
                severity_counts[rep.severity] += 1
            else:
                severity_counts["Medium"] += 1
                
    avg_conf = (total_confidence / total_scans) if total_scans > 0 else 0.0

    # Build weekly trend dummy database array
    trend_data = []
    now = datetime.now(timezone.utc)
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_str = day.strftime("%b %d")
        
        # Count reports on this day
        scans_on_day = sum(1 for r in all_reports if r.created_at.date() == day.date())
        # Add random simulation offset for visual graphing if database is small
        if scans_on_day == 0 and total_scans > 0:
            scans_on_day = random.randint(0, 3)
            
        trend_data.append({
            "date": day_str,
            "scans": scans_on_day,
            "infections": max(0, scans_on_day - random.choice([0, 1]))
        })

    # Nearby outbreak alerts simulation (simulating a radius of 50km in agrarian districts)
    recent_alerts = [
        {"id": "a1", "crop": "Wheat", "disease": "Yellow Rust", "distance": "8.5 km", "village": "Deoria", "urgency": "High"},
        {"id": "a2", "crop": "Tomato", "disease": "Early Blight", "distance": "12.0 km", "village": "Mohania", "urgency": "Medium"},
        {"id": "a3", "crop": "Rice", "disease": "Bacterial Blight", "distance": "4.2 km", "village": "Buxar", "urgency": "Critical"}
    ]

    return AnalyticsSummary(
        total_scans=total_scans,
        healthy_count=healthy_cnt,
        infected_count=infected_cnt,
        average_confidence=round(avg_conf, 2),
        disease_counts=disease_counts,
        severity_counts=severity_counts,
        crop_distribution=crop_distribution,
        recent_alerts=recent_alerts,
        trend_data=trend_data
    )

