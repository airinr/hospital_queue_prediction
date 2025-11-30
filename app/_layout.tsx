// app/_layout.tsx
import { Redirect, Stack } from "expo-router";
import React, { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";

import { useFonts } from "expo-font";
import {
  ActivityIndicator,
  Text as RNText,
  StyleSheet,
  View,
} from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  // 🔹 Set default font ketika fontsLoaded = true
  useEffect(() => {
    if (!fontsLoaded) return;

    if (!RNText.defaultProps) {
      RNText.defaultProps = {};
    }

    RNText.defaultProps.style = [
      RNText.defaultProps.style,
      { fontFamily: "Poppins-Regular" },
    ];
  }, [fontsLoaded]);

  // 🔹 Jangan render apa-apa sebelum font siap
  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  const signedIn = false;

  return (
    <>
      {!signedIn && <Redirect href="/(auth)/login" />}

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
