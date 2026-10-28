# IEEE-STYLE SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## SYSTEM: Kisan Guru AI (किसान गुरु)
### Document Version: 1.1.0-Platinum Review | Date: July 05, 2026

---

## 1. Cover Page
* **Product Name**: Kisan Guru AI (किसान गुरु)
* **Target Platforms**: Android (Flutter Native/Hybrid), iOS (Architecture Ready), Web (Admin & Doctor Portal), Backend (FastAPI Asynchronous Gateway)
* **Project Mission**: AI-Powered Agrarian Assistant for Indian Farmers
* **Authors**: Principal Software Architect, Senior Product Manager, Lead AI Solutions Architect, PostgreSQL DB Designer, DevOps Engineer
* **Organization**: Kisan Guru Technologies Pvt. Ltd., New Delhi, India
* **Classification**: Proprietary & Confidential

---

## 2. Document History
| Date | Version | Description of Change | Primary Authors | Reviewed By |
| :--- | :--- | :--- | :--- | :--- |
| 2026-06-20 | 1.0.0-Draft | Initial draft defining baseline specs, modules, and structures. | Lead System Architect | Product Committee |
| 2026-06-20 | 1.0.0-Release| Approved release version ready for development sprint kickoff. | Architectural Board | Chief technology Officer |
| 2026-07-05 | 1.1.0-Platinum Review | Expanded the chapter with premium UI/UX, Hindi-first experience, accessibility, DevSecOps, observability, resilience, and enterprise AI architecture. | Principal Architect | CTO Review Board |

---

## 3. Version Control
The project maintains a strict Git branching workflow combined with Semantic Versioning 2.0.0:
* **Major Revisions (X.0.0)**: Introduced when backward-incompatible structural changes occur. This includes changes to database schema partitions or shifts in JWT security rotation.
* **Minor Revisions (1.Y.0)**: Used when adding backward-compatible feature units, such as a new veterinary doctor chat model or Bhojpuri translation pack.
* **Patch Revisions (1.0.Z)**: Applied for hotfixes, package upgrades, and security patches.

---

## 4. Table of Contents
1. Cover Page
2. Document History
3. Version Control
4. Table of Contents
5. Introduction
6. Purpose
7. Scope
8. Product Overview
9. Product Perspective
10. Objectives
11. Business Goals
12. User Types
13. User Stories
14. Functional Requirements
15. Non Functional Requirements
16. Security Requirements
17. Privacy Requirements
17A. Human-Computer Interaction, Accessibility & Premium UI Requirements
17B. DevSecOps, Observability & Reliability Requirements
18. AI Requirements
19. Image Processing Requirements
20. Weather Intelligence Requirements
21. Voice Assistant Requirements
22. Crop Management Requirements
23. Animal Health Requirements
24. Farm Calendar Requirements
25. Notification Requirements
26. Chat Requirements
27. Student Module Requirements
28. Vet Doctor Module Requirements
29. Farm Helper Module Requirements
30. Machine Rental Module Requirements
31. Admin Module Requirements
32. Dashboard Requirements
33. Analytics Requirements
34. Error Handling Requirements
35. Logging Requirements
36. Backup Strategy
37. Disaster Recovery
38. Scalability Requirements
39. Performance Requirements
40. Accessibility Requirements
41. Localization Requirements
42. Offline Mode Requirements
43. Future Scope
44. Assumptions
45. Constraints
46. Risks
47. Acceptance Criteria
48. Deployment Requirements
49. Testing Requirements
50. Conclusion

---

## 5. Introduction
Indian agriculture involves over 140 million farming households facing multiple issues: unpredictable weather shifts, plant pests, expensive machinery rentals, language barriers, and a lack of local veterinary diagnostics. 

**Kisan Guru AI** is designed to address these issues. It integrates computer vision leaf diagnostics, voice-activated queries in regional languages, a shared-economy marketplace for heavy farm equipment, and veterinary diagnostics. The application operates under a strict offline-first design pattern, caching agricultural schedules, local calendars, and voice guides to ensure access in areas with weak cellular coverage.

