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
}

export function PlayerCard({
  name,
  rating,
  time,
  color,
  isCurrentTurn,
}: PlayerCardProps) {
  return (
    <Card className={cn("p-4 mb-4", isCurrentTurn && "border-primary")}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-xl capitalize">{name}</h3>
          <p className="text-sm text-muted-foreground">{rating} Elo</p>
        </div>
        <div className="text-xl font-mono">{time}</div>
      </div>
    </Card>
  );
}
