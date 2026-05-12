import { describe, it, expect } from 'vitest';

import {
  AnalyzeRepoInputSchema,
  GenerateTestsInputSchema,
  RunTestsInputSchema,
  DiagnoseFailureInputSchema,
  CreatePrInputSchema,
} from '../types.js';

describe('Tool input schemas', () => {
  describe('AnalyzeRepoInputSchema', () => {
    it('accepts valid input', () => {
      expect(() =>
        AnalyzeRepoInputSchema.parse({ repo_url: 'https://github.com/acme/app' }),
      ).not.toThrow();
    });

    it('defaults branch to main', () => {
      const result = AnalyzeRepoInputSchema.parse({ repo_url: 'https://github.com/acme/app' });
      expect(result.branch).toBe('main');
    });

    it('rejects non-URL repo_url', () => {
      expect(() => AnalyzeRepoInputSchema.parse({ repo_url: 'not-a-url' })).toThrow();
    });
  });

  describe('GenerateTestsInputSchema', () => {
    it('accepts playwright test type', () => {
      expect(() =>
        GenerateTestsInputSchema.parse({
          repo_url: 'https://github.com/acme/app',
          file_paths: ['src/login.ts'],
          test_type: 'playwright',
        }),
      ).not.toThrow();
    });

    it('accepts appium test type', () => {
      expect(() =>
        GenerateTestsInputSchema.parse({
          repo_url: 'https://github.com/acme/app',
          file_paths: ['src/HomeScreen.tsx'],
          test_type: 'appium',
        }),
      ).not.toThrow();
    });

    it('rejects empty file_paths', () => {
      expect(() =>
        GenerateTestsInputSchema.parse({
          repo_url: 'https://github.com/acme/app',
          file_paths: [],
          test_type: 'playwright',
        }),
      ).toThrow();
    });

    it('rejects unknown test_type', () => {
      expect(() =>
        GenerateTestsInputSchema.parse({
          repo_url: 'https://github.com/acme/app',
          file_paths: ['src/app.ts'],
          test_type: 'jest',
        }),
      ).toThrow();
    });
  });

  describe('RunTestsInputSchema', () => {
    it('defaults timeout to 300000ms', () => {
      const result = RunTestsInputSchema.parse({
        repo_url: 'https://github.com/acme/app',
        workflow_id: 'test.yml',
      });
      expect(result.timeout_ms).toBe(300000);
    });
  });

  describe('DiagnoseFailureInputSchema', () => {
    it('requires run_id as number', () => {
      expect(() =>
        DiagnoseFailureInputSchema.parse({
          repo_url: 'https://github.com/acme/app',
          run_id: 'not-a-number',
        }),
      ).toThrow();
    });
  });

  describe('CreatePrInputSchema', () => {
    it('requires at least one file', () => {
      expect(() =>
        CreatePrInputSchema.parse({
          repo_url: 'https://github.com/acme/app',
          branch: 'feat/tests',
          title: 'Add tests',
          files: [],
        }),
      ).toThrow();
    });

    it('accepts valid PR input', () => {
      expect(() =>
        CreatePrInputSchema.parse({
          repo_url: 'https://github.com/acme/app',
          branch: 'feat/tests',
          title: 'Add tests',
          files: [{ path: 'tests/login.spec.ts', content: 'test code' }],
        }),
      ).not.toThrow();
    });
  });
});
