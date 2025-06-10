'use client'; // Client Componentとしてマーク

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UnitType, CellState, Enemy } from '@/lib/types'; // 型定義をインポート

const ROWS = 20;
const COLS = 12;
const CELL_SIZE = 40; // 1セルのピクセルサイズ (w-10 h-10 bg-gray-800 border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-700)
const ENEMY_SPEED_PIXELS_PER_SECOND = 50; // 敵の基本速度 (例: 50ピクセル/秒)

// 初期盤面状態を生成するヘルパー関数
const createInitialBoard = (): CellState[][] => {
  return Array(ROWS).fill(null).map(() =>
    Array(COLS).fill(null).map(() => ({ unit: null }))
  );
};

export default function GameBoard() {
  const [board, setBoard] = useState<CellState[][]>(createInitialBoard());
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const lastTimestampRef = useRef<number>(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardOffsetX, setBoardOffsetX] = useState(0);

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
          type: 'basic', // 新しいUnitTypeのプロパティを追加
          hp: 100,       // 仮のHP
        };
      }
      return newBoard;
    });
  };

  const spawnEnemy = useCallback(() => {
    // 0 から COLS-1 の範囲でランダムな列を選択
    const startCol = Math.floor(Math.random() * COLS); 
    const newEnemy: Enemy = {
      id: `enemy-${Date.now()}-${Math.random()}`, // より一意なID
      type: 'basic',
      col: startCol, // ランダムな列を使用
      pixelY: 0,
      hp: 100, // 仮のHP
      speed: ENEMY_SPEED_PIXELS_PER_SECOND,
      targetPixelY: (ROWS - 1) * CELL_SIZE, // 盤面下端のセルの上端
    };
    setEnemies((prevEnemies) => [...prevEnemies, newEnemy]);
  }, []); // COLS, ROWS, CELL_SIZE, ENEMY_SPEED_PIXELS_PER_SECOND は定数としてアクセス可能と想定

  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = (timestamp: number) => {
      if (lastTimestampRef.current === 0) {
        lastTimestampRef.current = timestamp;
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = (timestamp - lastTimestampRef.current) / 1000; // 秒単位
      lastTimestampRef.current = timestamp;

      setEnemies((prevEnemies) =>
        prevEnemies
          .map((enemy) => {
            const newPixelY = enemy.pixelY + enemy.speed * deltaTime;
            if (newPixelY >= enemy.targetPixelY) {
              // ゴール到達: この敵をリストから除外
              console.log(`Enemy ${enemy.id} reached goal.`); // デバッグ用
              return null; 
            }
            return { ...enemy, pixelY: newPixelY };
          })
          .filter((enemy): enemy is Enemy => enemy !== null) // nullを除去 (型ガードも兼ねる)
      );

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lastTimestampRef.current = 0; // クリーンアップ時にリセット
    };
  }, []); // 依存配列は空。ループ内で常に最新のenemiesを扱えるようにsetEnemiesの関数型更新を使用。

  useEffect(() => {
    const updateBoardOffset = () => {
      if (boardRef.current) {
        setBoardOffsetX(boardRef.current.getBoundingClientRect().left);
      }
    };

    updateBoardOffset(); // 初期ロード時
    window.addEventListener('resize', updateBoardOffset); // リサイズ時

    return () => {
      window.removeEventListener('resize', updateBoardOffset);
    };
  }, []);

  return (
    <div className="flex flex-col items-center"> {/* 親要素を追加 */}
      <div 
        ref={boardRef} // ここにrefを追加
        className="grid grid-cols-12 gap-0.5 bg-gray-700 p-1 w-fit border border-gray-500 relative" // relativeを追加
      >
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

        {/* 敵の描画 */}
        {enemies.map((enemy) => (
          <div
            key={enemy.id}
            className="absolute bg-red-500 rounded-full" // 赤い円
            style={{
              width: CELL_SIZE * 0.8, // セルより少し小さく
              height: CELL_SIZE * 0.8,
              left: enemy.col * CELL_SIZE + (CELL_SIZE * 0.1), // 列位置 + 中央寄せオフセット (boardOffsetX を削除)
              top: enemy.pixelY + (CELL_SIZE * 0.1),         // Yピクセル位置 + 中央寄せオフセット
              zIndex: 10, // ユニットより手前に表示
            }}
          />
        ))}
      </div>
      <button 
        onClick={spawnEnemy} 
        className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow"
      >
        敵を出現させる (テスト用)
      </button>
    </div>
  );
}
