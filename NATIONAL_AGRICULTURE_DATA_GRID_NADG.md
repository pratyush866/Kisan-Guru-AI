# पुस्तक: किसान गुरु AI (Kisan Guru AI)
## वॉल्यूम V: भारत कृषि ऑपरेटिंग सिस्टम (Bharat Agriculture Operating System - BAOS)
### अध्याय 2: राष्ट्रीय कृषि डेटा ग्रिड (National Agriculture Data Grid - NADG)
#### भारत का एकीकृत कृषि डेटा इन्फ्रास्ट्रक्चर (India's Unified Agricultural Data Infrastructure)

---

## विषय-सूची (Table of Contents)
1. **एक डेटा समस्या के रूप में कृषि: चुनौतियाँ और आवश्यकताएँ (Agriculture as a Data Problem: Challenges & Needs)**
2. **राष्ट्रीय कृषि डेटा ग्रिड (NADG): संरचनात्मक संकल्पना (National Agriculture Data Grid: Structural Concept)**
3. **कृषि डेटा स्रोत: आवृति और अद्यतन तंत्र (Agricultural Data Sources: Frequency & Update Mechanisms)**
4. **एकीकृत डेटा मॉडल: स्कीमा डिज़ाइन और संबंध (Unified Data Model: Schema Design & Relationships)**
5. **कृषि नॉलेज ग्राफ: ग्राफिक तार्किक संबंध (Agriculture Knowledge Graph: Graphical Logical Relations)**
6. **वास्तविक समय डेटा स्ट्रीमिंग और सिंक (Real-Time Data Streaming & Sync)**
7. **वितरित भंडारण और लेकहाउस वास्तुकला (Distributed Storage & Lakehouse Architecture)**
8. **डेटा गुणवत्ता इंजन: विसंगति पहचान और सत्यापन (Data Quality Engine: Anomaly Detection & Validation)**
9. **सुरक्षा वास्तुकला: शून्य विश्वास और डेटा सुरक्षा (Security Architecture: Zero Trust & Data Security)**
10. **एआई डेटा पाइपलाइन: एमएलऑप्स जीवनचक्र (AI Data Pipeline: MLOps Lifecycle)**
11. **राष्ट्रीय स्तर का बुनियादी ढांचा: कंप्यूट और एज नेटवर्क (National-Scale Infrastructure: Compute & Edge Networks)**
12. **क्रियान्वयन रोडमैप: चरणबद्ध मील के पत्थर (Implementation Roadmap: Phased Milestones)**
13. **दृष्टिकोण 2035 और नए उद्यम अवसर (Vision 2035 & New Startup Opportunities)**
14. **तकनीकी शब्दावली और परिशिष्ट (Technical Glossary & Appendix)**

---

## 1. एक डेटा समस्या के रूप में कृषि: चुनौतियाँ और आवश्यकताएँ (Agriculture as a Data Problem: Challenges & Needs)

आधुनिक कृषि विज्ञान अब केवल जैविक प्रक्रियाओं (biological processes) और शारीरिक श्रम तक सीमित नहीं है; यह एक अत्यंत जटिल डेटा इंजीनियरिंग समस्या (data engineering problem) बन चुका है। भारतीय कृषि परिदृश्य में प्रत्येक दिन पेटाबाइट-पैमाने का डेटा (petabyte-scale data) उत्पन्न होता है। लेकिन वर्तमान में यह डेटा पूरी तरह से अनुपयोगी साबित हो रहा है क्योंकि यह विखंडित, विरोधाभासी और पुराना (fragmented, duplicate, and delayed) है।

```
+-----------------------------------------------------------------------------------------------+
|                            वर्तमान विखंडित कृषि डेटा प्रवाह                                    |
+-----------------------------------------------------------------------------------------------+
|  [ भूलेख विभाग ]      [ उर्वरक वितरण ]      [ मंडी समितियां ]      [ मौसम विभाग ]    [ वित्तीय बैंक ] |
|  * लैंड रिकॉर्ड      * सब्सिडी कूपन        * दैनिक मूल्य          * ग्रिड मौसम       * लोन आवेदन     |
|       |                    |                     |                     |                  |       |
|       +--------------------+---------------------+---------------------+------------------+       |
|                                            |                                                          |
|                                            v (डेटा विसंगति / डेटा साइलो)                              |
|  +-----------------------------------------------------------------------------------------+  |
|  |           कोई साझा मेटाडेटा रजिस्ट्री या वास्तविक समय डेटा सिंक्रोनाइजेशन नहीं है          |  |
|  +-----------------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------------+
```

### 1.1 प्रमुख डेटा विसंगतियाँ (Core Data Inconsistencies):

1. **असंगत डेटा मानक (Inconsistent Data Standards)**:
   विभिन्न राज्य सरकारों के भूमि रिकॉर्ड (Bhulekh / Land Records) अलग-अलग डेटा संरचनाओं (schemas) और स्थानीय भाषाओं में संग्रहीत हैं। इसके परिणामस्वरूप, अंतर-राज्यीय लेनदेन या राष्ट्रीय स्तर पर भूमि वर्गीकरण का विश्लेषण करना असंभव हो जाता है।

2. **अत्यधिक डेटा विलंबता (High Data Latency)**:
   मंडी मूल्य (APMC market prices) आम तौर पर भौतिक रूप से संकलित किए जाते हैं और विभिन्न वेबसाइटों पर 24 से 48 घंटे के विलंब (latency) के साथ अपलोड किए जाते हैं। वास्तविक समय में निर्णय लेने वाले एआई सिस्टम (AI systems) के लिए यह बासी डेटा किसी काम का नहीं होता।