---

## 6. Purpose
This SRS establishes the absolute functional, behavioral, operational, and non-functional requirements for the Kisan Guru AI ecosystem. It acts as the definitive design reference for the engineering, quality assurance, database administration, and operations teams. All subsequent architectural specifications and test scripts must be traced directly back to this document.

---

## 7. Scope
The Kisan Guru AI ecosystem includes the following technical components:
* **Frontend Mobile Application**: Built on Flutter to compile native Android applications (SDK 21+) and maintain an iOS-ready UI layout. Enforces localized speech-to-speech queries, offline databases via SQLCipher, and TensorFlow Lite model inference.
* **Backend Services API**: High-performance FastAPI server running Python 3.11 with asynchronous connection pooling, handling requests and serving as the controller for Celery workers.
* **Database & In-Memory Store**: A relational PostgreSQL database with PostGIS extensions for geospatial tractor matching, and Redis cache handling websocket sessions and rate limiting.
* **AI Pipelines & Workers**: Celery workers deploying YOLOv8 image processing models, Whisper ASR translation models, FastSpeech2 Text-to-Speech, and LLMs with Retrieval-Augmented Generation (RAG) mapped to verified agronomy data sources.

---

## 8. Product Overview
Kisan Guru AI is an all-in-one assistant for Indian farmers. Users can photograph damaged crops or livestock, ask questions in local languages, coordinate equipment rentals, and receive weather alerts in local dialects.

---

## 9. Product Perspective
The platform is organized as a monorepo backend and a modular Flutter application. 

```
                                  +------------------------------------+
                                  |    Flutter Mobile Client           |
                                  |    - SQLCipher Offline Caching     |
                                  |    - On-device Voice activity (VAD)|
                                  +------------------------------------+
                                                   |
                                     (HTTPS / TLS 1.3 / Websockets)
                                                   |
                                                   v
                                  +------------------------------------+
                                  |   FastAPI Application Gateway      |
                                  |   - JWT Token Authentication       |
                                  |   - Rate Limiter & Router          |
                                  +------------------------------------+
                                     /             |              \
                                    /              |               \
                                   v               v                v
                  +-------------------+   +------------------+   +-------------------+
                  | PostgreSQL        |   | Redis Cache      |   | Celery Workers    |
                  | - PostGIS Queries |   | - Session Store  |   | - PyTorch Inference|
                  | - Crop Ledgers    |   | - Message Broker |   | - RAG LLM Pipelines|
                  +-------------------+   +------------------+   +-------------------+
```

---

## 10. Objectives
* **Regional Accessibility**: Provide voice commands in regional languages (Hindi, Bhojpuri, Awadhi, English) to assist semi-literate users.
* **Diagnostics Performance**: Enable leaf disease diagnosis in under 2 seconds.
* **Reliable Syncing**: Enforce an offline outbox pattern to queue actions (like calendar notes or equipment rentals) and sync them when internet is restored.

---

## 11. Business Goals
* **Reach**: Acquire 10 million active users in Uttar Pradesh, Bihar, and Madhya Pradesh within 24 months of launch.
* **Yield Improvement**: Reduce average crop damage by 15% via early disease warning notifications.
* **Rental Economy**: Enable local equipment owners to share resources, targeting a 20% increase in machine utilization rate.

---

## 12. User Types
1. **Farmer**: Uses diagnostics, voice questions, calendars, and machinery rentals.
2. **Agriculture Student**: Enters field data, verifies crop issues, and earns credentials.
3. **Veterinary Doctor**: Manages cattle profiles, reviews diagnoses, and handles remote calls.
4. **Farm Helper**: Uses the marketplace to offer labor (e.g., harvesting or tractor driving).
5. **Machine Owner**: Lists equipment (tractors, combine harvesters) with rates and terms.
6. **Admin**: Manages configurations, reviews moderation flags, and verifies veterinary licenses.

---

