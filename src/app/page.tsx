"use client";

import { Button } from "@/components/ui/button";
import { ChessBoard } from "@/components/chess/board";
import { Play, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedText } from "@/components/ui/animated-text";
import { Features } from "@/components/features";
import { Header } from "@/components/layout/header";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-sm">
        <motion.div>
          <Header />
        </motion.div>
      </nav>

      <section className="relative min-h-screen flex items-center pt-16">
        <div className="container relative z-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <AnimatedText
                text="Réinventez les Échecs"
                className="text-6xl font-bold mb-6"
              />
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-muted-foreground mb-8"
              >
                Créez vos propres pièces. Défiez le monde. Devenez une légende.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-4"
              >
                <Button
                  size="lg"
                  className="hover:scale-105 transition-transform"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Jouer Maintenant
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="hover:scale-105 transition-transform"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Découvrir
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="relative"
            >
              <ChessBoard animated className="opacity-100" />
            </motion.div>
          </div>
        </div>
      </section>

      <Features />
    </main>
  );
}
