import { Stack } from "expo-router";
import React from "react";

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* app/(tabs)/index.tsx */}
      <Stack.Screen name="index" />

      {/* app/(tabs)/explore.tsx */}
      <Stack.Screen name="explore" />
      <Stack.Screen name="queueTicket" />
    </Stack>
  );
}