## 13. User Stories
* **US-01 (Farmer - Crop Disease)**: As a farmer in rural Bihar, I want to take a photo of my rice leaves so that the app can immediately identify bacterial leaf blight and suggest a remedy in Bhojpuri.
* **US-02 (Farmer - Voice Query)**: As a Hindi-speaking farmer, I want to say, "आलू में झुलसा रोग की दवा क्या है?" (What is the medicine for potato blight?) and hear the answer spoken back to me in Hindi.
* **US-03 (Machine Owner - Tractor Rental)**: As a tractor owner, I want to list my equipment for ₹1000/hour with GPS tracking so that farmers within 20km can rent it for plowing.
* **US-04 (Vet Doctor - Cattle Diagnosis)**: As a veterinary doctor, I want to view a cattle's symptoms and skin lesions in a diagnostic report before joining a virtual consultation.

---

## 14. Functional Requirements

### FR-1: Account Security & Access
* **FR-1.1**: The system must verify users using mobile phone numbers and OTP SMS.
* **FR-1.2**: Access tokens (JWT, 15-minute lifespan) and refresh tokens (7-day lifespan, stored in Postgres) must be rotated dynamically.

### FR-2: Crop Disease AI Diagnostics
* **FR-2.1**: The system must process uploaded leaf photos using YOLOv8 models to identify diseases.
* **FR-2.2**: The system must provide organic remedies, chemical options, and direct links to verify product safety.

### FR-3: Localized Speech Assistant
* **FR-3.1**: The system must accept voice queries, convert speech to text, run them against an agricultural RAG LLM pipeline, and read back the output.

### FR-4: Shared Machinery Marketplace
* **FR-4.1**: The system must match rental listings within a geofenced area using PostGIS.
* **FR-4.2**: The system must manage booking states through a defined workflow:
  `Created -> Approved by Owner -> Deposit Paid -> Active -> Completed -> Reviewed`.

---

## 15. Non-Functional Requirements
* **Usability**: The dashboard must prioritize one-tap access to primary tools (Voice AI and Diagnostics Camera).
* **Reliability**: System components must target 99.9% uptime with automated database recovery failovers.
* **Scalability**: The backend must handle up to 10,000 concurrent API requests using horizontal scaling.

---

## 16. Security Requirements
* **Network Security**: Enforce TLS 1.3 encryption on all connections.
* **Credential Protection**: Store API keys, passwords, and sensitive settings inside AWS Parameter Store / Vault.
* **Token Access**: Revoke active user sessions globally if a refresh token is reused or marked as compromised.

---

## 17. Privacy Requirements
* **Data Privacy**: Anonymize user profiles and locations prior to diagnostic analysis.
* **Access Permissions**: Prompt users in Flutter for permissions (Camera, Mic, GPS) and explain why they are required.
* **Data Deletion**: Allow users to request profile deletion, which purges personal records from storage within 14 business days.

---

## 17A. Human-Computer Interaction, Accessibility & Premium UI Requirements
* **Experience Design**: All user-facing dashboards, mobile screens, admin portals, and voice experiences must follow a premium modern interface similar to leading consumer AI products, using Material Design 3 principles, rounded cards, glassmorphism-inspired surfaces, soft shadows, responsive layouts, and smooth animations.
* **Visual Design System**: Define primary, secondary, and accent colors with a consistent palette, premium typography, generous spacing, strong hierarchy, animated charts, interactive GIS maps, skeleton loading states, and polished iconography.
* **Accessibility Standards**: Support dark mode, light mode, high contrast mode, screen readers, keyboard navigation, large touch targets, reduced motion preferences, and clear focus states.
* **Farmer-Centered Localization**: The default experience must be fully available in Hindi, with all UI text, notifications, help flows, error messages, tutorials, and voice responses localized. The system must support future expansion to Bhojpuri, Awadhi, Marathi, Tamil, Telugu, Bengali, Punjabi, Gujarati, Malayalam, and Kannada through a centralized localization framework.
* **Voice Experience**: Provide a voice assistant with animated listening, speaking, and processing states, audible confirmation cues, Hindi voice output, offline fallback prompts, and low-latency responses for weak network conditions.
* **Mobile & Web Responsiveness**: Mobile layouts must prioritize one-thumb workflows; tablet layouts must present side-by-side dashboards; desktop layouts must provide richer analytics and admin tools without sacrificing performance.

