"use client";

import { Suspense } from "react";
import { GameContent } from "./game-content";

export default function ClassicGamePage() {
  return (
    <main className="min-h-screen pt-20 bg-background">
      <div className="container">
        <Suspense fallback={<div>Chargement...</div>}>
          <GameContent />
        </Suspense>
      </div>
    </main>
  );
}
