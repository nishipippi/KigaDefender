'use client'; // Client Componentとしてマーク

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Unit, Enemy, Projectile, PlayerResources, Mutation } from '@/lib/types';
import Shop from './Shop'; // Shopコンポーネントをインポート
import MutationSelection from './MutationSelection'; // MutationSelectionコンポーネントをインポート
import GameOverScreen from './GameOverScreen'; // GameOverScreenコンポーネントをインポート

const CELL_SIZE = 50;
const BOARD_WIDTH = 12; // 20から12に変更
const BOARD_HEIGHT = 20; // 12から20に変更

// XPレベルアップに必要なXPの閾値 (仮の値)
const XP_THRESHOLDS = [0, 100, 250, 500, 1000, 2000]; // レベル1, 2, 3, 4, 5...

export default function GameBoard() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]); // 新規追加
  const [lastSampleHp, setLastSampleHp] = useState(100); // ラスト・サンプルのHP (仮の値)
  const [currentWave, setCurrentWave] = useState(0); // 現在のウェーブ数
  const [isWaveActive, setIsWaveActive] = useState(false); // ウェーブがアクティブかどうか
  const [allEnemiesSpawned, setAllEnemiesSpawned] = useState(false); // すべての敵がスポーンしたかどうか
  const [playerResources, setPlayerResources] = useState<PlayerResources>({ // 新規追加
    cultureFluid: 50, // 初期培養液を増やす
    xp: 0,
    level: 1,
  });
  const [shopUnits, setShopUnits] = useState<Unit[]>([]); // ショップに並ぶユニット
  const [selectedUnitToPlace, setSelectedUnitToPlace] = useState<Unit | null>(null); // 配置するユニット
  const [availableMutations, setAvailableMutations] = useState<Mutation[] | null>(null); // 選択可能な突然変異

  const lastFrameTimeRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // 仮のユニット生成関数 (ショップ用)
  const generateRandomUnit = useCallback((): Unit => {
    // ユニットの種類を増やす場合はここを拡張
    const unitTypes: ('basic' | 'archer' | 'shield')[] = ['basic', 'archer', 'shield'];
    const randomType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
    const baseCost = 10; // 仮の基本コスト

    return {
      id: `shop-unit-${Date.now()}-${Math.random()}`,
      x: -1, // ショップのユニットは盤面にいないので仮の値
      y: -1,
      type: randomType,
      hp: 100,
      attackPower: 20,
      attackSpeed: 1,
      range: 3,
      lastAttackTime: 0,
      cost: baseCost + Math.floor(Math.random() * 5), // コストにばらつき
      level: 1, // 初期レベル
    };
  }, []);

  // ショップの品揃えを生成
  const generateShopUnits = useCallback(() => {
    const newShopUnits: Unit[] = [];
    for (let i = 0; i < 3; i++) { // 3つのユニットをショップに並べる
      newShopUnits.push(generateRandomUnit());
    }
    setShopUnits(newShopUnits);
  }, [generateRandomUnit]);

  // ゲーム状態をリセットする関数
  const resetGame = useCallback(() => {
    setUnits([]);
    setEnemies([]);
    setProjectiles([]);
    setLastSampleHp(100);
    setCurrentWave(0);
    setIsWaveActive(false);
    setAllEnemiesSpawned(false);
    setPlayerResources({
      cultureFluid: 50,
      xp: 0,
      level: 1,
    });
    generateShopUnits(); // ショップを再生成
    setAvailableMutations(null); // 突然変異選択をクリア
  }, [generateShopUnits]);

  // ユニット購入ロジック
  const buyUnit = useCallback((unitToBuy: Unit) => {
    if (playerResources.cultureFluid >= unitToBuy.cost) {
      setPlayerResources(prev => ({
        ...prev,
        cultureFluid: prev.cultureFluid - unitToBuy.cost,
      }));
      setSelectedUnitToPlace({ ...unitToBuy, id: `placed-${Date.now()}-${Math.random()}` }); // 購入したユニットを配置待ち状態にする
      setShopUnits(prevShopUnits => prevShopUnits.filter(u => u.id !== unitToBuy.id)); // ショップから削除
    } else {
      console.log("培養液が足りません！");
    }
  }, [playerResources.cultureFluid]);

  // ショップリロールロジック
  const rerollShop = useCallback(() => {
    const rerollCost = 5; // 仮のリロールコスト
    if (playerResources.cultureFluid >= rerollCost) {
      setPlayerResources(prev => ({
        ...prev,
        cultureFluid: prev.cultureFluid - rerollCost,
      }));
      generateShopUnits(); // 新しい品揃えを生成
    } else {
      console.log("培養液が足りません！");
    }
  }, [playerResources.cultureFluid, generateShopUnits]);

  // ユニット配置/削除ロジック
  const handleCellClick = useCallback((x: number, y: number) => {
    setUnits(prevUnits => {
      const existingUnit = prevUnits.find(unit => unit.x === x && unit.y === y);
      if (existingUnit) {
        // 既存ユニットの削除
        // マージ進化のロジックをここに追加
        if (selectedUnitToPlace &&
            selectedUnitToPlace.type === existingUnit.type &&
            selectedUnitToPlace.level === existingUnit.level &&
            existingUnit.level < 3) { // 仮の最大レベル3
          // マージ処理
          const mergedUnit: Unit = {
            ...existingUnit,
            id: `merged-${Date.now()}-${Math.random()}`,
            level: existingUnit.level + 1,
            hp: existingUnit.hp * 1.5, // 仮のステータス上昇
            attackPower: existingUnit.attackPower * 1.2, // 仮のステータス上昇
            // 他のステータスも更新
          };
          setSelectedUnitToPlace(null); // 配置後、選択状態をクリア
          return prevUnits.filter(unit => unit.id !== existingUnit.id).concat(mergedUnit);
        } else {
          // マージできない場合は既存ユニットを削除
          return prevUnits.filter(unit => unit.id !== existingUnit.id);
        }
      } else if (selectedUnitToPlace) {
        // 選択中のユニットがあれば配置
        const newUnit = { ...selectedUnitToPlace, x, y };
        setSelectedUnitToPlace(null); // 配置後、選択状態をクリア
        return [...prevUnits, newUnit];
      } else {
        // 選択中のユニットがない場合は何もしない
        console.log("配置するユニットが選択されていません。");
        return prevUnits; // 変更なし
      }
    });
  }, [selectedUnitToPlace]); // selectedUnitToPlaceを依存配列に追加

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

  // 突然変異の生成 (仮のデータ)
  const generateMutations = useCallback(() => {
    const allMutations: Mutation[] = [
      {
        id: 'mut1',
        name: '攻撃力強化',
        description: '全てのユニットの攻撃力が10%上昇する。',
        applyEffect: (resources, units, enemies) => ({
          newResources: resources,
          newUnits: units.map(unit => ({ ...unit, attackPower: unit.attackPower * 1.1 })),
          newEnemies: enemies,
        }),
      },
      {
        id: 'mut2',
        name: '培養液ボーナス',
        description: 'ウェーブクリア時に獲得する培養液が20%増加する。',
        applyEffect: (resources, units, enemies) => ({
          newResources: { ...resources, cultureFluid: resources.cultureFluid }, // この効果はウェーブクリア時に別途処理
          newUnits: units,
          newEnemies: enemies,
        }),
      },
      {
        id: 'mut3',
        name: 'HP回復',
        description: 'ラスト・サンプルのHPが20回復する。',
        applyEffect: (resources, units, enemies) => ({
          newResources: resources,
          newUnits: units,
          newEnemies: enemies,
        }),
      },
    ];
    // ランダムに3つ選択 (ここでは仮に最初の3つ)
    setAvailableMutations(allMutations.slice(0, 3));
  }, []);

  // 突然変異を選択した際の処理
  const handleSelectMutation = useCallback((mutation: Mutation) => {
    // 選択された突然変異の効果を適用
    const { newResources, newUnits, newEnemies } = mutation.applyEffect(playerResources, units, enemies);
    setPlayerResources(newResources);
    setUnits(newUnits);
    setEnemies(newEnemies); // 敵はクリアされているはずだが念のため

    // HP回復の突然変異の場合、GameBoardのlastSampleHpを直接更新
    if (mutation.id === 'mut3') {
      setLastSampleHp(prevHp => Math.min(100, prevHp + 20)); // 最大HP100として仮定
    }

    setAvailableMutations(null); // 選択UIを非表示にする
  }, [playerResources, units, enemies]);

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
        setEnemies(prevEnemies => {
          const updatedEnemies = prevEnemies.map(enemy => {
            if (hitEnemies[enemy.id]) {
              return { ...enemy, hp: enemy.hp - hitEnemies[enemy.id] };
            }
            return enemy;
          });

          const defeatedEnemies = updatedEnemies.filter(enemy => enemy.hp <= 0);
          if (defeatedEnemies.length > 0) {
            setPlayerResources(prevResources => {
              let newXp = prevResources.xp + defeatedEnemies.length * 10; // 敵1体につき10XP (仮)
              let newCultureFluid = prevResources.cultureFluid + defeatedEnemies.length * 5; // 敵1体につき5培養液 (仮)
              let newLevel = prevResources.level;

              // レベルアップ判定
              while (newLevel < XP_THRESHOLDS.length && newXp >= XP_THRESHOLDS[newLevel]) {
                newLevel++;
                console.log(`Player Leveled Up to Level ${newLevel}!`);
                // レベルアップ時のボーナスやリセット処理があればここに追加
              }

              return {
                cultureFluid: newCultureFluid,
                xp: newXp,
                level: newLevel,
              };
            });
          }

          return updatedEnemies.filter(enemy => enemy.hp > 0); // HPが0以下の敵を削除
        });

        return newProjectiles; // 衝突した弾丸は削除される
      });

      // ゲームオーバー判定
      if (lastSampleHp <= 0) {
        console.log("GAME OVER!");
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
        // ゲームオーバー画面を表示するためにisWaveActiveをfalseにする
        setIsWaveActive(false);
        return; // ゲームループを停止
      }

      // ウェーブクリア判定 (敵が全ていなくなり、かつ全ての敵がスポーン済みの場合)
      if (enemies.length === 0 && allEnemiesSpawned && lastSampleHp > 0 && isWaveActive) {
        console.log(`WAVE ${currentWave} CLEAR!`); // 仮のウェーブクリア表示
        setIsWaveActive(false); // ウェーブを非アクティブにする
        setAllEnemiesSpawned(false); // フラグをリセット
        setProjectiles([]); // 残っている弾丸をクリア

        // 特定のウェーブで突然変異の選択をトリガー (例: 3ウェーブごと)
        if (currentWave > 0 && currentWave % 3 === 0) {
          generateMutations();
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [enemies, units, lastSampleHp, isWaveActive, currentWave, allEnemiesSpawned, playerResources.level, generateMutations]); // 依存配列にgenerateMutationsを追加

  // コンポーネントマウント時にショップを初期化
  useEffect(() => {
    generateShopUnits();
  }, [generateShopUnits]);

  return (
    <div className="relative w-[600px] h-[1000px] bg-green-800 overflow-hidden border-4 border-gray-900">
      {/* ショップコンポーネント */}
      {!isWaveActive && lastSampleHp > 0 && !availableMutations && ( // 突然変異選択中はショップを非表示
        <Shop
          shopUnits={shopUnits}
          playerResources={playerResources}
          onBuyUnit={buyUnit}
          onReroll={rerollShop}
        />
      )}

      {/* 突然変異選択コンポーネント */}
      {availableMutations && (
        <MutationSelection
          mutations={availableMutations}
          onSelectMutation={handleSelectMutation}
        />
      )}

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

      {/* ゲームオーバー表示 */}
      {lastSampleHp <= 0 && (
        <GameOverScreen
          waveReached={currentWave}
          onRetry={resetGame}
          onGoToMainMenu={() => console.log("メインメニューへ")} // 将来的に実装
        />
      )}
    </div>
  );
}
