import type { WebCoverageGap, WebRepoAnalysis } from './types.js';

export interface FileEntry {
  path: string;
}

function detectFramework(paths: string[]): WebRepoAnalysis['framework'] {
  if (paths.some((p) => p.includes('pages/') || p.includes('app/') && p.endsWith('page.tsx'))) {
    return 'nextjs';
  }
  if (paths.some((p) => p.includes('src/') && p.endsWith('.tsx'))) {
    return 'react';
  }
  if (paths.some((p) => p.endsWith('.vue'))) {
    return 'vue';
  }
  if (paths.some((p) => p.endsWith('.component.ts'))) {
    return 'angular';
  }
  return 'unknown';
}

function isPageFile(path: string): boolean {
  return (
    (path.includes('/pages/') || path.includes('/app/')) &&
    (path.endsWith('.tsx') || path.endsWith('.jsx')) &&
    !path.includes('_') &&
    !path.includes('layout') &&
    !path.includes('error') &&
    !path.endsWith('.test.tsx') &&
    !path.endsWith('.spec.tsx')
  );
}

function isComponentFile(path: string): boolean {
  return (
    path.includes('/components/') &&
    (path.endsWith('.tsx') || path.endsWith('.jsx')) &&
    !path.endsWith('.test.tsx') &&
    !path.endsWith('.spec.tsx')
  );
}

function isApiRoute(path: string): boolean {
  return (
    (path.includes('/api/') || path.includes('/routes/')) &&
    (path.endsWith('.ts') || path.endsWith('.js')) &&
    !path.endsWith('.test.ts') &&
    !path.endsWith('.spec.ts')
  );
}

function isTestFile(path: string): boolean {
  return (
    path.endsWith('.test.ts') ||
    path.endsWith('.spec.ts') ||
    path.endsWith('.test.tsx') ||
    path.endsWith('.spec.tsx')
  );
}

function hasTestCoverage(sourcePath: string, testFiles: Set<string>): boolean {
  const base = sourcePath
    .replace(/\.(tsx?|jsx?)$/, '')
    .split('/')
    .pop() ?? '';
  return [...testFiles].some((t) => t.includes(base));
}

export function analyzeWebRepo(files: FileEntry[]): WebRepoAnalysis {
  const paths = files.map((f) => f.path);
  const testFiles = new Set(paths.filter(isTestFile));

  const pages = paths.filter(isPageFile);
  const components = paths.filter(isComponentFile);
  const apiRoutes = paths.filter(isApiRoute);
  const framework = detectFramework(paths);

  const gaps: WebCoverageGap[] = [];

  for (const page of pages) {
    if (!hasTestCoverage(page, testFiles)) {
      const name = page.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') ?? 'Page';
      gaps.push({
        file_path: page,
        component_name: name,
        gap_type: 'missing_page_test',
        description: `Page "${name}" has no E2E test coverage`,
        priority: 'high',
        suggested_selectors: [`data-testid="${name.toLowerCase()}-page"`],
      });
    }
  }

  for (const component of components) {
    if (!hasTestCoverage(component, testFiles)) {
      const name = component.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') ?? 'Component';
      gaps.push({
        file_path: component,
        component_name: name,
        gap_type: 'missing_form_test',
        description: `Component "${name}" has no test coverage`,
        priority: 'medium',
        suggested_selectors: [`data-testid="${name.toLowerCase()}"`],
      });
    }
  }

  for (const route of apiRoutes) {
    if (!hasTestCoverage(route, testFiles)) {
      const name = route.split('/').pop()?.replace(/\.(ts|js)$/, '') ?? 'route';
      gaps.push({
        file_path: route,
        component_name: name,
        gap_type: 'missing_api_call_test',
        description: `API route "${name}" has no test coverage`,
        priority: 'high',
        suggested_selectors: [],
      });
    }
  }

  const summary =
    `Framework: ${framework}. ` +
    `${pages.length} page(s), ${components.length} component(s), ${apiRoutes.length} API route(s). ` +
    `${gaps.length} coverage gap(s) found.`;

  return { framework, pages, components, api_routes: apiRoutes, gaps, summary };
}
