import * as React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Constants } from 'expo';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import FocusScreen from './components/FocusScreen';
import DashboardScreen from './components/DashboardScreen';

const AppNavigator = createStackNavigator({
  focusScreen: {
    screen: FocusScreen,
    navigationOptions: ({ navigation }) => ({ header: null }),
  },
  dashboardScreen: DashboardScreen,
});

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
