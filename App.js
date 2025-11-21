import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './screens/Home';
import Explore from './screens/Explore';
import Profile from './screens/Profile';
import SongRecommendation from './screens/SongRecommendation';
import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={Home} />
      <Stack.Screen name="SongRecommendation" component={SongRecommendation} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Navigator>
  );
}

function AuthenticatedNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1DB954',
        tabBarInactiveTintColor: '#b3b3b3',
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#181818',
          borderTopColor: '#282828',
          borderTopWidth: 1,
          height: 75,
          paddingBottom: 0,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 8,
          lineHeight: 14,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

function AuthenticatedApp() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AuthenticatedNavigator />
    </NavigationContainer>
  );
}

function UnauthenticatedApp() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AuthStack />
    </NavigationContainer>
  );
}

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
});

