import {
  useEffect,
  useState,
} from "react";

import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";

import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../services/authService";

function Profile() {
  const [profileLoading, setProfileLoading] =
    useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [role, setRole] =
    useState("");

  const [joinedAt, setJoinedAt] =
    useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      setError("");

      const data =
        await getProfile();

      const user =
        data.user || {};

      setName(
        user.name || ""
      );

      setEmail(
        user.email || ""
      );

      setRole(
        user.role || ""
      );

      setJoinedAt(
        user.createdAt || ""
      );
    } catch (error) {
      console.error(
        "Load Profile Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileUpdate =
    async (event) => {
      event.preventDefault();

      try {
        setSavingProfile(true);
        setError("");
        setMessage("");

        const data =
          await updateProfile({
            name,
            email,
          });

        setName(
          data.user?.name || name
        );

        setEmail(
          data.user?.email || email
        );

        setMessage(
          data.message ||
            "Profile updated successfully."
        );
      } catch (error) {
        console.error(
          "Update Profile Error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to update profile."
        );
      } finally {
        setSavingProfile(false);
      }
    };

  const handlePasswordChange =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        setError(
          "Please fill all password fields."
        );

        return;
      }

      if (
        newPassword.length < 6
      ) {
        setError(
          "New password must be at least 6 characters."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          "New password and confirm password do not match."
        );

        return;
      }

      try {
        setChangingPassword(true);

        const data =
          await changePassword(
            currentPassword,
            newPassword
          );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setMessage(
          data.message ||
            "Password changed successfully."
        );
      } catch (error) {
        console.error(
          "Change Password Error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to change password."
        );
      } finally {
        setChangingPassword(false);
      }
    };

  if (profileLoading) {
    return (
      <div className="min-h-[80vh] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-100 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
            Your Account
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            My Profile
          </h1>

          <p className="text-gray-600 mt-3">
            Manage your personal information
            and account security.
          </p>
        </div>

        {error && (
          <div className="mt-6 border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 border border-green-200 bg-green-50 text-green-700 px-4 py-3 rounded-xl">
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-[320px_1fr] gap-8 mt-8">
          {/* Profile Summary */}
          <div className="bg-white border rounded-2xl p-6 h-fit">
            <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
              <UserRound
                size={42}
                className="text-gray-500"
              />
            </div>

            <div className="text-center mt-5">
              <h2 className="text-xl font-bold">
                {name || "User"}
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                {email}
              </p>

              <span className="inline-block mt-4 bg-black text-white text-xs uppercase tracking-wide px-3 py-1.5 rounded-full">
                {role || "user"}
              </span>
            </div>

            <div className="border-t mt-6 pt-5 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail
                  size={18}
                  className="text-gray-500"
                />

                <span className="break-all">
                  {email}
                </span>
              </div>

              {joinedAt && (
                <p className="text-sm text-gray-500">
                  Joined:{" "}
                  {new Date(
                    joinedAt
                  ).toLocaleDateString(
                    "en-IN"
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-8">
            {/* Personal Information */}
            <form
              onSubmit={
                handleProfileUpdate
              }
              className="bg-white border rounded-2xl p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold">
                Personal Information
              </h2>

              <p className="text-gray-500 mt-2">
                Update your name and email address.
              </p>

              <div className="grid md:grid-cols-2 gap-5 mt-7">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition disabled:bg-gray-400"
                >
                  <Save size={18} />

                  {savingProfile
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>

            {/* Password */}
            <form
              onSubmit={
                handlePasswordChange
              }
              className="bg-white border rounded-2xl p-6 md:p-8"
            >
              <div className="flex items-center gap-3">
                <LockKeyhole
                  size={24}
                />

                <h2 className="text-2xl font-bold">
                  Change Password
                </h2>
              </div>

              <p className="text-gray-500 mt-2">
                Use your current password to
                create a new password.
              </p>

              <div className="space-y-5 mt-7">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Current Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        currentPassword
                      }
                      onChange={(event) =>
                        setCurrentPassword(
                          event.target.value
                        )
                      }
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-black"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          (prev) =>
                            !prev
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showCurrentPassword ? (
                        <EyeOff
                          size={20}
                        />
                      ) : (
                        <Eye
                          size={20}
                        />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        newPassword
                      }
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      required
                      minLength={6}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-black"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (prev) =>
                            !prev
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showNewPassword ? (
                        <EyeOff
                          size={20}
                        />
                      ) : (
                        <Eye
                          size={20}
                        />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      required
                      minLength={6}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-black"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) =>
                            !prev
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          size={20}
                        />
                      ) : (
                        <Eye
                          size={20}
                        />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  changingPassword
                }
                className="mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400"
              >
                {changingPassword
                  ? "Changing Password..."
                  : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;