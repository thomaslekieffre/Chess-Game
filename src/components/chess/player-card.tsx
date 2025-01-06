import React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  name: string;
  rating: string;
  time: string;
  color: "white" | "black";
  isCurrentTurn: boolean;
  materialAdvantage?: number;
}

export function PlayerCard({
  name,
  rating,
  time,
  color,
  isCurrentTurn,
  materialAdvantage = 0,
}: PlayerCardProps) {
  const displayAdvantage = () => {
    if (materialAdvantage === 0) return null;
    const advantage =
      color === "white" ? materialAdvantage : -materialAdvantage;
    if (advantage <= 0) return null;
    return (
      <div className="text-sm text-green-500 font-semibold">+{advantage}</div>
    );
  };

  return (
    <Card className={cn("p-4 mb-4", isCurrentTurn && "border-primary")}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-xl capitalize">{name}</h3>
          <p className="text-sm text-muted-foreground">{rating} Elo</p>
          {displayAdvantage()}
        </div>
        <div className="text-xl font-mono">{time}</div>
      </div>
    </Card>
  );
}
