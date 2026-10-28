# Kisan Guru AI (किसान गुरु) 🌾🤖

> **India's Most Advanced AI-Powered Smart Farming Ecosystem**  
> Empowers farmers, students, veterinarians, and farm helpers with computer vision, weather intelligence, voice AI, and multi-lingual support (Hindi, Bhojpuri, Awadhi, English).

---

## 📌 Project Overview
**Kisan Guru AI** is an enterprise-grade digital agriculture platform designed to scale to millions of users across India. It addresses critical farming challenges from seed selection to harvest, animal healthcare, automated scheduling, and heavy machinery sharing.

### 🌟 Core Value Propositions
* **Crop Intelligence**: Real-time disease diagnosis using YOLO & OpenCV.
* **Animal Health Monitoring**: Basic veterinary diagnostic guides and voice-based consultations.
* **Weather & Agronomy Integration**: Localized micro-weather warnings with action plans in regional dialects.
* **Shared Economy**: Machine rental portal connecting farm equipment owners with local helpers and farmers.
* **Voice-First Design**: Regional speech-to-speech interaction powered by Whisper and custom TTS models.

---

## 🌐 Premium Product Experience & Enterprise Architecture
Kisan Guru AI is being evolved into a premium, multilingual, voice-first agricultural operating system for India. The experience layer combines Material Design 3 aesthetics, glassmorphism-inspired surfaces, smooth animations, and accessible high-contrast themes with practical tools that work even on low-bandwidth networks.

### AI & Intelligence Stack
* **Multi-Agent AI Orchestration**: Specialized agents for crop advisory, pest detection, irrigation forecasting, veterinary guidance, and rental matching.
* **Knowledge Graph & RAG**: Verified agronomy knowledge from ICAR, state agricultural universities, and local advisory content is fused with LLM reasoning for explainable recommendations.
* **Digital Twin & GIS**: Field-level digital monitoring combines GIS maps, drone/satellite imagery, soil moisture signals, weather telemetry, and farm history into a living operational model.
* **Edge AI & Offline Capability**: Lightweight on-device models support crop scanning, voice commands, and cached advisories even when connectivity is intermittent.

### Farmer Experience & HCI
* **Hindi-first UX**: The entire experience is designed for Hindi by default, with localized strings, voice assistants, alerts, help flows, and onboarding in Hindi.
* **Voice-first Interaction**: Natural voice dialogs, low-latency speech-to-speech support, haptics, and conversational guidance make the system usable for semi-literate and low-vision users.
* **Accessibility & Inclusion**: Large tap targets, screen-reader support, high-contrast mode, captioned voice interactions, and simple visual workflows are built in from day one.

### Security, Reliability & Operations
* **DevSecOps**: Secure SDLC, automated dependency scanning, secrets management, RBAC, audit logs, and policy-as-code are part of the operating model.
* **SRE & AIOps**: Observability, anomaly detection, health checks, automated rollback, and intelligent incident routing ensure 99.9%+ reliability.
* **Disaster Recovery**: Multi-region backups, immutable snapshots, recovery drills, and offsite data replication are planned for production deployment.

### Deployment Strategy
* **Cloud + Edge Hybrid**: Core inference and orchestration run in the cloud, while select models and cached workflows operate at the edge for resilience.
* **Scalable APIs**: Asynchronous FastAPI services, queue-based processing, and cache layers support burst traffic from peak advisory windows.
* **Modular Growth**: New services for drone analytics, soil sensing, marketplace expansion, and veterinary teleconsultation can be added without breaking the core platform.

---

