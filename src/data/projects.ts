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
    description: "AI WhatsApp receptionist and clinic management dashboard built with Next.js 16, Supabase (PostgreSQL with RLS), Meta Cloud API v19.0, and Razorpay.",
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
    title: "Boro — Trading, Risk & Compliance Platform",
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
    title: "Atlas AI — AI Tool Directory",
    description: "Production AI tool directory: 91 curated tools across 13 categories, explainable recommendations, favorites, dashboard, and an admin workflow with a full change-history ledger. Zero runtime dependencies.",
    language: "JavaScript",
    url: "https://github.com/taaqib-masood/atlas-ai",
    category: "Full-Stack",
    highlights: [
      "Server-rendered Node.js (>= 22.5) with zero runtime dependencies and no build step",
      "Built-in SQLite (node:sqlite) with an automatic JSON-file fallback behind one DAO interface",
      "scrypt password hashing, sessions, CSRF protection and rate-limited auth, all hand-rolled",
      "Explainable rule-based recommender that shows why each tool was suggested"
    ]
  },
  {
    name: "garageIQ-landing-page",
    title: "GarageIQ — Marketing Site",
    description: "Static marketing site for GarageIQ, the UAE garage-intelligence platform (the product itself lives in a private repo). No build step, no dependencies, deployed on Vercel.",
    language: "HTML / CSS",
    url: "https://github.com/taaqib-masood/garageIQ-landing-page",
    category: "Frontend",
    highlights: [
      "Dependency-free static site served straight from public/",
      "Public face of the private GarageIQ product"
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
      "WebGL point-cloud scenes (three.js + React Three Fiber): hero monolith and a scroll-driven project embedding space",
      "Nonce-based strict CSP, lazy-loaded 3D, and a live request trace of every agent tool call"
    ]
  }
];

export const projects: Project[] = [
  {
    slug: "garageiq",
    aliases: ["garage-iq", "garage iq", "garages", "garage marketplace"],
    title: "GarageIQ — UAE Garage Intelligence",
    blurb: "The trust layer for car repair in the UAE: turns tens of thousands of scattered Google Maps reviews into structured garage intelligence (trust, speed and price scores, brand specialisation, best-for tags) behind a natural-language search.",
    stack: [
      "Next.js 14",
      "NestJS 11",
      "Prisma",
      "PostgreSQL (Supabase)",
      "PostGIS",
      "pgvector",
      "Gemini 2.0 Flash",
      "Groq",
      "Python",
      "Celery",
      "Redis",
      "Apify",
      "Cloudinary",
      "Better Auth",
    ],
    metrics: [
      "5,809 garages tracked · 55,000+ reviews ingested · 4,900+ AI-scored profiles",
      "Dual-LLM pipeline: Gemini for live search intent, a 6-model Groq fleet for batch enrichment",
      "Batch enrichment routed across models by real daily token budget",
      "PostGIS geo search + pgvector embeddings in one Postgres",
    ],
    highlights: [
      "Natural-language search: \"brakes squeaking near Al Quoz\" is parsed into service, location, brand and price band by Gemini 2.0 Flash",
      "Batch enrichment fleet (Llama 3.1/3.3, GPT-OSS 20B/120B, Qwen3-32B, Llama-4-Scout) scheduled against each model's daily token cap",
      "Admin overrides pin AI-generated tags so nightly re-enrichment can never silently overwrite a human decision",
      "HttpOnly cookie sessions (Better Auth), bcrypt + short-lived JWT admin auth, and edge caching on public read paths",
    ],
    categories: ["AI/LLM", "Full-Stack"],
    repo: "https://github.com/taaqib-masood/garageIQ-landing-page",
    demo: "https://app.garageiq.ae/en",
    role: "Founder & sole engineer, 2026 – present (product repo private)",
  },
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
    demo: "https://www.loom.com/share/4320e5b3e47940069c2d4f3f0a473708",
    role: "Sole-built end-to-end at L&T Technology Services, Feb–Jun 2026",
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
    role: "Built at L&T Technology Services, Feb–Jun 2026",
  },
  {
    slug: "stock-forecasting-risk",
    aliases: ["boro", "stock", "stocks", "trading", "stock-market-forecasting-risk-analytics"],
    title: "Boro — Trading, Risk & Compliance Platform",
    blurb: "Automated trading, risk and compliance platform: forecasts prices (ARIMA + LightGBM ensemble, 52 features) and enforcing 10+ walk-forward-validated risk rules — fully automated via GitHub Actions, with FinBERT news sentiment and SHAP-explained Telegram signals.",
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
      "ARIMA + LightGBM ensemble on 52 features, gated by walk-forward validation",
      "Backtest (RELIANCE, 2019–2024): Sharpe 0.67 with realistic costs",
      "Automatic JSON audit trail for every trade decision",
      "Paper-trade simulator with mark-to-market P&L",
      "End-to-end MLflow experiment tracking",
      "Zero manual daily monitoring",
    ],
    categories: ["ML", "AI/LLM"],
    repo: "https://github.com/taaqib-masood/stock-market-forecasting-risk-analytics",
    demo: "https://stocks-proj.netlify.app",
    role: "Personal project, Dec 2025 – present",
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
      "Next.js 16 (App Router)",
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
  },
  {
    slug: "atlas-ai",
    aliases: ["atlas", "ai tool directory", "atlas ai"],
    title: "Atlas AI — AI Tool Directory",
    blurb: "Production AI tool directory with categorised browsing, search and filters, explainable recommendations, favourites, a personal dashboard, and an admin publishing workflow with a full change-history ledger.",
    stack: ["Node.js 22", "SQLite (node:sqlite)", "Server-side rendering", "scrypt", "Zero dependencies"],
    metrics: [
      "Zero runtime dependencies, no build step",
      "91 curated tools across 13 categories",
      "SQLite with automatic JSON-file fallback behind one DAO",
      "Hand-rolled sessions, CSRF and rate-limited auth",
    ],
    categories: ["Full-Stack"],
    repo: "https://github.com/taaqib-masood/atlas-ai",
    demo: null,
    role: "Personal project, 2026",
  },
];
