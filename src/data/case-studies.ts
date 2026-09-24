// Case-study content per project slug. Every claim is sourced from the project's README or the
// resume; numbers that aren't in a source are left out rather than rounded up.

export interface CaseStudy {
  /** One outcome-first sentence for non-technical readers (Plain-English mode). */
  plain: string;
  problem: string;
  built: string;
  result: string;
  /** Left-to-right data flow, rendered as the architecture diagram. */
  architecture: { stage: string; detail: string }[];
  decisions: string[];
}

export const caseStudies: Record<string, CaseStudy> = {
  garageiq: {
    plain: "Helps UAE drivers find a garage they can trust. It reads tens of thousands of Google reviews and turns them into simple trust, speed and price scores.",
    problem: "Nearly every garage on Google Maps shows 4.5+ stars, so car owners in the UAE can't tell who is honest, who specialises in their car, or who turns jobs around fast.",
    built: "A search app where you describe the problem in your own words (\"brakes squeaking near Al Quoz\"). AI reads the reviews for every garage and turns them into trust, speed and price scores, brand specialisms and best-for tags.",
    result: "Live at app.garageiq.ae. It tracks 5,809 garages and 55,000+ reviews, with 4,900+ AI-scored profiles searchable in plain language.",
    architecture: [
      { stage: "Apify", detail: "Google Maps ingestion, budget-capped runs" },
      { stage: "Python + Celery", detail: "enrichment workers on a schedule" },
      { stage: "Groq fleet", detail: "6 models routed by daily token budget" },
      { stage: "Postgres", detail: "PostGIS geo + pgvector embeddings" },
      { stage: "NestJS API", detail: "Gemini 2.0 Flash parses search intent" },
      { stage: "Next.js PWA", detail: "installable, edge-cached reads" },
    ],
    decisions: [
      "Two LLM tiers: a fast model on the live search path and a cheap fleet for batch enrichment, so search stays quick while bulk work stays affordable.",
      "Batch jobs route across six Groq models by each one's remaining daily token budget, raising throughput without paid capacity.",
      "Geo search and embeddings share one Postgres (PostGIS + pgvector) instead of adding a separate vector database.",
      "Admin-pinned tags survive nightly re-enrichment, so the AI can never silently overwrite a human decision.",
      "Sessions live in HttpOnly cookies (Better Auth) rather than localStorage, closing an XSS token-theft path.",
    ],
  },
  "ltts-proctoring-portal": {
    plain: "Automated most of a company's candidate screening: online tests with AI proctoring, plus live video interviews with transcription and an AI-written hiring report.",
    problem: "Screening candidates meant manual CV review, supervised tests and separate interview tools. It was slow, and hard to keep fair and consistent.",
    built: "One platform for the whole flow: bulk CV upload with ATS scoring and candidate-to-JD matching, webcam-proctored tests, and live video interviews with real-time transcription, an AI coach that suggests follow-up questions every 15 seconds, and an auto-generated hiring report.",
    result: "An estimated 95% of manual screening eliminated. Proctoring reaches 90% gaze and 95% multiple-face detection accuracy at under 50ms, with zero-downtime deploys through GitHub Actions.",
    architecture: [
      { stage: "Candidate browser", detail: "MediaPipe + face-api.js proctoring, <50ms" },
      { stage: "LiveKit", detail: "WebRTC SFU for live interviews" },
      { stage: "Deepgram Nova-2", detail: "real-time transcription" },
      { stage: "Groq Llama 3.3 70B", detail: "15s Whisper Coach + hiring report" },
      { stage: "Node.js + MongoDB", detail: "tests, scores, violation logs" },
    ],
    decisions: [
      "LiveKit's SFU instead of a peer-to-peer mesh, so interviews hold up as participants are added.",
      "Proctoring models run in the candidate's browser, keeping detection under 50ms.",
      "Dropped false-positive-heavy detectors and kept 8 high-signal violation types, trading coverage for fairness.",
      "The admin copilot's tool calls are prompt-constrained to a scoped registry, which eliminated hallucinated tool calls in production.",
    ],
  },
  "mcp-code-review-pipeline": {
    plain: "An AI reviewer that checks new code against the team's own tickets and design documents, not just for bugs, and posts its review in under 10 seconds.",
    problem: "Code-review tools only see the code. They can't tell whether it does what the ticket and the design spec asked for, so requirement gaps slip into production.",
    built: "Python connectors (MCP servers) give Claude access to GitHub/GitLab pull requests, Jira tickets, Confluence specs and Jama requirements, so every finding cites the exact clause it violates.",
    result: "In the live demo it caught 5 critical security issues (RCE via eval(), 4 SQL-injection vectors, MD5 hashing) and 6 acceptance-criteria failures, posted as a PR comment in under 10 seconds.",
    architecture: [
      { stage: "Pull request", detail: "GitHub or GitLab diff" },
      { stage: "MCP connectors", detail: "Jira · Confluence · Jama (Python)" },
      { stage: "Claude", detail: "cross-references code vs. requirements" },
      { stage: "PR comment", detail: "findings cite ticket clauses" },
    ],
    decisions: [
      "Built on the Model Context Protocol, so each source is a swappable server rather than custom glue code.",
      "Every finding cites a ticket clause or spec line, so engineers can verify it instead of trusting it.",
      "A mock Atlassian server lets the whole pipeline be tested without live credentials.",
    ],
  },
  "stock-forecasting-risk": {
    plain: "Trades by rules instead of emotion: it screens stocks, sizes every position so no trade risks more than 2% of capital, and keeps an automatic audit trail.",
    problem: "Retail traders size positions by gut feel, don't know their real risk per trade, and spend hours keeping compliance records.",
    built: "A Python pipeline that forecasts with an ARIMA + LightGBM ensemble on 52 features, including FinBERT news sentiment. It enforces 10+ risk rules, paper-trades with realistic costs, sends SHAP-explained signals to Telegram and generates orders through Zerodha.",
    result: "The backtest on RELIANCE (2019–2024) reached a Sharpe ratio of 0.67 with realistic costs. It runs daily on GitHub Actions with zero manual monitoring.",
    architecture: [
      { stage: "Market + news data", detail: "prices, FinBERT sentiment" },
      { stage: "52-feature matrix", detail: "technicals, sentiment, macro" },
      { stage: "ARIMA + LightGBM", detail: "ensemble, walk-forward validated" },
      { stage: "Risk engine", detail: "2% sizing, ATR stops, regime gates" },
      { stage: "Telegram + Zerodha", detail: "explained signals, real orders" },
    ],
    decisions: [
      "New rules must pass walk-forward validation out of sample before they ship, because in-sample backtests overfit.",
      "Position size comes from volatility and a 2% max-risk cap, never from conviction.",
      "Every decision is written to a JSON audit trail, so compliance is a by-product rather than a chore.",
      "It runs on scheduled GitHub Actions with MLflow tracking, so there's no server to maintain.",
    ],
  },
  "salon-booking-saas": {
    plain: "Online booking and business management for UAE salons, in English and Arabic, with VAT-compliant payments and automatic WhatsApp reminders.",
    problem: "UAE salons juggle phone bookings, no-shows, staff commissions and 5% VAT across branches, usually with generic tools that don't support Arabic.",
    built: "A multi-tenant platform where every salon brand and branch has its own hours, staff and bilingual catalogue, with real-time slot availability, loyalty points, Stripe online payments and Square POS in store.",
    result: "5% VAT is stored on every transaction. Reminders go out over WhatsApp and email through background queues, and it deploys with Docker, Kubernetes and Terraform.",
    architecture: [
      { stage: "React + Vite", detail: "EN/AR with RTL layout" },
      { stage: "Express API", detail: "tenant routing via X-Tenant-ID" },
      { stage: "MongoDB + Supabase", detail: "data, auth, storage" },
      { stage: "Redis + BullMQ", detail: "reminder and report jobs" },
      { stage: "Integrations", detail: "Twilio · SendGrid · Stripe · Square" },
    ],
    decisions: [
      "One deployment serves many salon brands, isolated by tenant rather than by separate databases.",
      "Reminders and reports run on BullMQ queues, so bookings never wait on a third-party API.",
      "Working hours and weekends (Friday/Saturday) are set per branch to match UAE norms.",
    ],
  },
  "predictive-maintenance": {
    plain: "Predicts when industrial machines will fail from their sensor data, early enough to schedule repairs instead of suffering breakdowns.",
    problem: "Unplanned machine failures are expensive, and a single model tends to miss either slow wear or sudden faults.",
    built: "A hybrid of three models (gradient boosting, an LSTM, and a CNN over frequency-domain FFT features) combined by a meta-controller that weights each by its confidence, then quantised with TensorFlow Lite for edge devices.",
    result: "Remaining-useful-life prediction on NASA's CMAPSS turbofan dataset reached an MAE of 15.31 and an RMSE of 17.22, beating each model on its own.",
    architecture: [
      { stage: "Sensor streams", detail: "vibration, thermal, pressure" },
      { stage: "Features", detail: "time domain + FFT" },
      { stage: "GBM · LSTM · CNN", detail: "complementary models" },
      { stage: "Meta-controller", detail: "confidence-weighted blend" },
      { stage: "TensorFlow Lite", detail: "quantised for edge inference" },
    ],
    decisions: [
      "Time- and frequency-domain models complement each other: the CNN dominates near failure, when high-frequency anomalies appear.",
      "Weights are set per prediction by model confidence rather than by a fixed average.",
      "Quantised to TensorFlow Lite so inference runs on the device instead of in the cloud.",
    ],
  },
  "smart-hospital-agent": {
    plain: "A WhatsApp receptionist for clinics: patients book, get reminders and pay deposits by chatting, 24/7, while staff see everything on one dashboard.",
    problem: "Clinics run on phone calls and paper registers: after-hours calls go unanswered, patients forget appointments, and no-shows cost revenue.",
    built: "A WhatsApp bot on Meta's Cloud API that walks patients through booking, sends reminders, collects deposits through Razorpay links and requests reviews, plus a real-time clinic dashboard with a daily AI doctor brief and no-show risk scoring.",
    result: "Patients book in under 60 seconds with no app to download, and each clinic's data sits in 13 Supabase tables isolated with Row Level Security.",
    architecture: [
      { stage: "WhatsApp", detail: "patient messages, no app needed" },
      { stage: "Meta Cloud API", detail: "webhook into the app" },
      { stage: "Booking state machine", detail: "Next.js route handlers" },
      { stage: "Supabase Postgres", detail: "13 tables, Row Level Security" },
      { stage: "Razorpay + dashboard", detail: "deposits, live queue, reminders" },
    ],
    decisions: [
      "Booking is a deterministic state machine, not free-form chat, so a patient can never be booked into a slot that doesn't exist.",
      "Tenant isolation is enforced in the database with Row Level Security, not only in application code.",
      "Deposits go out as payment links reconciled by webhook, which discourages no-shows.",
    ],
  },
  "atlas-ai": {
    plain: "A searchable directory of AI tools with personalised recommendations that explain why each tool was suggested.",
    problem: "New AI tools launch daily. People need a curated, trustworthy way to compare them, and admins need an audit trail of every catalogue change.",
    built: "A server-rendered Node.js app with zero dependencies: categorised browsing, filters, favourites, a personal dashboard, explainable recommendations and an admin workflow with a full change-history ledger.",
    result: "91 curated tools across 13 categories, running on built-in SQLite with an automatic JSON fallback for runtimes that lack it.",
    architecture: [
      { stage: "Browser", detail: "server-rendered HTML, no build step" },
      { stage: "Node.js core", detail: "routing, sessions, CSRF, gzip" },
      { stage: "Recommender", detail: "explainable rule-based picks" },
      { stage: "DAO", detail: "one interface, two backends" },
      { stage: "SQLite / JSON", detail: "node:sqlite with file fallback" },
    ],
    decisions: [
      "Zero runtime dependencies: nothing to patch and no supply-chain risk.",
      "One DAO over SQLite and JSON, so it deploys even where node:sqlite isn't available.",
      "Recommendations are rule-based and show their reasons, not a black box.",
    ],
  },
};
