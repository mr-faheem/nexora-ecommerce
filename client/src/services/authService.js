import api from "../api/axios";

export const loginUser = async (
  email,
  password
) => {
  const response = await api.post(
    "/auth/login",
    {
      email,
      password,
    }
  );

  return response.data;
};

export const getProfile = async () => {
  const response = await api.get(
    "/users/profile"
  );

  return response.data;
};

export const updateProfile = async (
  profileData
) => {
  const response = await api.put(
    "/users/profile",
    profileData
  );

  return response.data;
};

export const changePassword = async (
  currentPassword,
  newPassword
) => {
  const response = await api.put(
    "/users/change-password",
    {
      currentPassword,
      newPassword,
    }
  );

  return response.data;
};