'use client'; // Client Componentとしてマーク

import React, { useState } from 'react';
import { UnitType, CellState } from '@/lib/types'; // 型定義をインポート

const ROWS = 20;
const COLS = 12;

// 初期盤面状態を生成するヘルパー関数
const createInitialBoard = (): CellState[][] => {
  return Array(ROWS).fill(null).map(() =>
    Array(COLS).fill(null).map(() => ({ unit: null }))
  );
};

export default function GameBoard() {
  const [board, setBoard] = useState<CellState[][]>(createInitialBoard());

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => row.map(cell => ({ ...cell }))); // Deep copy
      // 既にユニットがいれば削除、いなければ配置
      if (newBoard[rowIndex][colIndex].unit) {
         newBoard[rowIndex][colIndex].unit = null;
      } else {
        newBoard[rowIndex][colIndex].unit = {
          id: `unit-${rowIndex}-${colIndex}`, // 仮のID
          x: colIndex,
          y: rowIndex,
        };
      }
      return newBoard;
    });
  };

  return (
    <div className="grid grid-cols-12 gap-0.5 bg-gray-700 p-1 w-fit border border-gray-500">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="w-10 h-10 bg-gray-800 border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-700"
            onClick={() => handleCellClick(rowIndex, colIndex)}
            data-testid={`cell-${rowIndex}-${colIndex}`} // テスト用ID
          >
            {cell.unit && (
              <div
                className="w-8 h-8 bg-blue-500 rounded"
                data-testid={`unit-${rowIndex}-${colIndex}`} // テスト用ID
              >
                {/* ユニットの見た目をここに記述 */}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
