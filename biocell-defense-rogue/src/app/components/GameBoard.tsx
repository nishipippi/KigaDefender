'use client'; // Client Componentとしてマーク

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Unit, Enemy, Projectile } from '@/lib/types'; // Projectileを追加

const CELL_SIZE = 50;
const BOARD_WIDTH = 12; // 20から12に変更
const BOARD_HEIGHT = 20; // 12から20に変更

export default function GameBoard() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]); // 新規追加
  const [lastSampleHp, setLastSampleHp] = useState(100); // ラスト・サンプルのHP (仮の値)
  const [currentWave, setCurrentWave] = useState(0); // 現在のウェーブ数
  const [isWaveActive, setIsWaveActive] = useState(false); // ウェーブがアクティブかどうか
  const [allEnemiesSpawned, setAllEnemiesSpawned] = useState(false); // すべての敵がスポーンしたかどうか

  const lastFrameTimeRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // ユニット配置/削除ロジック
  const handleCellClick = useCallback((x: number, y: number) => {
    setUnits(prevUnits => {
      const existingUnit = prevUnits.find(unit => unit.x === x && unit.y === y);
      if (existingUnit) {
        return prevUnits.filter(unit => unit.id !== existingUnit.id);
      } else {
        // 仮のユニットデータに攻撃関連のプロパティを追加
        return [...prevUnits, {
          id: `unit-${Date.now()}-${Math.random()}`,
          type: 'basic',
          x,
          y,
          hp: 100, // 仮のHP
          attackPower: 20, // 仮の値
          attackSpeed: 1,  // 仮の値 (1秒に1回)
          range: 3,        // 仮の値 (3マス)
          lastAttackTime: 0, // 初期値
        }];
      }
    });
  }, []);

  // 敵の出現ロジック
  const startWave = useCallback(() => {
    if (isWaveActive) return; // 既にウェーブがアクティブなら何もしない

    setCurrentWave(prevWave => prevWave + 1);
    setIsWaveActive(true); // ここでウェーブをアクティブにする
    setAllEnemiesSpawned(false); // 新しいウェーブ開始時にリセット
    setEnemies([]); // 前のウェーブの敵をクリア
    setProjectiles([]); // 残っている弾丸をクリア

    // 仮の敵出現ロジック (ウェーブ数に応じて調整可能)
    const numEnemies = 5 + currentWave * 2; // ウェーブが進むごとに敵を増やす
    let enemiesSpawnedCount = 0; // 生成された敵の数をカウント
    for (let i = 0; i < numEnemies; i++) {
      setTimeout(() => {
        setEnemies(prevEnemies => {
          const startX = Math.floor(Math.random() * BOARD_WIDTH);
          return [...prevEnemies, {
            id: `enemy-${Date.now()}-${Math.random()}`,
            type: 'basic',
            x: startX * CELL_SIZE + CELL_SIZE / 2, // 中央に配置
            y: 0,
            hp: 100 + currentWave * 10, // ウェーブが進むごとにHPを増やす
            maxHp: 100 + currentWave * 10,
            speed: 20 + currentWave * 2, // ウェーブが進むごとに速度を増やす
          }];
        });
        enemiesSpawnedCount++;
        if (enemiesSpawnedCount === numEnemies) {
          // すべての敵が生成された後にフラグを立てる
          setAllEnemiesSpawned(true);
        }
      }, i * 500); // 0.5秒ごとに敵を出現させる
    }
  }, [currentWave, isWaveActive]); // isWaveActiveを依存配列に追加

  // ゲームループ
  useEffect(() => {
    const gameLoop = (currentTime: DOMHighResTimeStamp) => {
      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000; // 秒単位
      lastFrameTimeRef.current = currentTime;

      if (!isWaveActive) {
        animationFrameIdRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // 敵の移動とゴール判定
      setEnemies(prevEnemies => {
        const newEnemies: Enemy[] = [];
        let hpLostThisFrame = 0;

        prevEnemies.forEach(enemy => {
          const newY = enemy.y + enemy.speed * deltaTime;
          if (newY >= BOARD_HEIGHT * CELL_SIZE) { // 画面下端に到達
            hpLostThisFrame += 10; // 仮のダメージ量
          } else {
            newEnemies.push({ ...enemy, y: newY });
          }
        });

        if (hpLostThisFrame > 0) {
          setLastSampleHp(prevHp => Math.max(0, prevHp - hpLostThisFrame));
        }
        return newEnemies;
      });

      // ユニットの攻撃ロジック
      setUnits(prevUnits => {
        const newUnits = prevUnits.map(unit => {
          // 攻撃クールダウンチェック
          if (currentTime - unit.lastAttackTime < (1000 / unit.attackSpeed)) {
            return unit; // まだ攻撃できない
          }

          // 索敵: 射程内の最も近い敵を探す
          const targetEnemy = enemies.reduce((closest: Enemy | null, currentEnemy) => {
            const unitCenterX = unit.x * CELL_SIZE + CELL_SIZE / 2;
            const unitCenterY = unit.y * CELL_SIZE + CELL_SIZE / 2;
            const distance = Math.sqrt(
              Math.pow(currentEnemy.x - unitCenterX, 2) +
              Math.pow(currentEnemy.y - unitCenterY, 2)
            );
            // 射程をピクセル単位に変換
            const rangeInPixels = unit.range * CELL_SIZE;

            if (distance <= rangeInPixels) {
              if (!closest || distance < Math.sqrt(Math.pow(closest.x - unitCenterX, 2) + Math.pow(closest.y - unitCenterY, 2))) {
                return currentEnemy;
              }
            }
            return closest;
          }, null);

          if (targetEnemy) {
            // 攻撃実行: 弾丸を生成
            setProjectiles(prevProjectiles => [
              ...prevProjectiles,
              {
                id: `proj-${Date.now()}-${Math.random()}`,
                startX: unit.x * CELL_SIZE + CELL_SIZE / 2,
                startY: unit.y * CELL_SIZE + CELL_SIZE / 2,
                targetX: targetEnemy.x,
                targetY: targetEnemy.y,
                damage: unit.attackPower,
                speed: 500, // 弾丸の速度 (pixels/sec)
                currentX: unit.x * CELL_SIZE + CELL_SIZE / 2,
                currentY: unit.y * CELL_SIZE + CELL_SIZE / 2,
                targetId: targetEnemy.id, // ターゲットの敵のIDを保存
              },
            ]);
            return { ...unit, lastAttackTime: currentTime }; // 攻撃時間を更新
          }
          return unit;
        });
        return newUnits;
      });

      // 弾丸の移動と衝突判定
      setProjectiles(prevProjectiles => {
        const newProjectiles: Projectile[] = [];
        const hitEnemies: { [key: string]: number } = {}; // 敵IDとダメージのマップ

        prevProjectiles.forEach(projectile => {
          const dx = projectile.targetX - projectile.currentX;
          const dy = projectile.targetY - projectile.currentY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // 弾丸がターゲットに十分近づいたか、または通り過ぎたか
          const targetReached = distance < (projectile.speed * deltaTime) || (
            (dx > 0 && projectile.currentX > projectile.targetX) ||
            (dx < 0 && projectile.currentX < projectile.targetX) ||
            (dy > 0 && projectile.currentY > projectile.targetY) ||
            (dy < 0 && projectile.currentY < projectile.targetY)
          );

          if (targetReached) {
            // ターゲットに到達したとみなし、ダメージを蓄積
            hitEnemies[projectile.targetId] = (hitEnemies[projectile.targetId] || 0) + projectile.damage;
          } else {
            // 弾丸を移動
            const ratio = (projectile.speed * deltaTime) / distance;
            newProjectiles.push({
              ...projectile,
              currentX: projectile.currentX + dx * ratio,
              currentY: projectile.currentY + dy * ratio,
            });
          }
        });

        // 敵のHPを更新し、HPが0になった敵を削除
        setEnemies(prevEnemies =>
          prevEnemies.map(enemy => {
            if (hitEnemies[enemy.id]) {
              return { ...enemy, hp: enemy.hp - hitEnemies[enemy.id] };
            }
            return enemy;
          }).filter(enemy => enemy.hp > 0) // HPが0以下の敵を削除
        );

        return newProjectiles; // 衝突した弾丸は削除される
      });

      // ゲームオーバー判定
      if (lastSampleHp <= 0) {
        console.log("GAME OVER!"); // 仮のゲームオーバー表示
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
        return; // ゲームループを停止
      }

      // ウェーブクリア判定 (敵が全ていなくなり、かつ全ての敵がスポーン済みの場合)
      if (enemies.length === 0 && allEnemiesSpawned && lastSampleHp > 0 && isWaveActive) {
        console.log(`WAVE ${currentWave} CLEAR!`); // 仮のウェーブクリア表示
        setIsWaveActive(false); // ウェーブを非アクティブにする
        setAllEnemiesSpawned(false); // フラグをリセット
        setProjectiles([]); // 残っている弾丸をクリア
      }

      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [enemies, units, lastSampleHp, isWaveActive, currentWave, allEnemiesSpawned]); // 依存配列を更新

  return (
    <div className="relative w-[600px] h-[1000px] bg-green-800 overflow-hidden border-4 border-gray-900">
      {/* グリッド描画 */}
      {Array.from({ length: BOARD_HEIGHT }).map((_, rowIndex) => (
        Array.from({ length: BOARD_WIDTH }).map((__, colIndex) => (
          <div
            key={`${colIndex}-${rowIndex}`}
            className="absolute border border-green-700"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: colIndex * CELL_SIZE,
              top: rowIndex * CELL_SIZE,
            }}
            onClick={() => handleCellClick(colIndex, rowIndex)}
          />
        ))
      ))}

      {/* ユニット描画 */}
      {units.map(unit => (
        <div
          key={unit.id}
          className="absolute bg-blue-500 rounded-sm"
          style={{
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            left: unit.x * CELL_SIZE + 2,
            top: unit.y * CELL_SIZE + 2,
          }}
        />
      ))}

      {/* 敵描画 */}
      {enemies.map(enemy => (
        <div
          key={enemy.id}
          className="absolute bg-red-500 rounded-full"
          style={{
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            left: enemy.x - (CELL_SIZE / 2 - 2), // 中心を基準に調整
            top: enemy.y - (CELL_SIZE / 2 - 2), // 中心を基準に調整
          }}
        />
      ))}

      {/* 弾丸描画 */}
      {projectiles.map(projectile => (
        <div
          key={projectile.id}
          className="absolute bg-yellow-300 rounded-full"
          style={{
            width: 10,
            height: 10,
            left: projectile.currentX - 5,
            top: projectile.currentY - 5,
          }}
        />
      ))}

      {/* ウェーブ開始ボタン */}
      {!isWaveActive && lastSampleHp > 0 && (
        <button
          onClick={startWave}
          className="absolute bottom-4 left-4 px-4 py-2 bg-blue-700 text-white rounded"
        >
          ウェーブ {currentWave + 1} 開始
        </button>
      )}

      {/* 敵出現ボタン (デバッグ用、ウェーブ開始ボタンと併用しない) */}
      {/* <button
        onClick={spawnEnemy}
        className="absolute bottom-4 left-4 px-4 py-2 bg-gray-700 text-white rounded"
      >
        敵を出現させる
      </button> */}

      {/* ラスト・サンプルのHP表示 */}
      <div className="absolute top-4 right-4 text-white text-xl font-bold">
        HP: {lastSampleHp}
      </div>

      {/* ウェーブ数表示 */}
      <div className="absolute top-4 left-4 text-white text-xl font-bold">
        ウェーブ: {currentWave}
      </div>

      {/* ゲームオーバー表示 (仮) */}
      {lastSampleHp <= 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white text-5xl font-bold">
          GAME OVER
        </div>
      )}
    </div>
  );
}
