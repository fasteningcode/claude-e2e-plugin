export interface WebCoverageGap {
  file_path: string;
  component_name: string;
  gap_type: 'missing_page_test' | 'missing_form_test' | 'missing_navigation_test' | 'missing_api_call_test';
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggested_selectors: string[];
}

export interface PlaywrightTestFile {
  path: string;
  content: string;
  component_name: string;
  test_count: number;
}

export interface WebRepoAnalysis {
  framework: 'nextjs' | 'react' | 'vue' | 'angular' | 'unknown';
  pages: string[];
  components: string[];
  api_routes: string[];
  gaps: WebCoverageGap[];
  summary: string;
}
