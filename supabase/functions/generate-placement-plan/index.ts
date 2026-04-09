const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Comprehensive role-specific roadmap data from the placement path document (all months up to 15)
const ROLE_ROADMAPS: Record<string, string> = {
  "software engineer": `
SOFTWARE ENGINEER ROADMAP (Target: All 50 Companies):

DAY 1-15 (Foundation Sprint):
- Day 1: Setup dev environment (VSCode, Git, GitHub)
- Day 2: Variables, Data Types, Control Flow
- Day 3: Functions, Recursion basics
- Day 4: Arrays, Strings fundamentals
- Day 5: OOP Concepts (Classes, Objects)
- Day 6: Practice 10 LeetCode Easy problems
- Day 7: Review + Mini project (Calculator app)
- Day 8: Data Structures - Arrays, Linked Lists
- Day 9: Stacks, Queues implementation
- Day 10: Hash Maps, Sets
- Day 11: Trees, Binary Trees basics
- Day 12: Sorting algorithms (Bubble, Merge, Quick)
- Day 13: 15 LeetCode Easy problems
- Day 14: Git workflow (branch, merge, PR)
- Day 15: CHECKPOINT - Build Todo CLI App
Metrics by Day 15: 25 LeetCode Easy solved, 1 GitHub repo with 10+ commits, 1 working CLI project

Language Selection by Company:
- Python (AI/ML companies)
- Java (Amazon, Oracle, SAP)
- Go (Google, Backend)
- JavaScript/TypeScript (Meta, Shopify)
- C++ (NVIDIA, Tesla, SpaceX)

DAY 16-45 (Intermediate Consolidation):
- Days 16-20: Binary Search, Two Pointers, Sliding Window
- Days 21-25: Graphs (BFS, DFS), Dynamic Programming intro
- Days 26-30: Recursion advanced, Backtracking
- Days 31-35: System Design basics (load balancer, DB)
- Days 36-40: SQL fundamentals (SELECT, JOIN, GROUP BY)
- Days 41-45: REST API building (FastAPI or Express.js)
Projects: Build REST API (CRUD), Add database (PostgreSQL/MySQL), Deploy on cloud (AWS Free Tier/Heroku), Add authentication (JWT)
LeetCode Progress: Total 75 problems (Easy:50, Medium:25), Focus: Arrays, Strings, HashMaps

MONTH 1 (Day 1-30) — Core Skills Established:
Week 1: Core syntax + DS basics (Day 1-7)
Week 2: Algorithms + OOP (Day 8-14)
Week 3: Database + API (Day 15-21)
Week 4: Testing + Deployment (Day 22-28)
Tools Mastered: Git/GitHub, Docker basics, Linux/Bash, VS Code, Postman
Projects: CLI Calculator/Todo App, REST API with CRUD, Basic web app
Targets: 100 LeetCode, 2 GitHub projects, 1 deployed app, Resume first draft
Resources: CS50 (Harvard), NeetCode 150, FreeCodeCamp, The Odin Project

MONTHS 2-3 — Job-Ready Foundations:
Month 2: System Design + Advanced DS&A
- Week 5: Trees (BST, AVL), Heaps, Priority Queue
- Week 6: Graphs advanced (Dijkstra, Topological Sort)
- Week 7: Dynamic Programming (Knapsack, LCS, LIS)
- Week 8: System Design (CAP theorem, Caching, CDN)
Month 3: Interview Preparation
- Week 9: Mock interviews (Pramp, Interviewing.io)
- Week 10: Behavioral prep (STAR method)
- Week 11: Company-specific prep (top 5 targets)
- Week 12: Portfolio polish + LinkedIn optimization
Advanced Projects: Microservices app (3 services), Real-time chat, E-commerce backend API, Open source contribution
System Design Topics: Load Balancers, Database Sharding, Message Queues (Kafka/RabbitMQ), Caching (Redis), API Gateway, Microservices vs Monolith, CAP Theorem
Resources: "Cracking the Coding Interview", "System Design Interview" Alex Xu, LeetCode Premium, Grokking System Design
Targets: 250 LeetCode (Easy:100, Medium:120, Hard:30), 4-5 GitHub projects, 10 mock interviews, Resume finalized

MONTHS 4-6 — Active Job Search:
Month 4: Specialization Pick - Backend (Node.js/Django/Spring Boot), Cloud (AWS/GCP/Azure certs), Mobile (React Native/Flutter), DevOps (CI/CD, GitHub Actions)
Month 5: Advanced System Design - Design Twitter/Instagram, Design Uber, Design Netflix, Design WhatsApp, Design Google Search
Month 6: Full Interview Circuit - 25+ applications, weekly mock interviews, negotiate offers
Certifications: AWS Cloud Practitioner (Month 4), AWS Solutions Architect Associate (Month 5-6)
Networking: LinkedIn 500+, Tech meetups 2/month, GitHub 100+ contributions, 5+ blog posts
Targets: 400 LeetCode total, 1 AWS cert, 50+ applications, 5+ interviews

MONTHS 7-9 — Offer & Growth:
Month 7-8 (No offer): Re-evaluate resume, target mid-tier companies, open source, build viral GitHub project, consider internships/contracts
Month 8-9 (Offer): Negotiate salary (Levels.fyi, Glassdoor, Blind), onboarding prep, study company stack, plan 30-60-90 day ramp-up
Advanced: Kubernetes basics, DB optimization (indexing, query plans), Security (OWASP Top 10), Performance profiling
Targets: Job offer or internship, 500+ LeetCode, 2 cloud certs

MONTHS 10-12 — Mid-Level Trajectory:
If Employed: Master internal codebase, own 2-3 features, mentor juniors, lead small projects, performance review prep
Continuous Learning: Advanced system design (distributed), DB internals, compiler design, networking deep dive, ML basics
Career Skills: Technical writing (design docs, RFCs), code review, estimation/planning, cross-team collaboration, on-call/incident response
Targets: Promoted or on track, leading technical discussions, 600+ LeetCode, 10+ blog posts, speaking at meetup/conference

MONTHS 13-15 — Senior Engineer Path:
Senior prep: Architect systems independently, drive technical roadmap, mentor 2+ juniors, own major features end-to-end, cross-functional leadership
Advanced: Distributed systems (Raft, Paxos), DB internals (B-trees, WAL), compiler/interpreter building, GPU computing, advanced security
Next Career Moves: Stay → Senior promotion, FAANG lateral, Staff Engineer track, Tech Lead Manager path
Targets: Senior level or clear path, $150K-$300K+ TC (FAANG), known expert in team

Company-specific prep: Amazon (Java + DynamoDB), Google (Go + Spanner), Meta (PHP/Hack + TAO), Netflix (Java + Spring), Uber (Go + PostgreSQL)`,

  "ai/ml engineer": `
AI/ML ENGINEER ROADMAP (Target: NVIDIA, Google, Meta, Amazon, Apple, Microsoft, OpenAI, DeepMind, Anthropic):

DAY 1-15 (AI Foundation Sprint):
- Day 1: Python refresher (NumPy, Pandas basics)
- Day 2: Linear Algebra review (vectors, matrices)
- Day 3: Statistics & Probability fundamentals
- Day 4: Matplotlib/Seaborn data visualization
- Day 5: Scikit-learn introduction (fit/predict)
- Day 6: First ML model (Linear Regression)
- Day 7: CHECKPOINT: Predict house prices project
- Day 8: Classification (Logistic Regression, KNN)
- Day 9: Decision Trees, Random Forests
- Day 10: Model evaluation (accuracy, F1, AUC-ROC)
- Day 11: Feature engineering basics
- Day 12: Train/Test split, Cross-validation
- Day 13: Kaggle intro (Titanic competition)
- Day 14: Jupyter Notebook mastery
- Day 15: CHECKPOINT: Kaggle bronze medal target
Math Prerequisites: Linear Algebra (Khan Academy), Calculus (derivatives, chain rule), Probability & Statistics, Matrix operations
Tools: Anaconda/Miniconda, Jupyter Lab, Google Colab (GPU access), Kaggle account

DAY 16-45 (Deep Learning Entry):
- Days 16-20: Neural Networks (Perceptron, Activation functions, Forward/Backpropagation, Gradient Descent, Build NN from scratch NumPy)
- Days 21-25: PyTorch/TensorFlow (Tensors, Autograd, nn.Module, Training loops, GPU training Colab)
- Days 26-30: Computer Vision (CNNs Conv/Pool/FC, Image classification MNIST/CIFAR-10, Transfer Learning ResNet/VGG, Object detection YOLO)
- Days 31-35: NLP Fundamentals (Tokenization, Word2Vec/GloVe, RNNs/LSTMs, Sentiment analysis project)
- Days 36-40: Transformers & Attention (Attention deep dive, BERT fine-tuning HuggingFace, GPT-2 inference, Text classification)
- Days 41-45: MLOps Introduction (MLflow experiment tracking, Model versioning, FastAPI deployment, Docker for ML)
Projects: Kaggle Titanic, Image Classifier (CNN), Sentiment Analyzer (BERT), Deployed ML API
Metrics: 2 Kaggle competitions, 4 ML projects on GitHub, PyTorch comfortable

MONTH 1 — ML Practitioner:
Week 1: Classical ML mastery - All sklearn algorithms, Ensemble methods (XGBoost, LightGBM), Hyperparameter tuning (Optuna), Feature selection
Week 2: Deep Learning fundamentals - Neural network architectures, Regularization (dropout, batch norm), Learning rate schedules, Debugging ML models
Week 3: Specialization intro - CV: Object detection pipeline, NLP: Text generation, RL: Q-learning
Week 4: End-to-end ML project - Problem definition, Data collection/cleaning, Model training/evaluation, Deployment (Streamlit/FastAPI)
Resources: fast.ai (free), Andrew Ng ML Specialization (Coursera), Hands-on ML (Geron book), PyTorch docs
Targets: 5 complete ML projects, 1 Kaggle top-20%, GitHub ML portfolio, Math foundations solid

MONTHS 2-3 — LLM & Advanced ML:
Month 2: Large Language Models
- Week 5: Transformer architecture deep dive (Self-attention math, Multi-head attention, Positional encoding, Build Transformer from scratch)
- Week 6: LLM Fine-tuning (PEFT/LoRA, Instruction fine-tuning, RLHF basics, Fine-tune Llama/Mistral)
- Week 7: LLM Applications (LangChain, RAG, Vector databases Pinecone/Weaviate, Build Q&A chatbot)
- Week 8: LLM Evaluation & Safety (BLEU/ROUGE metrics, Hallucination detection, Red-teaming, Constitutional AI)
Month 3: Production ML Systems
- Week 9: MLOps deep dive (Kubeflow, Model monitoring/drift, A/B testing, Feature stores Feast)
- Week 10: Distributed Training (Data/Model parallelism, Mixed precision, DeepSpeed)
- Week 11: Interview Prep (ML system design, ML coding, Research paper discussions, ML case studies)
- Week 12: Application Sprint (Apply 20+ roles, Tailor portfolio, Network with ML engineers)
Milestone Projects: Fine-tuned LLM, RAG app with vector DB, Real-time ML service, Kaggle silver notebook
Targets: LLM fine-tuning experience, MLOps pipeline, 10+ ML projects, Applying to AI roles

MONTHS 4-6 — AI Engineer Level (Specialization):
Track A: LLM/Generative AI - Pre-training fundamentals, tokenizer design (BPE, SentencePiece), scaling laws, inference optimization (quantization, vLLM, TensorRT-LLM), speculative decoding, KV cache, multi-GPU inference
Track B: Computer Vision - Diffusion models (Stable Diffusion), GANs, NeRF (3D), video understanding, real-time inference (TensorRT), edge deployment (ONNX), multi-camera systems
Track C: MLOps/AI Platform - Kubernetes for ML, custom operators, model serving (Triton, TorchServe), training infrastructure, internal ML platforms, feature store design, training job scheduling, cost management
Targets: Deep specialization, 3+ research paper implementations, AI company interviews, $120K-$180K target

MONTHS 7-9 — Senior AI Engineer Path:
Research: Read 2 papers/week, implement 1 paper/month, contribute to HuggingFace, technical blog posts
Competition: Kaggle Expert level, HuggingFace spaces, ArXiv submission, NeurIPS/ICML workshop
Interview Circuit: Tier 1 (OpenAI, DeepMind, Anthropic), Tier 2 (NVIDIA, Google DeepMind, Meta AI), Tier 3 (Apple MLR, Microsoft Research), Tier 4 (Startups - Cohere, Mistral)
Interview Types: ML coding (implement backprop), ML system design, research discussion, take-home challenge
Compensation: Entry $150K-$200K, FAANG $200K-$350K TC, Research $200K-$400K+
Targets: Offer from AI company, Kaggle Expert badge, 15+ projects, research experience

MONTHS 10-12 — AI Research/Production Expert:
If at AI company: Own ML model improvements, scale to production, publish internal research, build new capabilities
Advanced: Mixture of Experts (MoE), State Space Models (Mamba), Multimodal LLMs, Constitutional AI/Alignment, Flash Attention
Open Source: HuggingFace Transformers 5+ PRs, PyTorch 2+ PRs, custom open source AI tool
Targets: Published research, known in AI community, Senior AI Engineer trajectory, $200K-$400K TC

MONTHS 13-15 — Principal AI Engineer:
Principal/Staff skills: Define AI research roadmap, review/approve architectures, guide team of 5+ ML engineers, partner with product on AI strategy, conference speaker
Frontier Topics: AGI safety research, interpretability methods, multi-agent systems, world models, embodied AI
Targets: Staff/Principal level, $300K-$600K+ TC (FAANG), published papers/patents`,

  "agentic ai engineer": `
AGENTIC AI ENGINEER ROADMAP (Target: NVIDIA, Apple, ServiceNow, Salesforce):

DAY 1-15 (Agentic AI Foundations):
- Day 1: Python async programming (asyncio)
- Day 2: LLM API usage (OpenAI, Anthropic)
- Day 3: Prompt engineering fundamentals
- Day 4: Function calling / Tool use APIs
- Day 5: LangChain basics (chains, prompts)
- Day 6: Build first agent (simple Q&A)
- Day 7: CHECKPOINT: Personal assistant agent
- Day 8: Memory systems (short/long term)
- Day 9: Tool use (search, calculator, code)
- Day 10: Planning algorithms (ReAct, CoT)
- Day 11: Multi-step task completion
- Day 12: Error handling in agents
- Day 13: LlamaIndex basics
- Day 14: Vector database basics
- Day 15: CHECKPOINT: Research agent that searches web + summarizes
Prerequisites: Python intermediate, REST API understanding, JSON/data manipulation, basic LLM knowledge

DAY 16-45 (Agent Frameworks Expert):
- Days 16-20: Advanced Frameworks (AutoGen Microsoft, CrewAI multi-agent teams, LangGraph stateful agents, OpenAI Assistants API)
- Days 21-25: Multi-Agent Systems (communication protocols, role-based design, orchestrator-worker pattern, evaluation frameworks)
- Days 26-30: RAG for Agents (chunking strategies, embedding model selection, hybrid search BM25+dense, re-ranking techniques)
- Days 31-35: Agent Safety & Reliability (guardrails, output validation, hallucination mitigation, human-in-the-loop)
- Days 36-40: Production Agent Systems (observability LangSmith/Langfuse, cost optimization, latency reduction, testing frameworks)
- Days 41-45: Enterprise Agent Patterns (workflow automation, customer service, code generation, data analysis agents)
Projects: Multi-agent research system, Code review agent, Customer support agent (RAG), Data analyst agent
Metrics: 4 agent systems built, multi-agent orchestration, production-ready agent deployed

MONTH 1 — Agent Developer:
Week 1: Core architectures - ReAct pattern, Plan-and-Execute, Reflexion agents (self-improvement), MRKL systems
Week 2: Tool & API integration - Web search (Tavily, Serper), Code execution (E2B sandboxes), DB query tools, External API wrappers
Week 3: Memory architectures - Episodic (conversation), Semantic (knowledge), Procedural (skills), Memory retrieval strategies
Week 4: Agent deployment - FastAPI server, WebSocket streaming, Docker containerization, basic monitoring
Technologies: LangChain/LangGraph, AutoGen/CrewAI, OpenAI API, Anthropic API (Claude), Vector DBs (Chroma, Pinecone)
Targets: 6 agent systems, multi-modal agent (text+image), agent with persistent memory, portfolio published

MONTHS 2-3 — Enterprise Agent Specialist:
Month 2: Advanced Topics
- Week 5: Agent Reasoning (Tree of Thoughts, Graph of Thoughts, Monte Carlo Tree Search, Self-consistency sampling)
- Week 6: Multimodal Agents (Vision-language models, Image/video understanding, Document processing PDFs, Audio/speech)
- Week 7: Code Agents (GitHub Copilot-type systems, Code generation + execution, Automated testing, DevOps automation)
- Week 8: Workflow Automation (ServiceNow-style, Salesforce Einstein Agent study, Business process automation, Enterprise APIs)
Month 3: Production & Interviews
- Week 9: Agent Evaluation (Benchmarks AgentBench/GAIA, Custom eval frameworks, Red-teaming, Cost/latency profiling)
- Week 10: Enterprise Integration (Salesforce API, ServiceNow API, SAP process automation, Microsoft Copilot Studio)
- Week 11-12: Interview Prep (Agent system design, LLM fundamentals review, Python async deep dive, Target company research)
Targets: Enterprise agent systems built, evaluation experience, 20+ applications, $130K-$200K target

MONTHS 4-6 — Senior Agentic Engineer:
Month 4: Cutting-Edge Research - Autonomous agent architectures, Agent communication standards (MCP), Tool learning & composition, Long-horizon planning
Month 5: Build Flagship Project - Complex multi-agent system, 10+ tools integrated, Production-grade reliability, Open source release
Month 6: Community & Recognition - Twitter/X AI community presence, Technical blog, GitHub 100+ stars, Conference talk submission
Targets: Recognized in agentic AI, job offer at top company, $150K-$250K TC

MONTHS 7-15 — Lead Agentic AI Engineer:
Month 7-9: Build agentic features users love, reduce hallucination rates, scale to millions, patent applications
Month 10-12: Define agent architecture standards, lead team 3-5 engineers, partner with product/research, speak at AI conferences
Month 13-15: Company-wide agent strategy, novel research contributions, $250K-$500K+ TC, industry thought leader`,

  "backend engineer": `
BACKEND ENGINEER ROADMAP (Target: Google, Amazon, Meta, Uber, Netflix, Shopify):

DAY 1-15 (Backend Foundations):
- Day 1: HTTP protocol (methods, status codes)
- Day 2: REST API design principles
- Day 3: Python/Node.js/Go - pick one, setup
- Day 4: Build first API endpoint (Hello World)
- Day 5: CRUD operations with in-memory storage
- Day 6: JSON request/response handling
- Day 7: CHECKPOINT: Todo REST API
- Day 8: SQL fundamentals (CREATE, INSERT, SELECT)
- Day 9: JOINs (INNER, LEFT, RIGHT, FULL)
- Day 10: GROUP BY, HAVING, subqueries
- Day 11: Connect API to PostgreSQL
- Day 12: Basic authentication (username/password)
- Day 13: JWT implementation
- Day 14: Error handling & input validation
- Day 15: CHECKPOINT: User auth system with DB
Tools: Framework (FastAPI/Express/Gin), PostgreSQL, TablePlus/pgAdmin, Postman/Insomnia, Docker Compose

DAY 16-45 (Intermediate Backend):
- Days 16-20: Database Deep Dive (Indexing B-tree/Hash/Composite, Query optimization EXPLAIN ANALYZE, Transactions ACID, Connection pooling PgBouncer, Migrations Alembic/Flyway)
- Days 21-25: Caching & Performance (Redis fundamentals strings/hashes/sorted sets, Cache-aside pattern, Write-through/write-behind, Cache invalidation, Response time benchmarking)
- Days 26-30: Message Queues (RabbitMQ/Kafka, Producer-consumer, Celery async tasks, Event-driven architecture, Dead letter queues)
- Days 31-35: API Design Advanced (GraphQL vs REST, gRPC intro, API versioning, Rate limiting token bucket, Swagger/OpenAPI)
- Days 36-40: Security (OWASP Top 10, SQL injection prevention, OAuth 2.0/OpenID Connect, HTTPS/TLS, Secret management Vault)
- Days 41-45: DevOps (Docker multi-stage builds, Docker Compose, GitHub Actions CI/CD, Nginx reverse proxy, Basic Kubernetes)
Projects: Full auth system (OAuth+JWT), Real-time notifications (WebSocket), Async job processing, Cached API with Redis
Metrics: 4 backend projects deployed, API handles 1000+ RPS (load tested), security implemented

MONTH 1 — Production Backend:
Week 1: Core Backend Mastery - HTTP deep dive (HTTP/2, HTTP/3), Session vs Token auth, CORS handling, File uploads/S3
Week 2: Database Mastery - NoSQL (MongoDB, DynamoDB), SQL vs NoSQL, Replication (master-replica), Backup/recovery
Week 3: Distributed Systems Intro - CAP theorem, Consistency patterns, Service discovery, Circuit breaker pattern
Week 4: Cloud Deployment - AWS EC2/ECS, RDS (managed PostgreSQL), ElastiCache (managed Redis), CloudWatch monitoring
Targets: Production-deployed backend, handles concurrent users (stress tested), monitoring/alerting, 100 LeetCode

MONTHS 2-3 — Backend Interview Ready:
Month 2: Advanced Concepts
- Week 5: Microservices Architecture (decomposition, inter-service comm, Saga pattern, API Gateway)
- Week 6: Advanced Database (PostgreSQL partitioning, Elasticsearch, Time-series DBs, Database per service)
- Week 7: Observability (Logging ELK, Metrics Prometheus/Grafana, Tracing Jaeger/OpenTelemetry, Alerting)
- Week 8: Go Language (syntax, goroutines/channels, net/http, gRPC with Go)
Month 3: Interview Circuit
- Week 9-10: System Design (Design URL shortener, rate limiter, payment system, notification service)
- Week 11-12: Coding + Applications (LeetCode 250+ backend-specific, DB design challenges, 25+ applications, 3 blog posts)
Targets: System design confident, 250 LeetCode, microservices project, active interview pipeline

MONTHS 4-6 — Senior Backend Path:
Month 4: Performance Engineering - DB query optimization mastery, profiling (CPU/memory/I/O), benchmarking (k6, Locust), capacity planning
Month 5: Data Engineering Adjacent - Apache Kafka deep dive, stream processing (Flink), data pipeline design, analytics DBs (ClickHouse)
Month 6: Large Scale Systems - Consistent hashing, distributed locking, leader election, multi-region architecture
Company-Specific: Amazon (Java+DynamoDB+AWS), Google (Go+Spanner+GCP), Meta (PHP/Hack+TAO+Cassandra), Netflix (Java+Spring+Cassandra), Uber (Go+Java+PostgreSQL)
Targets: Offer received, AWS Developer Associate cert, $130K-$200K range

MONTHS 7-15 — Senior/Staff Backend:
Month 7-9: Own critical services, reduce p99 latency 30%+, lead incident response, design major changes
Month 10-12: Backend architecture decisions, code review/standards, interview/hire engineers, technology evaluation
Month 13-15: Cross-team backend standards, infrastructure roadmap, complexity reduction, $200K-$400K+ TC`,

  "full-stack engineer": `
FULL-STACK ENGINEER ROADMAP (Target: Microsoft, Salesforce, Shopify, ServiceNow, Intuit):

DAY 1-15 (Frontend + Backend Start):
- Day 1: HTML5 fundamentals (semantic markup)
- Day 2: CSS3 (flexbox, grid, responsive)
- Day 3: JavaScript ES6+ (let/const, arrow, async)
- Day 4: DOM manipulation, events
- Day 5: Fetch API, async/await
- Day 6: Build landing page (responsive)
- Day 7: CHECKPOINT: Portfolio website
- Day 8: React.js introduction (components, JSX)
- Day 9: React hooks (useState, useEffect)
- Day 10: React Router (SPA navigation)
- Day 11: State management (Context API)
- Day 12: Node.js + Express backend
- Day 13: Connect React to REST API
- Day 14: Basic CSS framework (TailwindCSS)
- Day 15: CHECKPOINT: Full-stack Todo app (React frontend + Node backend)
Tools: React+Vite, TailwindCSS, Node.js+Express, MongoDB Atlas, Vercel+Render

DAY 16-45 (Full-Stack Intermediate):
- Days 16-20: React Advanced (Redux Toolkit, React Query, useMemo, Testing Library, Storybook)
- Days 21-25: Backend Enhancement (TypeScript, Next.js, Prisma ORM, tRPC, PostgreSQL with Node.js)
- Days 26-30: Auth & Authorization (NextAuth.js/Clerk, RBAC, Session management, OAuth Google/GitHub)
- Days 31-35: Real-time Features (WebSockets Socket.io, Server-Sent Events, Real-time chat, Collaborative features like Notion)
- Days 36-40: File Handling & Media (S3 uploads Multer, Image optimization Next.js Image, Video streaming, CDN integration)
- Days 41-45: Deployment & DevOps (Docker+Docker Compose, CI/CD GitHub Actions, Monitoring Sentry/Vercel Analytics, DB backups)
Projects: E-commerce (React+Node+Stripe), Real-time chat (Socket.io), Blog platform (Next.js+Prisma), Dashboard with auth
Metrics: 4 full-stack projects deployed, TypeScript across all, authentication implemented

MONTH 1 — Full-Stack Developer:
Week 1: Modern Frontend Mastery - Advanced React patterns, Performance (Lighthouse 90+), Accessibility (WCAG 2.1), Mobile-first
Week 2: Backend & API Design - GraphQL with Apollo, API best practices, DB schema design, Background jobs
Week 3: Testing & Quality - Unit tests (Jest), Integration tests, E2E (Playwright/Cypress), 80%+ coverage
Week 4: Flagship Project - Complex SaaS, Multi-user with permissions, Payment integration, Production deployment
Targets: 3-4 deployed apps, TypeScript proficiency, testing culture, resume ready

MONTHS 2-3 — Interview Ready Full-Stack:
Month 2: Advanced Technologies
- Week 5: Modern Frontend (React Server Components Next.js 14+, Streaming SSR, Edge computing, PWA)
- Week 6: Mobile Development (React Native basics, Expo framework, Native features, App Store basics)
- Week 7: Cloud & Infrastructure (AWS Amplify, Serverless functions, PlanetScale/Neon, Edge databases)
- Week 8: AI Integration (OpenAI API in React, Streaming AI responses, AI-powered features, Vercel AI SDK)
Month 3: Job Applications
- Week 9-10: LeetCode 200+, System design for full-stack, Portfolio site, LinkedIn optimization
- Week 11-12: Apply 25+ companies, company-specific prep, salary research, mock interviews
Company-Specific: Shopify (Ruby on Rails + React), Microsoft (.NET + React + TypeScript), Salesforce (Apex + LWC + React), ServiceNow (JavaScript + platform), Intuit (React + Node.js + AWS)
Targets: 5+ apps portfolio, AI-integrated app, mobile app bonus, active interviews

MONTHS 4-15 — Growth Path:
Month 4-6: Specialization - React expert OR Next.js/SSR OR Full-stack+mobile OR Full-stack+AI, first offer $100K-$160K
Month 7-9: First Job Excellence - Master company stack, own frontend+backend features, UI/UX collaboration, performance wins
Month 10-12: Mid-Level Track - Lead feature dev, mentor juniors, architecture input, $120K-$180K TC
Month 13-15: Senior Full-Stack - System design ownership, platform decisions, team tech direction, $160K-$250K TC`,

  "ai infrastructure engineer": `
AI INFRASTRUCTURE / PLATFORM ENGINEER ROADMAP (Target: NVIDIA, Google, Amazon Bedrock, Microsoft Azure AI):

DAY 1-15 (Infrastructure Foundations):
- Day 1: Linux fundamentals (bash, process mgmt)
- Day 2: Docker (build, run, volumes, networks)
- Day 3: Docker Compose (multi-container)
- Day 4: Kubernetes basics (pods, services, deployments)
- Day 5: Kubernetes networking (ClusterIP, NodePort)
- Day 6: Helm charts basics
- Day 7: CHECKPOINT: Deploy 3-tier app on K8s
- Day 8: Python for infrastructure
- Day 9: Cloud fundamentals (AWS/GCP/Azure)
- Day 10: Terraform basics (IaC)
- Day 11: CI/CD pipelines (GitHub Actions)
- Day 12: Monitoring (Prometheus + Grafana)
- Day 13: Logging (ELK stack)
- Day 14: Networking (TCP/IP, DNS, Load Balancing)
- Day 15: CHECKPOINT: Full infra pipeline (code → CI → Docker → K8s → Monitor)
Setup: minikube/kind (local K8s), AWS Free Tier, Terraform, Prometheus+Grafana stack

DAY 16-45 (AI Infrastructure Specialist):
- Days 16-20: ML Model Serving (Triton Inference Server NVIDIA, TorchServe PyTorch, TensorFlow Serving, BentoML multi-framework, Load testing ML APIs Locust)
- Days 21-25: GPU Computing (CUDA basics if NVIDIA target, GPU memory management, Multi-GPU setup, GPU monitoring nvidia-smi/DCGM, Cost optimization spot instances)
- Days 26-30: Distributed Training Infrastructure (PyTorch Distributed, Horovod, DeepSpeed, Training cluster setup)
- Days 31-35: MLOps Platforms (Kubeflow Pipelines, MLflow complete setup, Weights & Biases, DVC data version control)
- Days 36-40: Cloud AI Services (AWS SageMaker architecture)

MONTHS 2-3: Advanced infrastructure, Kubernetes operators for ML, custom schedulers for GPU workloads, multi-cluster management
MONTHS 4-6: Production AI platforms, cost optimization at scale, multi-region GPU clusters
Target: $140K-$220K entry, scaling to $250K-$400K+ at senior level`
};

