import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

export default function QueueTicket() {
  const { queueNumber, poliName, name, date, estimasi, totalPatientsBefore } =
    useLocalSearchParams();

  const nomorAntrian = (queueNumber as string) || "0000";
  const namaPoli = (poliName as string) || "Nama Poli";
  const namaPasien = (name as string) || "Nama";
  const tanggalPelayanan = (date as string) || "DD/MM/YY";

  const estimasiMenit = estimasi ? Number(estimasi) : 0;

  const totalPasienSebelum = totalPatientsBefore
    ? Number(totalPatientsBefore)
    : 0;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient
        colors={["#0A5BAA", "#93BCD6", "#0E7BD5"]}
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View className="flex-row items-center px-4 pt-4 pb-2">
          <Pressable
            onPress={() => router.back()}
            className="p-2 -ml-2 mr-2 rounded-full"
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <Text className="flex-1 text-center text-white text-base font-poppins-bold">
            Antrian
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <View className="flex-1 items-center justify-center px-6 pb-10">
          <View className="w-full relative">
            {/* SCALLOP ATAS */}
            <View className="absolute -top-4 left-0 right-0 flex-row justify-between px-6">
              <View className="w-12 h-12 rounded-full bg-white shadow-md shadow-black/30" />
              <View className="w-12 h-12 rounded-full bg-white shadow-md shadow-black/30" />
              <View className="w-12 h-12 rounded-full bg-white shadow-md shadow-black/30" />
              <View className="w-12 h-12 rounded-full bg-white shadow-md shadow-black/30" />
              <View className="w-12 h-12 rounded-full bg-white shadow-md shadow-black/30" />
            </View>

            {/* BADAN TICKET */}
            <View className="bg-white rounded-3xl px-6 py-10">
              {/* Judul tiket */}
              <View className="items-center mb-6">
                <Text className="text-slate-900 text-base font-poppins-bold">
                  Antrian Anda
                </Text>
              </View>

              {/* Nomor antrian & poli */}
              <View className="items-center mb-8">
                <Text className="text-slate-500 text-xs mb-1">
                  Nomor Antrian
                </Text>
                <Text className="text-slate-900 text-3xl font-poppins-bold">
                  {nomorAntrian}
                </Text>

                <Text className="text-slate-500 text-xs mt-6 mb-1">
                  Nama Poliklinik
                </Text>
                <Text className="text-slate-900 text-base font-poppins-bold">
                  {namaPoli}
                </Text>

                <Text className="text-slate-500 text-xs mt-6 mb-1">
                  Estimasi Waktu Tunggu
                </Text>
                <Text className="text-slate-900 text-base font-poppins-bold">
                  {estimasiMenit} menit (
                  {totalPasienSebelum > 0
                    ? `${totalPasienSebelum} pasien lagi`
                    : "Tidak ada pasien di depan Anda"}
                  )
                </Text>
              </View>

              {/* BARIS TANGGAL & NAMA */}
              <View className="flex-row justify-between mb-6">
                <View className="flex-1 mr-3">
                  <Text className="text-slate-500 text-xs mb-1">Nama</Text>
                  <Text className="text-slate-900 text-sm font-poppins-bold">
                    {namaPasien}
                  </Text>
                </View>
                <View className="flex-1 items-end ml-3">
                  <Text className="text-slate-500 text-xs mb-1">
                    Tgl Pelayanan
                  </Text>
                  <Text className="text-slate-900 text-sm font-poppins-bold">
                    {tanggalPelayanan}
                  </Text>
                </View>
              </View>
            </View>

            {/* INFO */}
            <View className="mt-4 px-2">
              <Text className="text-white text-xs opacity-90">
                Diharapkan datang 15 menit sebelum jam pelayanan dimulai.
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
