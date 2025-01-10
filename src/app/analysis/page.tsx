"use client";

import { AnalysisBoard } from "@/components/chess/analysis-board";

export default function AnalysisPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Analyse d&apos;échecs
      </h1>

      <div className="bg-gray-800 rounded-lg p-6">
        <AnalysisBoard
          className="w-full"
          initialFen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        />
      </div>

      <div className="mt-6 text-gray-300">
        <h2 className="text-xl font-semibold mb-4">Instructions :</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Jouez des coups pour les deux camps</li>
          <li>
            Créez des variantes en jouant un coup différent à partir d&apos;une
            position précédente
          </li>
          <li>Cliquez sur une variante pour l&apos;explorer</li>
          <li>Exportez votre analyse en PGN ou FEN</li>
        </ul>
      </div>
    </div>
  );
}
