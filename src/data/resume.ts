export const aboutParagraphs = [
  "AI engineer who builds systems where the model isn't the demo, it's the infrastructure. I work at the layer where LLMs stop being a chatbot widget and start making decisions inside a real product: agentic tool-calling systems that don't hallucinate their way into bad actions, real-time pipelines that fuse computer vision with language reasoning, and multi-source AI agents that pull context from wherever the truth actually lives before generating an answer.",
  "I care about the unglamorous part of AI engineering: making sure the agent calls the right tool, the RAG pipeline retrieves the right context, and the system fails safely when it isn't sure. Full-stack (Python, TypeScript, Node.js, cloud infra) is the toolkit; getting AI to behave reliably in production is the actual job. Based in Dubai, UAE. Open to AI Engineering and AI-integrated full-stack roles."
];

export const skills = {
  "Languages": ["TypeScript", "JavaScript (ES6+)", "Python", "SQL", "HTML5", "CSS3"],
  "Frontend": ["Angular 18/19 (standalone components, RxJS)", "React", "Vite", "Angular Material", "Tailwind CSS (RTL)"],
  "Backend": ["Node.js", "Express.js", "REST APIs", "JWT auth", "bcrypt", "Multer", "BullMQ"],
  "Databases": ["MongoDB / Mongoose ODM", "MongoDB Atlas", "PostgreSQL (Supabase)", "Redis"],
  "AI / LLMs": ["Anthropic Claude", "Groq (LLaMA 3.1 / 3.3)", "prompt engineering", "function-calling agents", "RAG", "MCP tooling", "MediaPipe", "LiveKit (WebRTC)", "Deepgram Nova-2"],
  "ML & Data": ["LightGBM", "ARIMA", "LSTM", "scikit-learn", "SHAP", "FinBERT", "MLflow", "Pandas", "NumPy"],
  "Cloud & DevOps": ["Docker", "Kubernetes", "Terraform", "Nginx", "Render", "Vercel", "Cloudinary", "GitHub Actions (CI/CD)", "Azure (Cosmos DB, App Service, Blob Storage, OpenAI)"],
  "Tools": ["Git / GitHub", "Postman", "VS Code", "Cursor", "Stripe", "Supabase", "Zerodha Kite Connect", "Telegram Bot API"]
};

export const experience = [
  {
    role: "Full Stack Developer Intern",
    company: "L&T Technology Services (LTTS)",
    location: "Chennai, India",
    period: "Feb 2026 – Jun 2026 (5 mos)",
    bullets: [
      "Sole-built a production proctored assessment and recruitment platform (Angular 19 + Node.js + MongoDB Atlas) with zero-downtime CI/CD via GitHub Actions on Render across Agile sprints; eliminated an estimated 95% of manual screening via bulk CV upload, ATS scoring with auto-fix, weighted candidate-JD matching, and a 360° evaluation dashboard.",
      "Shipped LIPM (Live Interview Proctoring & Mentoring): a full live video interview platform on LiveKit (WebRTC) with Deepgram Nova-2 real-time transcription, a 15-second AI Whisper Coach loop feeding interviewers live follow-up prompts, and a post-session hiring report (Groq llama-3.3-70b) with red-flag extraction.",
      "Built a transcript-only speech-analytics engine deriving filler-word rate, pace (WPM), pause patterns, and a composite 0–100 confidence score — no audio signal processing required.",
      "Embedded LTTS Copilot: a tool-calling LLM agent (Groq llama-3.3-70b-versatile) as a floating admin chatbot with a scoped function-calling registry; deliberately prompt-engineered tool-trigger constraints to eliminate hallucinated tool calls in production.",
      "Achieved 90% gaze and 95% multiple-face detection accuracy at <50ms latency using MediaPipe Face Landmarker (solvePnP head-pose) and face-api.js; improved proctoring fairness by removing false-positive-heavy detectors and retaining 8 high-signal violation types.",
      "Designed an MCP-based AI code-review pipeline — Python connectors for GitHub, GitLab, Jira, Confluence, and Jama feed Claude-powered cross-referenced reviews; live demo caught 5 critical security issues (RCE via eval(), 4 SQL injection vectors, MD5 hashing) and 6 AC failures pre-merge in under 10 seconds.",
      "Drove a cloud-migration plan from free tier to Azure (Cosmos DB MongoDB API, App Service, Blob Storage, Azure OpenAI); delivered an access checklist and migration runbook adopted by the team."
    ]
  }
];

export const education = [
  {
    institution: "Vellore Institute of Technology (VIT)",
    degree: "B.Tech Computer Science and Engineering, Specialization in Bioinformatics",
    detail: "CGPA: 7.1 · 2022 – 2026 · Vellore, Tamil Nadu, India"
  },
  {
    institution: "GEMS Our Own Indian School",
    degree: "CBSE Class XII, Senior School, Science Stream",
    detail: "75% · 2020 – 2022 · Dubai, UAE"
  }
];

export const certifications = [
  "AWS Certified Cloud Practitioner (in progress)",
  "Oracle Generative AI Foundations"
];

export const spokenLanguages = "English (Fluent), Hindi (Fluent), Urdu (Fluent), Tamil (Fluent), Malayalam (Basic), Arabic (Basic)";

export const contact = {
  phone: "+971-501330057",
  email: "taaqib.masood@icloud.com",
  location: "Dubai, United Arab Emirates",
  linkedin: "https://www.linkedin.com/in/taaqib-masood",
  github: "https://github.com/taaqib-masood",
  liveDemo: "https://stocks-proj.netlify.app",
  residency: "Dubai, UAE · Available immediately",
  licenses: "UAE (Dubai) and India driving license"
};
