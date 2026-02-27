import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from llm_service import create_word, get_quality_score, refine_followup, refine_requirement
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from io import BytesIO
import docx
from docx.document import Document as DocxDocument
from llm_service import create_word, create_pdf, refine_followup, refine_requirement
from llm_service import extract_file_text

app = FastAPI(title="Requirement Refiner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequirementRequest(BaseModel):
    user_input: str
    image_base64: str | None = None

class FollowupRequest(BaseModel):
    original_requirement: str
    current_draft: dict
    instruction: str

def _create_quality_assessment_text(refined: dict) -> str:
    """Create a comprehensive text summary of the refined requirement for quality scoring."""
    parts = []
    
    # Add requirement summary
    if 'requirement_summary' in refined:
        summary = refined['requirement_summary']
        parts.append(f"REQUIREMENT: {summary.get('original_requirement', '')}")
        parts.append(f"ID: {summary.get('requirement_id', '')}")
    
    # Add classification
    if 'classification' in refined:
        cls = refined['classification']
        parts.append(f"\nCLASSIFICATION:")
        parts.append(f"Type: {cls.get('requirement_type', '')}")
        parts.append(f"Priority: {cls.get('priority', '')}")
        parts.append(f"Complexity: {cls.get('complexity', '')}")
    
    # Add acceptance criteria
    if 'acceptance_criteria' in refined and refined['acceptance_criteria']:
        parts.append(f"\nACCEPTANCE CRITERIA ({len(refined['acceptance_criteria'])} criteria):")
        for idx, ac in enumerate(refined['acceptance_criteria'][:5], 1):  # Limit to first 5
            if isinstance(ac, dict):
                parts.append(f"AC{idx}: {ac.get('title', '')}")
                parts.append(f"  Given {ac.get('given', '')}")
                parts.append(f"  When {ac.get('when', '')}")
                parts.append(f"  Then {ac.get('then', '')}")
    
    # Add user stories count
    if 'user_stories' in refined and refined['user_stories']:
        parts.append(f"\nUSER STORIES: {len(refined['user_stories'])} stories defined")
        for story in refined['user_stories'][:3]:  # First 3 stories
            parts.append(f"- {story.get('title', '')}")
    
    # Add test cases count
    if 'test_cases' in refined and refined['test_cases']:
        parts.append(f"\nTEST CASES: {len(refined['test_cases'])} test cases defined")
    
    # Add edge cases
    if 'edge_cases' in refined and refined['edge_cases']:
        parts.append(f"\nEDGE CASES: {len(refined['edge_cases'])} scenarios covered")
    
    # Add dependencies and risks
    if 'dependencies_and_risks' in refined:
        dr = refined['dependencies_and_risks']
        if dr.get('dependencies'):
            parts.append(f"\nDEPENDENCIES: {len(dr['dependencies'])} dependencies identified")
        if dr.get('risks'):
            parts.append(f"RISKS: {len(dr['risks'])} risks with mitigation plans")
    
    # Add effort estimation
    if 'effort_estimation' in refined:
        effort = refined['effort_estimation']
        parts.append(f"\nESTIMATED EFFORT: {effort.get('total_estimated_effort', '')}")
    
    return "\n".join(parts)

@app.post("/refine")
def refine(req: RequirementRequest):
    try:
        refined = refine_requirement(req.user_input, req.image_base64)

        # Check if validation failed
        if not refined.get("is_valid", True):
            return {
                "is_valid": False,
                "reason": refined.get("reason", "Input does not appear to be a valid requirement.")
            }

        # Get quality scores
        try:
            before_score = get_quality_score(req.user_input)
        except Exception as e:
            print(f"Quality before score failed: {e}")
            before_score = {"score": 0, "reason": "Score calculation failed"}

        # Create a comprehensive text summary for quality scoring
        try:
            quality_text = _create_quality_assessment_text(refined)
            after_score = get_quality_score(quality_text)
        except Exception as e:
            print(f"Quality after score failed: {e}")
            after_score = {"score": 0, "reason": "Score calculation failed"}

        return {
            "is_valid": True,
            "ticket": refined,
            "quality_before": before_score,
            "quality_after": after_score,
        }

    except Exception as e:
        error_msg = str(e)
        print("REFINE ERROR:", error_msg)
        
        # Return user-friendly error message
        error_response = {
            "is_valid": False,
            "error": True,
            "reason": "Unable to process your requirement"
        }
        
        # Provide specific guidance based on error type
        if "timeout" in error_msg.lower():
            error_response["reason"] = "The AI service took too long to respond. Please try again in a moment."
        elif "400" in error_msg:
            error_response["reason"] = "There was an issue processing your request. Please check your input and try again."
        elif "401" in error_msg or "403" in error_msg:
            error_response["reason"] = "Authentication issue. Please contact support."
        elif "image" in error_msg.lower():
            error_response["reason"] = "The image could not be processed. Please try with a different image or remove it."
        else:
            error_response["reason"] = "An unexpected error occurred. Please try again or contact support if the problem persists."
        
        return error_response

    
@app.get("/")
def root():
    return {"message": "Requirement Refiner API is running"}

# @app.post("/refine-followup")
# def refine_followup_api(req: FollowupRequest):
#     return refine_followup(
#         req.original_requirement,
#         req.current_draft,
#         req.instruction
#     )

@app.post("/refine-followup")
def refine_followup_api(req: FollowupRequest):
    try:
        refined = refine_followup(
            req.original_requirement,
            req.current_draft,
            req.instruction
        )
        
        # Check if refinement failed
        if refined.get("error", False):
            return refined

        # Get quality score using comprehensive text summary
        try:
            quality_text = _create_quality_assessment_text(refined)
            after_score = get_quality_score(quality_text)
        except Exception as e:
            print(f"Quality after score failed: {e}")
            after_score = {"score": 0, "reason": "Score calculation failed"}

        return {
            "ticket": refined,
            "quality_after": after_score,
        }
    except Exception as e:
        error_msg = str(e)
        print("REFINE_FOLLOWUP ERROR:", error_msg)
        
        # Return user-friendly error message
        error_response = {
            "error": True,
            "reason": "Unable to refine the requirement"
        }
        
        if "timeout" in error_msg.lower():
            error_response["reason"] = "The refinement took too long. Please try again."
        else:
            error_response["reason"] = "There was an issue refining your requirement. Please try again or try a different refinement."
        
        return error_response

@app.post("/download-word")
def download_word(ticket: dict):
    file_stream = create_word(ticket)

    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": "attachment; filename=jira_requirement.docx"}
    )
    
@app.post("/download-pdf")
def download_pdf(ticket: dict):
    file_stream = create_pdf(ticket)

    return StreamingResponse(
        file_stream,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="jira_requirement.pdf"'
        },
    )

