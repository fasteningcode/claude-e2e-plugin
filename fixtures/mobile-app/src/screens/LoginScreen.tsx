import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export function LoginScreen(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container} accessibilityLabel="login-screen">
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        accessibilityLabel="email-input"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        accessibilityLabel="password-input"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} accessibilityLabel="login-button">
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
});
