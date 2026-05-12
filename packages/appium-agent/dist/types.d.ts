export interface MobileCoverageGap {
    file_path: string;
    screen_name: string;
    gap_type: 'missing_screen_test' | 'missing_interaction_test' | 'missing_navigation_test';
    description: string;
    priority: 'high' | 'medium' | 'low';
    platform: 'ios' | 'android' | 'both';
}
export interface AppiumTestFile {
    path: string;
    content: string;
    screen_name: string;
    platform: 'ios' | 'android' | 'both';
    test_count: number;
}
export interface MobileRepoAnalysis {
    framework: 'react-native' | 'flutter' | 'native-ios' | 'native-android' | 'unknown';
    screens: string[];
    navigation_files: string[];
    gaps: MobileCoverageGap[];
    summary: string;
}
//# sourceMappingURL=types.d.ts.map