import { registerRootComponent } from 'expo';

import AppNavigator from './AppNavigator'; // Import your navigation logic

// registerRootComponent calls AppRegistry.registerComponent('main', () => AppNavigator);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(AppNavigator);
