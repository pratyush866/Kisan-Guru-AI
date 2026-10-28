# CONFIDENTIAL ENTERPRISE BACKEND ARCHITECTURE SPECIFICATION
## SYSTEM: Kisan Guru AI Microservices Platform & Backend Foundation (AgriOS)
**Document Reference: KG-AgriOS-BackEnd-Microservices-1.0.0**  
**Classification: Internal Proprietary & Confidential**  
**Target Audience: Backend Developers, DevOps Engineers, Database Architects, SREs**

---

## 1. Enterprise Backend Architecture

AgriOS uses a distributed **Microservices Architecture** designed to support 100M+ farmers. The platform is organized into three core logical layers to enforce isolation of concerns.

```mermaid
graph TD
    User[Flutter Mobile / Web App] -->|HTTPS / WSS| GW[Kong API Gateway Edge Layer]
    subgraph Edge Layer
        GW -->|Rate Limiter & JWT Validator| Disc[HashiCorp Consul / Service Registry]
    end
    subgraph Microservices Layer
        GW -->|gRPC / REST| Auth[Authentication Service]
        GW -->|gRPC / REST| UserSvc[User & Farmer Profile Service]
        GW -->|gRPC / REST| CropSvc[Crop & Farm Management Service]
        GW -->|gRPC / REST| AISvc[AI Cognitive & Vision Service]
        GW -->|gRPC / REST| MktSvc[Market Arbitrage Service]
    end
    subgraph Data & Messaging Layer
        Auth -->|Read/Write| DB[(PostgreSQL Cluster with PostGIS)]
        UserSvc -->|Cache| Redis[(Redis Distributed Cluster)]
        CropSvc -->|Publish| Kafka[(Apache Kafka Cluster Event Bus)]
        AISvc -->|Query| Qdrant[(Qdrant Vector DB)]
    end
    Kafka -->|Consume| Worker[Celery background task workers]
```

### Modularity & Shared Libraries Design
To prevent code duplication, common functionalities are extracted into a shared Python utility library, `agrios-common`, imported by all microservice services:
* `agrios_common.security`: Token generation, RS256 signature verifications, rate limiting helpers.
* `agrios_common.database`: Session managers, connection pooling setups, basic CRUD mixins.
* `agrios_common.messaging`: Kafka producer/consumer wrappers, Dead Letter Queue (DLQ) routers.

---

## 2. Microservices Directory

AgriOS features 28 specialized microservices. To ensure scalability, each service uses its own database instance.

### Catalog of Core Microservices

| Service Name | Primary Responsibilities | Database Strategy | Communication Protocols |
| :--- | :--- | :--- | :--- |
| **Authentication** | Phone number verification, JWT token sign/verify, key rotation. | PostgreSQL (schema: `auth`) | REST (edge), gRPC (internal) |
| **User & Profile** | Farmer, Student, Doctor profile details and preferences. | PostgreSQL (schema: `profiles`) | gRPC (internal) |
| **Crop Management** | Crop cycle calendars, sowing timelines. | PostgreSQL (schema: `crops`) | gRPC (internal), Kafka (events) |
| **Disease Diagnosis**| Fungal & bacterial pest inspections from uploads. | S3 metadata + PostgreSQL | REST (uploads), gRPC |
| **Weather Service** | Village-level forecasting, meteorological logs. | TimescaleDB | REST (external API), Kafka |
| **Market Arbitrage** | Real-time commodity crop price trackers. | MongoDB (price cache) | REST, WebSockets |
| **Govt Schemes** | Match eligibility indexes for subsidies. | PostgreSQL (schema: `schemes`) | gRPC |
| **AI Gateway** | Routing, load balancing to inference clusters. | Redis (temp states) | gRPC (Triton/vLLM) |
| **Vision AI Service**| YOLOv8 models inference coordinator. | S3 storage buckets | gRPC |
| **Voice AI Service** | Whisper speech translation and TTS. | File storage cache | WebSockets (low latency) |
| **Notification Svc** | FCM pushes, SMS notifications, WhatsApp logs. | Redis Queue | gRPC, Kafka |
| **Analytics Engine** | Agronomic pattern mining and usage dashboards. | ClickHouse OLAP | Kafka (events streaming) |
| **Decision Engine** | Linear programming solver for farming resources. | PostgreSQL | gRPC |
| **Memory Manager** | Dialog turns parsing and semantic embedding store. | Qdrant Vector DB | gRPC |
| **Knowledge Engine**| Grounded RAG index containing agricultural manuals. | Qdrant Vector DB | gRPC |
| **Job Scheduler** | Cron alerts for watering, sprayings, and soil tests. | Redis Cluster | Celery, Kafka |
| **Payment Service** | UPI payments and tractor rental escrows. | PostgreSQL (schema: `txns`) | REST, gRPC |
| **Subscription Svc**| Premium support and advisor memberships. | PostgreSQL | gRPC |
| **Marketplace Svc** | Machinery rentals, seed, and tool listings. | PostgreSQL + PostGIS | REST, gRPC |
| **Audit Service** | Tracks configuration updates and safety events. | Elasticsearch | Kafka (stream ingestion) |

