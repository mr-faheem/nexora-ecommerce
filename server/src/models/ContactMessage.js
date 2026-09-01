import mongoose from "mongoose";

const contactMessageSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: [
          true,
          "Name is required.",
        ],
        trim: true,
        maxlength: 100,
      },

      email: {
        type: String,
        required: [
          true,
          "Email is required.",
        ],
        trim: true,
        lowercase: true,
        maxlength: 150,
      },

      subject: {
        type: String,
        required: [
          true,
          "Subject is required.",
        ],
        trim: true,
        maxlength: 200,
      },

      message: {
        type: String,
        required: [
          true,
          "Message is required.",
        ],
        trim: true,
        maxlength: 1000,
      },

      isRead: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

const ContactMessage =
  mongoose.model(
    "ContactMessage",
    contactMessageSchema
  );

export default ContactMessage;