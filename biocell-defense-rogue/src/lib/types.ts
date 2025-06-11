export type Unit = {
  id: string; // ユニットの一意なID
  x: number;  // 盤面上のX座標 (列)
  y: number;  // 盤面上のY座標 (行)
  type: 'basic'; // 'basic', 'archer', 'shield', etc.
  hp: number;
  attackPower: number; // 追加
  attackSpeed: number; // 追加 (秒間攻撃回数)
  range: number;       // 追加 (マス数)
  lastAttackTime: number; // 追加: 最後に攻撃したタイムスタンプ
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
