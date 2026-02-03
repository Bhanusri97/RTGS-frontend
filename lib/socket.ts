// lib/socket.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

export const socket = io("http://192.168.1.167:5000", {
  autoConnect: true,
});

export const initSocketLogin = async () => {
  const userId = await AsyncStorage.getItem("userId");
  if (userId && socket.connected) {
    socket.emit("login", userId);
  }
};