3. **कृषि एआई अवसंरचना की कमी (Lack of AI-Ready Infrastructure)**:
   एआई मॉडल (AI models) को सटीक भविष्यवाणियों के लिए उच्च-गुणवत्ता वाले, लेबल किए गए टाइम-सीरीज डेटा (labeled time-series data) की आवश्यकता होती है। लेकिन वर्तमान में उपलब्ध डेटा असममित (asymmetric) है, जिसमें भारी मात्रा में गायब मान (missing values) और नकली डुप्लीकेट रिकॉर्ड शामिल हैं।

4. **एकीकृत राष्ट्रीय डेटा परत की आवश्यकता (Need for a Unified National Data Layer)**:
   कृषि को एक एकीकृत, आत्मनिर्भर पारिस्थितिकी तंत्र बनाने के लिए एक ऐसे साझा डेटा बैकबोन की आवश्यकता है जो किसानों, ड्रोन पायलटों, मौसम स्टेशनों, वित्तीय संस्थानों और सरकारी प्रणालियों को वास्तविक समय में जोड़ सके। राष्ट्रीय कृषि डेटा ग्रिड (NADG) इसी शून्य को भरने का काम करता है।

---

## 2. राष्ट्रीय कृषि डेटा ग्रिड (NADG): संरचनात्मक संकल्पना (National Agriculture Data Grid: Structural Concept)

राष्ट्रीय कृषि डेटा ग्रिड (NADG) कोई साधारण केंद्रीय डेटाबेस नहीं है। यह एक अत्यधिक वितरित, सुरक्षित और इवेंट-संचालित डेटा एक्सचेंज नेटवर्क (event-driven data exchange network) है, जो संपूर्ण भारतीय कृषि जगत के लिए "सिंगल सोर्स ऑफ ट्रुथ" (Single Source of Truth - SSoT) के रूप में कार्य करता है।

```
+-----------------------------------------------------------------------------------------------+
|                          राष्ट्रीय कृषि डेटा ग्रिड (NADG) आर्किटेक्चर                         |
+-----------------------------------------------------------------------------------------------+
|                                                                                               |
|  [ डेटा इनपुट स्ट्रीम्स ] -> IoT सेंसर + उपग्रह इमेजरी + मंडी एपीआई + सरकारी पोर्टल            |
|                                           |                                                   |
|                                           v (सुरक्षित API गेटवे / OAuth2)                     |
|  +-----------------------------------------------------------------------------------------+  |
|  |                            साझा इंटेलिजेंस लेयर (Shared Intelligence Layer)              |  |
|  |  * मेटाडेटा रजिस्ट्री (Metadata Repository)   * डेटा गुणवत्ता सत्यापन (Data Quality)     |  |
|  |  * सहमति प्रबंधन इंजन (Consent Manager)      * लाइव डेटा स्ट्रीमिंग (Kafka/Flink)        |  |
|  +-----------------------------------------------------------------------------------------+  |
|                                           |                                                   |
|                                           v                                                   |
|  [ वितरित स्टोरेज ] -> ClickHouse (हॉट) + MinIO / S3 (वॉर्म) + Hadoop / Glacier (कोल्ड)     |
|                                           |                                                   |
|                                           v                                                   |
|  [ डेटा आउटपुट ] -> कृषि एआई इंजन (Cognitive Engine), नीति निर्माण, स्टार्टअप इकोसिस्टम       |
+-----------------------------------------------------------------------------------------------+
```

### 2.1 NADG के प्राथमिक कार्य (Primary Capabilities of NADG):

* **एकीकृत डेटा विनिमय (Unified Data Exchange)**: विभिन्न प्रणालियों के बीच डेटा साझा करने के लिए ओपन एपीआई (Open APIs) और डेटा एडेप्टर का उपयोग किया जाता है।
* **साझा इंटेलिजेंस लेयर (Shared Intelligence Layer)**: सभी अनुप्रयोगों को ऐतिहासिक पैदावार, मृदा विश्लेषण और कीट चक्रों का समेकित विश्लेषण प्रदान किया जाता है।
* **एआई-रेडी प्लेटफॉर्म (AI-Ready Platform)**: साफ, प्री-प्रोसेस्ड और फीचर-इंजीनियर्ड डेटा स्ट्रीम्स (feature-engineered streams) जिन्हें एआई मॉडल प्रशिक्षण के लिए सीधे उपयोग किया जा सकता है।
* **कृषि नॉलेज ग्राफ (Agriculture Knowledge Graph)**: विभिन्न डेटा एंटिटीज के बीच जटिल और अंतर्निहित जैविक एवं आर्थिक संबंधों का मानचित्रण।

---

## 3. कृषि डेटा स्रोत: आवृति और अद्यतन तंत्र (Agricultural Data Sources: Frequency & Update Mechanisms)

NADG में डेटा विभिन्न इनपुट धाराओं के माध्यम से प्रवाहित होता है। इन धाराओं की समय-सीमा और फ्रीक्वेंसी उनकी आवश्यकताओं के अनुसार अनुकूलित की जाती है।

### 3.1 डेटा इनपुट स्रोतों की रूपरेखा (Agricultural Data Sources Frequency Matrix)

