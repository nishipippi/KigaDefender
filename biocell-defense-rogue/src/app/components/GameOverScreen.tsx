'use client';

import React from 'react';

interface GameOverScreenProps {
  waveReached: number;
  onRetry: () => void;
  onGoToMainMenu: () => void; // 将来的にメインメニューへ戻る機能
}

export default function GameOverScreen({ waveReached, onRetry, onGoToMainMenu }: GameOverScreenProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-30">
      <div className="bg-gray-900 p-10 rounded-lg shadow-xl text-white text-center border-2 border-red-600">
        <h2 className="text-5xl font-bold text-red-500 mb-6">GAME OVER</h2>
        <p className="text-2xl mb-4">到達ウェーブ: <span className="font-bold text-yellow-400">{waveReached}</span></p>
        {/* 将来的に獲得研究ポイントなどのリザルト表示を追加 */}
        <div className="mt-8 space-y-4">
          <button
            onClick={onRetry}
            className="block w-full px-8 py-3 bg-blue-600 text-white text-xl font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            リトライ
          </button>
          <button
            onClick={onGoToMainMenu}
            className="block w-full px-8 py-3 bg-gray-600 text-white text-xl font-semibold rounded-md hover:bg-gray-700 transition-colors"
          >
            メインメニューへ
          </button>
        </div>
      </div>
    </div>
  );
}
