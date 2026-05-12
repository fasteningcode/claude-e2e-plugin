import { describe, it, expect } from 'vitest';

import { analyzeMobileRepo } from '../analyze.js';

const reactNativeFiles = [
  { path: 'src/screens/HomeScreen.tsx' },
  { path: 'src/screens/LoginScreen.tsx' },
  { path: 'src/screens/SettingsScreen.tsx' },
  { path: 'src/navigation/AppNavigator.tsx' },
  { path: 'src/components/Button.tsx' },
  { path: 'android/app/build.gradle' },
  { path: 'e2e/LoginScreen.appium.test.ts' },
];

describe('analyzeMobileRepo', () => {
  it('detects react-native framework', () => {
    const result = analyzeMobileRepo(reactNativeFiles);
    expect(result.framework).toBe('react-native');
  });

  it('detects flutter framework', () => {
    const result = analyzeMobileRepo([
      { path: 'lib/main.dart' },
      { path: 'lib/screens/home_screen.dart' },
    ]);
    expect(result.framework).toBe('flutter');
  });

  it('identifies screen files', () => {
    const result = analyzeMobileRepo(reactNativeFiles);
    expect(result.screens).toContain('src/screens/HomeScreen.tsx');
    expect(result.screens).toContain('src/screens/SettingsScreen.tsx');
  });

  it('identifies navigation files', () => {
    const result = analyzeMobileRepo(reactNativeFiles);
    expect(result.navigation_files).toContain('src/navigation/AppNavigator.tsx');
  });

  it('finds gaps for screens without tests', () => {
    const result = analyzeMobileRepo(reactNativeFiles);
    const gapPaths = result.gaps.map((g) => g.file_path);
    expect(gapPaths).toContain('src/screens/HomeScreen.tsx');
    expect(gapPaths).toContain('src/screens/SettingsScreen.tsx');
  });

  it('does not flag screens that have test coverage', () => {
    const result = analyzeMobileRepo(reactNativeFiles);
    const gapPaths = result.gaps.map((g) => g.file_path);
    expect(gapPaths).not.toContain('src/screens/LoginScreen.tsx');
  });

  it('marks home/login/checkout screens as high priority', () => {
    const result = analyzeMobileRepo(reactNativeFiles);
    const homeGap = result.gaps.find((g) => g.screen_name.toLowerCase().includes('home'));
    expect(homeGap?.priority).toBe('high');
  });

  it('includes summary string', () => {
    const result = analyzeMobileRepo(reactNativeFiles);
    expect(result.summary).toContain('react-native');
    expect(result.summary).toContain('gap');
  });
});
