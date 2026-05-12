import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityLabel="home-screen">
      <Text style={styles.title}>ClaudeTest Demo</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Settings')}
        accessibilityLabel="go-to-settings"
      >
        <Text>Go to Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: { padding: 12, backgroundColor: '#007AFF', borderRadius: 8 },
});
