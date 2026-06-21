# Zixue (自学)

**AI-powered study plan generator for international students.**

> No more information gaps. 自学 — 消除留学生的信息差.

Inspired by [REKCARC-TSC-UHT](https://github.com/PKUanonym/REKCARC-TSC-UHT).

---

## The problem

International students lose an enormous amount of time to an invisible barrier: the **information gap**. Local students inherit years of accumulated knowledge about how a course actually works — which professors test which topics, how past exams are structured, what the unwritten expectations are, and where to focus. International students often arrive with none of that context, in a second language, and have to reconstruct it from scratch every semester. Zixue closes that gap. You give it what you have — a syllabus, past exams, lecture notes — and an AI advisor turns it into a concrete, week-by-week study plan, written in **both English and Chinese**, that tells you exactly what to study and why.

## Features

- 📄 **Document-aware** — upload a syllabus, past exams, and lecture notes; the plan is built from your actual course materials.
- 🔍 **Exam pattern analysis** — when past exams are provided, the AI identifies recurring question types and frequently tested topics, then weights your plan toward them.
- 🌏 **Bilingual output** — every plan is generated in both English and Simplified Chinese.
- 🗓️ **Week-by-week structure** — topics, concrete study actions, and time budgets for each week.
- 🔒 **Privacy-first** — uploaded files are processed in memory and immediately discarded. Nothing is stored.
- 🤝 **Community-driven** — each plan can carry a contributor credit, so the knowledge compounds.

## How it works

1. **Input** — enter your course details: university, course code, course name, department, professor, and semester.
2. **Upload** — attach your PDFs (syllabus, past exams, lecture notes), each labeled by type.
3. **Get your plan** — Zixue analyzes everything and returns a structured, bilingual weekly study plan in seconds.

## Tech stack

| Layer    | Technology                                              |
| -------- | ------------------------------------------------------- |
| Backend  | FastAPI · pdfplumber (in-memory PDF parsing)            |
| AI       | Claude (`claude-sonnet-4-6`) via the Anthropic SDK      |
| Frontend | React + Vite · react-markdown                           |

## Getting started

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then add your ANTHROPIC_API_KEY
uvicorn main:app --reload     # serves on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env          # optional — defaults to http://localhost:8000
npm run dev                   # serves on http://localhost:5173
```

Open http://localhost:5173, fill in your course details, upload your PDFs, and generate your plan.

## Privacy

Uploaded files are **never written to disk and never stored**. Each PDF is read into memory, parsed for text, and discarded within the request. Generated plans are stateless — there is no database in the MVP.

## Contributing

Zixue gets better the more course knowledge the community pools. Contributions are welcome — open an issue or a PR. When you submit a study plan you helped shape, add your **contributor username** so your work is credited at the bottom of the plan. Every contribution helps close the information gap for the next student.

## License

[MIT](LICENSE)