| डेटा स्रोत (Data Source) | संग्रह विधि (Collection Method) | संग्रह आवृति (Frequency) | डेटा संरचना प्रकार (Format) |
| :--- | :--- | :--- | :--- |
| **मृदा स्वास्थ्य (Soil Health)** | प्रयोगशाला सेंसर और हैंडहेल्ड स्पेक्ट्रोमीटर | प्रत्येक फसल चक्र के बाद (6 माह) | अर्द्ध-संरचित JSON / XML |
| **मौसम डेटा (Weather Data)** | स्वचालित मौसम स्टेशन (AWS) और IMD राडार | प्रति 15 मिनट में लाइव स्ट्रीमिंग | संरचित CSV / JSON |
| **उपग्रह छवियां (Satellite)** | ISRO EOS, Sentinel-2 (Multispectral) | प्रत्येक 5 से 12 दिन में अपडेट | रास्टर जियोटिफ (GeoTIFF) |
| **खेत सेंसर (IoT Sensors)** | LoRaWAN सॉइल मॉइस्चर और लीफ सेंसर | प्रति 30 मिनट में लाइव स्ट्रीमिंग | बाइनरी स्ट्रीम (Protobuf/MQTT)|
| **बाजार भाव (Mandi Prices)** | APMC टर्मिनल और ई-नाम (e-NAM) फीड्स | दैनिक (शाम 5:00 बजे) | संरचित रिलेशनल डेटा |
| **भूमि अभिलेख (Bhulekh)** | राज्य सरकारों के भूलेख एपीआई | वास्तविक समय में सिंक (ऑन-डिमांड) | संरचित XML / JSON |
| **ड्रोन स्कैन (Drone Scans)** | ऑर्थोमोसैक इमेज और LIDAR क्लाउड डेटा | प्रति 15 से 30 दिन में | पॉइंट क्लाउड / GeoTIFF |
| **रसद और कोल्ड स्टोरेज** | गोदाम RFID और ट्रक GPS ट्रैकर्स | प्रति 5 मिनट में अपडेट | समय-श्रृंखला टेलीमेट्री |

---

## 4. एकीकृत डेटा मॉडल: स्कीमा डिज़ाइन और संबंध (Unified Data Model: Schema Design & Relationships)

NADG सभी विषम डेटा को एकीकृत करने के लिए एक सामान्य स्कीमा डिज़ाइन (Common Schema Design) का उपयोग करता है। यह स्कीमा रिलेशनल (SQL) और गैर-रिलेशनल (NoSQL) दोनों प्रणालियों के लिए आधार प्रदान करती है।

```
+---------------------------------------------------------------------------------------------------+
|                                      एकीकृत डेटा मॉडल इकाई संबंध                                   |
+---------------------------------------------------------------------------------------------------+
|  [ uaid_farmers (किसान) ]                                                                         |
|         | (1)                                                                                     |
|         v (N)                                                                                     |
|  [ uaid_fields (खेत पार्सल) ] <--- (1:N) ---> [ field_sensor_telemetry (IoT सेंसर टेलीमेट्री) ]   |
|         | (1)                                                                                     |
|         v (N)                                                                                     |
|  [ uaid_crop_batches (फसल बैच) ] <--- (1:N) -> [ crop_disease_events (कीट / रोग प्रकोप) ]         |
|         | (1)                                                                                     |
|         v (N)                                                                                     |
|  [ financial_transactions (वित्तीय लेनदेन) ]                                                      |
+---------------------------------------------------------------------------------------------------+
```

### 4.1 SQL स्कीमा विनिर्देश (PostgreSQL / Citus Spatial DDL Specification)

```sql
-- एक्सटेंशन सक्षम करें
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. किसान मुख्य प्रोफ़ाइल (Farmer Core Table)
CREATE TABLE nadg_farmers (
    farmer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_guid VARCHAR(50) NOT NULL UNIQUE, -- वैश्विक अनूठी पहचान संख्या
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    block VARCHAR(50) NOT NULL,
    consent_granted BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. खेत पार्सल और भौगोलिक सीमा (Farm Field Geometrical Table)
CREATE TABLE nadg_fields (
    field_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES nadg_farmers(farmer_id) ON DELETE CASCADE,
    survey_number VARCHAR(50) NOT NULL,
    boundary_polygon GEOMETRY(Polygon, 4326) NOT NULL, -- खेत की भौगोलिक सीमा (GIS Coordinates)
    soil_profile_class VARCHAR(50),
    drainage_index NUMERIC(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. फसल बैच और स्वास्थ्य (Crop Batch & Health Metrics Table)
CREATE TABLE nadg_crop_batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID REFERENCES nadg_fields(field_id) ON DELETE CASCADE,
    crop_type VARCHAR(50) NOT NULL,
    variety VARCHAR(50) NOT NULL,
    sown_date DATE NOT NULL,
    estimated_yield_kg NUMERIC(10, 2),
    actual_yield_kg NUMERIC(10, 2),
    status VARCHAR(20) DEFAULT 'ACTIVE' -- ACTIVE, HARVESTED, FAILED
);

-- 4. IoT सेंसर टेलीमेट्री (Sensor Telemetry - ClickHouse में माइग्रेट की जाने वाली मुख्य रिलेशनल टेबल)
CREATE TABLE nadg_sensor_telemetry (
    telemetry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID REFERENCES nadg_fields(field_id) ON DELETE CASCADE,
    sensor_id VARCHAR(50) NOT NULL,
    soil_moisture_percentage NUMERIC(5, 2) NOT NULL,
    soil_temperature_celsius NUMERIC(4, 2) NOT NULL,
    npk_sensor_data JSONB, -- { "N": 42.1, "P": 30.5, "K": 20.4 }
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. फसल रोग और प्रकोप घटनाएँ (Disease/Pest Event Tracking Table)
CREATE TABLE nadg_disease_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES nadg_crop_batches(batch_id) ON DELETE CASCADE,
    disease_name VARCHAR(100) NOT NULL,
    severity_level VARCHAR(20) NOT NULL, -- LOW, MEDIUM, CRITICAL
    affected_area_percentage NUMERIC(5, 2),
    detected_via VARCHAR(30) NOT NULL, -- SATELLITE, DRONE, FARMER_PHOTO
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- भौगोलिक और समय-आधारित सूचकांक (GIS and Spatial Indexing for Optimization)
CREATE INDEX idx_nadg_fields_boundary ON nadg_fields USING GIST(boundary_polygon);
CREATE INDEX idx_nadg_telemetry_time ON nadg_sensor_telemetry(recorded_at DESC);
```

---

