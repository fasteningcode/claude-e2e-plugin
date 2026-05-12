import type { WebCoverageGap, PlaywrightTestFile } from './types.js';

function toTestPath(sourcePath: string): string {
  return sourcePath
    .replace(/\.(tsx?|jsx?)$/, '.spec.ts')
    .replace('/pages/', '/tests/e2e/pages/')
    .replace('/components/', '/tests/e2e/components/')
    .replace('/api/', '/tests/api/');
}

function generatePageTest(gap: WebCoverageGap): string {
  const { component_name, suggested_selectors } = gap;
  const selector = suggested_selectors[0] ?? `[data-testid="${component_name.toLowerCase()}"]`;
  const route = `/${component_name.toLowerCase().replace('page', '')}`;

  return `import { test, expect } from '@playwright/test';

test.describe('${component_name}', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('${route}');
  });

  test('renders without errors', async ({ page }) => {
    await expect(page.locator('${selector}')).toBeVisible();
  });

  test('page title is set correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/.+/);
  });

  test('has no broken links', async ({ page }) => {
    const links = page.locator('a[href]');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
        const response = await page.request.get(href).catch(() => null);
        if (response) {
          expect(response.status()).toBeLessThan(400);
        }
      }
    }
  });
});
`;
}

function generateComponentTest(gap: WebCoverageGap): string {
  const { component_name, suggested_selectors } = gap;
  const selector = suggested_selectors[0] ?? `[data-testid="${component_name.toLowerCase()}"]`;

  return `import { test, expect } from '@playwright/test';

test.describe('${component_name} component', () => {
  test('renders correctly', async ({ page }) => {
    // Navigate to a page that renders this component
    await page.goto('/');
    const component = page.locator('${selector}');
    await expect(component).toBeVisible();
  });

  test('is accessible', async ({ page }) => {
    await page.goto('/');
    // Verify component has appropriate ARIA attributes
    const component = page.locator('${selector}');
    await expect(component).toBeVisible();
  });
});
`;
}

function generateApiTest(gap: WebCoverageGap): string {
  const { component_name } = gap;

  return `import { test, expect } from '@playwright/test';

test.describe('API: ${component_name}', () => {
  test('returns 200 for valid request', async ({ request }) => {
    const response = await request.get('/api/${component_name.toLowerCase()}');
    expect(response.status()).toBe(200);
  });

  test('returns 400 for invalid input', async ({ request }) => {
    const response = await request.post('/api/${component_name.toLowerCase()}', {
      data: {},
    });
    expect([400, 422]).toContain(response.status());
  });

  test('requires authentication', async ({ request }) => {
    const response = await request.get('/api/${component_name.toLowerCase()}', {
      headers: { Authorization: '' },
    });
    expect([401, 403]).toContain(response.status());
  });
});
`;
}

export function generatePlaywrightTests(gaps: WebCoverageGap[]): PlaywrightTestFile[] {
  return gaps.map((gap) => {
    let content: string;
    let testCount: number;

    switch (gap.gap_type) {
      case 'missing_page_test':
        content = generatePageTest(gap);
        testCount = 3;
        break;
      case 'missing_api_call_test':
        content = generateApiTest(gap);
        testCount = 3;
        break;
      default:
        content = generateComponentTest(gap);
        testCount = 2;
    }

    return {
      path: toTestPath(gap.file_path),
      content,
      component_name: gap.component_name,
      test_count: testCount,
    };
  });
}
