# Requirements Analysis AI

**Team Name:** Pixels 

GenAI-powered system to convert raw, unstructured requirements into structured, Agile-ready user stories, acceptance criteria, edge cases, test cases, and effort estimates — in under 15 seconds.

## Setup Instructions

### Prerequisites

- Python 3.13+
- Node.js (LTS) + npm
- Angular CLI v13 — `npm install -g @angular/cli@13`

### Backend

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
./venv/scripts/activate

# Activate virtual environment (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python -m uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend

```bash
# Install node modules
npm install

# Start the Angular dev server
ng serve -o
```

Frontend runs at `http://localhost:4200`

---

## Dependencies

### Python (requirements.txt)

| fastapi       | 0.132.0| Backend REST API 
| uvicorn       | 0.41.0 | ASGI server 
| pydantic      | 2.12.5 | Data validation 
| requests      | 2.32.5 | LLM API client 
| python-docx   | 1.2.0  | Word export 
| reportlab     | 4.4.10 | PDF export 
| PyPDF2        | 3.0.1  | PDF ingestion 
| pandas        | 3.0.1  | Excel/CSV parsing 
| python-dotenv | 1.2.1  | Environment config 

### Node / Angular

| Angular      | 15 
| Tailwind CSS | 3.x 

---

## Technical Architecture

```
┌────────────────────────────────────────────┐
               Angular SPA (Frontend)                             
    Input Card + Image  │  Analysis Report(12                     
    Upload              │  sections) │Word/PDF                   
└───────────┬───────────────────────┬────────┘
            │ POST /refine          │ POST /download-*
┌───────────▼───────────────────────▼────────┐
            FastAPI Backend (Python)                               
   validate() → 8-phase analysis → quality_score()                
   refine() │ create_word() │ create_pdf()                        
└───────────────────────┬─────────────────────┘
                        │ HTTPS
              ┌─────────▼─────────┐
                    LLM Farms           
                    GPT o mini       
                    (Enterprise)     
              └───────────────────┘
```

| Layer                        | Technology 

| Frontend                     | Angular 15 + Tailwind CSS 
| API Gateway                  | FastAPI 
| LLM | LLM Farms — GPT o mini | 8-phase structured prompting, strict JSON output 
| Quality Scorer               | LLM Farms — GPT o mini 
| Export                       | python-docx + ReportLab 
| File Ingestion               | PyPDF2 + pandas + base64

---

## AI Approach

### Model Configuration


| Model                        | LLM Farms — GPT o mini |
| API Version                  | 2024-08-01-preview |
| Max Tokens                   | 16,000 (analysis) / 2,000 (quality score) |
| Temperature                  | 0.2 |
| Vision Support               | Yes — base64 images (wireframes, screenshots) |

### 8-Phase Analysis Pipeline

The system prompt forces the LLM to reason through requirements in 8 structured phases:

1. **Classification & Context** — type, domain, stakeholder, priority, complexity
2. **Detailed Analysis** — functional, non-functional, performance
3. **Edge Cases** — exception scenarios with risk levels and mitigation
4. **Clarification Questions** — functional, technical, scope, constraints
5. **Acceptance Criteria** — Given/When/Then format, INVEST principles
6. **Solution Options** — 2–4 implementation alternatives with pros/cons
7. **User Story Breakdown** — Epic + individual Agile stories
8. **Test Case Generation** — unit, integration, system, UAT

Output is a strict JSON schema with 12 top-level keys.

### Prompts Used

- **VALIDATION_PROMPT** — Rejects invalid inputs before calling the main pipeline (~20% API call savings)
- **SYSTEM_PROMPT** — Core 8-phase analysis (~700 tokens)
- **REFINE_PROMPT** — Improves specific sections only, preserving the rest
- **QUALITY_PROMPT** — Scores Clarity, Testability, Completeness, Actionability (25 pts each). Typical improvement: ~28 → ~86

### JSON Repair Pipeline

`safe_json_parse()` in `llm_service.py` applies three sequential repair strategies to handle malformed LLM output:

1. `_repair_unterminated_string()` — closes open string literals
2. `_repair_truncated_json()` — appends missing `]` / `}` closers
3. `_extract_complete_json()` — extracts the longest valid JSON object

Reduced parse failures from ~15% → <1% in production.
