import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export function SettingsScreen(): React.JSX.Element {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <View style={styles.container} accessibilityLabel="settings-screen">
      <Text style={styles.title}>Settings</Text>
      <View style={styles.row}>
        <Text>Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          accessibilityLabel="notifications-toggle"
        />
      </View>
      <View style={styles.row}>
        <Text>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          accessibilityLabel="dark-mode-toggle"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
});
