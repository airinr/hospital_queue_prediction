import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import { get, onValue, push, ref, set } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import PoliDetail, {
  PoliItem,
  PoliQueueDetail,
} from "../../components/poliDetail";
import { auth, db, rtdb } from "../../firebaseConfig";

type CurrentQueue = {
  poliId: string;
  namaPoli: string;
  queueNumber: string;
  jamDaftar: string;
  estimasiMenit?: number;
};

export default function HomeIndex() {
  const [queueDetails, setQueueDetails] = useState<PoliQueueDetail[]>([]);
  const [loadingQueueDetails, setLoadingQueueDetails] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState(true);

  // display name
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setDisplayName(null);
        setLoadingName(false);
        return;
      }

      const fromAuth = user.displayName ?? user.email ?? null;
      setDisplayName(fromAuth);
      setLoadingName(false);

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data() as any;
          if (data.nama) {
            setDisplayName(data.nama);
          }
        }
      } catch (e) {
        console.log("Gagal ambil profil Firestore, pakai nama dari Auth saja");
      }
    });

    return () => unsub();
  }, []);

  //card antrian
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCurrentQueue(null);
        return;
      }

      const uid = user.uid;
      const queueRef = ref(rtdb, `userQueue/${uid}`);

      const unsubQueue = onValue(queueRef, (snapshot) => {
        if (!snapshot.exists()) {
          setCurrentQueue(null);
          return;
        }

        const data = snapshot.val() as {
          poliId: string;
          namaPoli: string;
          queueNumber: string;
          jamDaftar: string;
          tanggal_daftar?: string;
          estimasi_menit?: number;
        };

        const todayKey = new Date().toISOString().slice(0, 10);

        if (!data.tanggal_daftar || data.tanggal_daftar !== todayKey) {
          setCurrentQueue(null);
          return;
        }

        setCurrentQueue({
          poliId: data.poliId,
          namaPoli: data.namaPoli,
          queueNumber: data.queueNumber,
          jamDaftar: data.jamDaftar,
          estimasiMenit: data.estimasi_menit,
        });
      });

      return () => {
        unsubQueue();
      };
    });

    return () => {
      unsubAuth();
    };
  }, []);

  const nameToShow = loadingName ? "Memuat..." : displayName || "Pasien";

  const [poliList, setPoliList] = useState<PoliItem[]>([]);
  const [loadingPoli, setLoadingPoli] = useState(true);

  const [selectedPoli, setSelectedPoli] = useState<PoliItem | null>(null);
  const [showPoliModal, setShowPoliModal] = useState(false);

  // antrian aktif user
  const [currentQueue, setCurrentQueue] = useState<CurrentQueue | null>(null);

  useEffect(() => {
    const poliRef = ref(rtdb, "poli");

    const unsubscribe = onValue(
      poliRef,
      (snapshot) => {
        const val = snapshot.val();
        if (!val) {
          setPoliList([]);
          setLoadingPoli(false);
          return;
        }

        const todayKey = new Date().toISOString().slice(0, 10);

        const list: PoliItem[] = Object.entries(val).map(
          ([key, value]: [string, any]) => {
            const detailObj = value["detail_pasien"] || {};

            // hitung hanya yang tanggal_daftar = hari ini
            const totalToday = (Object.values(detailObj) as any[]).filter(
              (item) => item.tanggal_daftar === todayKey
            ).length;

            return {
              id: key,
              nama_poli: value.nama_poli ?? key,
              // jumlah_pasien = hasil hitung dari detail-pasien
              jumlah_pasien: totalToday,
            };
          }
        );

        setPoliList(list);
        setLoadingPoli(false);
      },
      (error) => {
        console.error("Error membaca /poli:", error);
        setLoadingPoli(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // INTEGRASI MODEL
  const predictWaitTime = async (params: {
    hari: string;
    poli: string;
    jumlahAntrian: number;
    jamDaftarHour: number;
    jamDaftarMinute: number;
  }): Promise<number | null> => {
    try {
      const res = await fetch("https://bpjs.rutherweb.my.id/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Hari: params.hari,
          Poli: params.poli,
          Jumlah_Antrian_Saat_Ini: params.jumlahAntrian,
          Jam_Daftar_Hour: params.jamDaftarHour,
          Jam_Daftar_Minute: params.jamDaftarMinute,
        }),
      });

      if (!res.ok) {
        console.log("Gagal hit API prediksi, status:", res.status);
        return null;
      }

      const data = await res.json();
      return data.predicted_wait_time_minutes ?? null;
    } catch (err) {
      console.log("Error fetch prediksi:", err);
      return null;
    }
  };

  const handleDaftarPoli = async (poli: PoliItem, jamDaftar: string) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Anda harus login terlebih dahulu.");
      return;
    }

    const uid = user.uid;
    const namaUser = displayName || user.email || "Pasien";
    const todayKey = new Date().toISOString().slice(0, 10);

    try {
      const nextNumber = (poli.jumlah_pasien || 0) + 1;

      const now = new Date();
      const jam = now.getHours();
      const menit = now.getMinutes();

      const dayNames = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      const hari = dayNames[now.getDay()];

      // panggil model prediksi
      const estimasiMenit = await predictWaitTime({
        hari,
        poli: poli.nama_poli,
        jumlahAntrian: nextNumber,
        jamDaftarHour: jam,
        jamDaftarMinute: menit,
      });

      const detailRef = push(ref(rtdb, `poli/${poli.id}/detail_pasien`));
      await set(detailRef, {
        uid,
        nama: namaUser,
        jam_daftar: jamDaftar,
        nomor_antrian: nextNumber,
        tanggal_daftar: todayKey,
      });

      const queueNumber = `${poli.id}-${String(nextNumber).padStart(3, "0")}`;

      // simpan info antrian user (termasuk estimasi jika ada)
      await set(ref(rtdb, `userQueue/${uid}`), {
        poliId: poli.id,
        namaPoli: poli.nama_poli,
        queueNumber,
        jamDaftar,
        tanggal_daftar: todayKey,
        estimasi_menit: estimasiMenit,
      });

      setCurrentQueue({
        poliId: poli.id,
        namaPoli: poli.nama_poli,
        queueNumber,
        jamDaftar,
        estimasiMenit: estimasiMenit ?? undefined,
      });

      alert(`Berhasil mendaftar di ${poli.nama_poli}`);
      setShowPoliModal(false);
    } catch (err) {
      console.error("Gagal daftar poli:", err);
      alert("Terjadi kesalahan saat mendaftar. Coba lagi.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1">
        <View className="bg-white px-6 pt-8 pb-6">
          {/* Greeting */}
          <View className="mb-6">
            <Text className="text-slate-700 text-sm">Selamat Datang,</Text>
            <Text className="text-slate-900 text-2xl font-poppins-bold">
              {nameToShow}
            </Text>
            <Text className="text-slate-500 text-sm mt-1">
              Ada yang bisa dibantu?
            </Text>
          </View>

          {/* Antrian */}
          <View>
            <Text className="text-slate-700 text-sm mb-2">Antrian Anda:</Text>

            <Pressable
              disabled={!currentQueue}
              className={`flex-row items-center justify-between rounded-2xl px-4 py-4 shadow-md shadow-black/10 ${
                currentQueue ? "bg-main" : "bg-slate-300"
              }`}
              onPress={() => {
                if (!currentQueue) {
                  Alert.alert(
                    "Belum ada antrian",
                    "Silakan pilih poli dan tekan Daftar terlebih dahulu."
                  );
                  return;
                }

                let totalPatientsBefore = 0;
                const parts = currentQueue.queueNumber.split("-");

                if (parts.length > 1) {
                  const parsed = parseInt(parts[1], 10);
                  if (!isNaN(parsed)) {
                    totalPatientsBefore = parsed - 1;
                  }
                }

                router.push({
                  pathname: "/(tabs)/queueTicket",
                  params: {
                    queueNumber: currentQueue.queueNumber,
                    poliName: currentQueue.namaPoli,
                    waitText: "Silakan tunggu panggilan",
                    name: nameToShow,
                    date: new Date().toLocaleDateString("id-ID"),
                    estimasi: currentQueue.estimasiMenit?.toString() ?? "",
                    totalPatientsBefore: totalPatientsBefore.toString(),
                  },
                });
              }}
            >
              {currentQueue ? (
                <>
                  <View>
                    <Text className="text-white text-xs mb-1">
                      Nomor Antrian
                    </Text>
                    <Text className="text-white text-2xl font-poppins-bold">
                      {currentQueue.queueNumber}
                    </Text>
                    <Text className="text-sky-100 text-xs mt-1">
                      {currentQueue.namaPoli}
                    </Text>
                  </View>

                  <View className="items-end mr-2">
                    <Text className="text-sky-100 text-xs mb-1">
                      Jam Daftar
                    </Text>
                    <Text className="text-white text-xl font-poppins-bold">
                      {currentQueue.jamDaftar}
                    </Text>

                    <Text className="text-sky-100 text-xs mt-1">
                      {typeof currentQueue.estimasiMenit === "number"
                        ? `Estimasi: ± ${currentQueue.estimasiMenit} menit`
                        : "Estimasi: sedang dihitung..."}
                    </Text>
                  </View>

                  <View className="w-8 h-8 rounded-full border border-sky-200 items-center justify-center">
                    <Feather name="chevron-right" size={18} color="#E2E8F0" />
                  </View>
                </>
              ) : (
                <View className="flex-1">
                  <Text className="text-white text-sm font-poppins">
                    Belum ada antrian aktif. Pilih poli di bawah lalu tekan
                    tombol Daftar.
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <View className="flex-1 bg-main rounded-t-[32px]">
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 32,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="items-center mb-4">
              <Text className="text-white text-base font-poppins-bold">
                Daftar Poli
              </Text>
              <View className="w-16 h-[2px] bg-white mt-1" />
            </View>

            {loadingPoli ? (
              <Text className="text-white text-center mt-4">
                Memuat data poli...
              </Text>
            ) : poliList.length === 0 ? (
              <Text className="text-white text-center mt-4">
                Belum ada data poli.
              </Text>
            ) : (
              poliList.map((poli) => (
                <Pressable
                  key={poli.id}
                  className="flex-row items-center bg-white rounded-2xl px-4 py-3 mb-3 shadow-md shadow-black/20"
                  onPress={async () => {
                    setSelectedPoli(poli);
                    setShowPoliModal(true);

                    setLoadingQueueDetails(true);
                    try {
                      const detailRef = ref(
                        rtdb,
                        `poli/${poli.id}/detail_pasien`
                      );
                      const snap = await get(detailRef);

                      if (!snap.exists()) {
                        setQueueDetails([]);
                      } else {
                        const val = snap.val();
                        const todayKey = new Date().toISOString().slice(0, 10);

                        const list: PoliQueueDetail[] = Object.entries(val)
                          .map(([key, value]: [string, any]) => ({
                            id: key,
                            nama: value.nama ?? "-",
                            jam_daftar: value.jam_daftar ?? "",
                            nomor_antrian: value.nomor_antrian ?? 0,
                            tanggal_daftar: value.tanggal_daftar,
                          }))
                          .filter((item) => item.tanggal_daftar === todayKey);

                        setQueueDetails(list);
                      }
                    } catch (e) {
                      console.error("Gagal ambil detail_pasien:", e);
                      setQueueDetails([]);
                    } finally {
                      setLoadingQueueDetails(false);
                    }
                  }}
                >
                  <View className="w-16 h-16 bg-slate-300 rounded-xl mr-4 items-center justify-center">
                    <Image
                      source={require("../../assets/images/bpjs-logo.png")}
                      className="w-20 h-20"
                      resizeMode="contain"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-slate-900 font-poppins">
                      {poli.nama_poli}
                    </Text>
                    <Text className="text-slate-500 text-xs mt-1">
                      Jumlah Pasien: {poli.jumlah_pasien}
                    </Text>
                  </View>

                  <Feather name="chevron-right" size={20} color="#0F172A" />
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      <PoliDetail
        visible={showPoliModal}
        poli={selectedPoli}
        onClose={() => setShowPoliModal(false)}
        onDaftar={handleDaftarPoli}
        queueDetails={queueDetails}
        loadingQueueDetails={loadingQueueDetails}
      />
    </SafeAreaView>
  );
}