## 5. कृषि नॉलेज ग्राफ: ग्राफिक तार्किक संबंध (Agriculture Knowledge Graph: Graphical Logical Relations)

डेटा ग्रिड में विभिन्न वस्तुओं (entities) के बीच केवल सीधे संबंध नहीं होते। एक कीट का संक्रमण मौसम के तापमान और क्षेत्र की मृदा नमी से गहराई से जुड़ा होता है। इस अंतर्निहित ज्ञान को मॉडल करने के लिए NADG एक विकेंद्रीकृत नॉलेज ग्राफ (Knowledge Graph) का उपयोग करता है।

```
                  +--------------------------------+
                  |  [:CULTIVATES]                 |
  (Farmer Node) --+---> (LandParcel Node)          |
   "रमेश कुमार"   |      "सर्वे संख्या 412/12"      |
                  +--------------------------------+
                               |
                               | (खेत में उगाई गई फसल)
                               v
                     (CropBatch Node) "टमाटर"
                               |
                               | (पीड़ित है)
                               v
                     (Pest Node) "अर्ली ब्लाइट"
                               |
                               | (नियंत्रित किया जाता है)
                               v
                  (Pesticide Node) "Mancozeb"
```

### 5.1 संबंध श्रृंखला और तर्क अनुप्रयोग (Neo4j Cypher Data Population & Inference Queries):

मृदा स्वास्थ्य, जलवायु विसंगति और फसल के रोगों के बीच संबंध स्थापित करने के लिए निम्नलिखित साइफर (Cypher) कोड का उपयोग किया जाता है:

```cypher
// 1. ग्राम और जिला स्तर के संबंध बनाएं
CREATE (d:District {name: "नालंदा", state: "बिहार"})
CREATE (v:Village {name: "हरनौत", village_code: "244102"})
CREATE (v)-[:BELONGS_TO]->(d)

// 2. फसल रोग और तापमान अनुकूलता संबंध
CREATE (p:Pest {name: "आलू का पछेती झुलसा (Late Blight)", scientific_name: "Phytophthora infestans"})
CREATE (c:ClimateCondition {id: "COND-001", optimal_humidity_percent: 85.0, optimal_temp_range: "12C-22C"})
CREATE (p)-[:THRIVES_IN]->(c)

// 3. लाइव अनुमानित क्वेरी (Inference Query to Detect Outbreak Risks)
// यदि किसी क्षेत्र में पिछले 72 घंटों में आर्द्रता 85% से अधिक और तापमान 15-20 डिग्री सेल्सियस के बीच रहा है,
// तो उन सभी खेतों की सूची निकालें जहाँ आलू की फसल उगाई जा रही है:
MATCH (d:District {name: "नालंदा"})<-[:BELONGS_TO]-(v:Village)<-[:LOCATED_IN]-(f:Field)-[:HAS_CROP]->(c:CropBatch {crop_name: "आलू"})
MATCH (p:Pest {name: "आलू का पछेती झुलसा (Late Blight)"})-[:THRIVES_IN]->(cc:ClimateCondition)
WHERE f.average_humidity_72h >= cc.optimal_humidity_percent
RETURN v.name AS Village, f.survey_number AS Field_Survey_No, c.variety AS Variety, p.name AS Warning_Target
```

---

## 6. वास्तविक समय डेटा स्ट्रीमिंग और सिंक (Real-Time Data Streaming & Sync)

डेटा ग्रिड में डेटा केवल बैच मोड में नहीं आता। IoT सेंसर, उपग्रह डेटा चैनल और मोबाइल डिवाइस लाखों संदेश प्रति सेकंड भेजते हैं। इस प्रवाह को संभालने के लिए NADG एक वितरित संदेश ब्रोकर (Apache Kafka) और स्ट्रीमिंग डेटा प्रोसेसर (Apache Spark/Flink) का उपयोग करता है।

```
+----------------------------------------------------------------------------------------------+
|                                    रीयल-टाइम स्ट्रीमिंग पाइपलाइन                            |
+----------------------------------------------------------------------------------------------+
| [ IoT सेंसर / डिवाइसेज ] --> LoRaWAN / GSM Gateway                                           |
|                                     |                                                        |
|                                     v (MQTT / HTTPS)                                         |
| [ Apache Kafka Brokers ]  --> Topics: 'sensor-raw-telemetry', 'market-ticks'                  |
|                                     |                                                        |
|                                     v                                                        |
| [ PySpark Stream Handler ]--> स्कीमा सत्यापन (Schema validation)                             |
|                               --> डेटा फ़िल्टरिंग और समूहीकरण (Aggregations)                 |
|                                     |                                                        |
|                                     v                                                        |
| [ ClickHouse Data Node ]  ---> समय-श्रृंखला डेटाबेस (Time-Series Storage)                     |
+----------------------------------------------------------------------------------------------+
```

### 6.1 स्पार्क स्ट्रीमिंग डेटा प्रोसेसिंग कोड (PySpark Stream Handler Script):

यह डेटा पाइपलाइन का केंद्रीय स्ट्रीमिंग ब्लॉक है जो काफ्का टॉपिक (Kafka Topic) `sensor-raw-telemetry` से डेटा पढ़कर उसे रीयल-टाइम में क्लिकहाउस डेटाबेस (ClickHouse Database) में सेव करता है।

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json, expr
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType

# 1. स्पार्क सत्र प्रारंभ करें (Initialize Spark Engine Session)
spark = SparkSession.builder \
    .appName("NADG-RealTime-Telemetry-Ingestion") \
    .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.4.0") \
    .getOrCreate()

# 2. इनपुट टेलीमेट्री स्कीमा परिभाषित करें (Define Input Schema)
telemetry_schema = StructType([
    StructField("field_id", StringType(), False),
    StructField("sensor_id", StringType(), False),
    StructField("soil_moisture", DoubleType(), False),
    StructField("soil_temperature", DoubleType(), False),
    StructField("recorded_at", TimestampType(), False)
])