### Folders and Services Template
Each microservice is built using a Clean Modular Python layout:
```text
agrios-user-service/
├── app/
│   ├── config.py
│   ├── database.py
│   ├── main.py                    # Service startup hooks (gRPC & HTTP listeners)
│   ├── domain/                    # Internal Business Logic
│   │   ├── entities.py
│   │   └── interfaces.py
│   ├── application/               # Application coordination
│   │   └── use_cases.py
│   └── infrastructure/            # Relational models and gRPC client stubs
│       ├── models.py
│       ├── grpc_handlers.py
│       └── repositories.py
├── Dockerfile
└── requirements.txt
```

---

## 3. API Gateway Design

AgriOS uses a centralized **Kong API Gateway** cluster to handle edge routing, authentication validation, and traffic control.

### Kong Declarative Configuration (kong.yml)
```yaml
_format_version: "2.1"
services:
  - name: user-profile-service
    url: http://user-service.production.svc.cluster.local:8000
    routes:
      - name: user-profile-route
        paths:
          - /api/v1/users
    plugins:
      - name: jwt
        config:
          claims_to_verify:
            - exp
      - name: rate-limiting
        config:
          second: 5
          policy: redis
          redis_host: redis-rate-limit.production.svc.cluster.local
          redis_port: 6379

  - name: voice-ai-service
    url: ws://voice-service.production.svc.cluster.local:8001
    routes:
      - name: voice-ai-route
        paths:
          - /api/v1/voice/stream
        protocols:
          - ws
          - wss
```

---

## 4. Service Communication

We use synchronous gRPC for low-latency internal communication and asynchronous Kafka events for long-running workflows.

### Protocol Buffers gRPC Definition (profile.proto)
```protobuf
syntax = "proto3";

package agrios.profile;

service ProfileService {
  rpc GetFarmerProfile(FarmerProfileRequest) returns (FarmerProfileResponse);
  rpc UpdateFarmerLocation(LocationUpdateRequest) returns (LocationUpdateResponse);
}

message FarmerProfileRequest {
  string user_id = 1;
}

message FarmerProfileResponse {
  string user_id = 1;
  string phone_number = 2;
  double farm_size_acres = 3;
  string soil_type = 4;
  repeated string active_crops = 5;
}

message LocationUpdateRequest {
  string user_id = 1;
  double latitude = 2;
  double longitude = 3;
}

message LocationUpdateResponse {
  bool success = 1;
  string message = 2;
}
```

### Event Bus Routing & Resiliency Parameters
* **Kafka Event Bus**: Used to propagate events like `DISEASE_DETECTED` and `PAYMENT_COMPLETED`.
* **DLQ (Dead Letter Queue)**: Event processing failures are retried 3 times with exponential backoff. If failures persist, events are routed to `dlq.crop_events`.
* **Circuit Breaker Policy (Python Resilience)**:
  * Failure Rate Threshold: 50% failures in a 10-second window.
  * Slow Call Rate Threshold: 75% calls taking longer than $1500\text{ms}$.
  * Recovery Time: Circuit remains open for $30\text{ seconds}$ before testing with half-open requests.

---

## 5. Database Architecture

To support millions of active crop records without queries slowing down, database tables are partitioned and sharded.

```
+--------------------------------------------------------------------------+
|                         DATABASE ARCHITECTURE PLAN                       |
+--------------------------------------------------------------------------+
| [ EDGE CACHE ]                                                           |
| - Technology: Redis Cluster (Multi-Region Master-Replica setup)          |
| - Focus: JWT Blacklists, rate limiter tables, localized APMC market lists|
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
| [ PRIMARY STORAGE ]                                                      |
| - Technology: PostgreSQL Cluster with Citus sharding extension          |
| - Focus: User profiles, machinery rental escrows, cropping history       |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
| [ TSDB DATA ENGINE ]                                                     |
| - Technology: TimescaleDB Cluster                                        |
| - Focus: Weather forecast history, IoT soil moisture sensor logs         |
+--------------------------------------------------------------------------+
```