## 🛠️ Technology Stack
* **Mobile App (Frontend)**: [Flutter](https://flutter.dev/) (Clean Architecture, BLoC state management, SQLite Offline-first caching, Material Design 3 UI).
* **Backend API**: [FastAPI](https://fastapi.tiangolo.com/) (Python-based, Asynchronous concurrency, strict typing).
* **Database**: [PostgreSQL](https://www.postgresql.org/) (TimescaleDB extension ready for IoT/Weather data, PostGIS for geospatial farm boundaries).
* **Cache & Message Broker**: [Redis](https://redis.io/) (for WebSockets, Celery task broker, rate limiting).
* **Object Storage**: [AWS S3 / Firebase Storage](https://aws.amazon.com/s3/) (for user-uploaded crop/animal images & audio clips).
* **Inference Pipeline**: [PyTorch / ONNX Runtime](https://pytorch.org/) (for edge and cloud-based deep learning).

---

## 📂 Documentation Quick Links
To understand the engineering behind Kisan Guru AI, read the detailed specifications:

* 📄 **[Software Requirements Specification (SRS.md)](file:///c:/Users/HP/OneDrive/Desktop/Kisan%20Gurur%20AI/SRS.md)**  
  *Contains the comprehensive IEEE 830-style SRS including 50 detailed sections covering user stories, functional requirements, localization plans, data recovery, offline mode, security, and AI models.*
* 📄 **[System Architecture (ARCHITECTURE.md)](file:///c:/Users/HP/OneDrive/Desktop/Kisan%20Gurur%20AI/ARCHITECTURE.md)**  
  *Details the high-level & low-level design patterns, Clean Modular Architecture, class diagrams, database schemas, naming conventions, development guidelines, and deployment practices.*

---

## 🚀 Directory Structure Map
The project is organized as a monorepo containing two core services:

```text
Kisan Guru AI/
├── fastapi-backend/         # Python FastAPI backend service
│   ├── app/                 # Clean Architecture layers (domain, application, infrastructure, api)
│   ├── tests/               # PyTest suite (unit, integration, load)
│   ├── Dockerfile           # Backend containerization
│   └── requirements.txt     # Python production dependencies
│
├── flutter-frontend/        # Flutter Android/iOS application
│   ├── lib/                 # Feature-first modular code structure
│   ├── test/                # Flutter unit, widget, and golden test suites
│   ├── pubspec.yaml         # Dart dependencies & assets
│   └── analysis_options.yaml# Static analysis rules
│
├── README.md                # Project entry point (This file)
├── SRS.md                   # Software Requirements Specification
└── ARCHITECTURE.md          # System Architecture & Design guidelines
```

---

## 🌳 Git & Branching Strategy
We adhere to **GitFlow** combined with **Conventional Commits**:

### Branching Model
1. `main`: Production-ready releases only.
2. `develop`: Integration branch for features.
3. `feature/KG-<ticket_id>-<desc>`: Individual feature work.
4. `bugfix/KG-<ticket_id>-<desc>`: Issue resolutions.
5. `release/v<version>`: Release preparation and stabilization.

### Commit Messages
Format: `<type>(<scope>): <short description>`
* `feat(auth)`: Add phone-based OTP authentication with JWT tokens
* `fix(cv)`: Update YOLO confidence threshold for leaf disease detection
* `docs(srs)`: Refine Section 42 (Offline Mode Requirements)
* `refactor(db)`: Migrate farm calendar entity to include recurrence rules

---

## ⚙️ Local Development Quickstart
Refer to [ARCHITECTURE.md](file:///c:/Users/HP/OneDrive/Desktop/Kisan%20Gurur%20AI/ARCHITECTURE.md) for full setup instructions.

1. **Clone the repository**
2. **Backend Setup**:
   ```bash
   cd fastapi-backend
   pip install -r requirements.txt
   docker-compose up -d postgres redis
   python -m app.main
   ```
3. **Frontend Setup**:
   ```bash
   cd flutter-frontend
   flutter pub get
   flutter run
   ```

---

## 🛡️ License & Copyright
© 2026 Kisan Guru AI. All rights reserved. Proprietary and confidential software.
Designed and architected for scalable Indian agrarian development.
