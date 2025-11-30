# 🏥 Hospital Queue Prediction App

A mobile application built with **React Native (Expo)** that allows patients to view real-time clinic queues and receive a **predicted waiting time estimation** based on the number of people currently in line.

---

## 📌 Overview

Hospital Queue Prediction is designed to help patients avoid long and uncertain waiting times at healthcare facilities. Through this application, users can:

- View available clinics (poliklinik).
- See the current number of patients in each queue.
- Register for a queue directly from the app.
- View their queue number and registration time.
- Receive an estimated waiting time.
- Track queue movement in real time.

This application uses **Firebase Authentication**, **Firestore**, and **Firebase Realtime Database** for data management and live updates.

---

## 🚀 Key Features

### 🔐 User Authentication
- Login and registration using **Firebase Auth** (email & password).

### 🏥 Clinic List
- Displays available clinics along with their total queue count.

### 🧾 Queue Registration
- Users can join a queue for any clinic.
- Stores queue number, clinic ID, patient ID, and registration time.

### ⏳ Waiting Time Prediction
- Estimated waiting time based on:
  estimation = total_queue × average_service_time
- Can be extended with more advanced logic or future ML models.

### 🔄 Real-Time Queue Updates
- Uses **Firebase Realtime Database** for instant queue changes without refreshing.

### 📱 Modern UI/UX
- Built using React Native Hooks and modular components.
- Fully responsive and optimized for Android devices.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React Native (Expo)** | Mobile app interface |
| **Firebase Auth** | User authentication |
| **Firestore** | User data (optional) |
| **Firebase Realtime Database** | Real-time queue updates |
| **JavaScript / TypeScript** | App logic |
| **Expo Router** | Navigation |


---

## 🔧 Installation & Setup

### 1. Clone the Repository
git clone https://github.com/airinr/hospital_queue_prediction.git
cd hospital_queue_prediction  

### 2. Clone the Repository
npm install

### 3. Start the App
npx expo start

### 4. Open on Device
Scan the QR code using the Expo Go app.

