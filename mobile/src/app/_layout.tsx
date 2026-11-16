import { Baloo2_400Regular, Baloo2_700Bold, useFonts } from '@expo-google-fonts/baloo-2';
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Baloo2_700Bold,
    Baloo2_400Regular
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#F2F58C' }} />;
  }

  return (
    <Stack screenOptions={{ headerShown:false }}>
      <Stack.Screen name="index" options={{ title: 'Curiosity Corner' }} />
      <Stack.Screen name="login" options={{ title: 'Prijava' }} />
      <Stack.Screen name="signup" options={{ title: 'Registracija' }} />
    </Stack>
  );
}