### Citus Sharding DDL Configuration
```sql
-- Enable Citus extension for sharding across server nodes
CREATE EXTENSION CITUS;

-- Create core table
CREATE TABLE crop_ledger_records (
    record_id UUID NOT NULL,
    farmer_id VARCHAR(50) NOT NULL,
    crop_type VARCHAR(50) NOT NULL,
    action_performed TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (farmer_id, record_id)
);

-- Distribute table across citus worker nodes using farmer_id hash
SELECT create_distributed_table('crop_ledger_records', 'farmer_id');
```

---

## 6. Authentication & Authorization

AgriOS uses an OAuth2-compliant JWT token setup with secure key rotation.

```mermaid
sequenceDiagram
    participant User as Flutter Client
    participant Auth as Auth Microservice
    participant Redis as Redis Cache DB
    
    User->>Auth: Request OTP with Phone Number
    Auth->>User: Send SMS verification code
    User->>Auth: Submit verification code & Device ID
    Auth->>Redis: Generate & cache Refresh Token (Expires in 7 days)
    Auth->>User: Return Access Token (RS256 JWT, 15 min) + Refresh Token
    Note over User: Access Token expires
    User->>Auth: Request new Access Token with Refresh Token
    Auth->>Redis: Verify Refresh Token exists & is valid
    Auth->>User: Issue rotated Access & Refresh Tokens
```

### JWT Validation Claims Schema
```json
{
  "iss": "agrios.auth.service",
  "sub": "usr_99120aef-22",
  "exp": 1783281600,
  "iat": 1783280700,
  "device_id": "dev_android_pixel8_881",
  "roles": ["farmer"],
  "permissions": [
    "crops:read",
    "crops:write",
    "rentals:create"
  ]
}
```

---

## 7. Media Storage

AgriOS handles large volumes of uploaded files (such as high-resolution images of diseased leaves and voice recordings) using AWS S3 object storage fronted by a CDN.

```mermaid
graph TD
    A[Flutter App Upload] --> B[S3 Storage Gateway]
    B -->|Original Image| C[Raw Upload Bucket]
    C --> D[AWS Lambda Compression trigger]
    D -->|JPEG 640x640 compressed| E[Production Storage Bucket]
    E --> F[AWS CloudFront CDN edge caches]
    F --> G[Fast User Fetch]
    
    E -->|After 90 Days| H[S3 Glacier Flexible Archive]
    H -->|After 365 Days| I[Purge System Lifecycle Action]
```

---

## 8. Backend Folder Structure

We organize microservices using a monorepo structure to keep code clean and maintainable.

```text
agrios-backend-monorepo/
├── k8s/                           # Helm Deployments configurations
│   ├── values.yaml
│   └── templates/
├── terraform/                     # Infrastructure-as-code deployments
│   ├── vpc.tf
│   ├── eks.tf
│   └── rds.tf
├── shared-libraries/
│   ├── python/
│   │   ├── agrios-common/         # Shared utility library
│   │   │   ├── security.py
│   │   │   └── messaging.py
│   │   └── setup.py
├── services/
│   ├── auth-service/              # FastAPI Auth gateway service
│   │   ├── app/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── user-service/
│   └── crop-service/
├── docker-compose.yml
└── README.md
```

---

## 9. Logging

Distributed tracing is implemented using standard trace identifiers (`TraceId` and `SpanId`) added to headers for all service interactions.

### Structured Distributed Log Format (JSON)
```json
{
  "timestamp": "2026-07-04T10:51:48Z",
  "trace_id": "trace_ff31-419b-88a",
  "span_id": "span_4492-22",
  "service_name": "crop-service",
  "log_level": "INFO",
  "context": {
    "user_id": "usr_99120",
    "crop_type": "tomato",
    "action": "schedule_irrigation"
  },
  "message": "Irrigation recommendation processed for sector 3B",
  "execution_time_ms": 142
}
```

---

## 10. Monitoring

Prometheus and Grafana monitor backend metrics and trace requests across services.

### Prometheus Alert Rules Definition (alerts.rules.yaml)
```yaml
groups:
  - name: agrios-alerts
    rules:
      - alert: HighRequestFailureRate
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100 > 2
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High API Error Rate on {{ $labels.instance }}"
          description: "API gateway error rate exceeds 2% over a 5-minute period."

      - alert: DatabaseConnectionStall
        expr: pg_stat_database_numbackends > 85
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Database Connection Pool Exhaustion warning"
```

---

## 11. Cloud Infrastructure

AgriOS is deployed on AWS EKS using Kubernetes to manage container scaling and resource isolation.

