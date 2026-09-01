import api from "../api/axios";

export const getAdminUsers = async () => {
  const response = await api.get(
    "/users/admin/all"
  );

  return response.data;
};

export const updateAdminUserRole = async (
  userId,
  role
) => {
  const response = await api.put(
    `/users/admin/${userId}/role`,
    {
      role,
    }
  );

  return response.data;
};

export const deleteAdminUser = async (
  userId
) => {
  const response = await api.delete(
    `/users/admin/${userId}`
  );

  return response.data;
};