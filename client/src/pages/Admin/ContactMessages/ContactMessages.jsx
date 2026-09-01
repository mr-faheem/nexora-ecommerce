import {
  useEffect,
  useState,
} from "react";

import {
  Mail,
  MailOpen,
  Trash2,
  RefreshCw,
  Inbox,
  User,
  CalendarDays,
} from "lucide-react";

import api from "../../../api/axios";

function ContactMessages() {
  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedMessage,
    setSelectedMessage,
  ] = useState(null);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    actionLoading,
    setActionLoading,
  ] = useState("");

  const fetchMessages =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/contact"
          );

        setMessages(
          response.data
            .messages || []
        );

        setUnreadCount(
          response.data
            .unreadCount || 0
        );
      } catch (error) {
        console.error(
          "Admin Contact Messages Error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to load contact messages."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchMessages();
  }, []);

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const handleOpenMessage =
    async (message) => {
      setSelectedMessage(
        message
      );

      if (message.isRead) {
        return;
      }

      try {
        const response =
          await api.patch(
            `/contact/${message._id}/read`,
            {
              isRead: true,
            }
          );

        const updated =
          response.data
            .contactMessage;

        setMessages(
          (previous) =>
            previous.map(
              (item) =>
                item._id ===
                message._id
                  ? updated
                  : item
            )
        );

        setSelectedMessage(
          updated
        );

        setUnreadCount(
          (previous) =>
            Math.max(
              previous - 1,
              0
            )
        );
      } catch (error) {
        console.error(
          "Mark Message Read Error:",
          error
        );
      }
    };

  const toggleRead =
    async (message) => {
      try {
        setActionLoading(
          message._id
        );

        const response =
          await api.patch(
            `/contact/${message._id}/read`,
            {
              isRead:
                !message.isRead,
            }
          );

        const updated =
          response.data
            .contactMessage;

        setMessages(
          (previous) =>
            previous.map(
              (item) =>
                item._id ===
                message._id
                  ? updated
                  : item
            )
        );

        if (
          selectedMessage?._id ===
          message._id
        ) {
          setSelectedMessage(
            updated
          );
        }

        setUnreadCount(
          (previous) =>
            message.isRead
              ? previous + 1
              : Math.max(
                  previous - 1,
                  0
                )
        );
      } catch (error) {
        console.error(
          "Toggle Read Error:",
          error
        );
      } finally {
        setActionLoading("");
      }
    };

  const handleDelete =
    async (message) => {
      const confirmed =
        window.confirm(
          `Delete message from ${message.name}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          message._id
        );

        await api.delete(
          `/contact/${message._id}`
        );

        setMessages(
          (previous) =>
            previous.filter(
              (item) =>
                item._id !==
                message._id
            )
        );

        if (
          !message.isRead
        ) {
          setUnreadCount(
            (previous) =>
              Math.max(
                previous - 1,
                0
              )
          );
        }

        if (
          selectedMessage?._id ===
          message._id
        ) {
          setSelectedMessage(
            null
          );
        }
      } catch (error) {
        console.error(
          "Delete Contact Message Error:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
            "Unable to delete message."
        );
      } finally {
        setActionLoading("");
      }
    };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Heading */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
              Customer Support
            </p>

            <h1 className="text-4xl font-bold mt-3">
              Contact Messages
            </h1>

            <p className="text-gray-600 mt-3">
              View and manage
              customer enquiries
              from the Nexora
              contact form.
            </p>
          </div>

          <button
            type="button"
            onClick={
              fetchMessages
            }
            className="self-start md:self-auto border bg-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-50"
          >
            <RefreshCw
              size={17}
            />

            Refresh
          </button>
        </div>

        {/* Stats */}

        <div className="grid sm:grid-cols-2 gap-5 mb-7">
          <div className="bg-white border rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Messages
              </p>

              <h2 className="text-3xl font-bold mt-1">
                {
                  messages.length
                }
              </h2>
            </div>

            <Inbox
              size={27}
            />
          </div>

          <div className="bg-white border rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Unread Messages
              </p>

              <h2 className="text-3xl font-bold mt-1">
                {unreadCount}
              </h2>
            </div>

            <Mail
              size={27}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white border rounded-xl p-12 text-center text-gray-500">
            Loading messages...
          </div>
        ) : messages.length ===
          0 ? (
          <div className="bg-white border rounded-xl px-6 py-20 text-center">
            <Inbox
              size={42}
              className="mx-auto text-gray-400"
            />

            <h2 className="text-2xl font-bold mt-4">
              No messages yet
            </h2>

            <p className="text-gray-500 mt-2">
              Customer contact
              messages will appear
              here.
            </p>
          </div>
        ) : (
          <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6">
            {/* List */}

            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h2 className="font-bold text-lg">
                  Inbox
                </h2>
              </div>

              <div className="divide-y max-h-[680px] overflow-y-auto">
                {messages.map(
                  (message) => (
                    <button
                      key={
                        message._id
                      }
                      type="button"
                      onClick={() =>
                        handleOpenMessage(
                          message
                        )
                      }
                      className={`w-full text-left p-5 transition ${
                        selectedMessage?._id ===
                        message._id
                          ? "bg-gray-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            message.isRead
                              ? "bg-gray-100"
                              : "bg-black !text-white"
                          }`}
                        >
                          {message.isRead ? (
                            <MailOpen
                              size={17}
                            />
                          ) : (
                            <Mail
                              size={17}
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <p
                              className={`truncate ${
                                message.isRead
                                  ? "font-medium"
                                  : "font-bold"
                              }`}
                            >
                              {
                                message.name
                              }
                            </p>

                            {!message.isRead && (
                              <span className="w-2 h-2 rounded-full bg-black mt-2 shrink-0" />
                            )}
                          </div>

                          <p className="text-sm font-medium mt-1 truncate">
                            {
                              message.subject
                            }
                          </p>

                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {
                              message.message
                            }
                          </p>

                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(
                              message.createdAt
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Details */}

            <div className="bg-white border rounded-xl min-h-[500px]">
              {!selectedMessage ? (
                <div className="h-full min-h-[500px] flex items-center justify-center text-center px-8">
                  <div>
                    <Mail
                      size={40}
                      className="mx-auto text-gray-300"
                    />

                    <h2 className="text-xl font-bold mt-4">
                      Select a message
                    </h2>

                    <p className="text-gray-500 mt-2">
                      Choose a
                      customer message
                      from the inbox.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
                        Customer Message
                      </p>

                      <h2 className="text-2xl font-bold mt-2">
                        {
                          selectedMessage.subject
                        }
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={
                          actionLoading ===
                          selectedMessage._id
                        }
                        onClick={() =>
                          toggleRead(
                            selectedMessage
                          )
                        }
                        className="border px-3 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        title={
                          selectedMessage.isRead
                            ? "Mark unread"
                            : "Mark read"
                        }
                      >
                        {selectedMessage.isRead ? (
                          <Mail
                            size={18}
                          />
                        ) : (
                          <MailOpen
                            size={18}
                          />
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={
                          actionLoading ===
                          selectedMessage._id
                        }
                        onClick={() =>
                          handleDelete(
                            selectedMessage
                          )
                        }
                        className="border border-red-200 text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2
                          size={18}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="border-t my-6" />

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex items-start gap-3">
                      <User
                        size={18}
                        className="mt-1 text-gray-500"
                      />

                      <div>
                        <p className="text-xs text-gray-500">
                          Customer
                        </p>

                        <p className="font-semibold mt-1">
                          {
                            selectedMessage.name
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail
                        size={18}
                        className="mt-1 text-gray-500"
                      />

                      <div>
                        <p className="text-xs text-gray-500">
                          Email
                        </p>

                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="font-semibold mt-1 block hover:underline break-all"
                        >
                          {
                            selectedMessage.email
                          }
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 sm:col-span-2">
                      <CalendarDays
                        size={18}
                        className="mt-1 text-gray-500"
                      />

                      <div>
                        <p className="text-xs text-gray-500">
                          Received
                        </p>

                        <p className="font-medium mt-1">
                          {formatDate(
                            selectedMessage.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-sm font-semibold">
                      Message
                    </p>

                    <div className="mt-3 bg-gray-50 border rounded-xl p-5 text-gray-700 leading-7 whitespace-pre-wrap">
                      {
                        selectedMessage.message
                      }
                    </div>
                  </div>

                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject
                    )}`}
                    className="inline-flex items-center gap-2 mt-6 bg-black !text-white px-6 py-3 rounded-lg hover:bg-gray-800"
                  >
                    <Mail
                      size={17}
                    />

                    Reply by Email
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactMessages;