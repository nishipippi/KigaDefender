'use client';

import React from 'react';
import { Unit, PlayerResources } from '@/lib/types';

interface ShopProps {
  shopUnits: Unit[];
  playerResources: PlayerResources;
  onBuyUnit: (unit: Unit) => void;
  onReroll: () => void;
}

export default function Shop({ shopUnits, playerResources, onBuyUnit, onReroll }: ShopProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800 p-4 rounded-lg shadow-lg z-10">
      <h2 className="text-white text-2xl font-bold mb-4 text-center">ショップ</h2>
      <div className="flex justify-around mb-4">
        {shopUnits.map(unit => (
          <div
            key={unit.id}
            className="bg-gray-700 p-3 rounded-md text-white text-center cursor-pointer hover:bg-gray-600 transition-colors"
            onClick={() => onBuyUnit(unit)}
          >
            <div className="text-lg font-semibold">{unit.type}</div>
            <div className="text-sm">コスト: {unit.cost} 培養液</div>
            {/* 将来的にユニットの画像や詳細情報を表示 */}
          </div>
        ))}
      </div>
      <div className="text-center">
        <button
          onClick={onReroll}
          className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition-colors"
        >
          リロール (コスト: 5 培養液)
        </button>
      </div>
      <div className="mt-4 text-white text-center">
        培養液: {playerResources.cultureFluid} | XP: {playerResources.xp} | レベル: {playerResources.level}
      </div>
    </div>
  );
}
