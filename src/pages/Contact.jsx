import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ContactComingSoon() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  const siteEmail = ""; // <-- change to your email
  const whatsappNumber = ""; // <-- change to your WhatsApp number (E.164)

  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus({ type: "error", text: "Please fill all fields." });
      return;
    }

    // Simple mailto fallback so the page works without a backend.
    const subject = encodeURIComponent(`Contact from ${name} (Coming Soon)`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${siteEmail}?subject=${subject}&body=${body}`;

    setStatus({ type: "success", text: "Opening your email client..." });
  }

  function sendWhatsApp() {
    if (!message) {
      setStatus({ type: "error", text: "Please write a message to send via WhatsApp." });
      return;
    }
    const text = encodeURIComponent(`Contact from ${name || "Visitor"} (${email || "no-email"}):\n\n${message}`);
    const url = `https://wa.me/${whatsappNumber.replace(/^\+/, "")}?text=${text}`;
    window.open(url, "_blank");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        <div className="p-8 bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Contact</h1>
            <p className="mt-3 text-indigo-100/90 leading-relaxed">
              Our site is <strong>coming soon</strong>. Leave your message and we will reach out as soon as the launch
              goes live.
            </p>

            <div className="mt-6 space-y-4 text-sm text-indigo-100/90">
              <div>
                <span className="font-semibold">Email:</span> <a href={`mailto:${siteEmail}`} className="underline">{siteEmail}</a>
              </div>
              <div>
                <span className="font-semibold">WhatsApp:</span> <span>{whatsappNumber}</span>
              </div>
              <div>
                <span className="font-semibold">Status:</span> <span className="inline-block bg-white/10 px-2 py-0.5 rounded">Coming Soon</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs text-indigo-100/80">Follow us</p>
            <div className="mt-3 flex gap-3">
              {/* simple social icons - replace links */}
              <a href="#" aria-label="twitter" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.92c-.66.29-1.36.5-2.1.59a3.6 3.6 0 0 0 1.58-1.99 7.18 7.18 0 0 1-2.28.87 3.58 3.58 0 0 0-6.1 3.26A10.16 10.16 0 0 1 3.15 4.8a3.58 3.58 0 0 0 1.11 4.78c-.54-.02-1.05-.16-1.5-.4v.04a3.58 3.58 0 0 0 2.87 3.51c-.27.07-.56.1-.86.1-.21 0-.42-.02-.62-.06a3.58 3.58 0 0 0 3.34 2.49A7.19 7.19 0 0 1 2 18.57 10.15 10.15 0 0 0 7.3 20c6.02 0 9.32-4.98 9.32-9.31v-.42A6.62 6.62 0 0 0 22 5.92z"/></svg>
              </a>
              <a href="#" aria-label="facebook" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07c0 4.99 3.66 9.12 8.44 9.93v-7.03H7.9v-2.9h2.54V9.4c0-2.5 1.49-3.87 3.77-3.87 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.62.77-1.62 1.56v1.88h2.77l-.44 2.9h-2.33V22C18.34 21.19 22 17.06 22 12.07z"/></svg>
              </a>
              <a href="#" aria-label="instagram" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.5A4.5 4.5 0 1 0 16.5 13 4.5 4.5 0 0 0 12 8.5zm6.5-2.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Get in touch</h2>
              <p className="mt-1 text-sm text-gray-500">We’re launching soon — tell us what you’d like to see.</p>
            </div>
            <div className="text-xs bg-yellow-100 text-yellow-900 px-3 py-1 rounded-full">Coming Soon</div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent p-2"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent p-2"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-transparent p-2"
                placeholder="Tell us something about your project or question"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:opacity-95"
              >
                Send Email
              </button>

              <button
                type="button"
                // onClick={sendWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold shadow"
              >
                Send via WhatsApp
              </button>

              <button
                type="button"
                onClick={() => {
                  setName("");
                  setEmail("");
                  setMessage("");
                  setStatus(null);
                }}
                className="ml-auto text-sm text-gray-500 underline"
              >
                Clear
              </button>
            </div>

            {status && (
              <div
                className={`mt-2 text-sm ${status.type === "error" ? "text-red-600" : "text-green-700"}`}
              >
                {status.text}
              </div>
            )}
          </form>

          <div className="mt-6 text-xs text-gray-400">
            <p>
              This contact page is for a "Coming Soon" site. If you want submissions saved to a database or emailed
              automatically, connect the form to your backend API (POST /api/contact) or use services like Formspree,
              Netlify Forms, or a simple Node/Express endpoint.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
