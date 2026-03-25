import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apipaths.js";

const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });

    // 🔥 HANDLE BOTH CASES
    const data = response.data.data || response.data;

    return data; // { token, user }

  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const register = async (data) => {
  try {
    console.log("REGISTER PAYLOAD:", data);

    const response = await axiosInstance.post(
      API_PATHS.AUTH.REGISTER,
      {
        username: data.username,
        email: data.email,
        password: data.password,
      }
    );

    return response.data;
  } catch (error) {
    console.error("REGISTER ERROR:", error.response?.data);
    throw error.response?.data || { message: "Server error" };
  }
};

const getProfile = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AUTH.UPDATE_PROFILE,
      userData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const changePassword = async (passwords) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AUTH.CHANGE_PASSWORD,
      passwords
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
};

export default authService;
