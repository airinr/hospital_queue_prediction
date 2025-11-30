import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth } from "../../firebaseConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validasi", "Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);

      Alert.alert("Sukses", "Login berhasil!");
      router.replace("/");
    } catch (err: any) {
      console.error(err);
      let msg = "Terjadi kesalahan saat login.";
      if (err.code === "auth/user-not-found") {
        msg = "Akun tidak ditemukan.";
      } else if (err.code === "auth/wrong-password") {
        msg = "Password salah.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Format email tidak valid.";
      }
      Alert.alert("Gagal", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 justify-center">
            {/* Header */}
            <View className="mb-10 items-center">
              <Image
                source={require("../../assets/images/bpjs-logo.png")}
                className="w-48 h-28"
                resizeMode="contain"
              />
              <Text className="text-slate-900 text-3xl font-poppins-bold mt-2">
                MASUK
              </Text>
              <Text className="text-slate-600 font-poppins text-center">
                Masukkan email dan password untuk melanjutkan.
              </Text>
            </View>

            {/* Input Email */}
            <View className="mb-4">
              <Text className="text-slate-700 mb-1 font-medium">Email</Text>
              <TextInput
                className="w-full bg-slate-100 rounded-xl px-4 py-3 text-slate-900 border border-slate-300"
                placeholder="contoh@email.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Input Password */}
            <View className="mb-2">
              <Text className="text-slate-700 mb-1 font-medium">Password</Text>

              <View className="w-full flex-row items-center bg-slate-100 rounded-xl border border-slate-300 px-4">
                <TextInput
                  className="flex-1 py-3 text-slate-900"
                  placeholder="••••••••"
                  placeholderTextColor="#64748B"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />

                {/* Tombol Mata */}
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  className="pl-3 py-2"
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#64748B"
                  />
                </Pressable>
              </View>
            </View>

            {/* Lupa password */}
            <Pressable
              onPress={() => Alert.alert("Info", "Belum ada")}
              className="items-end mb-6"
            >
              <Text className="text-sky-600 text-xs font-medium">
                Lupa password?
              </Text>
            </Pressable>

            {/* Tombol Login */}
            <Pressable
              onPress={handleLogin}
              className="w-full bg-main rounded-xl py-3 items-center justify-center active:bg-secondary"
            >
              <Text className="text-white font-semibold text-base">Login</Text>
            </Pressable>

            {/* Footer / link ke register */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-600 text-sm">Belum punya akun? </Text>
              <Pressable onPress={() => router.push("/register")}>
                <Text className="text-sky-600 text-sm font-semibold">
                  Daftar
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
