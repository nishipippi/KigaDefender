// ユニットの基本的な型
export interface UnitType {
  id: string; // ユニットの一意なID
  x: number;  // 盤面上のX座標 (列)
  y: number;  // 盤面上のY座標 (行)
  // 今後、ユニットの種類、レベル、HPなどのプロパティを追加
}

// セルの状態を表す型 (ユニットが存在するかどうか)
export interface CellState {
  unit: UnitType | null; // セルにユニットがいればUnitType、いなければnull
}