### Kubernetes Deployment Spec (crop-service-deployment.yaml)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crop-service
  namespace: production
  labels:
    app: crop-service
spec:
  replicas: 4
  selector:
    matchLabels:
      app: crop-service
  template:
    metadata:
      labels:
        app: crop-service
    spec:
      containers:
        - name: crop-service-container
          image: kisan-guru/crop-service:v1.0.0
          ports:
            - containerPort: 8000
          resources:
            limits:
              cpu: "1000m"
              memory: "1024Mi"
            requests:
              cpu: "500m"
              memory: "512Mi"
          envFrom:
            - configMapRef:
                name: global-env-config
            - secretRef:
                name: database-credentials
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 15
            periodSeconds: 10
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: crop-service-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: crop-service
  minReplicas: 4
  maxReplicas: 40
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

---

## 12. DevOps Foundation

CI/CD pipelines build container images, run tests, and manage infrastructure deployments automatically.

```mermaid
graph TD
    A[Code Push to Branch] --> B[GitHub Actions Runner]
    subgraph CI Pipeline
        B --> C[Run PyTest Unit Suite]
        B --> D[Code Style Checks via Black/Flake8]
        B --> E[Security scan secrets search]
    end
    C -->|Success| F[Build Optimized Docker Image]
    F --> G[Push to Amazon ECR Registry]
    G --> H[Trigger AWS EKS deployment webhook]
    H --> I[Canary release update on Kubernetes cluster]
```

### Infrastructure as Code (eks.tf)
```hcl
module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "19.15.3"
  cluster_name    = "agrios-production-cluster"
  cluster_version = "1.27"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    general = {
      min_size     = 3
      max_size     = 15
      desired_size = 5
      instance_types = ["m6i.xlarge"]
    }
    gpu_inference = {
      min_size     = 2
      max_size     = 10
      desired_size = 3
      instance_types = ["g5.2xlarge"] # Nvidia A10G GPU nodes
    }
  }
}
```

---

## 13. Scalability & Availability

To ensure service availability for millions of active users, AgriOS is deployed in active-active configurations across primary and secondary regions.

### High Availability Metrics & Strategy
* **RTO (Recovery Time Objective)**: < 10 Minutes.
* **RPO (Recovery Point Objective)**: < 1 Minute.
* **Active-Active Replication**: citus database clusters replicate transactions between primary and backup regions continuously. If a regional outage occurs, DNS records update automatically to route traffic to the backup region.

---

## 14. System Security & Zero Trust Architecture

AgriOS uses encryption and identity validation protocols to protect data and secure service endpoints.

### Security Implementation Specifications
1. **Network Encryption**: All network traffic between microservices is encrypted using TLS 1.3.
2. **Web Application Firewall (WAF)**: Edge firewalls filter incoming HTTP requests to block SQL injection and cross-site scripting attempts.
3. **Database Input Validation**: Database inputs are sanitized using strict validation schemas to prevent injection attacks.

---

## 15. Quality Assurance & Load Testing Strategies

We run regular load and chaos tests to verify system stability under heavy traffic loads.

### Load Testing Topology (Locust script task)
```python
from locust import HttpUser, task, between

class AgriOSLoadTester(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def fetch_weather_advisory(self):
        headers = {"Authorization": "Bearer test_load_token_abc123"}
        self.client.get("/api/v1/weather/forecast?lat=25.59&lon=85.13", headers=headers)

    @task(1)
    def submit_crop_diagnosis(self):
        headers = {"Authorization": "Bearer test_load_token_abc123"}
        self.client.post("/api/v1/cognitive/query", json={
            "user_id": "usr_99120",
            "query_text": "टमाटर के पत्तों के धब्बों की दवा बताइए।"
        }, headers=headers)
```

---

## 16. Future Architectural Integrations

AgriOS is designed to support emerging technologies that will expand system capabilities.

### Future Integrations
* **IoT Sensor Feeds**: Direct telemetry ingestion pipelines to process readings from village soil probes.
* **Satellite Analysis API**: Integration with Sentinel imagery pipelines to map crop health index anomalies.
* **Drone Swarm Flight Controller**: Shared coordinate directories to orchestrate autonomous flight patterns for crop monitoring.

---

## Production Readiness Checklist

Before code is deployed to production clusters, verify that the following tasks are complete:
- [ ] Database migrations are successfully completed on CITUS worker nodes.
- [ ] TLS certificates are updated and active for all API domains.
- [ ] Rate limits are verified in Redis configurations.
- [ ] Dead Letter Queues are active and monitored.
- [ ] Disaster recovery drills are successfully tested, meeting RPO/RTO targets.
