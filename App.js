import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';

import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import FiltersScreen from './src/screens/FiltersScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import AnnouncementDetailScreen from './src/screens/AnnouncementDetailScreen';
import MyAnnouncementsScreen from './src/screens/MyAnnouncementsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { auth } from './src/services/firebaseConfig';
import styles, { colors } from './src/styles';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(Boolean(auth));

  useEffect(() => {
    if (!auth) {
      setCheckingSession(false);
      return undefined;
    }

    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingSession(false);
    });
  }, []);

  if (checkingSession) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="Filters"
              component={FiltersScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="MyAnnouncements" component={MyAnnouncementsScreen} />
            <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
