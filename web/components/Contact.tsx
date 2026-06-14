import React, { useState } from "react";
import { motion } from "framer-motion";

export const Contact: React.FC = () => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("Telegram credentials missing");
      setStatus("error");
      return;
    }

    const text = `
      New Contact Form Submission from mudir:
      Name: ${formData.name}
      Email: ${formData.email}
      Message: ${formData.message}
    `;

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: text,
          }),
        },
      );

      if (response.ok) {
        setStatus("sent");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("error");
    }
  };

  const inputClasses =
    "w-full bg-transparent border-b border-black/20 py-4 text-lg md:text-xl outline-none transition-all duration-300 placeholder:text-black/30";

  return (
    <section className="h-screen w-full snap-center bg-white flex flex-col justify-between px-6 pt-20 md:pt-24 pb-6">
      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-16"
        >
          <h2 className="text-4xl md:text-7xl font-bold tracking-tight mb-4">
            Contact Support.
          </h2>
          <p className="text-base md:text-lg font-light">
            Have questions? We are here to help.
          </p>
        </motion.div>

        <form className="space-y-8 md:space-y-12" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              placeholder="Name"
              className={inputClasses}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              required
            />
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-black"
              initial={{ width: "0%" }}
              animate={{ width: focusedField === "name" ? "100%" : "0%" }}
            />
          </div>

          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              className={inputClasses}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              required
            />
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-black"
              initial={{ width: "0%" }}
              animate={{ width: focusedField === "email" ? "100%" : "0%" }}
            />
          </div>

          <div className="relative">
            <textarea
              rows={1}
              placeholder="Message"
              className={`${inputClasses} resize-none`}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              onFocus={() => setFocusedField("message")}
              onBlur={() => setFocusedField(null)}
              required
            />
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-black"
              initial={{ width: "0%" }}
              animate={{ width: focusedField === "message" ? "100%" : "0%" }}
            />
          </div>

          <button
            disabled={status === "loading" || status === "sent"}
            className="px-10 py-4 border border-black rounded-full text-base md:text-lg font-medium hover:bg-black hover:text-white transition-all duration-300 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading"
              ? "Sending..."
              : status === "sent"
                ? "Message Sent"
                : "Send Message"}
          </button>
          {status === "error" && (
            <p className="text-red-500 text-sm">
              Failed to send message. Please try again.
            </p>
          )}
        </form>
      </div>

      <div className="max-w-7xl w-full mx-auto mt-12 pt-6 border-t border-black flex justify-between text-xs md:text-sm">
        <span>© 2026 Mudir.</span>
        <span>
          Created by{" "}
          <a
            href="https://basharkhan.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="font-bold">basharkhan.com</span>
          </a>
        </span>
      </div>
    </section>
  );
};
