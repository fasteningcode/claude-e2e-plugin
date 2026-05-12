import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { HomeScreen } from '../screens/HomeScreen.js';
import { LoginScreen } from '../screens/LoginScreen.js';
import { SettingsScreen } from '../screens/SettingsScreen.js';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
