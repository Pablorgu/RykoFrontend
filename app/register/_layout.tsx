import { Stack } from 'expo-router';
import { UserProfileProvider } from '../context/UserProfileContext';

export default function RegisterLayout() {
  return (
    <UserProfileProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: true,
        }}
      />
    </UserProfileProvider>
  );
}