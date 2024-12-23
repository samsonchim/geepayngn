import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PasscodeScreen from './PasscodeScreen';
import MainApp from './MainApp'; // Ensure this is your original MainApp component

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Passcode">
        <Stack.Screen
          name="Passcode"
          component={PasscodeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainApp"
          component={MainApp}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
