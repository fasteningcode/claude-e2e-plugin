import { describe, it, expect } from 'vitest';

import { generatePlaywrightTests } from '../generate.js';
import type { WebCoverageGap } from '../types.js';

const pageGap: WebCoverageGap = {
  file_path: 'src/pages/checkout.tsx',
  component_name: 'Checkout',
  gap_type: 'missing_page_test',
  description: 'No test for checkout page',
  priority: 'high',
  suggested_selectors: ['[data-testid="checkout-page"]'],
};

const componentGap: WebCoverageGap = {
  file_path: 'src/components/Button.tsx',
  component_name: 'Button',
  gap_type: 'missing_form_test',
  description: 'No test for Button component',
  priority: 'medium',
  suggested_selectors: ['[data-testid="button"]'],
};

const apiGap: WebCoverageGap = {
  file_path: 'src/pages/api/auth.ts',
  component_name: 'auth',
  gap_type: 'missing_api_call_test',
  description: 'No test for auth API route',
  priority: 'high',
  suggested_selectors: [],
};

describe('generatePlaywrightTests', () => {
  it('generates one test file per gap', () => {
    const files = generatePlaywrightTests([pageGap, componentGap]);
    expect(files).toHaveLength(2);
  });

  it('places page tests in tests/e2e/pages/', () => {
    const [file] = generatePlaywrightTests([pageGap]);
    expect(file?.path).toContain('tests/e2e/pages/');
    expect(file?.path).toMatch(/\.spec\.ts$/);
  });

  it('places api tests in tests/api/', () => {
    const [file] = generatePlaywrightTests([apiGap]);
    expect(file?.path).toContain('tests/api/');
  });

  it('generated page test imports from @playwright/test', () => {
    const [file] = generatePlaywrightTests([pageGap]);
    expect(file?.content).toContain("from '@playwright/test'");
  });

  it('generated page test uses the suggested selector', () => {
    const [file] = generatePlaywrightTests([pageGap]);
    expect(file?.content).toContain('[data-testid="checkout-page"]');
  });

  it('generated api test includes status code assertions', () => {
    const [file] = generatePlaywrightTests([apiGap]);
    expect(file?.content).toContain('200');
    expect(file?.content).toContain('400');
  });

  it('includes component name in test description', () => {
    const [file] = generatePlaywrightTests([pageGap]);
    expect(file?.content).toContain('Checkout');
  });

  it('returns correct test_count for pages', () => {
    const [file] = generatePlaywrightTests([pageGap]);
    expect(file?.test_count).toBe(3);
  });
});
