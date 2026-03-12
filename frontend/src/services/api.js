import axios from "axios";

/*
  Base API instance
*/
const API = axios.create({
  baseURL: "https://crypto-pulse-mk58.onrender.com/api",
});

/*
  Attach token automatically to every request
*/
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/*
  AUTH APIs
*/

export const signupUser = (data) => API.post("/signup", data);

export const loginUser = (data) => API.post("/login", data);

export const forgotPassword = (data) => API.post("/forgot-password", data);

export const verifyOTP = (data) => API.post("/verify-otp", data);

/*
  CRYPTO APIs
*/

export const fetchCryptos = () => API.get("/cryptos");

export const searchCrypto = (query) =>
  API.get(`/crypto/search?query=${encodeURIComponent(query)}`);

export const deleteCrypto = async (symbol) => {
  try {
    const response = await API.delete(
      `/crypto/delete/${encodeURIComponent(symbol)}`
    );
    return response.data;
  } catch (error) {
    console.error("Delete crypto error:", error.response?.data || error.message);
    throw error;
  }
};

export const addCrypto = async (symbol) => {
  try {
    const response = await API.post("/crypto/add", {
      symbol,
    });

    return response.data;

  } catch (error) {
    console.error("Add crypto error:", error.response?.data || error.message);
    throw error;
  }
};