---

## 17B. DevSecOps, Observability & Reliability Requirements
* **Security by Design**: Enforce TLS 1.3, secret rotation, RBAC, audit logging, immutable deployment artifacts, dependency scanning, and secure configuration management.
* **Operational Readiness**: The platform must expose health endpoints, distributed tracing, application metrics, incident dashboards, synthetic probes, and structured logs for SRE and AIOps workflows.
* **Reliability Targets**: The service must meet 99.9% availability, support graceful degradation during outages, provide automated rollback, and sustain recovery from regional failures using backup and disaster recovery runbooks.
* **Scalability**: The architecture must support elastic scaling for peak advisory seasons, bursty image processing, and concurrent voice sessions without degradation.

---

## 18. AI Requirements
* **Model Pipeline**: 
  ```
  User Audio -> Whisper ASR -> Text Query -> RAG Embedding Search -> LLM -> Text Response -> TTS Engine -> User Audio
  ```
* **RAG System**: Map the LLM database to verified directories from the Indian Council of Agricultural Research (ICAR).

---

## 19. Image Processing Requirements
* **Resolution Limits**: Resize uploaded photos to $640 \times 640$ pixels on-device to reduce bandwidth usage.
* **Correction Rules**: Standardize image brightness and contrast server-side using OpenCV before diagnostic processing.
* **Edge Processing**: Provide a compact on-device TensorFlow Lite model ($<15\text{MB}$) to perform basic crop diagnostics when offline.

---

## 20. Weather Intelligence Requirements
* **Telemetry Source**: Integrate with OpenWeatherMap and IMD APIs to fetch local village-level forecasts.
* **Actionable Advisories**: Generate watering and crop protection suggestions based on moisture levels and temperatures.
* **Voice Updates**: Read out extreme weather warnings (e.g., hailstorms, frost) in the farmer's selected local dialect.

---

## 21. Voice Assistant Requirements
* **Voice Detection**: Stop audio recording automatically after 1.5 seconds of silence.
* **Audio Efficiency**: Encode voice recordings to the Opus codec at 16kbps to ensure performance over weak 3G networks.
* **Audio Playback**: Use regional accents for Text-to-Speech readbacks to make guidance easier to understand.

---

## 22. Crop Management Requirements
* **Custom Sowing Calendar**: Adjust schedules dynamically based on crop variety, soil conditions, and the user's sowing date.
* **Watering Guidance**: Alert users to irrigate based on local soil dry spells and high temperatures.
* **Yield Planning**: Provide crop rotation recommendations based on the user's historical cultivation records.

---

## 23. Animal Health Requirements
* **Cattle Skin Inspection**: Detect conditions like Lumpy Skin Disease (LSD) from photos using OpenCV and PyTorch.
* **Health Log**: Guide users through structured questions (e.g., "Is the animal eating?", "Does it have a fever?") to document symptoms.
* **Veterinary Finder**: Match users with registered veterinary doctors within a 25km radius.

---

## 24. Farm Calendar Requirements
* **Recurring Tasks**: Allow users to set repeating alerts (e.g., "Apply fertilizer every 10 days").
* **Offline Sync**: Log calendar adjustments locally and sync them with the server when connection is restored.
* **Device Notifications**: Interface with Android's AlarmManager to trigger reminders even if the application is closed.

---

## 25. Notification Requirements
* **Push Service**: Use Firebase Cloud Messaging (FCM).
* **Deep Linking**: Attach JSON parameters to route users directly to relevant dashboard sections (e.g., disease reports).
* **Delivery Queue**: Store system notifications in a local queue if the device is offline, displaying them once connection is established.

