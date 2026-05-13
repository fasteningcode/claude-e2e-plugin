# Example: Generate Appium tests for a React Native app

This walkthrough shows ClaudeTest generating mobile tests for a React Native app.

## 1. Analyze for untested screens

```
Analyze https://github.com/your-org/your-rn-app for missing test coverage
```

**ClaudeTest returns:**
```json
[
  { "priority": "high",   "path": "src/screens/OnboardingScreen.tsx", "reason": "No tests for onboarding flow" },
  { "priority": "high",   "path": "src/screens/PaymentScreen.tsx",    "reason": "No tests for payment flow" },
  { "priority": "medium", "path": "src/screens/ProfileScreen.tsx",    "reason": "No tests for profile editing" }
]
```

## 2. Generate Appium tests

```
Generate Appium tests for the high-priority gaps you found
```

**ClaudeTest creates:**
- `tests/onboarding.test.ts` — covers both iOS and Android
- `tests/payment.test.ts` — covers card entry and confirmation

**Example generated test:**
```typescript
import { remote } from 'webdriverio';

describe('Onboarding flow', () => {
  it('should complete onboarding on iOS', async () => {
    const driver = await remote({
      capabilities: {
        platformName: 'iOS',
        'appium:deviceName': 'iPhone 15',
        'appium:app': process.env.APP_PATH,
      },
    });

    const welcomeText = await driver.$('~welcome-heading');
    await expect(welcomeText).toHaveText('Welcome to the app');

    const nextBtn = await driver.$('~next-button');
    await nextBtn.click();

    // ... continues through onboarding steps
    await driver.deleteSession();
  });
});
```

## 3. Run the tests in CI

```
Run the workflow test-mobile.yml on the feat/claudetest-coverage branch
```

ClaudeTest triggers the workflow and waits for results, then reports pass/fail.

## Environment variables for mobile tests

Set these before running Appium tests locally:

```bash
export PLATFORM=iOS           # or Android
export APP_PATH=/path/to/app.app
export IOS_DEVICE="iPhone 15"
export IOS_VERSION="17.0"
export APPIUM_HOST=localhost
export APPIUM_PORT=4723
```
