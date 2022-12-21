import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from './src/screens/RegisterScreen/RegisterScreen';
import LogInScreen from './src/screens/LogInScreen/LogInScreen';
import HomeScreen from './src/screens/HomeScreen/HomeScreen';
import AccountDetailsScreen from './src/screens/AccountDetailsScreen/AccountDetailsScreen';
import BusPassScreen from './src/screens/BusPassScreen/BusPassScreen';
import TicketScreen from './src/screens/TicketScreen/TicketScreen';
import LinesScreen from './src/screens/LinesScreen/LinesScreen';
import NavigationBar from './src/components/NavigationBar/NavigationBar';
import { Provider } from "react-redux";
import { store } from './store';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar style={styles.statusBar}></StatusBar>
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen name="LogInScreen" component={LogInScreen} />
          <Stack.Screen name="AccountDetailsScreen" component={AccountDetailsScreen} />
          <Stack.Screen name="BusPassScreen" component={BusPassScreen} />
          <Stack.Screen name="TicketScreen" component={TicketScreen} />
          <Stack.Screen name="LinesScreen" component={LinesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({});
