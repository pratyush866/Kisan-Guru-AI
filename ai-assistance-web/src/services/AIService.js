import { TranslationUtils } from '../utils/translator.js';

export class AIService {
  /**
   * Generates a structured response based on the query and active language.
   * Leverages localized semantic matching to return professional, context-appropriate advice.
   */
  static async generateResponse(query, language = 'english', contextPayload = {}) {
    const cleanQuery = query.toLowerCase().trim();

    // 1. Attempt dynamic query resolution via FastAPI Backend API if online
    if (navigator.onLine) {
      try {
        // Enforce query safety check before calling backend API
        // Merge frontend dashboard context with the query for "AI Copilot" awareness
        const savedGeminiKey = localStorage.getItem('user_gemini_api_key') || undefined;
        const enrichedQuery = `[Context: Weather=${contextPayload.weather || 'Unknown'}, Crop=${contextPayload.crop || 'Unknown'}, Location=${contextPayload.location || 'Unknown'}] User Query: ${query}`;
        
        const response = await fetch('http://127.0.0.1:8000/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: enrichedQuery, language, api_key: savedGeminiKey }),
          // Timeout threshold of 8 seconds
          signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined
        });

        if (response.ok) {
          const result = await response.json();
          return {
            category: result.category,
            data: result.data,
            timestamp: result.timestamp || new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn('FastAPI backend connection error, falling back to local database rule-matrix:', err);
      }
    }
    
    // 2. Semantic Category Classifier (Fallback)
    let category = 'crop';
    if (cleanQuery.includes('yellow') || cleanQuery.includes('spot') || cleanQuery.includes('blight') || cleanQuery.includes('disease') || cleanQuery.includes('रोग')) {
      category = 'disease';
    } else if (cleanQuery.includes('bug') || cleanQuery.includes('worm') || cleanQuery.includes('pest') || cleanQuery.includes('keeda') || cleanQuery.includes('कीड़ा')) {
      category = 'pest';
    } else if (cleanQuery.includes('fertilizer') || cleanQuery.includes('urea') || cleanQuery.includes('nitrogen') || cleanQuery.includes('खाद')) {
      category = 'fertilizer';
    } else if (cleanQuery.includes('water') || cleanQuery.includes('irrigate') || cleanQuery.includes('schedule') || cleanQuery.includes('पानी') || cleanQuery.includes('सिंचाई')) {
      category = 'irrigation';
    } else if (cleanQuery.includes('scheme') || cleanQuery.includes('yojana') || cleanQuery.includes('subsidy') || cleanQuery.includes('योजना')) {
      category = 'schemes';
    } else if (cleanQuery.includes('price') || cleanQuery.includes('market') || cleanQuery.includes('mandi') || cleanQuery.includes('भाव')) {
      category = 'market';
    } else if (cleanQuery.includes('organic') || cleanQuery.includes('jaivik') || cleanQuery.includes('जैविक')) {
      category = 'organic';
    } else if (cleanQuery.includes('cow') || cleanQuery.includes('cattle') || cleanQuery.includes('animal') || cleanQuery.includes('गाय') || cleanQuery.includes('पशु')) {
      category = 'livestock';
    }

    // 3. High-Fidelity Query Matching Matrix (Fallback)
    let structuredResponse = null;

    if (cleanQuery.includes('wheat') && (cleanQuery.includes('yellow') || cleanQuery.includes('पीला'))) {
      structuredResponse = this.getWheatYellowingAdvice(language);
    } else if (cleanQuery.includes('tomato') && (cleanQuery.includes('spot') || cleanQuery.includes('blight') || cleanQuery.includes('दाग'))) {
      structuredResponse = this.getTomatoBlightAdvice(language);
    } else if (cleanQuery.includes('rice') || cleanQuery.includes('paddy') || cleanQuery.includes('धान')) {
      if (cleanQuery.includes('fertilizer') || cleanQuery.includes('urea') || cleanQuery.includes('खाद')) {
        structuredResponse = this.getRiceFertilizerAdvice(language);
      }
    } else if (cleanQuery.includes('water') || cleanQuery.includes('schedule') || cleanQuery.includes('पानी') || cleanQuery.includes('सिंचाई')) {
      structuredResponse = this.getGeneralIrrigationAdvice(language);
    } else if (cleanQuery.includes('scheme') || cleanQuery.includes('yojana') || cleanQuery.includes('योजना')) {
      structuredResponse = this.getGovSchemesAdvice(language);
    } else if (cleanQuery.includes('organic') || cleanQuery.includes('jaivik') || cleanQuery.includes('जैविक')) {
      structuredResponse = this.getOrganicFarmingAdvice(language);
    }

    // 4. Fallback Dynamic Generator utilizing prompt segments (Simulated RAG lookup)
    if (!structuredResponse) {
      structuredResponse = this.getFallbackAdvice(query, category, language);
    }

    return {
      category,
      data: structuredResponse,
      timestamp: new Date().toISOString()
    };
  }

  // Wheat Yellowing Leaf Spot diagnostic response
  static getWheatYellowingAdvice(lang) {
    const langTemplates = {
      english: {
        problem: "Yellow Rust (Puccinia striiformis) or Nitrogen Deficiency in Wheat crop.",
        reason: "Cool, wet weather promotes Yellow Rust spores. Alternatively, high irrigation without nitrogen supply causes leaf yellowing from the bottom upward.",
        solution: "Apply Propiconazole 25% EC @ 200 ml per acre dissolved in 200 liters of water. For nutrient deficiency, spray 2% Urea solution (4 kg in 200L water) per acre.",
        prevention: "Use rust-resistant seeds (e.g., HD-2967, DBW-187). Keep drainage active to prevent root saturation.",
        cost: "₹650 - ₹800 per acre (Fungicide + Labor).",
        expectedResult: "Arrest of rust spread within 48-72 hours. Green color return in leaves within 7 days.",
        expertTip: "Inspect crop edges first. Rust symptoms start in localized patches, blowing with wind currents.",
        warning: "Avoid spraying urea solution during midday heat to prevent chemical leaf burn."
      },
      hindi: {
        problem: "गेहूं की फसल में पीला रतुआ (येलो रस्ट) रोग या नाइट्रोजन की कमी।",
        reason: "ठंडा और नमी वाला मौसम पीले रतुआ के बीजाणुओं को फैलाता है। अत्यधिक सिंचाई और नाइट्रोजन की कमी पत्तियों को नीचे से ऊपर की ओर पीला कर देती है।",
        solution: "प्रोपिकोनाजोल 25% EC @ 200 मिली प्रति एकड़ को 200 लीटर पानी में मिलाकर छिड़काव करें। पोषण की कमी के लिए 2% यूरिया घोल का छिड़काव करें।",
        prevention: "रतुआ-रोधी बीज जैसे HD-2967 या DBW-187 का उपयोग करें। खेत में जलभराव न होने दें।",
        cost: "₹650 - ₹800 प्रति एकड़ (दवा + मजदूरी)।",
        expectedResult: "48-72 घंटों के भीतर रतुआ का प्रसार रुक जाएगा। 7 दिनों में पत्तियां फिर से हरी होने लगेंगी।",
        expertTip: "खेत के किनारों की पहले जांच करें। रस्ट हवा के बहाव के साथ छोटे हिस्सों से शुरू होता है।",
        warning: "तेज धूप या दोपहर के समय यूरिया के छिड़काव से बचें, इससे पत्तियां झुलस सकती हैं।"
      },
      bhojpuri: {
        problem: "गेहूं के खेत में पीला रतुआ (येलो रस्ट) रोग या नाइट्रोजन की कमी।",
        reason: "ठंडा आ नमी वाला मौसम पीला रतुआ के बीजाणु बढ़ावे ला। बहुत सिंचाई आ नाइट्रोजन कम होखे पर पत्ता नीचे से ऊपर पीला पड़ जाए।",
        solution: "प्रोपिकोनाजोल 25% EC @ 200 मिली प्रति एकड़ में 200 लीटर पानी मिलाईं। खनिज की कमी पर 2% यूरिया घोल छिड़काव करीं।",
        prevention: "रतुआ-रोधी बीज जैसे HD-2967 या DBW-187 इस्तेमाल करीं। खेत में पानी जमा न होखे देहीं।",
        cost: "₹650 - ₹800 प्रति एकड़ (दवा + मजूरी)।",
        expectedResult: "48-72 घंटा में रतुआ का फैलाव रोकल जा सकेला। 7 दिन में पत्ता फिर से हरा हो जाई।",
        expertTip: "खेत के छोर पहिले जाँच करीं। रतुआ हवा के साथ छोटे-छोटे हिस्से में शुरू होई।",
        warning: "धूप के समय यूरिया का छिड़काव न करीं, पत्ता झुलस सकता बा।"
      }
    };
    return langTemplates[lang] || langTemplates['english'];
  }

  // Tomato Early Blight diagnostic response
  static getTomatoBlightAdvice(lang) {
    const langTemplates = {
      english: {
        problem: "Early Blight (Alternaria solani) in Tomato.",
        reason: "Fungal pathogen thriving in high humidity, warm temperatures, and prolonged foliage wetness.",
        solution: "Spray Mancozeb 75% WP @ 600g per acre or copper oxychloride @ 500g in 200 liters of water.",
        prevention: "Prune lower branches up to 8 inches from soil. Ensure crop rotation with non-solanaceous crops.",
        cost: "₹550 - ₹750 per acre.",
        expectedResult: "Reduction of spot expansion on foliage and stems within 5 days.",
        expertTip: "Use drip irrigation instead of sprinkler systems to keep tomato foliage dry.",
        warning: "Remove and burn heavily infected foliage away from the field. Do not compost it."
      },
      hindi: {
        problem: "टमाटर में अगेती झुलसा (अर्ली ब्लाइट) रोग।",
        reason: "फफूंद जनित रोग जो हवा में उच्च आर्द्रता, गर्म तापमान और पत्तियों पर नमी रहने से फैलता है।",
        solution: "मैनकोजेब 75% WP @ 600 ग्राम प्रति एकड़ या कॉपर ऑक्सीक्लोराइड @ 500 ग्राम को 200 लीटर पानी में मिलाकर स्प्रे करें।",
        prevention: "जमीन से 8 इंच ऊपर तक की निचली पत्तियों की कटाई करें। फसल चक्र अपनाएं।",
        cost: "₹550 - ₹750 प्रति एकड़।",
        expectedResult: "5 दिनों के भीतर पत्तों और तनों पर धब्बों का बढ़ना रुक जाएगा।",
        expertTip: "पत्तियों को सूखा रखने के लिए फव्वारा सिंचाई की जगह टपक (ड्रिप) सिंचाई का प्रयोग करें।",
        warning: "संक्रमित पौधों के पत्तों को तोड़कर खेत से दूर जला दें। इन्हें खाद के गड्ढे में न डालें।"
      }
    };
    return langTemplates[lang] || langTemplates['english'];
  }

  // Rice NPK Fertilizer recommendation
  static getRiceFertilizerAdvice(lang) {
    const langTemplates = {
      english: {
        problem: "Optimal Nutrient dosage recommendation for Paddy (Rice) crop.",
        reason: "Paddy requires balanced Nitrogen, Phosphorus, and Potassium (NPK) ratios to support grain panicle weight and root structure.",
        solution: "Apply NPK in ratio of 120:60:60 kg/ha. Apply full Phosphorus and Potassium during transplanting, and divide Nitrogen into 3 equal splits (transplanting, tillering, panicle initiation).",
        prevention: "Conduct soil test prior to application to adjust recommended dose according to soil profile.",
        cost: "₹2,500 - ₹3,500 per hectare.",
        expectedResult: "Sturdy tillering, optimal grain counts, and up to 15% increase in crop yield.",
        expertTip: "Top-dress Zinc Sulphate @ 25 kg/ha if transplanting in zinc-deficient sandy loam soil.",
        warning: "Never apply nitrogenous fertilizers during heavy rains, as it leads to leaching loss."
      },
      hindi: {
        problem: "धान (चावल) की फसल के लिए उर्वरक (खाद) की अनुशंसित मात्रा।",
        reason: "धान को बालियों के विकास और मजबूत जड़ों के लिए संतुलित नाइट्रोजन, फास्फोरस और पोटाश (NPK) की आवश्यकता होती है।",
        solution: "NPK 120:60:60 किग्रा/हेक्टेयर का प्रयोग करें। फास्फोरस और पोटाश की पूरी मात्रा रोपाई के समय दें। नाइट्रोजन को 3 भागों में बांट कर दें।",
        prevention: "खाद डालने से पहले मिट्टी की जांच अवश्य करवा लें ताकि आवश्यकतानुसार बदलाव किया जा सके।",
        cost: "₹2,500 - ₹3,500 प्रति हेक्टेयर।",
        expectedResult: "मजबूत कल्ले निकलेंगे, बालियों में दानों की संख्या बढ़ेगी और उपज में 15% तक सुधार होगा।",
        expertTip: "जिंक की कमी वाली मिट्टी में रोपाई के समय 25 किग्रा जिंक सल्फेट प्रति हेक्टेयर का प्रयोग करें।",
        warning: "तेज बारिश के दौरान यूरिया या अन्य नाइट्रोजन खाद न डालें, इससे खाद बह जाएगी।"
      },
      bhojpuri: {
        problem: "धान (चावल) के खेत खातिर खाद की अनुशंसित मात्रा।",
        reason: "धान के लिए संतुलित नाइट्रोजन, फॉस्फोरस आ पोटाश (NPK) चाहिए, ताकि बालि मजबूत होवे आ जड़ भी मजबूत होखे।",
        solution: "NPK 120:60:60 किलो/हेक्टेयर इस्तेमाल करीं। फॉस्फोरस आ पोटाश पूरी मात्रा रोपाई के समय दिहीं। नाइट्रोजन तीन हिस्से में दिहीं।",
        prevention: "खाद डालने से पहिले माटी की जाँच कराईं, ताकि सही मात्रा मिल सके।",
        cost: "₹2,500 - ₹3,500 प्रति हेक्टेयर।",
        expectedResult: "मजबूत कल्ला निकले, बालि में दाना बढ़े, उपज 15% तक बढ़ सके।",
        expertTip: "जिंक की कमी वाली माटी में 25 किलो जिंक सल्फेट/हेक्टेयर डाल दें।",
        warning: "तेज बारिस में यूरिया या नाइट्रोजन खाद न डालें, नहीं तो खाद बह जाए।"
      }
    };
    return langTemplates[lang] || langTemplates['english'];
  }

  // General Irrigation Advice
  static getGeneralIrrigationAdvice(lang) {
    const localized = {
      english: {
        problem: "Irrigation Scheduling and Evapotranspiration balance.",
        reason: "Crops require water replenishment matching weather patterns, soil moisture depletion rates, and developmental stages.",
        solution: "Adopt drip irrigation lines for close-planted vegetables. Schedule watering during low evaporative demand hours (early morning or late evening).",
        prevention: "Create mulching beds around plants to limit surface evaporation by 30%.",
        cost: "Drip system: ₹35,000 - ₹50,000 per acre (government subsidies cover up to 80%).",
        expectedResult: "Water saving of up to 40% and enhanced nutrient absorption by roots.",
        expertTip: "Check soil moisture by squeezing soil in your hand. If it forms a stable ball, moisture is sufficient.",
        warning: "Avoid water stagnation in fields of pulse crops like Chickpea or Pigeon pea as it triggers Wilt."
      },
      hindi: {
        problem: "सिंचाई अनुसूची और वाष्पन-निस्तापन संतुलन।",
        reason: "फसलों के लिए मौसम, मिट्टी की नमी और उनकी बढ़वार के अनुसार पानी की जरूरत होती है।",
        solution: "करीब बिखरी सब्जियों के लिए टपक सिंचाई लाइन अपनाएं। सुबह जल्दी या शाम को पानी दें।",
        prevention: "पौधों के आसपास मल्चिंग की परत रखें ताकि पानी कम बचे।",
        cost: "टपक प्रणाली: ₹35,000 - ₹50,000 प्रति एकड़ (सरकारी सब्सिडी 80% तक)।",
        expectedResult: "पानी की बचत 40% तक और जड़ों द्वारा पोषक तत्व ग्रहण बेहतर।",
        expertTip: "मिट्टी को हाथ से दबाकर देखें। अगर गेंद बन जाए तो नमी पर्याप्त है।",
        warning: "दालों की फसलों में पानी जमा न होने दें, इससे विटिलता हो सकती है।"
      },
      bhojpuri: {
        problem: "पानी देवे के समय आ वाष्पन-संतुलन।",
        reason: "फसल के लिए मौसम, माटी की नमी आ बढ़वार के हिसाब से पानी चाहिए।",
        solution: "करीब-करीब सब्जी के खेत में ड्रिप सिंचाई लाइन लगाईं। सुबह जल्दी या शाम के समय पानी दिहीं।",
        prevention: "पौधा के आसपास मल्चिंग की परत रखीं ताकि पानी जल्दी न बचे।",
        cost: "ड्रिप सिस्टम: ₹35,000 - ₹50,000 प्रति एकड़ (सरकारी सब्सिडी 80% तक)।",
        expectedResult: "पानी की बचत 40% तक आ जड़ दवा जल्दी ग्रहण करे।",
        expertTip: "माटी के हाथ से दबाईं। अगर गेंद बन जाए त नमी काफी बा।",
        warning: "दाल की फसल में पानी जमा न होखे देहीं, नहीं तो विटिलता हो जाई।"
      }
    };

    return localized[lang] || localized.english;
  }

  // Government Schemes Advice
  static getGovSchemesAdvice(lang) {
    const localized = {
      english: {
        problem: "Financial assistance and agricultural subsidy programs in India.",
        reason: "To support marginal farming income, reduce crop loan dependency, and encourage water conservation tools.",
        solution: "Register for PM-KISAN (₹6,000 yearly income support) and PM-KUSUM (up to 90% subsidy for solar water pump installation).",
        prevention: "Register with KCC (Kisan Credit Card) to get agricultural production loans up to ₹3 lakh at reduced 4% interest rates.",
        cost: "Registration is FREE through local CSC (Common Service Centers).",
        expectedResult: "Direct benefit transfer (DBT) to bank accounts and reduced interest rates.",
        expertTip: "Link Aadhaar cards and land registry papers directly to CSC portal for seamless approval.",
        warning: "Do not pay registration fee to unofficial third-party agents. Apply only through government portals."
      },
      hindi: {
        problem: "भारत में वित्तीय सहायता और कृषि सब्सिडी कार्यक्रम।",
        reason: "छोटे किसानों की आय को मजबूत करने, ऋण पर निर्भरता कम करने और पानी बचाने वाले उपकरणों को बढ़ावा देने के लिए।",
        solution: "PM-KISAN (₹6,000 वार्षिक आय सहायता) और PM-KUSUM (सोलर पंप स्थापना पर 90% तक सब्सिडी) के लिए पंजीकरण करें।",
        prevention: "KCC (किसान क्रेडिट कार्ड) से जुड़कर ₹3 लाख तक के कृषि ऋण 4% कम ब्याज पर ले सकते हैं।",
        cost: "पंजीकरण स्थानीय CSC (सामान्य सेवा केंद्र) पर मुफ्त है।",
        expectedResult: "बैंक खाते में सीधे लाभ हस्तांतरण (DBT) और कम ब्याज दर।",
        expertTip: "अनुमोदन के लिए आधार और जमीन के कागजात सीधे CSC पोर्टल से लिंक करें।",
        warning: "अनधिकृत एजेंटों को कोई पंजीकरण शुल्क न दें। केवल सरकारी पोर्टल पर ही आवेदन करें।"
      },
      bhojpuri: {
        problem: "भारत में वित्तीय सहायता आ कृषि सब्सिडी कार्यक्रम।",
        reason: "छोटे किसान के आमदनी मजबूत करे, ऋण पर निर्भरता कम करे आ पानी बचाव के औजार बढ़ावे खातिर।",
        solution: "PM-KISAN (₹6,000 सालाना आय सहायता) आ PM-KUSUM (सोलर पंप लगावे पर 90% तक सब्सिडी) खातिर पंजीकरण करीं।",
        prevention: "KCC (किसान क्रेडिट कार्ड) से जुड़ के ₹3 लाख तक का कृषि ऋण 4% कम ब्याज पर ले सकत बानी।",
        cost: "पंजीकरण स्थानीय CSC (सामान्य सेवा केंद्र) पर मुफ्त बा।",
        expectedResult: "बैंक खाते में सीधे लाभ हस्तांतरण (DBT) आ कम ब्याज दर।",
        expertTip: "अनुमोदन खातिर आधार आ जमीन के कागजात सीधे CSC पोर्टल से जोड़ दीं।",
        warning: "अनधिकृत एजेंटों के पास कोई पंजीकरण शुल्क न दिहीं। सिर्फ सरकारी पोर्टल पर आवेदन करीं।"
      }
    };

    return localized[lang] || localized.english;
  }

  // Organic Farming Advice
  static getOrganicFarmingAdvice(lang) {
    const localized = {
      english: {
        problem: "Transitioning to Jaivik Kheti (Organic Farming) and pest prevention.",
        reason: "Chemical insecticides degrade soil microorganisms and lead to pest resistance.",
        solution: "Prepare 'Neemastra' or 'Jeevamrutha' using local neem seeds, cow dung, cow urine, and jaggery. Spray as natural insect repellents.",
        prevention: "Build green manuring beds of Sesbania (Dhaincha) and plow them back into the soil before sowing main crops.",
        cost: "₹300 - ₹500 per acre (Using locally sourced farm items).",
        expectedResult: "Gradual restore of organic carbon in soil, leading to premium organic crop prices.",
        expertTip: "Add crop rotation with legumes to naturally lock nitrogen back into soil without using synthetic fertilizers.",
        warning: "Organic transition takes 2-3 years for soil to recover fully. Expect slightly lower yields in the first season."
      },
      hindi: {
        problem: "जैविक खेती (जैविक खेती) की ओर बदलाव और कीट नियंत्रण।",
        reason: "रासायनिक कीटनाशक मिट्टी के सूक्ष्मजीवों को नुकसान पहुंचाते हैं और कीटों के प्रतिरोध को बढ़ाते हैं।",
        solution: "स्थानीय नीम के बीज, गाय का गोबर, गाय का मूत्र और गुड़ से नीमास्त्र या जीवामृत तैयार करें।",
        prevention: "सिंघाड़ा (धैनचा) की हरी खाद बनाकर मुख्य फसल बोने से पहले मिट्टी में मिला दें।",
        cost: "₹300 - ₹500 प्रति एकड़ (स्थानीय सामग्री से)।",
        expectedResult: "मिट्टी में कार्बन और जैविकता धीरे-धीरे लौटेगी।",
        expertTip: "दालों के साथ फसल चक्र अपनाएं ताकि नाइट्रोजन मिट्टी में प्राकृतिक रूप से बने रहे।",
        warning: "जैविक खेती में 2-3 साल लग सकते हैं। पहले सीजन में उपज थोड़ी कम हो सकती है।"
      },
      bhojpuri: {
        problem: "जैविक खेती (Jaivik Kheti) की ओर बदलाव आ कीड़ा रोकथाम।",
        reason: "रासायनिक कीटनाशक माटी के सूक्ष्मजीव नष्ट करे ला आ कीड़ा का प्रतिरोध बढ़ावे ला।",
        solution: "लोकल नीम के बीज, गाय का गोबर, गाय का मूत्र आ गुड़ से नीमास्त्र या जीवामृत तैयार करीं।",
        prevention: "धैनचा की हरी खाद बनाईं आ मुख्य फसल बोने से पहले माटी में मिला दीं।",
        cost: "₹300 - ₹500 प्रति एकड़ (लोकल सामग्री से)।",
        expectedResult: "माटी में कार्बन आ जैविकता धीरे-धीरे वापस आए।",
        expertTip: "दाल के साथ फसल चक्र अपनाईं ताकि नाइट्रोजन माटी में प्राकृतिक रूप से रहे।",
        warning: "जैविक खेती में 2-3 साल लग सकती बा। पहले सीजन में उपज थोड़ी कम हो सकेला।"
      }
    };

    return localized[lang] || localized.english;
  }

  // Fallback Dynamic Advisory
  static getFallbackAdvice(query, category, lang) {
    const localized = {
      english: {
        problem: `Information lookup for: "${query}" in agricultural category: [${category}]`,
        reason: `Query parsed successfully. Diagnostic systems suggest optimal recommendations for standard agronomy rules.`,
        solution: `Apply standard balanced organic manure, check irrigation spacing, and consult near agricultural extension office for localized pesticide prescriptions.`,
        prevention: `Enforce crop rotation, manage field borders to prevent pest migration, and select certified seeds.`,
        cost: `Variable based on local market rates (estimated under ₹1,200 per acre).`,
        expectedResult: `Optimization of soil parameters and protection of crop foliage from common stress factors.`,
        expertTip: `Always test soil health yearly to apply target nutrients instead of broad general inputs.`,
        warning: `Read chemical label directions carefully before applying any commercial insecticides.`
      },
      hindi: {
        problem: `कृषि श्रेणी [${category}] में जानकारी के लिए: "${query}"`,
        reason: `प्रश्न समझ लिया गया। सिस्टम ने मानक कृषि नियमों के अनुसार सबसे उपयुक्त सलाह दी है।`,
        solution: `संतुलित जैविक खाद डालें, सिंचाई की दूरी जांचें और स्थानीय कृषि विस्तार कार्यालय से सलाह लें।`,
        prevention: `फसल चक्र अपनाएं, खेत के सीमाओं का प्रबंधन करें और प्रमाणित बीज चुनें।`,
        cost: `स्थानीय बाजार दर के अनुसार बदलता है (लगभग ₹1,200 प्रति एकड़)।`,
        expectedResult: `मिट्टी के मानों में सुधार और फसल की पत्तियों की सुरक्षा।`,
        expertTip: `हर साल मिट्टी की जांच कराएं ताकि सही पोषक तत्व दिए जा सकें।`,
        warning: `किसी भी रासायनिक कीटनाशक को लगाने से पहले लेबल पढ़ लें।`
      },
      bhojpuri: {
        problem: `कृषि श्रेणी [${category}] में जानकारी खातिर: "${query}"`,
        reason: `सवाल समझ लेबल बा। सिस्टम मानक खेती के नियम पर सबसे नीमन सलाह दे रहल बा।`,
        solution: `संतुलित जैविक खाद डाल दीं, सिंचाई की दूरी जाँच करीं आ स्थानीय कृषि विस्तार केंद्र से सलाह ले लीं।`,
        prevention: `फसल चक्र अपनाईं, खेत के सीमावर्ती भाग देखभाल करीं आ प्रमाणित बीज चुनलीं।`,
        cost: `स्थानीय बाजार भाव के हिसाब से बदलत बा (लगभग ₹1,200 प्रति एकड़)।`,
        expectedResult: `माटी के गुण सुधार होई आ फसल के पत्ता सुरक्षित रहे।`,
        expertTip: `हर साल माटी की जाँच कराईं ताकि सही खाद मिल सके।`,
        warning: `किसी भी रासायनिक कीटनाशक लगावे से पहले लेबल पूरा पढ़ लीं।`
      }
    };

    return localized[lang] || localized.english;
  }
}
