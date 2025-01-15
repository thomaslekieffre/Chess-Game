"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    title: "Créez vos Pièces",
    description:
      "Un éditeur intuitif pour donner vie à vos idées les plus créatives.",
    image: "/knightLP.png",
    imagePosition: "left-0 top-16",
  },
  {
    icon: <Trophy className="w-6 h-6 text-primary" />,
    title: "Mode Compétitif",
    description: "Grimpez les échelons et participez à des tournois exclusifs.",
  },
  {
    icon: <Users className="w-6 h-6 text-primary" />,
    title: "Communauté Active",
    description:
      "Partagez vos créations et découvrez celles des autres joueurs.",
    image: "/bishopLP.png",
    imagePosition: "-right-4 top-64",
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 },
  },
};

export function Features() {
  return (
    <section className="py-24 min-h-screen relative overflow-hidden">
      {features.map(
        (feature, index) =>
          feature.image && (
            <motion.img
              key={`image-${index}`}
              src={feature.image}
              alt=""
              className={`absolute ${feature.imagePosition} ${
                feature.imagePosition.includes("right")
                  ? "rotate-12"
                  : "-rotate-12"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            />
          )
      )}
      <div className="container relative mt-32">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-16 font-['Vina_Sans'] font-light"
        >
          Une Experience Unique
        </motion.h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="mt-4 mb-4">
                  <p className="text-secondary">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
