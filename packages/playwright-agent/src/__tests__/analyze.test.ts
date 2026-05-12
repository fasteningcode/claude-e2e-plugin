import { describe, it, expect } from 'vitest';

import { analyzeWebRepo } from '../analyze.js';

const nextjsFiles = [
  { path: 'src/pages/index.tsx' },
  { path: 'src/pages/login.tsx' },
  { path: 'src/pages/checkout.tsx' },
  { path: 'src/components/Button.tsx' },
  { path: 'src/components/LoginForm.tsx' },
  { path: 'src/pages/api/auth.ts' },
  { path: 'src/pages/login.spec.ts' },
];

describe('analyzeWebRepo', () => {
  it('detects nextjs framework', () => {
    const result = analyzeWebRepo(nextjsFiles);
    expect(result.framework).toBe('nextjs');
  });

  it('identifies page files', () => {
    const result = analyzeWebRepo(nextjsFiles);
    expect(result.pages).toContain('src/pages/checkout.tsx');
    expect(result.pages).toContain('src/pages/index.tsx');
  });

  it('identifies component files', () => {
    const result = analyzeWebRepo(nextjsFiles);
    expect(result.components).toContain('src/components/Button.tsx');
  });

  it('identifies api routes', () => {
    const result = analyzeWebRepo(nextjsFiles);
    expect(result.api_routes).toContain('src/pages/api/auth.ts');
  });

  it('finds gaps for pages without tests', () => {
    const result = analyzeWebRepo(nextjsFiles);
    const gapPaths = result.gaps.map((g) => g.file_path);
    expect(gapPaths).toContain('src/pages/checkout.tsx');
    expect(gapPaths).toContain('src/pages/index.tsx');
  });

  it('does not flag files that have test coverage', () => {
    const result = analyzeWebRepo(nextjsFiles);
    const gapPaths = result.gaps.map((g) => g.file_path);
    expect(gapPaths).not.toContain('src/pages/login.tsx');
  });

  it('marks page gaps as high priority', () => {
    const result = analyzeWebRepo(nextjsFiles);
    const pageGap = result.gaps.find((g) => g.gap_type === 'missing_page_test');
    expect(pageGap?.priority).toBe('high');
  });

  it('marks component gaps as medium priority', () => {
    const result = analyzeWebRepo(nextjsFiles);
    const componentGap = result.gaps.find((g) => g.gap_type === 'missing_form_test');
    expect(componentGap?.priority).toBe('medium');
  });

  it('includes summary string', () => {
    const result = analyzeWebRepo(nextjsFiles);
    expect(result.summary).toContain('Framework: nextjs');
    expect(result.summary).toContain('gap');
  });

  it('returns empty gaps when all files are tested', () => {
    const fullyTestedFiles = [
      { path: 'src/pages/index.tsx' },
      { path: 'src/pages/index.spec.ts' },
    ];
    const result = analyzeWebRepo(fullyTestedFiles);
    expect(result.gaps).toHaveLength(0);
  });
});
