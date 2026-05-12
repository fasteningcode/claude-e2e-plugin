function detectFramework(paths) {
    if (paths.some((p) => p.endsWith('.dart')))
        return 'flutter';
    if (paths.some((p) => p.endsWith('.swift') || p.endsWith('.m') || p.endsWith('.xib') || p.endsWith('.storyboard')))
        return 'native-ios';
    if (paths.some((p) => p.endsWith('.kt') || p.endsWith('.java')))
        return 'native-android';
    if (paths.some((p) => p.includes('android/') &&
        (p.endsWith('.tsx') || p.endsWith('.jsx') || p.endsWith('.ts') || p.endsWith('.js'))) ||
        paths.some((p) => p.endsWith('app.json') || p.includes('react-native')))
        return 'react-native';
    if (paths.some((p) => p.endsWith('.tsx') || p.endsWith('.jsx')))
        return 'react-native';
    return 'unknown';
}
function isScreenFile(path) {
    const lower = path.toLowerCase();
    return ((lower.includes('screen') || lower.includes('view') || lower.includes('page')) &&
        (path.endsWith('.tsx') || path.endsWith('.jsx') || path.endsWith('.swift') ||
            path.endsWith('.kt') || path.endsWith('.dart')) &&
        !path.includes('__tests__') &&
        !path.endsWith('.test.ts') &&
        !path.endsWith('.spec.ts'));
}
function isNavigationFile(path) {
    const lower = path.toLowerCase();
    return lower.includes('navigation') || lower.includes('navigator') || lower.includes('router');
}
function isTestFile(path) {
    return (path.includes('__tests__') ||
        path.endsWith('.test.ts') ||
        path.endsWith('.spec.ts') ||
        path.endsWith('.appium.test.ts') ||
        path.includes('e2e/'));
}
function hasTestCoverage(sourcePath, testFiles) {
    const base = sourcePath
        .replace(/\.(tsx?|jsx?|swift|kt|dart)$/, '')
        .split('/')
        .pop() ?? '';
    return [...testFiles].some((t) => t.toLowerCase().includes(base.toLowerCase()));
}
export function analyzeMobileRepo(files) {
    const paths = files.map((f) => f.path);
    const testFiles = new Set(paths.filter(isTestFile));
    const screens = paths.filter(isScreenFile);
    const navigationFiles = paths.filter(isNavigationFile);
    const framework = detectFramework(paths);
    const gaps = [];
    for (const screen of screens) {
        if (!hasTestCoverage(screen, testFiles)) {
            const name = screen.split('/').pop()?.replace(/\.(tsx?|jsx?|swift|kt|dart)$/, '') ?? 'Screen';
            const isHighPriority = name.toLowerCase().includes('home') ||
                name.toLowerCase().includes('login') ||
                name.toLowerCase().includes('checkout') ||
                name.toLowerCase().includes('onboard');
            gaps.push({
                file_path: screen,
                screen_name: name,
                gap_type: 'missing_screen_test',
                description: `Screen "${name}" has no Appium test coverage`,
                priority: isHighPriority ? 'high' : 'medium',
                platform: 'both',
            });
        }
    }
    for (const navFile of navigationFiles) {
        if (!hasTestCoverage(navFile, testFiles)) {
            const name = navFile.split('/').pop()?.replace(/\.(tsx?|jsx?|ts|js)$/, '') ?? 'Navigator';
            gaps.push({
                file_path: navFile,
                screen_name: name,
                gap_type: 'missing_navigation_test',
                description: `Navigation "${name}" has no test coverage`,
                priority: 'high',
                platform: 'both',
            });
        }
    }
    const summary = `Framework: ${framework}. ` +
        `${screens.length} screen(s), ${navigationFiles.length} navigation file(s). ` +
        `${gaps.length} coverage gap(s) found.`;
    return { framework, screens, navigation_files: navigationFiles, gaps, summary };
}
//# sourceMappingURL=analyze.js.map