---

## 26. Chat Requirements
* **WebSocket Integration**: Connect chat services using FastAPI WebSockets.
* **Delivery Status**: Track message states (`Sent`, `Delivered`, `Read`) in the database.
* **Media Uploads**: Allow sharing images of crop issues and voice notes directly in chat sessions.

---

## 27. Student Module Requirements
* **Verification Tasks**: Display local diagnostic verification tasks to students on a map dashboard.
* **Credit Registry**: Award points to students for verified farm visits, redeemable for academic credits or incentives.
* **Second Opinion Portal**: Route flagged diagnostic queries to students for validation before escalation.

---

## 28. Vet Doctor Module Requirements
* **Medical Dashboard**: Provide doctors with active consultation profiles, case histories, and symptom logs.
* **Prescription Engine**: Include digital prescription templates for animal medicines.
* **Duty Toggle**: Allow doctors to toggle their availability for consultations.

---

## 29. Farm Helper Module Requirements
* **Labor Board**: List daily tasks (e.g., "Harvesting help needed for 2 acres, ₹700/day").
* **Geo-Radius Filter**: Filter available labor tasks within a 15km radius of the helper.
* **Secure Payment**: Manage helper payments through UPI APIs.

---

## 30. Machine Rental Module Requirements
* **Geospatial Mapping**: Index equipment listings using PostGIS queries.
* **Security Deposits**: Manage variable security deposits based on equipment type.
* **Rating Portal**: Require both renter and owner to rate the transaction after completion.

---

## 31. Admin Module Requirements
* **Auto-Mod**: Flag inappropriate messages or low-resolution images using classification models.
* **User Management**: Allow administrators to freeze accounts, verify credentials, and review transactions.
* **System Toggles**: Provide controls to adjust thresholds and update model weights dynamically.

---

## 32. Dashboard Requirements
* **Farmer view**: Display current weather forecasts, today's tasks, disease warnings, and rental requests.
* **Admin view**: Display active system traffic, model performance metrics, and transaction summaries.

---

## 33. Analytics Requirements
* **Disease Heatmaps**: Map outbreaks to help authorities allocate crop protection resources.
* **Accuracy Tracking**: Monitor user feedback on AI diagnostics to identify performance degradation.
* **Onboarding Funnels**: Track user drop-offs to improve localized workflows.

---

## 34. Error Handling Requirements
* **Standard Errors**: Return unified JSON error payloads from the API:
  ```json
  {
    "detail": "Descriptive error message",
    "error_code": "ERROR_CODE"
  }
  ```
* **Offline Fallbacks**: Intercept network failures in Flutter and route queries to cached database records.
* **API Fail-Safes**: Use circuit breakers to keep the system running if external weather or LLM APIs go down.

---

## 35. Logging Requirements
* **Structured Logs**: Format server logs in JSON using Python `structlog` for easy aggregation.
* **Privacy Controls**: Mask sensitive details (e.g., passwords, PINs, auth tokens) in system logs.
* **Client Diagnostics**: Cache non-sensitive device crash logs and upload them to Sentry when connected to Wi-Fi.

---

## 36. Backup Strategy
* **Continuous Backups**: Save database transaction logs (WAL) to AWS S3 using WAL-G.
* **Retention Policy**: Keep daily incremental backups for 7 days, weekly backups for 4 weeks, and monthly backups for 12 months.
* **Asset Replication**: Replicate uploaded crop and animal photos across multiple regions.

---

## 37. Disaster Recovery
* **Targets**: Target Recovery Point Objective (RPO) < 5 minutes, and Recovery Time Objective (RTO) < 4 hours.
* **Redundant Deployment**: Deploy a hot standby environment in a secondary region to handle failovers.

---

## 38. Scalability Requirements
* **Instance Scaling**: Auto-scale FastAPI server instances based on CPU utilization and incoming requests.
* **DB Partitioning**: Partition database log tables by month to maintain query speed over time.
* **Asset Delivery**: Cache translation assets, images, and static resources globally using a CDN.

