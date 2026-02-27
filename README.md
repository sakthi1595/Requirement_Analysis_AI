# 🧠 Requirement Analysis AI

An AI-powered full-stack application that transforms **unstructured, ambiguous requirements** into structured, Jira-ready analysis reports — complete with user stories, acceptance criteria, test cases, effort estimates, and more. Export the full report as a **Word (.docx)** or **PDF** document.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
  - [Backend](#backend-setup)
  - [Frontend](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Output Report Structure](#output-report-structure)
- [Environment Variables](#environment-variables)
- [Usage Guide](#usage-guide)

---

## Overview

Requirement Analysis AI bridges the gap between raw, informal requirement descriptions and structured, development-ready specifications. Paste a rough idea, a feature request, or even upload a screenshot — the AI engine analyzes it and generates a comprehensive report covering every dimension a development team needs.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 AI-Powered Analysis | Converts unstructured text into a full requirement report using GPT-4o-mini |
| 🖼️ Image Upload Support | Attach a screenshot or wireframe alongside the text requirement |
| 📊 Quality Score | Displays a quality score **before** and **after** AI refinement |
| 📝 User Stories | Generates structured user stories with priorities and effort estimates |
| ✅ Acceptance Criteria | Given / When / Then format for every criterion |
| 🧪 Test Cases | Unit, integration, system, and UAT test cases with pass/fail criteria |
| ⚡ Edge Cases | Identifies edge scenarios with risk levels and mitigation strategies |
| 🔄 Follow-up Refinement | Iteratively refine the output with natural language instructions |
| ⬇️ Export to Word | Download the full report as a `.docx` file |
| ⬇️ Export to PDF | Download the full report as a `.pdf` file |
| 🗂️ Collapsible Sections | Toggle individual sections of the report for focused review |

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Runtime |
| FastAPI | 0.132.0 | REST API framework |
| Uvicorn | 0.41.0 | ASGI server |
| Pydantic | 2.12.5 | Request/response validation |
| python-dotenv | 1.2.1 | Environment variable management |
| requests | 2.32.5 | HTTP client for AI API calls |
| python-docx | 1.2.0 | Word document generation |
| ReportLab | 4.4.10 | PDF generation |
| pandas | 3.0.1 | Data handling |
| PyPDF2 | 3.0.1 | PDF text extraction |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Angular | 13.3 | SPA framework |
| TypeScript | 4.6 | Type-safe scripting |
| TailwindCSS | 3.4 | Utility-first styling |
| RxJS | 7.5 | Reactive HTTP calls |

### AI Provider
- **OpenAI GPT-4o-mini** via custom API gateway (`OPENAI_API_KEY`)
- Alternate: **Anthropic Claude Sonnet** via `GENAIPLATFORM_FARM_SUBSCRIPTION_KEY` (see `llm_service_claude.py`)

---

## 📁 Project Structure

```
Hackathon/
├── Requirement_Analysis_AI/
│   └── README.md
│
├── backend/
│   ├── main.py                  # FastAPI app & route handlers
│   ├── llm_service.py           # Core AI logic, document generation (GPT-4o-mini)
│   ├── llm_service_claude.py    # Alternate AI backend (Claude Sonnet)
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # API keys (create manually — not committed)
│
└── frontend/
    ├── angular.json
    ├── package.json
    ├── tailwind.config.js
    └── src/
        └── app/
            ├── app.module.ts
            ├── app-routing.module.ts
            └── requirement-ai/
                ├── requirement-ai.component.ts    # Main UI logic
                ├── requirement-ai.component.html  # Template
                ├── requirement-ai.component.scss  # Styles
                └── requirement-analysis.model.ts  # TypeScript interfaces
```

---

## ✅ Prerequisites

Make sure the following are installed before proceeding:

- **Python** 3.10 or later — [Download](https://www.python.org/downloads/)
- **Node.js** 16 or later + **npm** — [Download](https://nodejs.org/)
- **Angular CLI** 13 — install via `npm install -g @angular/cli@13`
- A valid **OpenAI API Key** (or equivalent gateway key)

---

## ⚙️ Setup & Installation

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS / Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create the `.env` file** in the `backend/` directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   > If using the Claude backend, also add:
   > ```env
   > GENAIPLATFORM_FARM_SUBSCRIPTION_KEY=your_claude_key_here
   > ```

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

---

## ▶️ Running the Application

### Start the Backend

From the `backend/` directory:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at: `http://127.0.0.1:8000`  
Interactive API docs (Swagger UI): `http://127.0.0.1:8000/docs`

---

### Start the Frontend

From the `frontend/` directory:

```bash
ng serve
```

The app will be available at: `http://localhost:4200`

> ⚠️ **The backend must be running before using the frontend.**

---

## 📡 API Reference

### `POST /refine`
Analyzes an unstructured requirement and returns a full structured report.

**Request Body:**
```json
{
  "user_input": "Users should be able to reset their password",
  "image_base64": "<optional base64-encoded image string>"
}
```

**Response:**
```json
{
  "is_valid": true,
  "ticket": { /* RequirementAnalysisReport object */ },
  "quality_before": { "score": 42, "reason": "..." },
  "quality_after":  { "score": 91, "reason": "..." }
}
```

---

### `POST /refine-followup`
Iteratively refines an existing analysis based on a follow-up instruction.

**Request Body:**
```json
{
  "original_requirement": "Users should be able to reset their password",
  "current_draft": { /* existing RequirementAnalysisReport */ },
  "instruction": "Add more edge cases for locked accounts"
}
```

**Response:**
```json
{
  "ticket": { /* updated RequirementAnalysisReport */ },
  "quality_after": { "score": 95, "reason": "..." }
}
```

---

### `POST /download-word`
Generates and streams a `.docx` Word document from a report object.

**Request Body:** `RequirementAnalysisReport` JSON object  
**Response:** Binary stream (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)

---

### `POST /download-pdf`
Generates and streams a `.pdf` document from a report object.

**Request Body:** `RequirementAnalysisReport` JSON object  
**Response:** Binary stream (`application/pdf`)

---

### `GET /`
Health check endpoint.

**Response:** `{ "message": "Requirement Refiner API is running" }`

---

## 📄 Output Report Structure

Each generated report (`RequirementAnalysisReport`) contains the following sections:

| Section | Description |
|---|---|
| `requirement_summary` | Requirement ID, original text, analyst, date |
| `classification` | Type, domain, stakeholder, priority, complexity, impact scope |
| `detailed_analysis` | Hardware, software (UI/HMI/backend), performance, cross-functional requirements |
| `edge_cases` | Scenario, trigger, expected behavior, risk level, mitigation |
| `clarification_questions` | Functional, technical, constraint, and scope questions |
| `acceptance_criteria` | Given / When / Then / And format with verification method |
| `implementation_options` | Multiple approaches with pros, cons, effort, and risk |
| `recommendation` | AI's recommended implementation approach |
| `user_stories` | Story ID, As a / I want / So that, priority, effort, DoD |
| `epic` | Parent epic with business value and linked stories |
| `test_cases` | Unit / integration / system / UAT tests with steps and pass/fail criteria |
| `test_stories` | BDD-style test stories with entry/exit criteria |
| `test_coverage_summary` | Count of test types and automated vs manual breakdown |
| `dependencies_and_risks` | External dependencies and risks with mitigations |
| `effort_estimation` | Total effort, dev/test/doc breakdown, sprint allocation suggestion |
| `next_steps` | Ordered list of recommended next actions |

---

## 🔐 Environment Variables

| Variable | File | Required | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | `backend/.env` | ✅ Yes | API key for GPT-4o-mini (primary LLM) |
| `GENAIPLATFORM_FARM_SUBSCRIPTION_KEY` | `backend/.env` | ❌ Optional | Subscription key for Claude Sonnet (alternate LLM) |

> **Never commit `.env` to version control.** Add it to `.gitignore`.

---

## 🚀 Usage Guide

1. Open `http://localhost:4200` in your browser.
2. Type or paste an unstructured requirement into the text area.
   - *Example:* `"As a user I want some way to not forget my password"`
3. *(Optional)* Click **Upload Image** to attach a screenshot or wireframe.
4. Click **Generate** — the AI will analyze and display the full report.
5. Review the **Quality Score** before and after analysis.
6. Use the **collapsible section headers** to focus on specific parts of the report.
7. To iterate, type a follow-up instruction (e.g., *"Add edge cases for network failure"*) and click **Refine**.
8. When satisfied, click **Download Word** or **Download PDF** to export the report.
