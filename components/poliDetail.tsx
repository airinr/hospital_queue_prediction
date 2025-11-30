import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

export type PoliItem = {
  id: string;
  nama_poli: string;
  jumlah_pasien: number;
};

export type PoliQueueDetail = {
  id: string;
  nama: string;
  jam_daftar: string;
  nomor_antrian: number;
  tanggal_daftar?: string;
};

type PoliDetailModalProps = {
  visible: boolean;
  poli: PoliItem | null;
  onClose: () => void;
  onDaftar: (poli: PoliItem, jamDaftar: string) => void;
  // ⬇️ data antrian dari parent (detailPasien)
  queueDetails?: PoliQueueDetail[];
  loadingQueueDetails?: boolean;
};

export default function PoliDetail({
  visible,
  poli,
  onClose,
  onDaftar,
  queueDetails = [],
  loadingQueueDetails = false,
}: PoliDetailModalProps) {
  const [jamDaftar, setJamDaftar] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"info" | "antrian">("info");

  useEffect(() => {
    if (visible) {
      // reset ke tab Info setiap kali modal dibuka
      setActiveTab("info");

      const now = new Date();
      const formatted = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setJamDaftar(formatted);
    } else {
      setJamDaftar("");
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 items-center justify-center">
        <View className="w-11/12 bg-white rounded-2xl p-6">
          {/* Judul */}
          <Text className="text-slate-900 text-lg font-poppins-bold mb-3">
            {poli?.nama_poli ?? "Detail Poli"}
          </Text>

          {/* ⬇️ Tab header */}
          <View className="flex-row mb-4">
            <Pressable
              className={`flex-1 items-center py-2 rounded-xl mr-1 ${
                activeTab === "info" ? "bg-main" : "bg-slate-100"
              }`}
              onPress={() => setActiveTab("info")}
            >
              <Text
                className={`text-sm font-poppins ${
                  activeTab === "info" ? "text-white" : "text-slate-700"
                }`}
              >
                Daftar
              </Text>
            </Pressable>

            <Pressable
              className={`flex-1 items-center py-2 rounded-xl ml-1 ${
                activeTab === "antrian" ? "bg-main" : "bg-slate-100"
              }`}
              onPress={() => setActiveTab("antrian")}
            >
              <Text
                className={`text-sm font-poppins ${
                  activeTab === "antrian" ? "text-white" : "text-slate-700"
                }`}
              >
                Data Antrian
              </Text>
            </Pressable>
          </View>

          {/* tab */}
          {activeTab === "info" ? (
            <>
              <Text className="text-slate-600 text-sm">
                Jumlah pasien terdaftar:{" "}
                <Text className="font-poppins-bold">
                  {poli?.jumlah_pasien ?? 0}
                </Text>
              </Text>

              <Text className="text-slate-600 text-sm mt-1 mb-4">
                Jam daftar:{" "}
                <Text className="font-poppins-bold">{jamDaftar || "-"}</Text>
              </Text>

              {/* Tombol Daftar */}
              <Pressable
                className="w-full bg-main rounded-xl py-3 items-center justify-center mb-3"
                onPress={() => {
                  if (poli) onDaftar(poli, jamDaftar || "");
                }}
              >
                <Text className="text-white font-semibold text-base">
                  Daftar {poli?.nama_poli ?? "Nama Poli"}
                </Text>
              </Pressable>
            </>
          ) : (
            // Tab Data Antrian
            <View className="max-h-64 mb-3">
              {loadingQueueDetails ? (
                <Text className="text-slate-600 text-sm">
                  Memuat data antrian...
                </Text>
              ) : queueDetails.length === 0 ? (
                <Text className="text-slate-600 text-sm">
                  Belum ada pasien terdaftar di poli ini.
                </Text>
              ) : (
                <ScrollView>
                  {queueDetails.map((q) => (
                    <View
                      key={q.id}
                      className="flex-row items-center justify-between bg-slate-100 rounded-xl px-3 py-2 mb-2"
                    >
                      <View>
                        <Text className="text-slate-900 font-poppins-bold">
                          {String(q.nomor_antrian).padStart(3, "0")}
                        </Text>
                        <Text className="text-slate-600 text-xs">{q.nama}</Text>
                      </View>
                      <Text className="text-slate-700 text-xs">
                        {q.jam_daftar}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Tombol Tutup */}
          <Pressable
            className="w-full border border-slate-300 rounded-xl py-3 items-center justify-center"
            onPress={onClose}
          >
            <Text className="text-slate-700 font-medium text-base">Tutup</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
