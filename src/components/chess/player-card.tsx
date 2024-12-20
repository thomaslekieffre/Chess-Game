import React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  name: string;
  rating: number;
  time: string;
  color: "white" | "black";
  isCurrentTurn: boolean;
}

export function PlayerCard({
  name,
  rating,
  time,
  color,
  isCurrentTurn,
}: PlayerCardProps) {
  return (
    <Card
      className={cn(
        "p-6 transition-all duration-300",
        isCurrentTurn && "ring-2 ring-primary"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            {color === "white" ? "♔" : "♚"}
          </div>
          {isCurrentTurn && (
            <motion.div
              className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{rating} ELO</p>
        </div>

        <div className="text-2xl font-mono font-bold">{time}</div>
      </div>
    </Card>
  );
}
