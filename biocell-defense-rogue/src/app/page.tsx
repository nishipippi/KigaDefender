import GameBoard from '@/app/components/GameBoard';
import Image from "next/image"; // Imageコンポーネントは残しておく

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
      <h1 className="text-4xl font-bold text-white mb-8">
        BioCell Defense Rogue (Prototype)
      </h1>
      <GameBoard />
      {/* 今後、UI要素（スコア、ウェーブ情報など）をここに追加 */}
    </main>
  );
}
