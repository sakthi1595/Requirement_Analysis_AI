import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequirementAnalysisReport } from './requirement-analysis.model';

@Component({
  selector: 'app-requirement-ai',
  templateUrl: './requirement-ai.component.html',
  styleUrls: ['./requirement-ai.component.scss']
})
export class RequirementAiComponent {

  userInput = '';
  instruction = '';
  loading = false;

  analysis: RequirementAnalysisReport | null = null;

  // ⭐ quality scores
  qualityBefore: number | null = null;
  qualityAfter: number | null = null;

  // ⭐ image support
  selectedImageBase64: string | null = null;
  selectedImagePreview: string | null = null;

  // ⭐ validation modal
  showModal = false;
  modalMessage = '';

  // ⭐ error modal
  showErrorModal = false;
  errorMessage = '';

  // ⭐ section visibility control
  expandedSections: { [key: string]: boolean } = {
    classification: true,
    detailedAnalysis: false,
    edgeCases: false,
    clarificationQuestions: false,
    acceptanceCriteria: true,
    implementationOptions: false,
    userStories: true,
    testCases: false,
    dependencies: false,
    effort: true
  };

  constructor(private http: HttpClient) {}

  // =============================  // 🖼️ IMAGE UPLOAD
  // =============================
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.selectedImageBase64 = result.split(',')[1]; // Remove data:image/... prefix
      this.selectedImagePreview = result; // Keep full data URL for preview
    };
    reader.readAsDataURL(file);
  }

  // Remove image
  clearImage() {
    this.selectedImageBase64 = null;
    this.selectedImagePreview = null;
  }

  // =============================
  // 🔔 TOGGLE SECTION
  // =============================
  toggleSection(section: string) {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  // =============================  //  GENERATE
  // =============================
  generate() {
    if (!this.userInput.trim()) return;

    this.loading = true;

    this.http.post<any>('http://127.0.0.1:8000/refine', {
      user_input: this.userInput,
      image_base64: this.selectedImageBase64
    }).subscribe({
      next: (res) => {
        // Check if there's an error
        if (res.error === true) {
          this.showError(res.reason || 'An error occurred while processing your request.');
          this.loading = false;
          return;
        }

        // Check if validation failed
        if (res.is_valid === false) {
          this.modalMessage = res.reason || 'The input does not appear to be a valid requirement. Please provide a feature request, bug report, or technical specification.';
          this.showModal = true;
          this.loading = false;
          return;
        }

        this.analysis = res.ticket as RequirementAnalysisReport;
        this.qualityBefore = res.quality_before?.score ?? null;
        this.qualityAfter = res.quality_after?.score ?? null;
        this.loading = false;
      },
      error: (err) => {
        let errorMsg = 'Unable to connect to the service. Please check your connection and try again.';
        if (err.status === 500) {
          errorMsg = 'Server error occurred. Please try again in a moment.';
        } else if (err.status === 400) {
          errorMsg = 'Invalid request. Please check your input and try again.';
        } else if (err.status === 0) {
          errorMsg = 'Unable to reach the server. Please check your connection and try again.';
        }
        this.showError(errorMsg);
        this.loading = false;
      },
    });
  }

  // =============================
  // 🔔 CLOSE MODAL
  // =============================
  closeModal() {
    this.showModal = false;
    this.modalMessage = '';
  }

  // =============================
  // ❌ CLOSE ERROR MODAL
  // =============================
  closeErrorModal() {
    this.showErrorModal = false;
    this.errorMessage = '';
  }

  // Show error to user
  private showError(message: string) {
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  // =============================
  // ✨ QUICK REFINE
  // =============================
  applyQuickRefine(text: string) {
    this.instruction = text;
    // Note: Quick refine feature is currently disabled for comprehensive analysis
    // this.refineFurther();
  }

  // =============================
  // 🔄 REFINE
  // =============================
  refineFurther() {
    if (!this.instruction.trim()) return;

    this.loading = true;

    this.http.post<any>('http://127.0.0.1:8000/refine-followup', {
      original_requirement: this.userInput,
      current_draft: this.analysis,
      instruction: this.instruction,
    }).subscribe({
      next: (res) => {
        // Check if there's an error
        if (res.error === true) {
          this.showError(res.reason || 'An error occurred while refining your requirement.');
          this.loading = false;
          return;
        }

        this.analysis = res.ticket as RequirementAnalysisReport;
        this.qualityAfter = res.quality_after?.score ?? null;
        this.instruction = '';
        this.loading = false;
      },
      error: (err) => {
        let errorMsg = 'Unable to refine the requirement. Please try again.';
        if (err.status === 500) {
          errorMsg = 'Server error occurred during refinement. Please try again.';
        } else if (err.status === 0) {
          errorMsg = 'Connection lost. Please check your connection and try again.';
        }
        this.showError(errorMsg);
        this.loading = false;
      },
    });
  }

  // =============================
  // ⬇️ WORD
  // =============================
  downloadWord() {
    if (!this.analysis) return;

    this.http.post(
      'http://127.0.0.1:8000/download-word',
      this.analysis,
      { responseType: 'blob' }
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'requirement_analysis_report.docx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Download failed', err)
    });
  }

  // =============================
  // ⬇️ PDF
  // =============================
  downloadPdf() {
    if (!this.analysis) return;

    this.http.post(
      'http://127.0.0.1:8000/download-pdf',
      this.analysis,
      { responseType: 'blob' }
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'requirement_analysis_report.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('PDF download failed', err)
    });
  }
}