# 3. काफ्का से डेटा स्ट्रीम शुरू करें (Read Stream from Kafka Brokers)
kafka_stream_df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka-broker-1.nadg.internal:9092,kafka-broker-2.nadg.internal:9092") \
    .option("subscribe", "sensor-raw-telemetry") \
    .option("startingOffsets", "latest") \
    .load()

# 4. बाइनरी पेलोड को स्ट्रिंग और जेएसओएन (JSON) में बदलें
parsed_stream_df = kafka_stream_df \
    .selectExpr("CAST(value AS STRING) as json_payload") \
    .select(from_json(col("json_payload"), telemetry_schema).alias("data")) \
    .select("data.*")

# 5. वाटरमार्किंग और प्रोसेसिंग नियम (Filter Outliers & Add Watermark for Latency Checks)
filtered_stream_df = parsed_stream_df \
    .withWatermark("recorded_at", "5 minutes") \
    .filter((col("soil_moisture") >= 0.0) & (col("soil_moisture") <= 100.0))

# 6. क्लिकहाउस या वितरित डेटा लेक में आउटपुट सिंक करें
query = filtered_stream_df.writeStream \
    .format("jdbc") \
    .option("url", "jdbc:clickhouse://clickhouse-coordinator.nadg.internal:8123/nadg_analytics") \
    .option("dbtable", "sensor_telemetry_hot") \
    .option("user", "nadg_streaming_writer") \
    .option("password", "SecureStreamingPassword1002") \
    .option("checkpointLocation", "s3a://nadg-lakehouse/checkpoints/telemetry/") \
    .start()

# query.awaitTermination() # उत्पादन के समय इसे सक्रिय किया जाता है
```

---

## 7. वितरित भंडारण और लेकहाउस वास्तुकला (Distributed Storage & Lakehouse Architecture)

NADG भंडारण लागत और पुनर्प्राप्ति गति (retrieval speed) के बीच संतुलन बनाने के लिए **मल्टी-टियर स्टोरेज मॉडल** (Multi-Tier Storage Model) का उपयोग करता है।

```
+------------------------------------------------------------------------------------------+
|                              NADG मल्टी-टियर स्टोरेज मॉडल                                |
+------------------------------------------------------------------------------------------+
|  * हॉट स्टोरेज (Hot Tier): ClickHouse (समय-श्रृंखला डेटा, रीयल-टाइम विश्लेषण, 30 दिन)     |
|         | (स्वचालित डेटा संक्रमण नियम)                                                   |
|         v                                                                                |
|  * वॉर्म स्टोरेज (Warm Tier): MinIO / Ceph (GeoTIFF सैटेलाइट इमेजरी, PDF रिपोर्ट्स, 1 वर्ष)|
|         |                                                                                |
|         v                                                                                |
|  * कोल्ड स्टोरेज (Cold Tier): Apache Hadoop HDFS / S3 Glacier (ऐतिहासिक पैदावार, 15 वर्ष) |
+------------------------------------------------------------------------------------------+
```

### 7.1 लेकहाउस वास्तुकला डिजाइन (Lakehouse Layers):

1. **कांस्य परत (Bronze Layer - Raw Ingestion)**:
   सभी इनपुट सेंसर लॉग, उपग्रह फ़ाइलें और मंडी डेटा को उनके मूल रूप (raw format) में अनछुआ संग्रहीत किया जाता है।
2. **रजत परत (Silver Layer - Cleaned & De-duplicated)**:
   डेटा की गुणवत्ता जांचने के बाद विसंगतियों को हटाया जाता है और टाइम-सीरीज को संरेखित (aligned) किया जाता है।
3. **स्वर्ण परत (Gold Layer - Analytical Aggregates)**:
   विशिष्ट विश्लेषणात्मक दृश्य (Analytical views) जैसे कि "गाँव की औसत उपज" या "साप्ताहिक सिंचाई सूचकांक" जो सीधे एआई मॉडल को फीड किए जाते हैं।

### 7.2 आपदा वसूली और बैकअप नीति (Disaster Recovery & Backup Policy):

* **भौगोलिक-पुनरावृत्ति (Geo-Replication)**: संपूर्ण चांदी और सोने की डेटा परतों को वास्तविक समय में प्राथमिक डेटा सेंटर (मुंबई) से माध्यमिक डेटा सेंटर (बेंगलुरु) में सिंक किया जाता है।
* **RTO & RPO**:
  * **RPO (Recovery Point Objective)**: < 15 सेकंड (वितरित जर्नल सिंकिंग)।
  * **RTO (Recovery Time Objective)**: < 10 मिनट (स्वचालित DNS रूटिंग स्विच)।

---

## 8. डेटा गुणवत्ता इंजन: विसंगति पहचान और सत्यापन (Data Quality Engine: Anomaly Detection & Validation)

खराब डेटा खराब निर्णयों को जन्म देता है। इसलिए, NADG में एक स्व-सुधारात्मक डेटा गुणवत्ता इंजन (Data Quality Engine) शामिल है जो सेंसर विफलता या धोखाधड़ी का स्वचालित रूप से पता लगाता है।

```
+----------------------------------------------------------------------------------------------+
|                                    डेटा गुणवत्ता इंजन वर्कफ़्लो                              |
+----------------------------------------------------------------------------------------------+
|  [ सेंसर डेटा इनपुट ] ---> स्थानीय सीमा मान परीक्षण (Min-Max limits)                        |
|                                       |                                                      |
|                                       v (यदि मान संदिग्ध हैं)                                |
|  [ एआई विसंगति पहचान मॉडल (Isolation Forest) ] ---> स्थानिक सहसंबंध सत्यापन (Spatial context) |
|                                       |                                                      |
|                   +-------------------+-------------------+                              |
|                   |                                       |                              |
|                   v (सत्यापित विसंगति)                   v (सामान्य रीडिंग)              |
|        [ रिकॉर्ड को चिह्नित करें ]              [ डेटा लेक में संग्रहीत करें ]         |
|        [ पिछले 7 दिनों के औसत से भरें ]                                                       |
+----------------------------------------------------------------------------------------------+
```

### 8.1 मशीन लर्निंग विसंगति पहचान एल्गोरिदम (Python Outlier Detector for IoT Telemetry):

सेंसर कई बार त्रुटिपूर्ण डेटा (जैसे अचानक आर्द्रता 100% या तापमान 90C दिखाना) भेजते हैं। यह स्क्रिप्ट Z-स्कोर (Z-Score) विश्लेषण और स्थानिक सहसंबंध (Spatial correlation) का उपयोग करके विसंगतियों को हटाती है:

```python
import numpy as np
from scipy import stats

