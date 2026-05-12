import type { GitHubClient } from '../github/client.js';
import type { GenerateTestsInput, TestFile } from '../types.js';

export async function handleGenerateTests(
  input: GenerateTestsInput,
  client: GitHubClient,
): Promise<{ test_files: TestFile[]; summary: string }> {
  const branch = input.branch ?? 'main';
  const testFiles: TestFile[] = [];

  for (const filePath of input.file_paths) {
    const fileContent = await client.getFileContent(input.repo_url, filePath, branch);

    const testPath =
      input.test_type === 'playwright'
        ? filePath.replace(/\.(ts|tsx|js|jsx)$/, '.spec.ts')
        : filePath.replace(/\.(ts|tsx|js|jsx)$/, '.appium.test.ts');

    const testContent =
      input.test_type === 'playwright'
        ? generatePlaywrightTest(filePath, fileContent.content)
        : generateAppiumTest(filePath, fileContent.content);

    testFiles.push({ path: testPath, content: testContent, test_type: input.test_type });
  }

  return {
    test_files: testFiles,
    summary: `Generated ${testFiles.length} ${input.test_type} test file(s).`,
  };
}

function generatePlaywrightTest(sourcePath: string, _sourceContent: string): string {
  const componentName = sourcePath.split('/').pop()?.replace(/\.(ts|tsx|js|jsx)$/, '') ?? 'Page';

  return `import { test, expect } from '@playwright/test';

test.describe('${componentName}', () => {
  test('should load without errors', async ({ page }) => {
    await page.goto('/');
    await expect(page).not.toHaveURL('/error');
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/');
    // TODO: Add specific accessibility checks for ${componentName}
  });
});
`;
}

function generateAppiumTest(sourcePath: string, _sourceContent: string): string {
  const screenName = sourcePath.split('/').pop()?.replace(/\.(ts|tsx|js|jsx)$/, '') ?? 'Screen';

  return `import { remote } from 'webdriverio';

describe('${screenName}', () => {
  let driver: WebdriverIO.Browser;

  before(async () => {
    driver = await remote({
      capabilities: {
        platformName: process.env.PLATFORM ?? 'Android',
        'appium:automationName': process.env.PLATFORM === 'iOS' ? 'XCUITest' : 'UiAutomator2',
        'appium:app': process.env.APP_PATH ?? '',
      },
    });
  });

  after(async () => {
    await driver.deleteSession();
  });

  it('should display ${screenName} correctly', async () => {
    // TODO: Add specific element assertions for ${screenName}
    const isDisplayed = await driver.$('~app-root').isDisplayed();
    expect(isDisplayed).toBe(true);
  });
});
`;
}
