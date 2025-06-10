// ユニットの基本的な型
export interface UnitType {
  id: string; // ユニットの一意なID
  x: number;  // 盤面上のX座標 (列)
  y: number;  // 盤面上のY座標 (行)
  type: 'basic'; // 'basic', 'archer', 'shield', etc.
  hp: number;
}

// セルの状態を表す型 (ユニットが存在するかどうか)
export interface CellState {
  unit: UnitType | null; // セルにユニットがいればUnitType、いなければnull
}

export interface Enemy {
  id: string;
  type: 'basic';
  col: number; // 出現列 (X座標)
  pixelY: number; // 現在のY座標 (ピクセル単位)
  hp: number;
  speed: number; // ピクセル/秒
  targetPixelY: number; // ゴールラインのY座標
}
