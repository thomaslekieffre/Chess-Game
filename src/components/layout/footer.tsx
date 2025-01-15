"use client";

import { Mail, Instagram, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

const socialLinks = [
  {
    icon: <Mail className="w-5 h-5" />,
    text: "chessgamefr@gmail.com",
    href: "mailto:chessgamefr@gmail.com",
  },
  {
    icon: <Instagram className="w-5 h-5" />,
    text: "@insta",
    href: "https://instagram.com/chessgamefr",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1 14.66 14.66 0 0 0-4.58 0 10.14 10.14 0 0 0-.53-1.1 16 16 0 0 0-4.13 1.3 17.33 17.33 0 0 0-3 11.59 16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83 3.39 3.39 0 0 0 .42-.33 11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.84 12.41 12.41 0 0 0 1.08 1.78 16.44 16.44 0 0 0 5.06-2.59 17.22 17.22 0 0 0-3-11.59 16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.93 1.93 0 0 1 1.8 2 1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.92 1.92 0 0 1 1.8 2 1.92 1.92 0 0 1-1.8 2z" />
      </svg>
    ),
    text: "Serveur officiel",
    href: "https://discord.gg/AmEhQEygCr",
  },
  {
    icon: <Twitter className="w-5 h-5" />,
    text: "thomasdev59",
    href: "https://twitter.com/thomasdev59",
  },
];

export function Footer() {
  return (
    <footer className="w-full bg-background/80 backdrop-blur-sm border-t">
      <div className="px-8 py-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-display mb-4 text-secondary font-light font-['Vina_Sans']">
              Contact :
            </h3>
            <ul className="space-y-2">
              {socialLinks.map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
                  >
                    {link.icon}
                    <span>{link.text}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="mt-8"
          >
            <Image
              src="/icon/logo.png"
              alt="ChessGame Logo"
              width={60}
              height={60}
            />
          </motion.div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-4 border-t text-sm text-secondary">
          <p>Tous droits réservés © 2025 ChessGame</p>
          <a
            href="/conditions"
            className="hover:text-primary transition-colors"
          >
            Conditions générales
          </a>
        </div>
      </div>
    </footer>
  );
}
