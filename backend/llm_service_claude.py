import os
import json
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load .env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv("GENAIPLATFORM_FARM_SUBSCRIPTION_KEY")

print("API KEY LOADED:", bool(API_KEY))

URL = "https://aoai-farm.bosch-temp.com/api/google/v1/publishers/anthropic/models/claude-sonnet-4-5@20250929:rawPredict"

SYSTEM_PROMPT = """
You are a senior business analyst.

Convert unclear requirements into a clear Jira ticket.

Return ONLY valid JSON in this exact structure:

{
  "summary": "",
  "description": "",
  "steps_to_reproduce": "",
  "expected_result": "",
  "actual_result": "",
  "acceptance_criteria": [],
  "priority": ""
}
"""


def refine_requirement1(user_input: str) -> dict:
    headers = {
    "Authorization": f"Bearer {API_KEY}",
    "genaiplatform-farm-subscription-key": API_KEY,
    "Content-Type": "application/json",
   }
    print("KEY PREFIX:", API_KEY[:6] if API_KEY else None)
    print("KEY LENGTH:", len(API_KEY) if API_KEY else 0)

    # Anthropic format
    payload = {
        "anthropic_version": "vertex-2023-10-16",
        "max_tokens": 1024,
        "messages": [
            {
                "role": "user",
                "content": f"{SYSTEM_PROMPT}\n\nUser requirement:\n{user_input}"
            }
        ]
    }

    response = requests.post(URL, headers=headers, json=payload, timeout=60)

    print("RAW RESPONSE:", response.text)

    response.raise_for_status()
    data = response.json()

    # 🔥 Anthropic response extraction
    # Usually: data["content"][0]["text"]
    ai_text = data["content"][0]["text"]

    return json.loads(ai_text)