def validate_telemetry_record(soil_moisture_series: list, current_reading: float, threshold=3.0) -> bool:
    """
    Z-स्कोर विश्लेषण का उपयोग करके सेंसर रीडिंग की सत्यता का मूल्यांकन करें।
    soil_moisture_series: पिछले 30 दिनों की ऐतिहासिक दैनिक औसत नमी मानों की सूची।
    current_reading: आज प्राप्त हुई वर्तमान रीडिंग।
    """
    if len(soil_moisture_series) < 5:
        # यदि ऐतिहासिक डेटा अपर्याप्त है, तो सामान्य सीमा सीमाओं से जांचें
        return 0.0 <= current_reading <= 100.0
        
    data = np.array(soil_moisture_series)
    mean = np.mean(data)
    std_dev = np.std(data)
    
    if std_dev == 0:
        return True # कोई भिन्नता नहीं है, मान स्वीकार्य है
        
    z_score = abs((current_reading - mean) / std_dev)
    
    # यदि Z-स्कोर सीमा से अधिक है, तो इसे एक विसंगति (Outlier) माना जाएगा
    if z_score > threshold:
        return False # डेटा अमान्य है (Suspected Anomaly)
        
    return True # डेटा वैध है
```

---

## 9. सुरक्षा वास्तुकला: शून्य विश्वास और डेटा सुरक्षा (Security Architecture: Zero Trust & Data Security)

राष्ट्रीय सुरक्षा और किसानों की व्यक्तिगत सुरक्षा के लिए NADG एक **शून्य विश्वास सुरक्षा ढांचा (Zero-Trust Security Architecture)** लागू करता है।

```
                                    +-----------------------+
                                    |     API Gateway       |
                                    |  (Mutual TLS 1.3 /    |
                                    |   OAuth2 KeyCloak)    |
                                    +-----------------------+
                                        /               \
                         (किसान सहमति सत्यापित)       (प्रशासक अनुमति)
                                      /                   \
                                     v                     v
                         +-------------------+     +-------------------+
                         |  किसान सहमति इंजन |     |  भूमिका आधारित   |
                         | (Consent Manager) |     |  नियंत्रण (RBAC)  |
                         +-------------------+     +-------------------+
                                     \                     /
                                      \                   /
                                       v                 v
                                    +-----------------------+
                                    |    ClickHouse / PostGIS|
                                    |  (AES-256 Encrypted)  |
                                    +-----------------------+
