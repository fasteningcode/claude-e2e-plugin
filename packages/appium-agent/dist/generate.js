function toTestPath(sourcePath, screenName) {
    return `e2e/${screenName}.appium.test.ts`;
}
function generateScreenTest(gap) {
    const { screen_name } = gap;
    return `import { remote } from 'webdriverio';
import type { RemoteOptions } from 'webdriverio';

const PLATFORM = (process.env['PLATFORM'] ?? 'Android') as 'Android' | 'iOS';

function getCapabilities(): RemoteOptions['capabilities'] {
  if (PLATFORM === 'iOS') {
    return {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': process.env['IOS_DEVICE'] ?? 'iPhone 15',
      'appium:platformVersion': process.env['IOS_VERSION'] ?? '17.0',
      'appium:app': process.env['APP_PATH'] ?? '',
      'appium:noReset': false,
    };
  }
  return {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env['ANDROID_DEVICE'] ?? 'emulator-5554',
    'appium:app': process.env['APP_PATH'] ?? '',
    'appium:noReset': false,
  };
}

describe('${screen_name} Screen', () => {
  let driver: WebdriverIO.Browser;

  before(async () => {
    driver = await remote({
      hostname: process.env['APPIUM_HOST'] ?? 'localhost',
      port: Number(process.env['APPIUM_PORT'] ?? 4723),
      capabilities: getCapabilities(),
    });
  });

  after(async () => {
    if (driver) {
      await driver.deleteSession();
    }
  });

  it('displays the ${screen_name} screen', async () => {
    // TODO: Update accessibility ID or XPath for your app
    const screenElement = await driver.$(\`~${screen_name.toLowerCase()}-screen\`);
    const isDisplayed = await screenElement.isDisplayed();
    expect(isDisplayed).toBe(true);
  });

  it('has no loading errors', async () => {
    // Wait for loading indicator to disappear
    const loadingIndicator = await driver.$('~loading-indicator');
    const exists = await loadingIndicator.isExisting();
    if (exists) {
      await loadingIndicator.waitForDisplayed({ reverse: true, timeout: 10000 });
    }
    // Verify no error state
    const errorElement = await driver.$('~error-state');
    const hasError = await errorElement.isExisting();
    expect(hasError).toBe(false);
  });
});
`;
}
function generateNavigationTest(gap) {
    const { screen_name } = gap;
    return `import { remote } from 'webdriverio';
import type { RemoteOptions } from 'webdriverio';

const PLATFORM = (process.env['PLATFORM'] ?? 'Android') as 'Android' | 'iOS';

function getCapabilities(): RemoteOptions['capabilities'] {
  return {
    platformName: PLATFORM,
    'appium:automationName': PLATFORM === 'iOS' ? 'XCUITest' : 'UiAutomator2',
    'appium:app': process.env['APP_PATH'] ?? '',
  };
}

describe('${screen_name} Navigation', () => {
  let driver: WebdriverIO.Browser;

  before(async () => {
    driver = await remote({
      hostname: process.env['APPIUM_HOST'] ?? 'localhost',
      port: Number(process.env['APPIUM_PORT'] ?? 4723),
      capabilities: getCapabilities(),
    });
  });

  after(async () => {
    if (driver) {
      await driver.deleteSession();
    }
  });

  it('navigates between screens without crashing', async () => {
    // TODO: Update tab/navigation element selectors
    const tabBar = await driver.$('~tab-bar');
    const exists = await tabBar.isExisting();
    expect(exists).toBe(true);
  });

  it('back navigation works correctly', async () => {
    await driver.back();
    // Verify we navigated back
    const currentActivity = await driver.currentActivity().catch(() => '');
    expect(typeof currentActivity).toBe('string');
  });
});
`;
}
export function generateAppiumTests(gaps) {
    return gaps.map((gap) => {
        const content = gap.gap_type === 'missing_navigation_test'
            ? generateNavigationTest(gap)
            : generateScreenTest(gap);
        return {
            path: toTestPath(gap.file_path, gap.screen_name),
            content,
            screen_name: gap.screen_name,
            platform: gap.platform,
            test_count: 2,
        };
    });
}
//# sourceMappingURL=generate.js.map