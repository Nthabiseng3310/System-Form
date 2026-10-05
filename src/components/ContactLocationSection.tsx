import React, { useState } from 'react';
import { BUSINESS_INFO } from '../data/treatments';
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  Instagram,
  Facebook,
  MessageSquare,
  Clock,
} from 'lucide-react';

export const ContactLocationSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    // Simulate sending message to rakuoanenthabiseng17@gmail.com
    setTimeout(() => {
      setIsSending(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <section id="contact" className="py-20 sm:py-24 bg-[#FAF7F2] text-[#2D2723]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-[#8C6D46] font-semibold mb-2 block">
            Get In Touch
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1C2E24] font-normal tracking-tight mb-4"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            Location &amp; Inquiries
          </h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mb-6" />
          <p className="text-sm sm:text-base text-[#5A4F47] leading-relaxed">
            Conveniently situated in the leafy Sandton / Fourways precinct. Feel free to contact us with any questions or special requests.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details & Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC8] shadow-sm space-y-6">
              <h3
                className="text-xl sm:text-2xl font-serif text-[#1C2E24]"
                style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
              >
                Studio Contacts
              </h3>

              <div className="space-y-5 text-xs sm:text-sm">
                {/* Location */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#1C2E24]/5 text-[#1C2E24] shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#1C2E24]" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#8C6D46] font-semibold block mb-0.5">
                      Location
                    </span>
                    <p className="font-medium text-[#1C2E24]">{BUSINESS_INFO.area}</p>
                    <p className="text-xs text-[#8C7E74] mt-1 italic">
                      (Exact street address &amp; private gate code provided upon confirmed booking for guest privacy)
                    </p>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#1C2E24]/5 text-[#1C2E24] shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-[#1C2E24]" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#8C6D46] font-semibold block mb-0.5">
                      Phone &amp; WhatsApp
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={BUSINESS_INFO.phoneCall}
                        className="font-medium text-[#1C2E24] hover:text-[#8C6D46] underline decoration-[#C5A880] underline-offset-4"
                      >
                        {BUSINESS_INFO.phoneDisplay}
                      </a>
                      <a
                        href={BUSINESS_INFO.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#25D366] hover:underline"
                      >
                        <MessageSquare className="w-3 h-3 fill-[#25D366]" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#1C2E24]/5 text-[#1C2E24] shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-[#1C2E24]" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#8C6D46] font-semibold block mb-0.5">
                      Direct Email
                    </span>
                    <a
                      href={`mailto:${BUSINESS_INFO.email}`}
                      className="font-medium text-[#1C2E24] hover:text-[#8C6D46] break-all underline decoration-[#C5A880] underline-offset-4"
                    >
                      {BUSINESS_INFO.email}
                    </a>
                  </div>
                </div>

                {/* Studio Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#1C2E24]/5 text-[#1C2E24] shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-[#1C2E24]" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#8C6D46] font-semibold block mb-0.5">
                      Operating Schedule
                    </span>
                    <p className="text-[#2E2824]">{BUSINESS_INFO.openDaysText}</p>
                    <p className="text-xs text-[#8C7E74]">{BUSINESS_INFO.closedDaysText}</p>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-[#F0EAE2] flex items-center justify-between">
                <span className="text-xs text-[#8C6D46] font-medium">Follow Nthabi's Touch</span>
                <div className="flex items-center gap-2">
                  <a
                    href="#"
                    title="Instagram (Add handle later)"
                    className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E0D5C7] flex items-center justify-center text-[#1C2E24] hover:bg-[#1C2E24] hover:text-[#FAF7F2] transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="#"
                    title="Facebook (Add link later)"
                    className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E0D5C7] flex items-center justify-center text-[#1C2E24] hover:bg-[#1C2E24] hover:text-[#FAF7F2] transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form & Google Map (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Embedded Google Map */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#E8DEC8] shadow-sm">
              <div className="h-64 sm:h-72 w-full relative bg-[#EFEAE2]">
                <iframe
                  title="Nthabi's Touch Spa Location - Sandton / Fourways area, Johannesburg"
                  src="https://maps.google.com/maps?q=Fourways%20Mall,%20Sandton,%20Johannesburg&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="p-4 bg-[#FAF8F5] border-t border-[#E8DEC8] text-xs text-[#6B5E55] flex items-center justify-between">
                <span>📍 Sandton &amp; Fourways District, Johannesburg</span>
                <span className="text-[#8C6D46] font-medium">Secure Visitor Parking Available</span>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC8] shadow-sm">
              <h3
                className="text-xl sm:text-2xl font-serif text-[#1C2E24] mb-2"
                style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
              >
                Send Us a Message
              </h3>
              <p className="text-xs text-[#6B5E55] mb-5">
                Have a question regarding treatments, tailored packages, or special requests? Drop us a note below.
              </p>

              {submitted ? (
                <div className="p-5 rounded-2xl bg-[#F0F5F2] border border-[#C5DDD0] text-center text-[#1C452C] space-y-2 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-[#24613E]" />
                  <h4 className="font-serif text-lg font-medium text-[#1C2E24]">Thank You</h4>
                  <p className="text-xs leading-relaxed">
                    Your inquiry has been dispatched to <strong>{BUSINESS_INFO.email}</strong>. Our team will get back to you promptly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setPhone('');
                      setMessage('');
                    }}
                    className="mt-3 text-xs text-[#1C2E24] underline font-medium"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Zanele Khumalo"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none focus:border-[#1C2E24]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 076 200 6014"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none focus:border-[#1C2E24]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. zanele@example.co.za"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none focus:border-[#1C2E24]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we assist you?"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none focus:border-[#1C2E24]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#1C2E24] hover:bg-[#284133] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{isSending ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
