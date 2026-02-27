// Comprehensive interfaces for Requirements Analysis Report

export interface RequirementSummary {
  original_requirement: string;
  requirement_id: string;
  analyst: string;
  date: string;
}

export interface Classification {
  requirement_type: string;
  target_system: string;
  domain: string;
  stakeholder: string;
  primary_category: string;
  sub_category: string;
  impact_scope: string;
}

export interface SoftwareRequirements {
  ui_ux_related: string[];
  hmi_related: string[];
  backend_logic: string[];
}

export interface DetailedAnalysis {
  hardware_requirements: string[];
  software_requirements: SoftwareRequirements;
  performance_requirements: string[];
  cross_functional_requirements: string[];
}

export interface EdgeCase {
  scenario: string;
  trigger: string;
  current_behavior: string;
  expected_behavior: string;
  risk_level: string;
  mitigation_strategy: string;
}

export interface ClarificationQuestions {
  functional: string[];
  technical: string[];
  constraints: string[];
  scope: string[];
}

export interface AcceptanceCriterion {
  title: string;
  given: string;
  when: string;
  then: string;
  and: string[];
  verification_method: string;
  test_data_required: string;
}

export interface ImplementationOption {
  option_name: string;
  description: string;
  pros: string[];
  cons: string[];
  effort_estimate: string;
  risk_level: string;
  dependencies: string[];
}

export interface UserStory {
  story_id: string;
  title: string;
  as_a: string;
  i_want: string;
  so_that: string;
  story_type: string;
  priority: string;
  estimated_effort: string;
  dependencies: string[];
  technical_notes: string[];
  acceptance_criteria: string[];
  definition_of_done: string[];
}

export interface Epic {
  name: string;
  description: string;
  business_value: string;
  stories: string[];
}

export interface TestCase {
  test_id: string;
  title: string;
  story_reference: string;
  test_type: string;
  priority: string;
  automated: string;
  preconditions: string[];
  test_steps: string[];
  test_data: string;
  expected_result: string;
  pass_fail_criteria: string;
}

export interface TestStory {
  test_story_id: string;
  title: string;
  as_a: string;
  i_want: string;
  so_that: string;
  test_scope: string[];
  test_approach: string[];
  entry_criteria: string[];
  exit_criteria: string[];
  associated_test_cases: string[];
}

export interface TestCoverageSummary {
  total_test_cases: number;
  unit_tests: number;
  integration_tests: number;
  system_tests: number;
  uat_tests: number;
  automated: number;
  manual: number;
  edge_cases_covered: string[];
}

export interface Risk {
  risk: string;
  mitigation: string;
}

export interface DependenciesAndRisks {
  dependencies: string[];
  risks: Risk[];
}

export interface EffortBreakdown {
  development: string;
  testing: string;
  documentation: string;
}

export interface EffortEstimation {
  total_estimated_effort: string;
  breakdown: EffortBreakdown;
  suggested_sprint_allocation: string;
}

export interface RequirementAnalysisReport {
  requirement_summary: RequirementSummary;
  classification: Classification;
  detailed_analysis: DetailedAnalysis;
  edge_cases: EdgeCase[];
  clarification_questions: ClarificationQuestions;
  acceptance_criteria: AcceptanceCriterion[];
  implementation_options: ImplementationOption[];
  recommendation: string;
  user_stories: UserStory[];
  epic: Epic;
  test_cases: TestCase[];
  test_stories: TestStory[];
  test_coverage_summary: TestCoverageSummary;
  dependencies_and_risks: DependenciesAndRisks;
  effort_estimation: EffortEstimation;
  next_steps: string[];
}
