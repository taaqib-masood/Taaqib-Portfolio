export interface Project {
  slug: string;
  aliases?: string[];
  title: string;
  blurb: string;
  stack: string[];
  metrics: string[];
  categories: string[];
  repo: string;
  demo: string | null;
  role: string;
  image?: string;
  highlights?: string[];
}

export interface GithubRepoInfo {
  name: string;
  title: string;
  description: string;
  language: string;
  url: string;
  category: string;
  highlights: string[];
}

export const githubRepos: GithubRepoInfo[] = [
  {
    name: "smart-hospital-agent",
    title: "Reva AI — WhatsApp Receptionist",
    description: "AI WhatsApp receptionist and clinic management dashboard built with Next.js 14, Supabase (PostgreSQL with RLS), Meta Cloud API v19.0, and Razorpay.",
    language: "TypeScript",
    url: "https://github.com/taaqib-masood/smart-hospital-agent",
    category: "AI/LLM & Full-Stack",
    highlights: [
      "State-machine booking engine (idle -> greeting -> collect_name -> show_doctors -> confirm_slot -> booked)",
      "Automated Razorpay deposit payment links with webhook reconciliation",
      "AI no-show prediction model scoring morning appointments",
      "Multi-tenant clinic architecture with 13 Supabase tables protected by Row Level Security"
    ]
  },
  {
    name: "stock-market-forecasting-risk-analytics",
    title: "Stock Market Forecasting & Risk Analytics",
    description: "Systematic quant trading pipeline forecasting price movements (ARIMA + LightGBM ensemble, 52 features) with walk-forward validation and 10+ strict risk rules.",
    language: "Python",
    url: "https://github.com/taaqib-masood/stock-market-forecasting-risk-analytics",
    category: "ML & Quant Finance",
    highlights: [
      "10+ automated risk rules: 2% max portfolio risk sizing, ATR volatility stops, regime switching gates",
      "FinBERT NLP news sentiment analysis integrated into feature matrix",
      "SHAP-explained trading signals delivered to Telegram bot",
      "Automated daily execution via GitHub Actions with MLflow experiment tracking"
    ]
  },
  {
    name: "predictive-maintenance-industrial-machinery",
    title: "Predictive Maintenance of Industrial Machinery",
    description: "Hybrid AI system integrating GBM, LSTM, and CNN under a confidence-weighted meta-controller for turbofan engine degradation forecasting on NASA CMAPSS dataset.",
    language: "Python",
    url: "https://github.com/taaqib-masood/predictive-maintenance-industrial-machinery",
    category: "ML & Edge AI",
    highlights: [
      "MAE 15.31 and R² 0.85 outperforming standalone architectures",
      "Processes vibration and thermal sensor telemetry across time and frequency domains (FFT)",
      "75% model footprint reduction via TensorFlow Lite INT8 quantization",
      "Edge-deployed for real-time inference on Raspberry Pi 4 and NVIDIA Jetson Nano"
    ]
  },
  {
    name: "salon-booking-saas",
    title: "Salon Booking SaaS (UAE)",
    description: "Production-grade multi-tenant salon management platform tailored for UAE businesses with bilingual EN/AR interface and RTL layout.",
    language: "TypeScript / Node.js",
    url: "https://github.com/taaqib-masood/salon-booking-saas",
    category: "Full-Stack SaaS",
    highlights: [
      "Bilingual Arabic/English RTL scheduling engine with staff commission tracking",
      "UAE VAT-compliant payments via Stripe and Square POS",
      "Redis + BullMQ asynchronous job queues for SMS/WhatsApp reminders",
      "Containerized with Docker and orchestrated with Kubernetes; Terraform-provisioned infra"
    ]
  },
  {
    name: "atlas-ai",
    title: "Atlas AI — Autonomous Multi-Agent System",
    description: "Modular agentic task orchestration platform coordinating specialized LLM agents for research, synthesis, and workflow automation.",
    language: "JavaScript / TypeScript",
    url: "https://github.com/taaqib-masood/atlas-ai",
    category: "AI/LLM Agents",
    highlights: [
      "Multi-agent supervisor pattern delegating sub-tasks to specialized domain agents",
      "Scoped tool registries with deterministic guardrails against hallucinated actions",
      "Streaming execution graph visualization"
    ]
  },
  {
    name: "garageIQ-landing-page",
    title: "GarageIQ — Auto Workshop Platform",
    description: "Modern landing page and customer portal interface for automotive service centers and workshops.",
    language: "HTML / CSS / JavaScript",
    url: "https://github.com/taaqib-masood/garageIQ-landing-page",
    category: "Frontend",
    highlights: [
      "Responsive automotive service booking workflow",
      "Interactive inspection checklist preview"
    ]
  },
  {
    name: "majestic-constructions",
    title: "Majestic Constructions Portal",
    description: "Commercial construction project tracking portal and corporate showcase website.",
    language: "TypeScript",
    url: "https://github.com/taaqib-masood/majestic-constructions",
    category: "Full-Stack",
    highlights: [
      "Client milestone tracking and architectural portfolio showcases",
      "Performance-optimized image delivery"
    ]
  },
  {
    name: "Taaqib-Portfolio",
    title: "Taaqib Masood — Swiss Brutalist Engineering Portfolio",
    description: "Production Next.js portfolio featuring a mechanical Swiss brutalist design system and interactive AI Agent Terminal.",
    language: "TypeScript",
    url: "https://github.com/taaqib-masood/Taaqib-Portfolio",
    category: "Full-Stack & AI",
    highlights: [
      "Interactive Groq-powered AI Agent Terminal operating as an interview proxy",
      "Custom physics-based Framer Motion cubic-bezier transitions",
      "Dynamic Google Translate RTL Arabic switcher with zero visual layout shift"
    ]
  },
  {
    name: "graphify",
    title: "Graphify — Codebase Knowledge Graph",
    description: "Turns any codebase (code, docs, SQL schemas, configs, PDFs) into a queryable knowledge graph. A /graphify skill for Claude Code, Cursor, Codex, and Gemini CLI using local deterministic AST parsing — no vector store required.",
    language: "Python",
    url: "https://github.com/Graphify-Labs/graphify",
    category: "Developer Tools & AI",
    highlights: [
      "Deterministic AST parsing via tree-sitter — every graph edge is explained, not hallucinated",
      "GraphRAG with Leiden community detection for cross-file semantic clustering",
      "MCP (Model Context Protocol) server for AI agent tool integration",
      "Works as a skill across Claude Code, Cursor, Codex, and Gemini CLI"
    ]
  },
  {
    name: "ponytail",
    title: "Ponytail — Lazy Senior Dev AI Rules",
    description: "Makes your AI agent think like the laziest senior dev in the room. A set of battle-tested agent rules enforcing YAGNI, minimum diff, deletion over addition, and root-cause bug fixing.",
    language: "JavaScript",
    url: "https://github.com/DietrichGebert/ponytail",
    category: "Developer Tools & AI",
    highlights: [
      "Enforces YAGNI ladder: does it need to be built? does stdlib/platform already do it? only then write code",
      "Shortest working diff wins — boring over clever, fewest files possible",
      "Bug fix = root cause not symptom: grep all callers, fix the shared function once",
      "Compatible with Claude Code, Cursor, Codex, and Gemini CLI as agent rules/skills"
    ]
  }
];

