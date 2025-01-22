import React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  className?: string;
  name: string;
  rating: string;
  time: string;
  color: "white" | "black";
  isCurrentTurn: boolean;
  materialAdvantage?: number;
  selectedTitle?: string;
  selectedBanner?: string | null;
  textColors?: {
    text: string;
    title: string;
    rating: string;
  };
}

export function PlayerCard({
  className,
  name,
  rating,
  time,
  color,
  isCurrentTurn,
  materialAdvantage = 0,
  selectedTitle,
  selectedBanner,
  textColors = {
    text: "#FFFFFF",
    title: "#FFFFFF",
    rating: "",
  },
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

  // console.log("Banner URL:", selectedBanner);

  return (
    <Card
      className={cn(
        "p-4 mb-4",
        className,
        isCurrentTurn && "border-primary",
        selectedBanner ? "bg-cover bg-center" : "bg-white dark:bg-black"
      )}
      style={{
        backgroundImage: selectedBanner ? `url(${selectedBanner})` : undefined,
      }}
    >
      <div className="relative z-10 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3
              className="font-semibold text-xl capitalize"
              style={{ color: textColors.title }}
            >
              {name}
            </h3>
            {selectedTitle && (
              <p
                className="text-xs italic mb-1"
                style={{ color: textColors.text }}
              >
                {selectedTitle}
              </p>
            )}
            <p className="text-sm" style={{ color: textColors.rating }}>
              {rating} Elo
            </p>
            {displayAdvantage()}
          </div>
          <div className="text-xl font-mono" style={{ color: textColors.text }}>
            {time}
          </div>
        </div>
      </div>
    </Card>
  );
}
