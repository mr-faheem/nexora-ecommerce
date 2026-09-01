import ContactMessage from "../models/ContactMessage.js";

// ======================================================
// Create Contact Message
// Public
// POST /api/contact
// ======================================================

export const createContactMessage =
  async (req, res) => {
    try {
      const {
        name,
        email,
        subject,
        message,
      } = req.body;

      if (
        !name?.trim() ||
        !email?.trim() ||
        !subject?.trim() ||
        !message?.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "All fields are required.",
          });
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          email.trim()
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Please enter a valid email address.",
          });
      }

      if (
        message.trim().length >
        1000
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Message cannot exceed 1000 characters.",
          });
      }

      const contactMessage =
        await ContactMessage.create(
          {
            name: name.trim(),

            email: email
              .trim()
              .toLowerCase(),

            subject:
              subject.trim(),

            message:
              message.trim(),
          }
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Your message has been received successfully.",

          contactMessage: {
            _id:
              contactMessage._id,

            createdAt:
              contactMessage.createdAt,
          },
        });
    } catch (error) {
      console.error(
        "Create Contact Message Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Server error while sending message.",
        });
    }
  };

// ======================================================
// Get All Messages
// Admin
// GET /api/contact
// ======================================================

export const getContactMessages =
  async (req, res) => {
    try {
      const messages =
        await ContactMessage.find()
          .sort({
            createdAt: -1,
          });

      const unreadCount =
        await ContactMessage.countDocuments(
          {
            isRead: false,
          }
        );

      return res
        .status(200)
        .json({
          success: true,

          count:
            messages.length,

          unreadCount,

          messages,
        });
    } catch (error) {
      console.error(
        "Get Contact Messages Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Server error while fetching messages.",
        });
    }
  };

// ======================================================
// Mark Message Read / Unread
// Admin
// PATCH /api/contact/:id/read
// ======================================================

export const updateMessageReadStatus =
  async (req, res) => {
    try {
      const message =
        await ContactMessage.findById(
          req.params.id
        );

      if (!message) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Contact message not found.",
          });
      }

      const nextStatus =
        req.body.isRead !==
        undefined
          ? req.body.isRead ===
              true ||
            req.body.isRead ===
              "true"
          : true;

      message.isRead =
        nextStatus;

      await message.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            nextStatus
              ? "Message marked as read."
              : "Message marked as unread.",

          contactMessage:
            message,
        });
    } catch (error) {
      console.error(
        "Update Contact Message Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Server error while updating message.",
        });
    }
  };

// ======================================================
// Delete Message
// Admin
// DELETE /api/contact/:id
// ======================================================

export const deleteContactMessage =
  async (req, res) => {
    try {
      const message =
        await ContactMessage.findById(
          req.params.id
        );

      if (!message) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Contact message not found.",
          });
      }

      await message.deleteOne();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Contact message deleted successfully.",
        });
    } catch (error) {
      console.error(
        "Delete Contact Message Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Server error while deleting message.",
        });
    }
  };