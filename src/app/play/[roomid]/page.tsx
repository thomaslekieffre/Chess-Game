// "use client";

import { Suspense } from "react";
import { GameContent } from "./game-content";

export default async function ClassicGamePage({
  params,
}: {
  params: Promise<{ roomid: string }>;
}) {
  const roomId = (await params).roomid;
  return (
    <main className="min-h-screen bg-background">
      <div className="h-full pt-16">
        <Suspense fallback={<div>Chargement...</div>}>
          <GameContent roomId={roomId} />
        </Suspense>
      </div>
    </main>
  );
}
