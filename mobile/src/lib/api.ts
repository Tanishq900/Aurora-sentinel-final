import axios from "axios";
import Constants from "expo-constants";

const backendApiUrl = Constants.expoConfig?.extra?.backendApiUrl;

if (!backendApiUrl) {
  throw new Error(
    "Missing backend API URL. Please ensure backendApiUrl is set in app.json → expo.extra"
  );
}

export const api = axios.create({
  baseURL: backendApiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
