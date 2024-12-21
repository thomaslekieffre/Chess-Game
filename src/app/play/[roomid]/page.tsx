// "use client";

import { Suspense } from "react";
import { GameContent } from "./game-content";

export default async function ClassicGamePage({
  params,
}: {
  params: Promise<{ roomid: string }>
}) {
  const roomId = (await params).roomid
  console.log(roomId)
  return (  
    <main className="min-h-screen pt-20 bg-background">
      <div className="container">
        <Suspense fallback={<div>Chargement...</div>}>
          <GameContent roomId={roomId} />
        </Suspense>
      </div>
    </main>
  );
}
