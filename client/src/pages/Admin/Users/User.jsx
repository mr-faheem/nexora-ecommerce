import {
  useEffect,
  useState,
} from "react";

import {
  Trash2,
  UserRound,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";

import {
  getAdminUsers,
  updateAdminUserRole,
  deleteAdminUser,
} from "../../../services/userService";

import useAuth from "../../../hooks/useAuth";

function User() {
  const { user: loggedInUser } =
    useAuth();

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAdminUsers();

      setUsers(data.users || []);
    } catch (error) {
      console.error(
        "Fetch Users Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (
    userId,
    role
  ) => {
    try {
      setUpdatingId(userId);
      setError("");
      setMessage("");

      const data =
        await updateAdminUserRole(
          userId,
          role
        );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                role:
                  data.user?.role ||
                  role,
              }
            : user
        )
      );

      setMessage(
        data.message ||
          "User role updated successfully."
      );
    } catch (error) {
      console.error(
        "Update User Role Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update user role."
      );

      // Backend reject kare to
      // original data dubara load kar do.
      try {
        const data =
          await getAdminUsers();

        setUsers(
          data.users || []
        );
      } catch (refreshError) {
        console.error(
          "Refresh Users Error:",
          refreshError
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (
    userId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this user?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const data =
        await deleteAdminUser(
          userId
        );

      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) =>
            user._id !== userId
        )
      );

      setMessage(
        data.message ||
          "User deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete User Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to delete user."
      );
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl">
        <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
          Store Management
        </p>

        <h1 className="text-4xl font-bold mt-3">
          Users
        </h1>

        <p className="text-gray-600 mt-3">
          Manage registered users and
          account roles.
        </p>

        {error && (
          <div className="mt-6 border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 border border-green-200 bg-green-50 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        <div className="mt-8 bg-white border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-gray-500">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-gray-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-5 py-4">
                      User
                    </th>

                    <th className="px-5 py-4">
                      Email
                    </th>

                    <th className="px-5 py-4">
                      Role
                    </th>

                    <th className="px-5 py-4">
                      Joined
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {users.map((user) => {
                    const isCurrentUser =
                      user._id ===
                      loggedInUser?.id;

                    return (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                              {user.avatar ? (
                                <img
                                  src={
                                    user.avatar
                                  }
                                  alt={
                                    user.name
                                  }
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <UserRound
                                  size={20}
                                  className="text-gray-500"
                                />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">
                                  {
                                    user.name
                                  }
                                </p>

                                {isCurrentUser && (
                                  <span className="text-[11px] bg-black text-white px-2 py-0.5 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-gray-500 mt-1">
                                {user._id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {user.email}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {user.role ===
                              "admin" && (
                              <ShieldCheck
                                size={18}
                              />
                            )}

                            <select
                              value={
                                user.role
                              }
                              disabled={
                                isCurrentUser ||
                                updatingId ===
                                  user._id
                              }
                              onChange={(
                                event
                              ) =>
                                handleRoleChange(
                                  user._id,
                                  event
                                    .target
                                    .value
                                )
                              }
                              className={`border rounded-lg px-3 py-2 ${
                                isCurrentUser
                                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                  : "bg-white"
                              }`}
                              title={
                                isCurrentUser
                                  ? "You cannot change your own role."
                                  : "Change user role"
                              }
                            >
                              <option value="user">
                                User
                              </option>

                              <option value="admin">
                                Admin
                              </option>
                            </select>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            {isCurrentUser ? (
                              <button
                                type="button"
                                disabled
                                className="w-10 h-10 border rounded-lg flex items-center justify-center bg-gray-100 text-gray-400 cursor-not-allowed"
                                title="You cannot delete your own admin account."
                              >
                                <LockKeyhole
                                  size={
                                    17
                                  }
                                />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    user._id
                                  )
                                }
                                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                title="Delete user"
                              >
                                <Trash2
                                  size={
                                    17
                                  }
                                />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default User;