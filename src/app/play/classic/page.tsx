"use client";

import { Button } from "@/components/ui/button";
import { Timer, Zap, Gauge } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const timeControls = [
  {
    name: "Bullet",
    time: 1,
    icon: <Zap className="w-6 h-6" />,
    description: "1 minute par joueur",
  },
  {
    name: "Blitz",
    time: 3,
    icon: <Timer className="w-6 h-6" />,
    description: "3 minutes par joueur",
  },
  {
    name: "Rapide",
    time: 10,
    icon: <Gauge className="w-6 h-6" />,
    description: "10 minutes par joueur",
  },
];

export default function ClassicModePage() {
  const router = useRouter();

  const handleTimeControlSelect = (minutes: number) => {
    router.push(`/play/classic/game?time=${minutes}`);
  };

  return (
    <main className="min-h-screen pt-20 bg-background">
      <div className="container max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-center"
        >
          Choisissez votre cadence
        </motion.h1>

        <div className="grid md:grid-cols-3 gap-6">
          {timeControls.map((control, index) => (
            <motion.div
              key={control.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full h-auto p-6 hover:border-primary"
                onClick={() => handleTimeControlSelect(control.time)}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {control.icon}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{control.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {control.description}
                    </p>
                  </div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