function findBestRoadmap(targetRole: string): string {
  const roleLower = targetRole.toLowerCase();
  
  // Direct matches
  for (const [key, value] of Object.entries(ROLE_ROADMAPS)) {
    if (roleLower.includes(key) || key.includes(roleLower)) {
      return value;
    }
  }
  
  // Fuzzy matches
  if (roleLower.includes("ml") || roleLower.includes("machine learning") || roleLower.includes("data scien") || roleLower.includes("ai ") || roleLower.includes("deep learning")) {
    return ROLE_ROADMAPS["ai/ml engineer"];
  }
  if (roleLower.includes("agent") || roleLower.includes("llm") || roleLower.includes("prompt")) {
    return ROLE_ROADMAPS["agentic ai engineer"];
  }
  if (roleLower.includes("backend") || roleLower.includes("server") || roleLower.includes("api developer")) {
    return ROLE_ROADMAPS["backend engineer"];
  }
  if (roleLower.includes("full") || roleLower.includes("fullstack") || roleLower.includes("full-stack") || roleLower.includes("web dev") || roleLower.includes("mern") || roleLower.includes("mean")) {
    return ROLE_ROADMAPS["full-stack engineer"];
  }
  if (roleLower.includes("infra") || roleLower.includes("platform") || roleLower.includes("devops") || roleLower.includes("sre") || roleLower.includes("cloud") || roleLower.includes("mlops")) {
    return ROLE_ROADMAPS["ai infrastructure engineer"];
  }
  if (roleLower.includes("frontend") || roleLower.includes("front-end") || roleLower.includes("react") || roleLower.includes("ui developer")) {
    return ROLE_ROADMAPS["full-stack engineer"];
  }
  
  // Default to software engineer
  return ROLE_ROADMAPS["software engineer"];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, targetRole, currentSkills, totalDays } = await req.json();

    if (!companyName || !targetRole) {
      return new Response(JSON.stringify({ error: "Company name and target role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const days = totalDays || 30;
    const roadmapContext = findBestRoadmap(targetRole);

    const prompt = `You are an expert career coach. Create a detailed ${days}-day placement preparation plan for someone targeting "${targetRole}" at "${companyName}".

Current skills: ${currentSkills?.join(", ") || "Not specified"}

USE THE FOLLOWING EXPERT ROADMAP DATA as your primary reference to generate highly specific, actionable daily tasks. Adapt the timeline to fit ${days} days:

${roadmapContext}

Generate a JSON response with this structure:
{
  "summary": "Brief overview of the plan",
  "phases": [
    {
      "name": "Phase name",
      "days": "Day X-Y",
      "focus": "Main focus area"
    }
  ],
  "dailyTasks": [
    {
      "day": 1,
      "title": "Task title",
      "description": "Detailed description of what to do including specific resources, tools, and metrics",
      "category": "study|practice|mock|review",
      "estimatedHours": 2
    }
  ]
}

Important guidelines:
- Use the roadmap data above to create specific, actionable tasks (not generic advice)
- Include specific tools, platforms, and resources mentioned in the roadmap
- Add company-specific interview patterns and culture for ${companyName}
- Include LeetCode/coding challenges with specific problem counts
- Add project milestones and checkpoints from the roadmap
- Include mock interviews and behavioral prep (STAR method)
- Make tasks progressively harder
- Include certification targets and salary benchmarks where relevant
- Generate exactly ${days} daily tasks
Return ONLY valid JSON, no markdown.`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const response = await fetch(LOVABLE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `AI service unavailable (${response.status}). Please try again.` }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const plan = JSON.parse(content);

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Plan generation error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message || "Plan generation failed. Please try again." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
