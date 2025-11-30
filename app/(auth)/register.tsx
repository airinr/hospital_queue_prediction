import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
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
import { auth, db } from "../../firebaseConfig"; // sesuaikan path

export default function Register() {
  const [email, setEmail] = useState("");
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !nama || !nik || !password) {
      Alert.alert("Validasi", "Semua field wajib diisi.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Validasi", "Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      // Buat akun di Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      //set displayName di Auth
      await updateProfile(user, { displayName: nama });

      await setDoc(doc(db, "users", user.uid), {
        nama: nama,
        NIK: nik,
      });

      Alert.alert("Sukses", "Registrasi berhasil!");
      router.replace("/login");
    } catch (err: any) {
      console.error(err);
      let msg = "Terjadi kesalahan saat registrasi.";
      if (err.code === "auth/email-already-in-use") {
        msg = "Email sudah terdaftar.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Format email tidak valid.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password terlalu lemah.";
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
          <View className="flex-1 px-6 justify-center py-8">
            {/* Header */}
            <View className="mb-10 items-center">
              <Image
                source={require("../../assets/images/bpjs-logo.png")}
                className="w-48 h-28"
                resizeMode="contain"
              />
              <Text className="text-slate-900 text-3xl font-poppins-bold mt-2">
                DAFTAR AKUN
              </Text>
              <Text className="text-slate-600 font-poppins text-center">
                Isi data di bawah untuk membuat akun Anda.
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

            {/* Input NIK */}
            <View className="mb-4">
              <Text className="text-slate-700 mb-1 font-medium">Nama</Text>
              <TextInput
                className="w-full bg-slate-100 rounded-xl px-4 py-3 text-slate-900 border border-slate-300"
                placeholder="Nama Anda"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                value={nama}
                onChangeText={setNama}
              />
            </View>

            {/* Input NIK */}
            <View className="mb-4">
              <Text className="text-slate-700 mb-1 font-medium">NIK</Text>
              <TextInput
                className="w-full bg-slate-100 rounded-xl px-4 py-3 text-slate-900 border border-slate-300"
                placeholder="8923424058692035"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                autoCapitalize="none"
                value={nik}
                onChangeText={setNik}
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

            {/* Tombol Register */}
            <Pressable
              onPress={handleRegister}
              className="w-full bg-main rounded-xl py-3 items-center justify-center active:bg-secondary"
            >
              <Text className="text-white font-semibold text-base">
                Buat Akun
              </Text>
            </Pressable>

            {/* Footer / link ke login */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-600 text-sm">Sudah punya akun? </Text>
              <Pressable onPress={() => router.push("/login")}>
                <Text className="text-sky-600 text-sm font-semibold">
                  Masuk
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
