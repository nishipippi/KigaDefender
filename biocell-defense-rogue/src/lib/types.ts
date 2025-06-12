export type UnitType = 'assault-bacterium' | 'archer-bacterium' | 'shield-cell' | 'macrophage' | 'culture-yeast' | 'aura-yeast' | 'slow-phage' | 'corrosive-phage';

export type Unit = {
  id: string; // ユニットの一意なID
  x: number;  // 盤面上のX座標 (列)
  y: number;  // 盤面上のY座標 (行)
  type: UnitType;
  hp: number;
  attackPower: number; // 追加
  attackSpeed: number; // 追加 (秒間攻撃回数)
  range: number;       // 追加 (マス数)
  lastAttackTime: number; // 追加: 最後に攻撃したタイムスタンプ
  cost: number; // 追加: ショップでの購入コスト
  level: number; // 追加: ユニットのレベル
  icon: React.FC<React.SVGProps<SVGSVGElement>>; // 追加: ユニットのアイコン
};

// セルの状態を表す型 (ユニットが存在するかどうか)
export interface CellState {
  unit: Unit | null; // セルにユニットがいればUnitType、いなければnull
}

export type Enemy = {
  id: string;
  type: 'basic';
  x: number; // 現在のX座標 (ピクセル単位)
  y: number; // 現在のY座標 (ピクセル単位)
  hp: number;
  maxHp: number;
  speed: number; // ピクセル/秒
};

export type Projectile = { // 新規追加
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  damage: number;
  speed: number;
  currentX: number;
  currentY: number;
  targetId: string; // ターゲットの敵のIDを保存
};

export interface PlayerResources {
  cultureFluid: number;
  xp: number;
  level: number;
}

export interface Mutation {
  id: string;
  name: string;
  description: string;
  applyEffect: (resources: PlayerResources, units: Unit[], enemies: Enemy[]) => {
    newResources: PlayerResources;
    newUnits: Unit[];
    newEnemies: Enemy[];
  };
}
