const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_URL = "https://api.lovable.dev/v1/chat/completions";

// Comprehensive role-specific roadmap data from the placement path document
const ROLE_ROADMAPS: Record<string, string> = {
  "software engineer": `
SOFTWARE ENGINEER ROADMAP:
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

DAY 16-45 (Intermediate):
- Days 16-20: Binary Search, Two Pointers, Sliding Window
- Days 21-25: Graphs (BFS, DFS), Dynamic Programming intro
- Days 26-30: Recursion advanced, Backtracking
- Days 31-35: System Design basics (load balancer, DB)
- Days 36-40: SQL fundamentals (SELECT, JOIN, GROUP BY)
- Days 41-45: REST API building (FastAPI or Express.js)

MONTH 1 TARGETS: 100 LeetCode problems, 2 GitHub projects, 1 deployed application, Resume first draft
MONTH 2-3: System Design + Advanced DS&A, Mock interviews (Pramp), Behavioral prep (STAR method), Company-specific prep
MONTH 4-6: Specialization (Backend/Cloud/Mobile/DevOps), AWS certifications, 400 LeetCode total, 50+ job applications
MONTH 7-9: If no offer - re-evaluate resume, target mid-tier companies, open source contributions
MONTH 10-12: Master internal codebase, own features independently, performance review prep
Resources: CS50 (Harvard), NeetCode 150, FreeCodeCamp, The Odin Project, Cracking the Coding Interview, System Design Interview by Alex Xu
Company-specific: Amazon (Java + DynamoDB), Google (Go + Spanner), Meta (PHP/Hack + TAO), Netflix (Java + Spring), Uber (Go + PostgreSQL)`,

  "ai/ml engineer": `
AI/ML ENGINEER ROADMAP:
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
Math Prerequisites: Linear Algebra (Khan Academy), Calculus, Probability & Statistics, Matrix operations
Tools: Anaconda/Miniconda, Jupyter Lab, Google Colab (GPU access), Kaggle account

DAY 16-45 (Deep Learning Entry):
- Days 16-20: Neural Networks (Perceptron, Activation functions, Forward/Backpropagation, Gradient Descent)
- Days 21-25: PyTorch/TensorFlow Introduction (Tensors, Autograd, nn.Module, GPU training)
- Days 26-30: Computer Vision basics (CNNs, Image classification MNIST/CIFAR-10, Transfer Learning ResNet/VGG, Object detection YOLO)
- Days 31-35: NLP Fundamentals (Tokenization, Word2Vec/GloVe, RNNs/LSTMs, Sentiment analysis)
- Days 36-40: Transformers & Attention (BERT fine-tuning with HuggingFace, GPT-2 inference)
- Days 41-45: MLOps Introduction (MLflow, model versioning, FastAPI deployment, Docker for ML)

MONTH 2-3: LLM & Advanced ML - Transformer architecture, PEFT/LoRA fine-tuning, LangChain/RAG, Vector databases, MLOps deep dive, Distributed Training
MONTH 4-6: Specialization tracks - Track A (LLM/Generative AI), Track B (Computer Vision), Track C (MLOps/AI Platform)
Resources: fast.ai course, Andrew Ng ML Specialization (Coursera)
Target Companies: NVIDIA, Google, Meta, Amazon, Apple, Microsoft, OpenAI, DeepMind, Anthropic`,

  "agentic ai engineer": `
AGENTIC AI ENGINEER ROADMAP:
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

DAY 16-45 (Agent Frameworks Expert):
- Days 16-20: Advanced Frameworks (AutoGen, CrewAI, LangGraph, OpenAI Assistants API)
- Days 21-25: Multi-Agent Systems (communication protocols, role-based design, orchestrator-worker pattern)
- Days 26-30: RAG for Agents (chunking strategies, embedding models, hybrid search, re-ranking)
- Days 31-35: Agent Safety & Reliability (guardrails, output validation, hallucination mitigation, human-in-the-loop)
- Days 36-40: Production Agent Systems (observability with LangSmith/Langfuse, cost optimization, latency reduction)
- Days 41-45: Enterprise Agent Patterns (workflow automation, customer service, code generation, data analysis agents)

MONTH 2-3: Tree of Thoughts, Graph of Thoughts, Multimodal Agents, Code Agents, Workflow Automation, Agent Evaluation
Target Companies: NVIDIA, Apple, ServiceNow, Salesforce`,

  "backend engineer": `
BACKEND ENGINEER ROADMAP:
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

DAY 16-45 (Intermediate Backend):
- Days 16-20: Database Deep Dive (Indexing, Query optimization, Transactions ACID, Connection pooling, Migrations)
- Days 21-25: Caching & Performance (Redis, Cache-aside pattern, Write-through/write-behind, Cache invalidation)
- Days 26-30: Message Queues (RabbitMQ/Kafka, Producer-consumer, Celery async tasks, Event-driven architecture)
- Days 31-35: API Design Advanced (GraphQL vs REST, gRPC, API versioning, Rate limiting, Swagger/OpenAPI)
- Days 36-40: Security (OWASP Top 10, SQL injection prevention, OAuth 2.0/OpenID Connect, HTTPS/TLS, Secret management)
- Days 41-45: DevOps (Docker multi-stage builds, Docker Compose, GitHub Actions CI/CD, Nginx, Basic Kubernetes)

MONTH 2-3: Microservices, Advanced Database, Observability (Prometheus/Grafana, Jaeger), System Design Interviews
Target Companies: Google, Amazon, Meta, Uber, Netflix, Shopify`,

  "full-stack engineer": `
FULL-STACK ENGINEER ROADMAP:
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

DAY 16-45 (Full-Stack Intermediate):
- Days 16-20: React Advanced (Redux Toolkit, React Query, useMemo, Testing Library, Storybook)
- Days 21-25: Backend Enhancement (TypeScript, Next.js, Prisma ORM, tRPC, PostgreSQL with Node.js)
- Days 26-30: Authentication & Authorization (NextAuth.js/Clerk, RBAC, Session management, OAuth Google/GitHub)
- Days 31-35: Real-time Features (WebSockets/Socket.io, Server-Sent Events, Real-time chat, Collaborative features)
- Days 36-40: File Handling & Media (S3 uploads, Image optimization, Video streaming, CDN integration)
- Days 41-45: Deployment & DevOps (Docker, CI/CD GitHub Actions, Monitoring Sentry, Database backups)

MONTH 2-3: React Server Components, PWA, React Native, Cloud & Infrastructure, AI Integration with OpenAI API
Target Companies: Microsoft, Salesforce, Shopify, ServiceNow, Intuit
Company-specific: Shopify (Ruby on Rails + React), Microsoft (.NET + React + TypeScript), Salesforce (Apex + LWC)`,

  "ai infrastructure engineer": `
AI INFRASTRUCTURE / PLATFORM ENGINEER ROADMAP:
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
- Day 15: CHECKPOINT: Full infra pipeline

DAY 16-45:
- Days 16-20: ML Model Serving (Triton, TorchServe, TensorFlow Serving, BentoML, Load testing)
- Days 21-25: GPU Computing (CUDA basics, GPU memory management, Multi-GPU setup, nvidia-smi/DCGM)
- Days 26-30: Distributed Training Infrastructure (PyTorch Distributed, Horovod, DeepSpeed)
- Days 31-35: MLOps Platforms (Kubeflow Pipelines, MLflow, Weights & Biases, DVC)
- Days 36-40: Cloud AI Services (AWS SageMaker architecture)
Target Companies: NVIDIA, Google, Amazon (Bedrock), Microsoft (Azure AI)`
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
  if (roleLower.includes("ml") || roleLower.includes("machine learning") || roleLower.includes("data scien") || roleLower.includes("ai ")) {
    return ROLE_ROADMAPS["ai/ml engineer"];
  }
  if (roleLower.includes("agent") || roleLower.includes("llm")) {
    return ROLE_ROADMAPS["agentic ai engineer"];
  }
  if (roleLower.includes("backend") || roleLower.includes("server") || roleLower.includes("api")) {
    return ROLE_ROADMAPS["backend engineer"];
  }
  if (roleLower.includes("full") || roleLower.includes("fullstack") || roleLower.includes("full-stack") || roleLower.includes("web dev")) {
    return ROLE_ROADMAPS["full-stack engineer"];
  }
  if (roleLower.includes("infra") || roleLower.includes("platform") || roleLower.includes("devops") || roleLower.includes("sre") || roleLower.includes("cloud")) {
    return ROLE_ROADMAPS["ai infrastructure engineer"];
  }
  if (roleLower.includes("frontend") || roleLower.includes("front-end") || roleLower.includes("react") || roleLower.includes("ui")) {
    return ROLE_ROADMAPS["full-stack engineer"]; // closest match
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
      "description": "Detailed description of what to do",
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
- Add project milestones and checkpoints
- Include mock interviews and behavioral prep (STAR method)
- Make tasks progressively harder
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
      throw new Error(`AI API error: ${response.status}`);
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
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
