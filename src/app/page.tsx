"use client";

import { Button } from "@/components/ui/button";
import { Play, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedText } from "@/components/ui/animated-text";
import { Features } from "@/components/features";
import { Header } from "@/components/layout/header";
import { DemoBoard } from "@/components/chess/demo-board";

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
          <div className="flex items-center">
            <div className="w-1/2">
              <AnimatedText
                text="Reinventez les echecs !"
                className="text-5xl font-bold mb-6 font-['Vina_Sans'] font-light"
              />
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-secondary mb-8 font-light max-w-xl"
              >
                <br />
                <br />
                Avec ChessGame, faites bcp de blabla pour avoir un long pavé et
                peut etre que vous pourrez être marketing chez nous pour bien
                pub et avoir des users. Plus il y a d&apos;users plus il y aura
                d&apos;activité et de hype autour. Plus il y a de hype, plus les
                gens paieront et donc on aura plus d&apos;€.
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
                  variant="outline"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Jouer Maintenant
                </Button>
                <Button
                  size="lg"
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
              className="absolute right-0 w-[45%] h-[80vh]"
              style={{
                transform: "translateX(5%)",
              }}
            >
              <img
                src="/echiquier.png"
                alt="Echiquier"
                className="w-full h-full object-cover"
                style={{
                  objectPosition: "center right",
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      <Features />
    </main>
  );
}
