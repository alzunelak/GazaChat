import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import UsernameScreen from './UsernameScreen';
import QRCodeScreen from './QRCodeScreen';
import ScanScreen from './ScanScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="UsernameScreen">
        <Stack.Screen
          name="UsernameScreen"
          component={UsernameScreen}
          options={{ title: 'Set Username' }}
        />
        <Stack.Screen
          name="QRCodeScreen"
          component={QRCodeScreen}
          options={{ title: 'Your QR Code' }}
        />
        <Stack.Screen
          name="ScanScreen"
          component={ScanScreen}
          options={{ title: 'Scan Friend\'s QR' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