export const projects: Project[] = [
  {
    slug: "ltts-proctoring-portal",
    title: "LTTS Test Management & Live Interview Proctoring Portal",
    blurb: "Production proctored assessment + recruitment platform — live video interviewing, real-time transcription, AI Whisper Coach, and auto-generated hiring reports.",
    stack: [
      "Angular 19",
      "Node.js",
      "Express.js",
      "LiveKit",
      "Deepgram Nova-2",
      "LLaMA 3.3-70b (OpenRouter)",
      "MediaPipe",
      "JWT",
      "MongoDB Atlas",
    ],
    metrics: [
      "90% gaze-tracking accuracy",
      "95% multi-face detection at <50ms",
      "~95% manual screening eliminated",
      "Zero-downtime CI/CD via GitHub Actions on Render",
    ],
    categories: ["AI/LLM", "Full-Stack"],
    repo: "https://github.com/taaqib-masood",
    demo: null,
    role: "Sole-built end-to-end at L&T Technology Services, Feb–Jun 2026",
    image: "/projects/ltts-proctoring.jpg",
  },
  {
    slug: "mcp-code-review-pipeline",
    title: "MCP AI Code-Review Pipeline",
    blurb: "Multi-source AI code reviewer on Model Context Protocol — Python connectors for GitHub, GitLab, Jira, Confluence, and Jama feed Claude for cross-referenced reviews that cite exact ticket clauses and spec violations.",
    stack: [
      "Python",
      "Model Context Protocol",
      "Anthropic Claude",
      "GitHub API",
      "GitLab API",
      "Jira",
      "Confluence",
      "Jama",
    ],
    metrics: [
      "Caught 5 critical security issues pre-merge (RCE via eval(), 4 SQL injection vectors, MD5 hashing)",
      "6 acceptance-criteria failures flagged",
      "Review posted as GitHub PR comment in <10 seconds",
    ],
    categories: ["AI/LLM"],
    repo: "https://github.com/taaqib-masood",
    demo: null,
    role: "Built at L&T Technology Services",
    image: "/projects/mcp-code-review.jpg",
  },
  {
    slug: "stock-forecasting-risk",
    title: "Stock Market Forecasting & Risk Analytics",
    blurb: "Systematic pipeline forecasting prices (ARIMA + LightGBM ensemble, 52 features) and enforcing 10+ walk-forward-validated risk rules — fully automated via GitHub Actions, with FinBERT news sentiment and SHAP-explained Telegram signals.",
    stack: [
      "Python",
      "ARIMA",
      "LightGBM",
      "LSTM",
      "scikit-learn",
      "SHAP",
      "FinBERT",
      "MLflow",
      "Zerodha Kite Connect",
      "Telegram Bot API",
      "GitHub Actions",
    ],
    metrics: [
      "10+ enforced risk rules (2% max-risk sizing, ATR stops, regime gates, earnings blackout)",
      "Paper-trade simulator with mark-to-market P&L",
      "End-to-end MLflow experiment tracking",
      "Zero manual daily monitoring",
    ],
    categories: ["ML", "AI/LLM"],
    repo: "https://github.com/taaqib-masood/stock-market-forecasting-risk-analytics",
    demo: "https://stocks-proj.netlify.app",
    role: "Personal project, Dec 2025 – present",
    image: "/projects/stock-forecasting.jpg",
  },
  {
    slug: "salon-booking-saas",
    title: "Salon Booking SaaS (UAE)",
    blurb: "Production-grade multi-tenant SaaS for UAE salons — bilingual EN/AR catalogs, real-time slot scheduling, staff commission tracking, loyalty points, and WhatsApp/email notifications, containerized and Kubernetes-orchestrated.",
    stack: [
      "React",
      "Vite",
      "Node.js",
      "Express",
      "MongoDB",
      "PostgreSQL (Supabase)",
      "Redis",
      "Docker",
      "Kubernetes",
      "Terraform",
      "Nginx",
      "Stripe",
      "Square POS",
      "Twilio",
      "SendGrid",
    ],
    metrics: [
      "UAE VAT-compliant payments via Stripe + Square POS",
      "Bilingual EN/AR with RTL",
      "Redis + BullMQ async job queues",
      "Terraform-provisioned K8s",
    ],
    categories: ["Full-Stack"],
    repo: "https://github.com/taaqib-masood/salon-booking-saas",
    demo: null,
    role: "Personal project, Feb–May 2026",
    image: "/projects/salon-booking.jpg",
  },
  {
    slug: "predictive-maintenance",
    title: "Predictive Maintenance of Industrial Machinery",
    blurb: "Dynamic AI-based hybrid model integrating GBM, LSTM, and CNN under a smart meta-controller — processes vibration & thermal data in time and frequency domains and dynamically weights predictions by model confidence, optimized for edge deployment.",
    stack: [
      "Python",
      "TensorFlow",
      "Scikit-learn",
      "LSTM",
      "CNN",
      "Gradient Boosting",
      "FFT",
      "TensorFlow Lite",
    ],
    metrics: [
      "MAE 15.31 (outperforms individual models)",
      "R² 0.85",
      "75% model-size reduction via TensorFlow Lite",
      "Real-time on Raspberry Pi 4 & NVIDIA Jetson Nano",
      "Handles both gradual degradation & sudden failures",
    ],
    categories: ["ML", "Edge"],
    repo: "https://github.com/taaqib-masood/predictive-maintenance-industrial-machinery",
    demo: null,
    role: "Research project, VIT — dataset: NASA CMAPSS Turbofan Engine Dataset",
    image: "/projects/predictive-maintenance.jpg",
  },
  {
    slug: "smart-hospital-agent",
    aliases: [
      "reva-ai",
      "reva",
      "smart-hospital-agent",
      "whatsapp-receptionist",
      "reva-whatsapp",
      "hospital-agent"
    ],
    title: "Reva AI — WhatsApp Receptionist",
    blurb: "AI-powered WhatsApp bot replacing clinic front desks — autonomously books appointments, sends reminders, collects deposits via Razorpay, and manages patient records 24/7 with a real-time dashboard.",
    stack: [
      "Next.js 14 (App Router)",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "Supabase (PostgreSQL)",
      "Supabase Auth",
      "Meta Cloud API v19.0",
      "Razorpay",
      "Vercel Cron",
    ],
    metrics: [
      "Automated state-machine booking via WhatsApp",
      "AI no-show prediction risk scoring",
      "Live patient queue & dynamic slot blocker",
      "Digital consent forms & prescriptions",
    ],
    highlights: [
      "Deterministic WhatsApp state machine (idle -> greeting -> collect_name -> show_doctors -> confirm_slot -> booked)",
      "Automated Razorpay deposit links sent via WhatsApp with webhook payment reconciliation",
      "Multi-tenant clinic architecture with 13 Supabase tables protected by Row Level Security",
      "Morning risk scoring engine predicting no-show likelihood to optimize doctor calendar density"
    ],
    categories: ["AI/LLM", "Full-Stack"],
    repo: "https://github.com/taaqib-masood/smart-hospital-agent",
    demo: null,
    role: "Personal project / SaaS",
    image: "/projects/smart-hospital.jpg",
  },
];