---

## 39. Performance Requirements
* **Gateway Latency**: Resolve core API requests in under 150ms.
* **Voice Latency**: Return text-to-speech voice responses within 800ms of a query.
* **Device Limits**: Restrict the mobile app's RAM usage to 250MB during active camera operations.

---

## 40. Accessibility Requirements
* **Speech Control**: Allow users to navigate key app screens using voice commands.
* **Screen Reader Support**: Design UI layouts to WCAG 2.1 AA standards and provide labels for screen readers.
* **High Contrast Display**: Include high-contrast display modes optimized for outdoor readability.

---

## 41. Localization Requirements
* **Supported Dialects**: Hindi, Bhojpuri, Awadhi, and English.
* **Dynamic Local Translation**: 
  ```
  Is Awadhi Translation Available? 
     |-- Yes: Display Awadhi 
     |-- No: Fallback to Hindi -> Then fallback to English
  ```
* **Regional Terminology**: Use localized crop names in advisories depending on the user's region.

---

## 42. Offline Mode Requirements
* **Local Database**: Encrypt SQLite tables using SQLCipher.
* **Sync Engine Flow**:
  ```
  Action offline -> Save to local Sync queue -> Connection restored -> Transmit queue -> Process database -> Update local status to SYNCED
  ```
* **Conflict Rules**: Resolve profile updates using "Last-Write-Wins" and merge calendar entries chronologically.

---

## 43. Future Scope
* **NDVI Indexes**: Map field health using Sentinel satellite data.
* **Agricultural Loans**: Integrate with digital lending systems to offer loans for seeds and fertilizers.
* **IoT Soil Probes**: Read telemetry data directly from local soil moisture sensors.

---

## 44. Assumptions
* **Device Access**: Assume users own an Android smartphone running Android 5.0 (Lollipop) or newer.
* **Network Access**: Assume farmers have access to intermittent 3G or 4G data coverage.
* **OTP Gateways**: Assume the integrated SMS provider delivers OTP messages reliably.

---

## 45. Constraints
* **Low-Cost Inference**: Run YOLO models locally on-device or in CPU pools to minimize cloud server costs.
* **Limited Datasets**: Build regional dialect models using fine-tuned speech translation techniques.
* **Localization Boundaries**: Limit text translations to the four primary target languages.

---

## 46. Risks
* **Incorrect AI Diagnoses**: Misidentifying crop diseases could lead to incorrect pesticide usage, posing crop damage risks.
* **Sync Overlaps**: Sync delays could create data conflicts if multiple users edit the same profile simultaneously.
* **API Cost Volatility**: Compute usage spikes under rapid adoption could significantly increase LLM costs.

---

## 47. Acceptance Criteria
* **Model Target**: The YOLOv8 disease classification model must achieve a precision rate $>0.88$ on validation datasets.
* **Speech Accuracy**: The speech-to-text module must keep the Word Error Rate (WER) under 15% for target dialects.
* **Authentication Integrity**: Ensure expired or modified JWT access tokens are immediately rejected by backend routers.

---

## 48. Deployment Requirements
* **Containers**: Build backend services using multi-stage Docker builds to package dependencies securely.
* **Infrastructure**: Deploy infrastructure using validated Terraform templates.
* **CI/CD Pipeline**: Automate linting, unit testing, and mobile build compilation using GitHub Actions.

---

## 49. Testing Requirements
* **Unit Tests**: Maintain unit test coverage above 85% for core application services.
* **Widget & Flow Tests**: Test offline sync behaviors under simulated network drops in Flutter.
* **Field Trials**: Verify performance with real-world testing involving 100 farmers across selected regions.

---

## 50. Conclusion
This Software Requirements Specification defines the operational requirements for Kisan Guru AI. By combining AI-powered diagnostics and voice assistance with a secure offline-first mobile layout, Kisan Guru AI provides the technical foundation needed to deliver digital farming assistance across rural India.
