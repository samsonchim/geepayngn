import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PasscodeScreen from './PasscodeScreen';
import MainApp from './MainApp'; 
import Transfer from './Transfer';
import Amount from './Amount';
import Success from './Success';
import Request from './Request';

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
         <Stack.Screen
          name="Transfer"
          component={Transfer}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Amount"
          component={Amount}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Success"
          component={Success}
          options={{ headerShown: false }}
        />
          <Stack.Screen
            name="Request"
            component={Request}
            options={{ headerShown: false }}
          />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
