import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import App from './App'; 
import Main from './Main'; 

const Stack = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="App" component={App} />
      <Stack.Screen name="Main" component={Main} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
