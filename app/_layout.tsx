import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from './(store)/authStore';
import { ActivityIndicator, View } from 'react-native';
import "../global.css";
import { getToken } from './services/_storage';
import api from './api/client';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const { user, token, isLoading, isInitialized, initializeAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
    })();
  }, []);

  // Initialize authentication when loading the app
  useEffect(() => {
    initializeAuth();
  }, []);

  // Guard de autenticación
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)' || segments[0] === 'login' || segments[0] === 'register';
    const inAppGroup = segments[0] === '(app)' || segments[0] === '(tabs)' || segments[0] === 'home';

    if (!token && !inAuthGroup) {
      router.replace('/login');
      //AUTH GROUP ELSE IF
    } else if (token && user && inAuthGroup) {
      // Verify if user is complete
      const hasCompleteProfile = user.birthdate && user.weight && user.height && user.calorieGoal;
      
      if (hasCompleteProfile) {
        router.replace('/home');
      } else {
        // Registerd user but missing profile data
        const hasPersonalData = user.birthdate && user.gender;
        
        if (!hasPersonalData) {
          // Missing personal data - go to step 2
          router.replace('/register/personal');
        } else {
          // Has personal data but missing goals - go to step 3
          router.replace('/register/goals');
        }
      }
      //APP GROUP ELSE IF
    } else if (token && user && inAppGroup) {
      // Authenticated user trying to access the app
      const hasCompleteProfile = user.birthdate && user.weight && user.height && user.calorieGoal;
      
      if (!hasCompleteProfile) {
        // Missing profile data - redirect to the corresponding registration step
        const hasPersonalData = user.birthdate && user.gender;
        
        if (!hasPersonalData) {
          router.replace('/register/personal');
        } else {
          router.replace('/register/goals');
        }
      }
    }
  }, [token, user, isInitialized, segments]);

  if (!isInitialized || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: true,
      }}
    />
  );
}
