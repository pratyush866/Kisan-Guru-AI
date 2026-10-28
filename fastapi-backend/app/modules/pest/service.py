import random
from typing import Dict, Any, List

# Complete Seed Library for all 15 Supported Pests
PEST_LIBRARY_SEED = {
    "fall_armyworm": {
        "pest_name": "Fall Armyworm (Spodoptera frugiperda)",
        "scientific_name": "Spodoptera frugiperda",
        "description": "Lepidopteran pest that aggressively feeds on crop foliage, leaves, and ears, particularly targeting maize plants.",
        "damage_symptoms": "Ragged leaf edges, large holes, sawdust-like frass on leaf whorls, cut stalks.",
        "organic_control": "Apply Neem seed kernel extract (NSKE) 5% or spray Bacillus thuringiensis (Bt) formulation @ 2g/liter of water.",
        "chemical_control": "Spray Chlorantraniliprole 18.5% SC (Coragen) @ 80 ml per acre or Emamectin Benzoate 5% SG @ 80g per acre.",
        "biological_control": "Release egg parasitoids Trichogramma chilonis @ 50,000/acre. Encourage predator bugs like earwigs.",
        "mechanical_control": "Hand-pick caterpillars from leaf whorls. Place wood ash or sand in the whorls to scratch caterpillars.",
        "ipm_strategy": "Intercrop maize with desmodium (push-pull) and plant napier grass borders. Monitor whorls weekly.",
        "pesticide_name": "Chlorantraniliprole 18.5% SC",
        "pesticide_dosage": "80 ml per acre in 200 liters of water",
        "application_timing": "Apply in late afternoons directly into the leaf whorls.",
        "safety_precautions": "Wear mask and goggles. Avoid spraying during honeybee foraging periods.",
        "waiting_period_days": 14,
        "crop_vulnerability": "Maize (High), Sugarcane (Medium), Sorghum (Medium)"
    },
    "stem_borer": {
        "pest_name": "Stem Borer (Chilo suppressalis)",
        "scientific_name": "Chilo suppressalis",
        "description": "Larvae tunnel into the plant stems, cutting the vascular tissue and causing absolute crop lodging and whiteheads.",
        "damage_symptoms": "Dead hearts (dried central leaf whorls), whiteheads (empty straw-colored grain panicles), stem holes.",
        "organic_control": "Spray neem oil 10,000 ppm @ 3ml/liter or apply bio-pesticide Beauveria bassiana @ 5g/liter.",
        "chemical_control": "Apply Cartap Hydrochloride 4G granules @ 10 kg/acre or spray Flubendiamide 39.35% SC @ 50 ml/acre.",
        "biological_control": "Release Trichogramma japonicum wasps @ 1,00,000/acre during early tillering.",
        "mechanical_control": "Uproot and destroy dead hearts clumps. Cut stubbles close to ground level post-harvest.",
        "ipm_strategy": "Set up light traps @ 5/acre to capture adult moths. Avoid excessive nitrogen fertilizer.",
        "pesticide_name": "Cartap Hydrochloride 4G",
        "pesticide_dosage": "10 kg per acre (Soil application)",
        "application_timing": "Broadcast granules in standing water at tillering stage.",
        "safety_precautions": "Do not touch granules with bare hands. Wear protective gloves.",
        "waiting_period_days": 21,
        "crop_vulnerability": "Rice (High), Maize (Medium), Sugarcane (Medium)"
    },
    "brown_planthopper": {
        "pest_name": "Brown Planthopper (Nilaparvata lugens)",
        "scientific_name": "Nilaparvata lugens",
        "description": "Sucking pest that colonizes the base of paddy stems, extracting sap and causing brown patches called hopper burn.",
        "damage_symptoms": "Hopperburn (patches of dried, yellow-brown circular spots in fields), presence of thousands of insects at stem base.",
        "organic_control": "Spray neem seed kernel extract 5% or apply metarhizium anisopliae bio-fungus.",
        "chemical_control": "Spray Pymetrozine 50% WDG @ 120g/acre or Dinotefuran 20% SG @ 80g/acre.",
        "biological_control": "Encourage spiders (Lycosa pseudoannulata) and mirid bugs which feed on planthopper nymphs.",
        "mechanical_control": "Drain field water for 3-4 days to disrupt breeding humidity. Open pathways in dense planting.",
        "ipm_strategy": "Maintain wider plant spacing (20x15cm). Keep fields dry intermittently (alternate wetting and drying).",
        "pesticide_name": "Pymetrozine 50% WDG",
        "pesticide_dosage": "120g per acre in 200 liters of water",
        "application_timing": "Direct the spray nozzle towards the base of rice hills.",
        "safety_precautions": "Ensure protective boots and clothing. Do not breathe spray mist.",
        "waiting_period_days": 19,
        "crop_vulnerability": "Rice (High)"
    },
    "aphids": {
        "pest_name": "Aphids (Aphis gossypii)",
        "scientific_name": "Aphis gossypii",
        "description": "Tiny soft-bodied sucking insects that cluster under leaves, secreting honeydew and transmitting viruses.",
        "damage_symptoms": "Curled leaves, yellowing foliage, sticky black soot (sooty mold) on leaf surfaces, stunted plant tips.",
        "organic_control": "Spray organic soap water solution (5g/liter) or spray 5% ginger-garlic-chili extract.",
        "chemical_control": "Spray Imidacloprid 17.8% SL @ 100 ml/acre or Thiamethoxam 25% WG @ 80g/acre.",
        "biological_control": "Release predatory Ladybird beetles or Lacewing larvae which eat thousands of aphids daily.",
        "mechanical_control": "Hose down plants with a strong stream of water to dislodge aphid colonies.",
        "ipm_strategy": "Install yellow sticky cards. Avoid high nitrogen inputs which stimulate soft leafy shoots.",
        "pesticide_name": "Thiamethoxam 25% WG",
        "pesticide_dosage": "80g per acre in 200L water",
        "application_timing": "Spray early morning at first colony detection.",
        "safety_precautions": "Highly toxic to bees. Avoid spraying near open flowers or bee hives.",
        "waiting_period_days": 7,
        "crop_vulnerability": "Mustard (High), Chili (High), Tomato (Medium), Cotton (Medium)"
    },
    "whiteflies": {
        "pest_name": "Whiteflies (Bemisia tabaci)",
        "scientific_name": "Bemisia tabaci",
        "description": "Sucking sap-feeding vectors that transmit destructive viruses like Leaf Curl and soot mold spores.",
        "damage_symptoms": "Chlorotic spots, yellowing leaves, silvering of leaf underparts, cloud of tiny white insects when disturbed.",
        "organic_control": "Spray neem oil 1.5% with liquid detergent or apply castor oil sticky traps.",
        "chemical_control": "Spray Diafenthiuron 50% WP @ 250g/acre or Spiromesifen 22.9% SC @ 200 ml/acre.",
        "biological_control": "Encourage parasitic wasps (Encarsia formosa). Spray Verticillium lecanii fungus.",
        "mechanical_control": "Place yellow sticky boards @ 30/acre at crop height to catch migrating adults.",
        "ipm_strategy": "Adopt crop rotation. Grow barrier crops like maize around vegetable nurseries.",
        "pesticide_name": "Diafenthiuron 50% WP",
        "pesticide_dosage": "250g per acre in 200L water",
        "application_timing": "Morning hours when whiteflies are less active on leaves.",
        "safety_precautions": "Ensure complete body cover, goggles, and chemical respirator mask during spray.",
        "waiting_period_days": 10,
        "crop_vulnerability": "Cotton (High), Chili (High), Tomato (High), Potato (Medium)"
    },
    "thrips": {
        "pest_name": "Thrips (Scirtothrips dorsalis)",
        "scientific_name": "Scirtothrips dorsalis",
        "description": "Very small insects that rasp leaf cells and suck sap, causing leaves to curl upward and turn silvery.",
        "damage_symptoms": "Upward leaf curling (boat-shaped), silvery/bronze leaf undersides, scarred flower petals, dry tips.",
        "organic_control": "Spray garlic-chili extract 5% or apply blue sticky traps.",
        "chemical_control": "Spray Fipronil 5% SC @ 300 ml/acre or Spinosad 45% SC @ 75 ml/acre.",
        "biological_control": "Encourage predatory thrips (Franklinothrips) and predatory mites (Amblyseius).",
        "mechanical_control": "Keep weeds completely cleared from field margins to reduce thrip reservoirs.",
        "ipm_strategy": "Deploy blue sticky traps @ 20/acre. Maintain optimum soil moisture to reduce thrips pupation in soil.",
        "pesticide_name": "Spinosad 45% SC",
        "pesticide_dosage": "75 ml per acre in 200L water",
        "application_timing": "Apply at early flower stage or on initial upward leaf curl.",
        "safety_precautions": "Store Spinosad in original bottles. Avoid contact with skin.",
        "waiting_period_days": 7,
        "crop_vulnerability": "Chili (High), Onion (High), Grapes (Medium)"
    },
    "leaf_miner": {
        "pest_name": "Leaf Miner (Liriomyza trifolii)",
        "scientific_name": "Liriomyza trifolii",
        "description": "Larvae feed internally between leaf epidermal layers, carving winding white galleries and reducing leaf area.",
        "damage_symptoms": "Serpentine white winding tunnels in leaves, leaf drying, premature leaf drop.",
        "organic_control": "Spray neem oil 10,000 ppm @ 3ml/liter or apply bio-pesticide spinosad.",
        "chemical_control": "Spray Abamectin 1.9% EC @ 150 ml/acre or Cyromazine 75% WP @ 100g/acre.",
        "biological_control": "Encourage parasitic wasps like Diglyphus isaea which kill leaf miner larvae inside leaves.",
        "mechanical_control": "Squeeze leaves by hand to crush the larvae inside the tunnels. Prune infested leaves.",
        "ipm_strategy": "Rotate crops with non-hosts. Use row covers on young crops.",
        "pesticide_name": "Abamectin 1.9% EC",
        "pesticide_dosage": "150 ml per acre in 200L water",
        "application_timing": "Apply as soon as the first white winding lines appear on leaves.",
        "safety_precautions": "Abamectin is toxic to aquatic organisms. Do not allow wash-off into ponds.",
        "waiting_period_days": 7,
        "crop_vulnerability": "Tomato (High), Potato (Medium), Chili (Medium)"
    },
    "fruit_fly": {
        "pest_name": "Fruit Fly (Bactrocera cucurbitae)",
        "scientific_name": "Bactrocera cucurbitae",
        "description": "Adult flies puncture fruits to lay eggs. Developing maggots bore inside, causing fruit rot.",
        "damage_symptoms": "Oozing puncture wounds on fruits, rotting fruits, premature fruit drop, maggots inside fruit pulp.",
        "organic_control": "Spray neem oil or hang fly traps baited with Tulsi leaf extract.",
        "chemical_control": "Spray Malathion 50% EC @ 300 ml/acre mixed with 1 kg jaggery as bait.",
        "biological_control": "Conserve braconid parasitoids. Release sterile males in larger blocks.",
        "mechanical_control": "Bury fallen fruits at least 2 feet deep in soil. Install methyl eugenol pheromone traps.",
        "ipm_strategy": "Install pheromone traps @ 10/acre. Bag young developing fruits in paper sleeves.",
        "pesticide_name": "Malathion 50% EC + Jaggery",
        "pesticide_dosage": "300 ml Malathion + 1kg Jaggery per acre",
        "application_timing": "Spray in patches on crop borders early morning.",
        "safety_precautions": "Keep jaggery-bait out of reach of domestic animals.",
        "waiting_period_days": 5,
        "crop_vulnerability": "Mango (High), Banana (Medium), Tomato (Medium)"
    },
    "mealybug": {
        "pest_name": "Mealybug (Phenacoccus solenopsis)",
        "scientific_name": "Phenacoccus solenopsis",
        "description": "Sucking scale insects covered in white waxy powder. They cluster on stems and leaves, causing leaf drying.",
        "damage_symptoms": "White cottony/waxy masses on stems and leaf nodes, leaf chlorosis, plant death, heavy black sooty mold.",
        "organic_control": "Spray fish oil rosin soap (FORS) @ 20g/liter or spray hand-wash soap + alcohol mix.",
        "chemical_control": "Spray Profenofos 50% EC @ 400 ml/acre or Buprofezin 25% SC @ 300 ml/acre.",
        "biological_control": "Release predatory mealybug destroyer beetle (Cryptolaemus montrouzieri) @ 500/acre.",
        "mechanical_control": "Prune infested twigs and burn. Paint stem base with sticky glue bands to block ants.",
        "ipm_strategy": "Ant control is critical because ants protect mealybugs from predators. Destroy nearby ant hills.",
        "pesticide_name": "Buprofezin 25% SC",
        "pesticide_dosage": "300 ml per acre in 200L water",
        "application_timing": "Apply at crawler emergence stage. Waxy adults are harder to kill.",
        "safety_precautions": "Buprofezin is a growth regulator. Apply when crop is not flowering.",
        "waiting_period_days": 14,
        "crop_vulnerability": "Cotton (High), Mango (High), Tomato (Medium), Grapes (Medium)"
    },
    "termites": {
        "pest_name": "Termites (Odontotermes obesus)",
        "scientific_name": "Odontotermes obesus",
        "description": "Social insects that attack roots and base of crops, especially in sandy soils during dry spells.",
        "damage_symptoms": "Mud galleries on stems, plant wilting, hollowed stem bases, plant easily pulls out of ground.",
        "organic_control": "Apply neem cake @ 100 kg/acre to soil. Pour dilute soap water down mounds.",
        "chemical_control": "Soil drenching: Chlorpyriphos 20% EC @ 1.5 liters/acre or Fipronil 0.3G granules.",
        "biological_control": "Encourage predatory ants. Drench mounds with Metarhizium anisopliae spore suspension.",
        "mechanical_control": "Locate and destroy termite queen in the colony. Maintain high organic carbon in soil.",
        "ipm_strategy": "Irrigate crop fields promptly. Dry soils are more vulnerable to termite attacks.",
        "pesticide_name": "Chlorpyriphos 20% EC",
        "pesticide_dosage": "1.5 liters per acre (Soil drench)",
        "application_timing": "Drench soil around plants or mix with irrigation water.",
        "safety_precautions": "Chlorpyriphos is highly toxic. Wear protective boots and gloves. Avoid inhalation.",
        "waiting_period_days": 30,
        "crop_vulnerability": "Sugarcane (High), Wheat (Medium), Groundnut (Medium)"
    },
    "locust": {
        "pest_name": "Locust (Schistocerca gregaria)",
        "scientific_name": "Schistocerca gregaria",
        "description": "Migratory swarming grasshoppers that consume green foliage rapidly, stripping entire fields overnight.",
        "damage_symptoms": "Complete defoliation (stripped stems, bare twigs), swarm clouds of millions of grasshoppers.",
        "organic_control": "Spray bio-pesticide Metarhizium acridum @ 20g/liter of water.",
        "chemical_control": "Spray Bifenthrin 10% EC @ 200 ml/acre or Deltamethrin 2.8% EC @ 250 ml/acre.",
        "biological_control": "Conserve wild birds. Spray fungal Metarhizium which targets grasshoppers selectively.",
        "mechanical_control": "Dig trenches around crops to trap nymphs. Beat metal tins/drums to scare swarms.",
        "ipm_strategy": "Plow sandy soil beds post-monsoon to destroy buried locust egg pods. Coordinate region alerts.",
        "pesticide_name": "Bifenthrin 10% EC",
        "pesticide_dosage": "200 ml per acre in 200L water",
        "application_timing": "Spray border fields early morning when locusts are roosting.",
        "safety_precautions": "Coordinate with regional warning groups. Keep children and cattle away during spraying.",
        "waiting_period_days": 7,
        "crop_vulnerability": "All crops (Wheat, Maize, Rice, Sugarcane, Cotton) (High)"
    },
    "cutworm": {
        "pest_name": "Cutworm (Agrotis ipsilon)",
        "scientific_name": "Agrotis ipsilon",
        "description": "Soil-dwelling caterpillars that hide in soil by day and emerge at night to sever seedling stems at base.",
        "damage_symptoms": "Seedling stems severed clean at soil level, wilted seedlings, curled caterpillars under soil crumbs.",
        "organic_control": "Apply neem cake to soil. Place sticky barriers or plastic rings around seedlings.",
        "chemical_control": "Soil application: Chlorpyriphos 20% EC @ 1 liter/acre or spray Indoxacarb 14.5% SC @ 150 ml/acre.",
        "biological_control": "Apply entomopathogenic nematodes (Steinernema carpocapsae) to moist soil.",
        "mechanical_control": "Hand-collect caterpillars at night using a torch. Plow fields deep to expose pupae to birds.",
        "ipm_strategy": "Flooding fields before planting destroys soil cutworm hideouts. Plant early.",
        "pesticide_name": "Indoxacarb 14.5% SC",
        "pesticide_dosage": "150 ml per acre in 200L water",
        "application_timing": "Spray soil base and crop rows late evening.",
        "safety_precautions": "Avoid direct soil contact. Wear face mask during application.",
        "waiting_period_days": 14,
        "crop_vulnerability": "Potato (High), Tomato (Medium), Chili (Medium)"
    },
    "spider_mites": {
        "pest_name": "Spider Mites (Tetranychus urticae)",
        "scientific_name": "Tetranychus urticae",
        "description": "Microscopic arachnids that feed under leaves, spinning fine webs and creating yellow speckles.",
        "damage_symptoms": "Fine webbing under leaves, yellow-white speckling on leaf surfaces, bronzed/dry leaves.",
        "organic_control": "Spray wettable sulfur 80% WP @ 2g/liter or spray neem oil + soap.",
        "chemical_control": "Spray Spiromesifen 22.9% SC @ 200 ml/acre or Propargite 57% EC @ 400 ml/acre.",
        "biological_control": "Release predatory mites (Phytoseiulus persimilis) which feed on spider mites.",
        "mechanical_control": "Sprinkle clean water on plants to wash off webs and dust from leaves.",
        "ipm_strategy": "Keep crop borders clean. Dust accumulation on leaves promotes spider mite population.",
        "pesticide_name": "Spiromesifen 22.9% SC",
        "pesticide_dosage": "200 ml per acre in 200L water",
        "application_timing": "Spray leaves thoroughly, ensuring coverage of leaf undersides.",
        "safety_precautions": "Do not mix with oils. Wear protective overalls.",
        "waiting_period_days": 7,
        "crop_vulnerability": "Cotton (High), Chili (High), Tomato (Medium), Grapes (Medium)"
    },
    "bollworm": {
        "pest_name": "Bollworm (Helicoverpa armigera)",
        "scientific_name": "Helicoverpa armigera",
        "description": "Highly destructive chewing pest that bores into crop buds, cotton bolls, and tomato fruits.",
        "damage_symptoms": "Circular holes bored into cotton bolls or tomato fruits, empty flower buds, droppings on leaves.",
        "organic_control": "Spray Helicoverpa NPV virus @ 250 LE/acre or neem oil formulation 5%.",
        "chemical_control": "Spray Spinetoram 11.7% SC @ 180 ml/acre or Emamectin Benzoate 5% SG @ 80g/acre.",
        "biological_control": "Deploy egg card Trichogramma chilonis wasps. Encourage insectivorous birds with perches.",
        "mechanical_control": "Pick and destroy infested cotton bolls/tomato fruits. Plow soil to destroy overwintering pupae.",
        "ipm_strategy": "Plant trap crops like Marigold around cotton/tomato blocks. Set up pheromone traps.",
        "pesticide_name": "Emamectin Benzoate 5% SG",
        "pesticide_dosage": "80g per acre in 200L water",
        "application_timing": "Apply at early pod/boll formation stage before boring occurs.",
        "safety_precautions": "Highly toxic to silkworms. Avoid drift to mulberry plants.",
        "waiting_period_days": 10,
        "crop_vulnerability": "Cotton (High), Tomato (High), Chickpea (High)"
    },
    "armyworm": {
        "pest_name": "Armyworm (Mythimna separata)",
        "scientific_name": "Mythimna separata",
        "description": "Caterpillars that move in massive groups, defoliating crop leaves, leaving only veins.",
        "damage_symptoms": "Foliage defoliated to central leaf veins, leaves cut at base, plant stalks chewed down.",
        "organic_control": "Spray Bt formulation @ 2g/liter or apply wood ash on leaf borders.",
        "chemical_control": "Spray Lambda Cyhalothrin 5% EC @ 250 ml/acre or Indoxacarb @ 150 ml/acre.",
        "biological_control": "Conserve parasitic flies (Tachinids) and braconid wasps.",
        "mechanical_control": "Create deep boundary ditches filled with water to block caterpillar migrations.",
        "ipm_strategy": "Set light traps. Clear leaf trash post-harvest. Monitor crop edges daily.",
        "pesticide_name": "Lambda Cyhalothrin 5% EC",
        "pesticide_dosage": "250 ml per acre in 200L water",
        "application_timing": "Late evening spray targeting moving colonies.",
        "safety_precautions": "Lambda cyhalothrin is highly irritating. Wear full mask, safety glasses and gloves.",
        "waiting_period_days": 14,
        "crop_vulnerability": "Wheat (High), Rice (High), Maize (Medium)"
    }
}

