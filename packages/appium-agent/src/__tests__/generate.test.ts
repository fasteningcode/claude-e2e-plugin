import { describe, it, expect } from 'vitest';

import { generateAppiumTests } from '../generate.js';
import type { MobileCoverageGap } from '../types.js';

const screenGap: MobileCoverageGap = {
  file_path: 'src/screens/HomeScreen.tsx',
  screen_name: 'HomeScreen',
  gap_type: 'missing_screen_test',
  description: 'No test for HomeScreen',
  priority: 'high',
  platform: 'both',
};

const navGap: MobileCoverageGap = {
  file_path: 'src/navigation/AppNavigator.tsx',
  screen_name: 'AppNavigator',
  gap_type: 'missing_navigation_test',
  description: 'No test for AppNavigator',
  priority: 'high',
  platform: 'both',
};

describe('generateAppiumTests', () => {
  it('generates one test file per gap', () => {
    const files = generateAppiumTests([screenGap, navGap]);
    expect(files).toHaveLength(2);
  });

  it('places tests in e2e/ directory', () => {
    const [file] = generateAppiumTests([screenGap]);
    expect(file?.path).toMatch(/^e2e\//);
    expect(file?.path).toMatch(/\.appium\.test\.ts$/);
  });

  it('generated screen test imports from webdriverio', () => {
    const [file] = generateAppiumTests([screenGap]);
    expect(file?.content).toContain("from 'webdriverio'");
  });

  it('generated test handles both iOS and Android', () => {
    const [file] = generateAppiumTests([screenGap]);
    expect(file?.content).toContain('XCUITest');
    expect(file?.content).toContain('UiAutomator2');
  });

  it('generated test uses APPIUM_HOST env var', () => {
    const [file] = generateAppiumTests([screenGap]);
    expect(file?.content).toContain('APPIUM_HOST');
  });

  it('generated navigation test includes back navigation test', () => {
    const [file] = generateAppiumTests([navGap]);
    expect(file?.content).toContain('back navigation');
  });

  it('uses screen name in test description', () => {
    const [file] = generateAppiumTests([screenGap]);
    expect(file?.content).toContain('HomeScreen Screen');
  });

  it('cleans up driver session in after hook', () => {
    const [file] = generateAppiumTests([screenGap]);
    expect(file?.content).toContain('deleteSession');
  });
});
