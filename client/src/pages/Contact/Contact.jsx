import {
  useState,
} from "react";

import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import api from "../../api/axios";

function Contact() {
  const [
    form,
    setForm,
  ] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,

        [name]: value,
      })
    );

    if (success) {
      setSuccess("");
    }

    if (error) {
      setError("");
    }
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (submitting) {
        return;
      }

      try {
        setSubmitting(true);

        setSuccess("");
        setError("");

        await api.post(
          "/contact",
          form
        );

        setForm({
          name: "",
          email: "",
          subject: "",
          message: "",
        });

        setSuccess(
          "Message sent successfully. Our team will get back to you soon."
        );
      } catch (error) {
        console.error(
          "Contact Message Error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to send your message. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <div className="bg-white">
      {/* Header */}

      <section className="bg-neutral-100 border-b">
        <div className="max-w-7xl mx-auto px-6 py-14 md:py-16">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
            Contact Nexora
          </p>

          <h1 className="text-4xl md:text-6xl font-bold mt-4">
            How can we help?
          </h1>

          <p className="text-gray-600 mt-5 max-w-2xl leading-7">
            Have a question about
            your order, product or
            shopping experience?
            Send us a message and
            our team will get back
            to you.
          </p>
        </div>
      </section>

      {/* Content */}

      <section className="max-w-7xl mx-auto px-6 py-14 md:py-16">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
          {/* Left */}

          <div>
            <h2 className="text-3xl font-bold">
              Get in touch
            </h2>

            <p className="text-gray-500 mt-4 leading-7 max-w-md">
              Our support team is
              here to help with
              shopping, orders and
              general questions.
            </p>

            <div className="mt-9 space-y-6">
              {/* Email */}

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <Mail
                    size={20}
                  />
                </div>

                <div>
                  <p className="font-semibold">
                    Email
                  </p>

                  <p className="text-gray-500 mt-1">
                    support@nexora.com
                  </p>
                </div>
              </div>

              {/* Phone */}

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <Phone
                    size={20}
                  />
                </div>

                <div>
                  <p className="font-semibold">
                    Phone
                  </p>

                  <p className="text-gray-500 mt-1">
                    +91 XXXXX XXXXX
                  </p>
                </div>
              </div>

              {/* Location */}

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <MapPin
                    size={20}
                  />
                </div>

                <div>
                  <p className="font-semibold">
                    Location
                  </p>

                  <p className="text-gray-500 mt-1">
                    India
                  </p>
                </div>
              </div>

              {/* Hours */}

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <Clock
                    size={20}
                  />
                </div>

                <div>
                  <p className="font-semibold">
                    Support Hours
                  </p>

                  <p className="text-gray-500 mt-1 leading-6">
                    Monday - Saturday
                    <br />
                    10:00 AM - 7:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Order Tip */}

            <div className="mt-10 bg-neutral-100 rounded-2xl p-6 max-w-md">
              <h3 className="font-bold">
                Order related query?
              </h3>

              <p className="text-gray-500 text-sm leading-6 mt-3">
                Include your Order
                ID in the subject or
                message so our team
                can help you faster.
              </p>
            </div>
          </div>

          {/* Form */}

          <form
            onSubmit={
              handleSubmit
            }
            className="border border-gray-200 rounded-3xl p-7 md:p-9 bg-white"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
                Customer Support
              </p>

              <h2 className="text-2xl md:text-3xl font-bold mt-2">
                Send a message
              </h2>

              <p className="text-gray-500 mt-2">
                Fill in the details
                below and our team
                will respond as soon
                as possible.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 mt-7">
              <div>
                <label className="block font-medium text-sm mb-2">
                  Name
                </label>

                <input
                  required
                  maxLength={100}
                  name="name"
                  value={
                    form.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Your name"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block font-medium text-sm mb-2">
                  Email
                </label>

                <input
                  required
                  type="email"
                  maxLength={150}
                  name="email"
                  value={
                    form.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="block font-medium text-sm mb-2">
                Subject
              </label>

              <input
                required
                maxLength={200}
                name="subject"
                value={
                  form.subject
                }
                onChange={
                  handleChange
                }
                placeholder="How can we help?"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition"
              />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-4 mb-2">
                <label className="font-medium text-sm">
                  Message
                </label>

                <span className="text-xs text-gray-400">
                  {
                    form.message
                      .length
                  }
                  /1000
                </span>
              </div>

              <textarea
                required
                rows="5"
                maxLength={1000}
                name="message"
                value={
                  form.message
                }
                onChange={
                  handleChange
                }
                placeholder="Write your message..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition resize-none"
              />
            </div>

            {/* Button */}

            <button
              type="submit"
              disabled={
                submitting
              }
              className="mt-6 bg-black !text-white px-7 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Send
                size={18}
              />

              {submitting
                ? "Sending..."
                : "Send Message"}
            </button>

            {/* RESULT — RIGHT BESIDE ACTION AREA */}

            {success && (
              <div className="mt-4 flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <p className="text-sm font-medium leading-6">
                  {success}
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <p className="text-sm font-medium leading-6">
                  {error}
                </p>
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}

export default Contact;