class PestAIProcessor:
    @staticmethod
    def analyze_image_quality(filename: str, size: int) -> Dict[str, Any]:
        """
        Validates file format, checks size, and simulates analysis for contrast, brightness, and blur
        to satisfy MODULE 1 (Auto Image Quality Check).
        """
        # Formats
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext not in ["jpg", "jpeg", "png", "webp"]:
            return {
                "passed": False,
                "error": "Unsupported image format. Allowed formats: JPG, JPEG, PNG, WEBP."
            }
        
        # Size (Max 5MB)
        if size > 5 * 1024 * 1024:
            return {
                "passed": False,
                "error": "Image file size exceeds maximum limit of 5MB."
            }
            
        # Simulate blur/brightness
        # Using filename to mock quality failure states
        is_blurry = "blurry" in filename.lower()
        is_dark = "dark" in filename.lower()
        
        brightness = round(random.uniform(0.15, 0.35) if is_dark else random.uniform(0.50, 0.75), 2)
        blur_index = round(random.uniform(2.0, 9.5) if is_blurry else random.uniform(25.0, 60.0), 2) # > 12 is clean
        contrast = round(random.uniform(0.60, 0.90), 2)
        
        if blur_index < 12.0:
            return {
                "passed": False,
                "error": "Blurry image detected. Please capture a clear leaf photo in proper lighting."
            }
        if brightness < 0.25:
            return {
                "passed": False,
                "error": "Low-light image detected. Turn on camera flash or take photo in daylight."
            }
            
        return {
            "passed": True,
            "brightness": brightness,
            "contrast": contrast,
            "blur_index": blur_index,
            "format": ext.upper()
        }

    @staticmethod
    def run_detection(crop_name: str, filename: str, model_arch: str) -> Dict[str, Any]:
        """
        Runs mock deep learning pipeline (CNN, ResNet, EfficientNet, YOLO, ViT) and yields
        multi-object coordinates representing insects/pests for the visualization canvas.
        """
        clean_fn = filename.lower()
        is_healthy = "healthy" in clean_fn or "clean" in clean_fn
        is_unknown = "unknown" in clean_fn or "random" in clean_fn

        # Base properties based on model selected
        base_confidence = 0.86
        inf_time_ms = 95
        if model_arch.lower() == "vit":
            base_confidence = 0.95
            inf_time_ms = 390
        elif model_arch.lower() == "yolo":
            base_confidence = 0.91
            inf_time_ms = 45 # YOLO is very fast
        elif model_arch.lower() == "resnet":
            base_confidence = 0.88
            inf_time_ms = 180
            
        # Select target pest based on crop association
        matched_key = "fall_armyworm" # default fallback
        
        # Match crop to common pest
        if "rice" in crop_name.lower():
            matched_key = random.choice(["stem_borer", "brown_planthopper", "armyworm"])
        elif "wheat" in crop_name.lower():
            matched_key = random.choice(["locust", "armyworm"])
        elif "mustard" in crop_name.lower():
            matched_key = "aphids"
        elif "chili" in crop_name.lower():
            matched_key = random.choice(["thrips", "whiteflies"])
        elif "tomato" in crop_name.lower():
            matched_key = random.choice(["leaf_miner", "bollworm"])
        elif "cotton" in crop_name.lower():
            matched_key = random.choice(["whiteflies", "mealybug", "bollworm", "spider_mites"])
        elif "mango" in crop_name.lower():
            matched_key = random.choice(["fruit_fly", "mealybug"])
        elif "potato" in crop_name.lower():
            matched_key = random.choice(["cutworm", "leaf_miner"])
        elif "sugarcane" in crop_name.lower():
            matched_key = random.choice(["termites", "stem_borer"])

        library_data = PEST_LIBRARY_SEED[matched_key]
        pest_name = library_data["pest_name"]
        
        if is_healthy:
            pest_name = "No Pest Infestation"
            confidence = round(base_confidence + random.uniform(-0.03, 0.03), 2)
            severity = "Healthy"
            damage = "Healthy plant canopy. No active insects or feeding bites detected."
            loss = 0.0
            urgency = "Low"
            boxes = []
        elif is_unknown:
            pest_name = "Unknown Insect Specimen"
            confidence = round(random.uniform(0.35, 0.52), 2)
            severity = "Low"
            damage = "Unidentified insect observed. The specimen does not match standard agricultural pest vectors."
            loss = 2.5
            urgency = "Low"
            boxes = [
                {"label": "Insect Specimen", "xmin": 40, "ymin": 35, "xmax": 55, "ymax": 50}
            ]
        else:
            confidence = round(base_confidence + random.uniform(-0.06, 0.04), 2)
            severity = random.choice(["Medium", "High", "Critical"])
            damage = f"Active colonies of {pest_name} feeding on foliage. Leaves show holes and punctures."
            loss = round(random.uniform(15.0, 55.0), 1)
            urgency = "Immediate" if severity == "Critical" else ("High" if severity == "High" else "Medium")
            
            # Generate multi-object coordinates (MODULE 2: Multi-object Detection)
            boxes = [
                {"label": pest_name.split(" (")[0], "xmin": int(random.uniform(18, 30)), "ymin": int(random.uniform(20, 38)), "xmax": int(random.uniform(40, 52)), "ymax": int(random.uniform(42, 60))},
                {"label": pest_name.split(" (")[0], "xmin": int(random.uniform(55, 68)), "ymin": int(random.uniform(45, 55)), "xmax": int(random.uniform(78, 90)), "ymax": int(random.uniform(68, 85))}
            ]

        # Formulate Top 5 predictions list
        top_5 = []
        if is_healthy:
            top_5.append({"pest": "No Pest Infestation", "confidence": confidence})
            top_5.append({"pest": PEST_LIBRARY_SEED["aphids"]["pest_name"], "confidence": 0.08})
            top_5.append({"pest": PEST_LIBRARY_SEED["whiteflies"]["pest_name"], "confidence": 0.05})
            top_5.append({"pest": "Spider Mites", "confidence": 0.02})
            top_5.append({"pest": "Thrips", "confidence": 0.01})
        else:
            top_5.append({"pest": pest_name, "confidence": confidence})
            top_5.append({"pest": "No Pest Infestation", "confidence": round(1.0 - confidence - 0.06, 2)})
            top_5.append({"pest": "Alternative Larvae Strain", "confidence": 0.04})
            top_5.append({"pest": "Lepidopteran Damage", "confidence": 0.02})
            top_5.append({"pest": "Thrips", "confidence": 0.01})

        # Smart Treatment controls
        treatments = {
            "organic": library_data["organic_control"] if not is_healthy else "N/A",
            "chemical": library_data["chemical_control"] if not is_healthy else "N/A",
            "biological": library_data["biological_control"] if not is_healthy else "N/A",
            "mechanical": library_data["mechanical_control"] if not is_healthy else "N/A",
            "ipm_strategy": library_data["ipm_strategy"] if not is_healthy else "N/A",
            "pesticide_name": library_data["pesticide_name"] if not is_healthy else "N/A",
            "pesticide_dosage": library_data["pesticide_dosage"] if not is_healthy else "N/A",
            "application_timing": library_data["application_timing"] if not is_healthy else "N/A",
            "safety_precautions": library_data["safety_precautions"] if not is_healthy else "N/A",
            "waiting_period_days": library_data["waiting_period_days"] if not is_healthy else 0
        }

        # Predict future pest spread (MODULE 6: Weather & Outbreak Risk)
        # Sucking pests thrive in high humidity; locusts and caterpillars thrive in warm dry transitions
        humidity = random.randint(55, 88)
        temperature = random.uniform(22.0, 34.0)
        
        spread_risk = 15.0
        if not is_healthy:
            # Sucking pests calculation
            if matched_key in ["aphids", "whiteflies", "thrips", "brown_planthopper", "spider_mites"]:
                if humidity > 75:
                    spread_risk = round(random.uniform(70.0, 95.0), 1)
                else:
                    spread_risk = round(random.uniform(35.0, 60.0), 1)
            else:
                # Chewing leaf caterpillars
                if temperature > 28.0:
                    spread_risk = round(random.uniform(65.0, 90.0), 1)
                else:
                    spread_risk = round(random.uniform(40.0, 65.0), 1)

        forecasts = {
            "temperature_threshold_c": round(temperature, 1),
            "humidity_threshold_percent": humidity,
            "seasonal_risk_level": "High" if spread_risk > 70 else "Medium",
            "nearby_farmer_alert_status": "Triggered" if spread_risk > 65 else "Inactive",
            "crop_vulnerability_index": library_data["crop_vulnerability"],
            "preventative_action": f"Introduce yellow sticky traps and release predator beetles. Keep boundary weeds trimmed."
        }

        return {
            "pest_detected": pest_name,
            "confidence": confidence,
            "severity": severity,
            "damage_description": damage,
            "spread_risk_percentage": spread_risk,
            "crop_loss_percentage": loss,
            "urgency_level": urgency,
            "inference_time_ms": inf_time_ms,
            "model_architecture": model_arch.upper(),
            "bounding_boxes": boxes,
            "top_5_predictions": top_5,
            "treatment_plan": treatments,
            "predictions_forecast": forecasts
        }
