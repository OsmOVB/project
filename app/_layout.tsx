// //app/_layout.tsx
// import { useEffect } from 'react';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useAuth } from '../hooks/useAuth';
// import { router, useSegments } from 'expo-router';
// import React from 'react';
// import { ThemeProvider } from '../context/ThemeContext';

// export default function RootLayout() {
//   const { user } = useAuth();
//   const segments = useSegments();

//   useEffect(() => {
//     const inAuthGroup = segments[0] === '(auth)';

//     if (user && inAuthGroup) {
//       router.replace('/(tabs)');
//     } else if (!user && !inAuthGroup) {
//       router.replace('/(auth)/login');
//     }
//   }, [user, segments]);

//   return (
//     <ThemeProvider>
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="(auth)" options={{ headerShown: false }} />
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// }

import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import React from 'react';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [user, segments]);

  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <Slot />
    </ThemeProvider>
  );
}