```

### 9.1 सहमति प्रबंधक और सुरक्षा तंत्र (Consent Management Infrastructure):

* **किसान-स्वामित्व वाला डेटा (Farmer-Owned Data)**: कोई भी वित्तीय संस्थान या एग्रीटेक कंपनी किसान की स्पष्ट डिजिटल सहमति के बिना उसकी भूमि सीमा या फसल उपज के डेटा तक नहीं पहुंच सकती।
* **भूमिका आधारित पहुंच नियंत्रण (Role-Based Access Control - RBAC)**:
  * **रिसर्च इंस्टिट्यूट**: केवल गुमनाम (anonymized) जिला स्तर के आंकड़ों तक पहुंच।
  * **बैंक / बीमा प्रदाता**: केवल विशिष्ट ऋणदाता किसान के सहमति टोकन (consent token) के साथ उसके खेत के विशिष्ट डेटा को देख सकता है।
  * **ड्रोन ऑपरेटर**: केवल उड़ान पथ सीमा (polygon boundaries) तक सीमित पहुंच।

### 9.2 सुरक्षित एपीआई अनुरोध पेलोड स्कीमा (Consent Verification JSON Payload Example):

जब कोई थर्ड-पार्टी ऐप किसान के सॉइल डेटा का उपयोग करना चाहता है, तो उसे गेटवे पर निम्नलिखित डिजिटल सहमति पेलोड जमा करना होता है:

```json
{
  "request_metadata": {
    "requester_id": "ORG-AGRI-LOAN-BANK-1002",
    "request_timestamp": "2026-07-05T00:42:00Z",
    "api_version": "v2.0"
  },
  "consent_token": {
    "token_id": "CNS-UUIDv7-55a2b",
    "farmer_uaid": "UAID-FMR-88120",
    "target_field_id": "UAID-FLD-99321",
    "authorized_scopes": ["soil_profile", "crop_history"],
    "expiry_timestamp": "2026-07-10T00:00:00Z",
    "digital_signature_sha256": "8f3b0c4298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
}
```

---

## 10. एआई डेटा पाइपलाइन: एमएलऑप्स जीवनचक्र (AI Data Pipeline: MLOps Lifecycle)

एआई डेटा पाइपलाइन का प्राथमिक लक्ष्य डेटा ग्रिड में संग्रहीत कच्चे आंकड़ों (raw telemetry) को वास्तविक समय में प्रशिक्षण सुविधाओं (training features) में बदलना और एआई मॉडल के संस्करणों को प्रबंधित करना है।

```
+-----------------------------------------------------------------------------------+
|                            NADG MLOps जीवनचक्र पाइपलाइन                           |
+-----------------------------------------------------------------------------------+
|  [ डेटा संग्रह (ClickHouse) ] ---> [ फीचर स्टोर (Feast Feature Store) ]            |
|                                                |                                  |
|                                                v                                  |
|  [ मॉडल प्रशिक्षण (Kubeflow) ] ---> [ एमएलफ्लो मॉडल रजिस्ट्री (MLflow Registry) ]  |
|                                                |                                  |
|                                                v                                  |
|  [ निरंतर मूल्यांकन (Evidently AI) ] <-> [ उत्पादन ट्राइटन सर्वर (Triton Node) ]   |
+-----------------------------------------------------------------------------------+
```

### 10.1 फीचर स्टोर डिज़ाइन (Feature Store Model):

NADG में **Feast Feature Store** का उपयोग किया जाता है। यह समय-श्रृंखला डेटा से फीचर्स (जैसे: `past_30d_average_humidity`, `ndvi_change_rate`) की गणना करता है और उन्हें एआई मॉडल के लिए कम विलंबता (low latency) के साथ उपलब्ध कराता है।

* **फीचर स्टोर स्कीमा (Feature Definition Script)**:
  1. **इकाई (Entity)**: `Field_ID`
  2. **फीचर्स (Features)**: `past_10d_rain_accumulated`, `crop_moisture_index`
  3. **ताजा डेटा रिपोजिटरी (Online Store)**: Redis (त्वरित पुनर्प्राप्ति के लिए)
  4. **ऐतिहासिक डेटा रिपोजिटरी (Offline Store)**: ClickHouse / Delta Lake (प्रशिक्षण के लिए)

---

## 11. राष्ट्रीय स्तर का बुनियादी ढांचा: कंप्यूट और एज नेटवर्क (National-Scale Infrastructure: Compute & Edge Networks)

100 मिलियन किसानों और अरबों डेटा रिकॉर्ड की सेवा के लिए, NADG बुनियादी ढांचे को अत्यधिक स्केलेबल बनाया गया है।

### 11.1 इन्फ्रास्ट्रक्चर स्केलिंग अनुमान (Infrastructure Scaling Matrix)

| घटक (Component) | वर्तमान पैमाना (Staging Scale) | लक्षित उत्पादन पैमाना (Target Scale) | आर्किटेक्चर समाधान (Solution) |
| :--- | :--- | :--- | :--- |
| **समवर्ती उपयोगकर्ता (Active Users)**| 50,000 / मिनट | 15 मिलियन / मिनट | Nginx, EKS Load Balancers |
| **रीयल-टाइम सेंसर** | 500,000 सेंसर नोड्स | 100 मिलियन सेंसर नोड्स | Kafka Cluster (100 Partitions) |
| **डेटाबेस स्टोरेज** | 50 टेराबाइट (TB) | 80 पेटाबाइट (PB) | ClickHouse distributed, HDFS |
| **उपग्रह छवियां** | 10 टीबी / माह | 2 पेटाबाइट / माह | object Storage (S3/MinIO Cluster)|
| **एआई अनुमान (AI Inference)**| 1,000 अनुरोध / सेकंड | 120,000 अनुरोध / सेकंड | NVIDIA TensorRT + Triton pools |
| **एज कंप्यूटिंग** | 100 ग्राम नोड्स | 250,000 ग्राम पंचायत नोड्स | Raspberry Pi 5 & Jetson Edge Box|

### 11.2 नेटवर्क नेटवर्क टोपोलॉजी (Physical Network Topology):

```
                                +-----------------------+
                                |  राष्ट्रीय डेटा सेंटर |
                                |  (Core Supercomputer) |
                                +-----------------------+
                                      /           \
                       (10 Gbps फाइबर)             (10 Gbps फाइबर)
                                    /               \
                       +-------------------+     +-------------------+
                       |  राज्य मुख्यालय    |     |  राज्य मुख्यालय    |
                       |  (State Cloud IDP)|     |  (State Cloud IDP)|
                       +-------------------+     +-------------------+
                                 |                         |
                           (SD-WAN Mesh)             (SD-WAN Mesh)
                                 |                         |
                       +-------------------+     +-------------------+
                       | ग्राम पंचायत नोड्स  |     | ग्राम पंचायत नोड्स  |
                       | (Village Edge Box)|     | (Village Edge Box)|
                       +-------------------+     +-------------------+
```

---

## 12. क्रियान्वयन रोडमैप: चरणबद्ध मील के पत्थर (Implementation Roadmap: Phased Milestones)

NADG परियोजना को पांच रणनीतिक चरणों में लागू किया जाएगा।

### 12.1 चरणबद्ध क्रियान्वयन (NADG Implementation Phased Matrix)

```
2026          2027          2028          2029          2030+
  |-------------|-------------|-------------|-------------|---------->
  Phase 1       Phase 2       Phase 3       Phase 4       Phase 5
  राज्य         राष्ट्रीय     एआई-रेडी      वास्तविक      वैश्विक
  डेटाबेस       मेटाडेटा      डेटा लेकहाउस  समय विश्लेषण  अंतर-संचालन
  एकीकरण        रजिस्ट्री      की स्थापना    का पूर्ण रोल  (Global Grid)
```

* **चरण 1: राज्य एकीकरण (Phase 1: State Integration - 12 महीने)**:
  सभी 28 राज्यों और 8 केंद्र शासित प्रदेशों के भूमि रिकॉर्ड और कृषि मंडियों के सर्वर को एकीकृत करना।
* **चरण 2: राष्ट्रीय रजिस्ट्री (Phase 2: National Registry - 12 महीने)**:
  UAID किसान और भू-स्थानिक डेटा रजिस्ट्री को राष्ट्रीय स्तर पर लाइव करना।
* **चरण 3: एआई-रेडी डेटा प्लेटफॉर्म (Phase 3: AI-Ready Platform - 12 महीने)**:
  वितरित स्टोरेज (ClickHouse/MinIO) और Feast फीचर स्टोर की स्थापना।
* **चरण 4: वास्तविक समय इंटेलिजेंस (Phase 4: Real-time Intelligence - 12 महीने)**:
  पंचायत स्तर पर एज नोड्स और LoRaWAN सेंसर के ग्रिड का विस्तार। काफ्का-स्पार्क स्ट्रीमिंग पाइपलाइनों की शुरुआत।
* **चरण 5: वैश्विक कृषि अंतर-संचालन (Phase 5: Global Interoperability - निरंतर)**:
  वैश्विक खाद्य नीति निकायों और अंतर्राष्ट्रीय आपदा प्रबंधन नेटवर्क के साथ सुरक्षित डेटा विनिमय का विकास।

---

## 13. दृष्टिकोण 2035 और नए उद्यम अवसर (Vision 2035 & New Startup Opportunities)

वर्ष 2035 तक, NADG भारत की कृषि क्रांति का आधार बन जाएगा। यह पारदर्शी डेटा लेयर नए स्टार्टअप्स और अनुसंधान के लिए अपार संभावनाएं पैदा करेगी।

### 13.1 कृषि टेक स्टार्टअप अवसर (Startup Opportunities in NADG Ecosystem):

```
+---------------------------------------------------------------------------------------+
|                        NADG समर्थित नए व्यावसायिक अवसर                                 |
+---------------------------------------------------------------------------------------+
|  1. स्वचालित बीमा निपटान (Automated Insurance Clearence):                              |
|     सैटेलाइट फसल क्षति डेटा और मौसम डेटा का उपयोग करके 24 घंटे में भुगतान।             |
|  2. प्रिसिजन कृषि-ऋण (Precision Agri-Lending):                                        |
|     किसानों के ऐतिहासिक फसल उपज और लेनदेन आंकड़ों के आधार पर लो-कॉस्ट माइक्रो लोन।     |
|  3. ड्रोन-एज-ए-सर्विस (Drone-as-a-Service - DaaS):                                      |
|     खेत में कीट संक्रमण की जीपीएस मैपिंग के बाद स्वचालित छिड़काव सेवा बुक करना।         |
+---------------------------------------------------------------------------------------+
```

### 13.2 भविष्य की अनुसंधान दिशाएं (Future Research Directions):

* **मृदा कार्बन अनुक्रमण (Soil Carbon Sequestration Tracking)**: उपग्रह इमेजरी और सेंसर डेटा का उपयोग करके मिट्टी में जैविक कार्बन के स्तर को मापना, ताकि किसान वैश्विक कार्बन क्रेडिट बाजारों (carbon credit markets) में अपनी हिस्सेदारी का दावा कर सकें।
* **जैव-विविधता संकेतक (Biodiversity Indicators)**: एआई डेटा विश्लेषण के माध्यम से फसल पैटर्न और मिट्टी की सूक्ष्मजीव विविधता के बीच संबंध स्थापित करना।

---

## 14. तकनीकी शब्दावली और परिशिष्ट (Technical Glossary & Appendix)

### 14.1 तकनीकी शब्दावली (Bilingual Glossary):

1. **SSoT (Single Source of Truth / एकल सत्य स्रोत)**: सूचना प्रौद्योगिकी में वह अभ्यास जहाँ डेटा को केवल एक केंद्रीय या प्रामाणिक स्थान पर संग्रहीत किया जाता है, ताकि विभिन्न प्रणालियों में विरोधाभास न हो।
2. **Lakehouse Architecture (लेकहाउस वास्तुकला)**: एक नया डेटा आर्किटेक्चर जो डेटा लेक की लचीलापन और कम लागत को डेटा वेयरहाउस की ट्रांजैक्शनल इंटीग्रिटी (ACID properties) के साथ जोड़ता है।
3. **Z-Score (जेड-स्कोर)**: सांख्यिकी में वह संख्या जो दर्शाती है कि कोई डेटा पॉइंट माध्य (mean) से कितने मानक विचलन (standard deviation) दूर है। इसका उपयोग विसंगतियों को पहचानने के लिए किया जाता है।
4. **Citus PostgreSQL (साइटस पोस्टग्रेएसक्यूएल)**: पोस्टग्रेएसक्यूएल का एक ओपन-सोर्स एक्सटेंशन जो डेटाबेस को वितरित डेटाबेस (distributed database) में बदल देता है, जिससे अरबों डेटा पंक्तियों पर तेज क्वेरी निष्पादन संभव होता है।
5. **Protobuf (प्रोटोकॉल बफ़र्स)**: डेटा को तेजी से सीरियलाइज़ करने के लिए गूगल द्वारा विकसित एक बाइनरी फॉर्मेट, जो जेएसओएन (JSON) की तुलना में बहुत हल्का और कुशल होता है।

### 14.2 सिस्टम और सुरक्षा स्थिरांक (Security Constants Matrix for NADG Systems):

* **Encryption Standard**: AES-256-GCM डेटा स्टोरेज और ट्रांसमिशन दोनों स्तरों पर।
* **Mutual TLS (mTLS)**: TLS 1.3 केवल सुरक्षित इलिप्स-कर्व (ECDSA) एल्गोरिदम के साथ।
* **Token Standard**: JSON Web Token (JWT) RS256 हस्ताक्षरित प्रमाणन के साथ।

---

### निष्कर्ष (Conclusion)

"The National Agriculture Data Grid is not merely a database. It is the nervous system of India's Agriculture Operating System."
