import React, { useState } from 'react';
import { motion } from 'motion/react';
import Wordmark from './Wordmark';
import { TranslationSchema } from '../translations';

interface FooterProps {
  t: TranslationSchema['footer'];
}

export const Footer: React.FC<FooterProps> = ({ t }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <motion.footer
      id="footer"
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#070E18] text-[#E2E6E8] border-t border-[#E2E6E8]/20 px-6 sm:px-10 lg:px-16 pt-20 pb-12 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Identity Column */}
          <div className="md:col-span-5 space-y-6">
            <Wordmark size="md" showMedallion={true} />

            <p className="font-body text-xs sm:text-sm text-[#E2E6E8]/80 max-w-sm leading-relaxed">
              {t.brandDesc}
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs font-mono text-[#D8A065]">
              <span className="w-2 h-2 bg-[#D8A065]" />
              <span>CAIRO // BEIRUT // DUBAI // ARCHIVE</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 space-y-4">
            <span className="font-heading text-xs text-[#D8A065] tracking-widest block uppercase">
              {t.navHeading}
            </span>
            <ul className="space-y-2.5 font-body text-xs text-[#E2E6E8]/80">
              <li>
                <a href="#hero" className="hover:text-[#D8A065] transition-colors">
                  {t.topLink}
                </a>
              </li>
              <li>
                <a href="#story" className="hover:text-[#D8A065] transition-colors">
                  {t.conceptLink}
                </a>
              </li>
              <li>
                <a href="#products" className="hover:text-[#D8A065] transition-colors">
                  {t.piecesLink}
                </a>
              </li>
              <li>
                <a href="#editorial" className="hover:text-[#D8A065] transition-colors">
                  LOOKBOOK & FABRICS
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-[#D8A065] transition-colors">
                  CLIENT REVIEWS & STARS
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#D8A065] transition-colors text-[#D8A065]">
                  ATELIER CONCIERGE & CONTACT
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-[#D8A065] transition-colors">
                  FAQ & CARE ARCHIVE
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Atelier Contact & Drops */}
          <div className="md:col-span-4 space-y-4">
            <span className="font-heading text-xs text-[#D8A065] tracking-widest block uppercase">
              DIRECT CONCIERGE & DROPS
            </span>
            <div className="space-y-2 text-xs font-mono bg-[#132238]/60 p-3 border border-[#E2E6E8]/20">
              <div className="text-[#D8A065]">
                WHATSAPP: <a href="https://wa.me/201288224920" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#E2E6E8]">+20 128 822 4920</a>
              </div>
              <div className="text-[#E2E6E8]">
                EMAIL: <a href="https://mail.google.com/mail/?view=cm&fs=1&to=lahabfire@gmail.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#D8A065]" title="Compose in Gmail (New Tab)">lahabfire@gmail.com</a>
              </div>
            </div>
            <p className="font-body text-xs text-[#E2E6E8]/80">
              {t.notifyDesc}
            </p>

            {submitted ? (
              <div className="p-3 bg-[#132238] border border-[#D8A065] text-[#D8A065] text-xs font-mono">
                {t.joinedMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-[#132238] border border-[#E2E6E8]/30 px-3.5 py-2.5 text-xs text-[#E2E6E8] placeholder-[#E2E6E8]/40 focus:outline-none focus:border-[#D8A065]"
                />
                <button
                  type="submit"
                  className="btn-lahab-primary px-5 py-2.5 text-xs font-bold cursor-pointer"
                >
                  {t.joinBtn}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="pt-8 border-t border-[#E2E6E8]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body text-[#E2E6E8]/60">
          <div>{t.copyright}</div>
          <div className="flex items-center gap-6">
            <span>{t.edition}</span>
            <span>SHIPPED IN ACID-FREE PACKAGING</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
export default Footer;
