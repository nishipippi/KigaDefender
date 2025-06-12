import { ArrowUpIcon, CursorArrowRaysIcon, ShieldCheckIcon, TrashIcon, CurrencyYenIcon, SunIcon, PauseIcon, FireIcon } from '@heroicons/react/24/solid';
import { UnitType, Unit } from './types';

// ユニットの基本定義と初期ステータス
export type UnitDefinition = {
  name: string;
  type: UnitType;
  baseHp: number;
  baseAttackPower: number;
  baseAttackSpeed: number;
  baseRange: number;
  baseCost: number;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  specialAbility: string;
  evolution: {
    level2: {
      hpMultiplier: number;
      attackPowerMultiplier?: number; // オプショナルに変更
      attackSpeedMultiplier?: number; // 追加
      rangeMultiplier?: number; // 追加
      specialAbilityUpgrade?: string;
    };
    level3A: {
      name: string;
      hpMultiplier: number;
      attackPowerMultiplier: number;
      specialAbility: string;
      attackSpeedMultiplier?: number;
      rangeMultiplier?: number;
    };
    level3B: {
      name: string;
      hpMultiplier: number;
      attackPowerMultiplier: number;
      specialAbility: string;
      attackSpeedMultiplier?: number;
      rangeMultiplier?: number;
    };
  };
};

export const unitDefinitions: Record<UnitType, UnitDefinition> = {
  'assault-bacterium': {
    name: '突撃菌',
    type: 'assault-bacterium',
    baseHp: 100,
    baseAttackPower: 10,
    baseAttackSpeed: 1.2,
    baseRange: 1,
    baseCost: 10,
    icon: ArrowUpIcon,
    specialAbility: 'なし',
    evolution: {
      level2: { hpMultiplier: 1.8, attackPowerMultiplier: 1.8 },
      level3A: {
        name: '重装突撃菌',
        hpMultiplier: 5.0, // 100 -> 180 -> 500 (Lv1の5倍)
        attackPowerMultiplier: 3.5, // 10 -> 18 -> 35 (Lv1の3.5倍)
        specialAbility: '攻撃時に確率(15%)で敵をスタンさせる。',
      },
      level3B: {
        name: '双鞭突撃菌',
        hpMultiplier: 2.0, // 100 -> 180 -> 200 (Lv1の2倍)
        attackPowerMultiplier: 2.0, // 10 -> 18 -> 20 (Lv1の2倍)
        attackSpeedMultiplier: 2.08, // 1.2 -> 1.2 -> 2.5 (Lv1の約2.08倍)
        specialAbility: 'ASPDが大幅に上昇(2.5)。2回攻撃になる（1回あたりのダメージは低下）。',
      },
    },
  },
  'archer-bacterium': {
    name: '射手菌',
    type: 'archer-bacterium',
    baseHp: 80,
    baseAttackPower: 8,
    baseAttackSpeed: 1.0,
    baseRange: 4,
    baseCost: 10,
    icon: CursorArrowRaysIcon,
    specialAbility: 'なし',
    evolution: {
      level2: { hpMultiplier: 1.875, attackPowerMultiplier: 1.875, rangeMultiplier: 1.25 }, // HP: 80->150, ATK: 8->15, Range: 4->5
      level3A: {
        name: '連射射手菌',
        hpMultiplier: 2.0, // 80 -> 150 -> 160 (仮)
        attackPowerMultiplier: 3.125, // 8 -> 15 -> 25
        attackSpeedMultiplier: 2.0, // 1.0 -> 1.0 -> 2.0
        rangeMultiplier: 1.0, // 4 -> 5 -> 4 (少し短くなる)
        specialAbility: 'ASPDが劇的に上昇(2.0)。射程が少し短くなる(4)。',
      },
      level3B: {
        name: '貫通射手菌',
        hpMultiplier: 2.0, // 80 -> 150 -> 160 (仮)
        attackPowerMultiplier: 5.0, // 8 -> 15 -> 40
        attackSpeedMultiplier: 0.8, // 1.0 -> 1.0 -> 0.8
        specialAbility: '攻撃が敵を2体まで貫通するようになる。ASPDは少し低下(0.8)。',
      },
    },
  },
  'shield-cell': {
    name: '盾細胞',
    type: 'shield-cell',
    baseHp: 250,
    baseAttackPower: 5,
    baseAttackSpeed: 0.8,
    baseRange: 1,
    baseCost: 15,
    icon: ShieldCheckIcon,
    specialAbility: '[自己修復]: 5秒間ダメージを受けないと、HPが毎秒2%回復する。',
    evolution: {
      level2: { hpMultiplier: 2.0, attackPowerMultiplier: 2.0, specialAbilityUpgrade: '回復量が毎秒3%に上昇。' },
      level3A: {
        name: '反射装甲細胞',
        hpMultiplier: 4.8, // 250 -> 500 -> 1200
        attackPowerMultiplier: 2.0, // 5 -> 10 -> 10 (仮)
        specialAbility: '受けたダメージの10%を攻撃者に反射する。',
      },
      level3B: {
        name: '庇護細胞',
        hpMultiplier: 4.0, // 250 -> 500 -> 1000
        attackPowerMultiplier: 2.0, // 5 -> 10 -> 10 (仮)
        specialAbility: '隣接する味方1体が受けるダメージの30%を肩代わりする。',
      },
    },
  },
  'macrophage': {
    name: 'マクロファージ',
    type: 'macrophage',
    baseHp: 200,
    baseAttackPower: 25,
    baseAttackSpeed: 0.7,
    baseRange: 2,
    baseCost: 20,
    icon: TrashIcon,
    specialAbility: '[捕食]: 敵を倒すと、自身の最大HPの5%を回復する。',
    evolution: {
      level2: { hpMultiplier: 1.9, attackPowerMultiplier: 1.8, specialAbilityUpgrade: '回復量が最大HPの7%に上昇。' },
      level3A: {
        name: '処刑マクロファージ',
        hpMultiplier: 2.0, // 200 -> 380 -> 400 (仮)
        attackPowerMultiplier: 3.2, // 25 -> 45 -> 80
        specialAbility: 'HPが20%以下の敵に対するダメージが3倍になる。',
      },
      level3B: {
        name: '飽食マクロファージ',
        hpMultiplier: 2.0, // 200 -> 380 -> 400 (仮)
        attackPowerMultiplier: 2.8, // 25 -> 45 -> 70
        specialAbility: '敵を倒すごとに攻撃力が永続的に+1上昇する（上限+50）。',
      },
    },
  },
  'culture-yeast': {
    name: '培養酵母',
    type: 'culture-yeast',
    baseHp: 70,
    baseAttackPower: 6,
    baseAttackSpeed: 1.0,
    baseRange: 3,
    baseCost: 12,
    icon: CurrencyYenIcon,
    specialAbility: '[副産物]: このユニットが敵を倒すと、1培養液を追加で獲得する。',
    evolution: {
      level2: { hpMultiplier: 1.85, attackPowerMultiplier: 2.0, specialAbilityUpgrade: '追加獲得が2培養液に増加。' },
      level3A: {
        name: '黄金酵母',
        hpMultiplier: 2.0, // 70 -> 130 -> 140 (仮)
        attackPowerMultiplier: 3.33, // 6 -> 12 -> 20
        specialAbility: '培養液獲得量が5に増加。さらに低確率(5%)でXPを1獲得する。',
      },
      level3B: {
        name: '利子酵母',
        hpMultiplier: 2.0, // 70 -> 130 -> 140 (仮)
        attackPowerMultiplier: 4.16, // 6 -> 12 -> 25
        specialAbility: 'ウェーブ開始時、現在の所持培養液の5%を追加で獲得する（上限あり）。',
      },
    },
  },
  'aura-yeast': {
    name: '強化酵母',
    type: 'aura-yeast',
    baseHp: 120,
    baseAttackPower: 0, // 攻撃しない
    baseAttackSpeed: 0,
    baseRange: 0,
    baseCost: 18,
    icon: SunIcon,
    specialAbility: '[強化オーラ]: 隣接する味方ユニットの攻撃力を+10%する。',
    evolution: {
      level2: { hpMultiplier: 1.83, attackPowerMultiplier: 0, specialAbilityUpgrade: 'オーラ範囲が周囲1マスに拡大。効果が+15%に上昇。' }, // attackPowerMultiplierを追加
      level3A: {
        name: '攻撃オーラ酵母',
        hpMultiplier: 2.0, // 120 -> 220 -> 240 (仮)
        attackPowerMultiplier: 0,
        specialAbility: 'オーラが攻撃力+25%と攻撃速度+15%の効果になる。',
      },
      level3B: {
        name: '防御オーラ酵母',
        hpMultiplier: 2.5, // 120 -> 220 -> 300 (仮)
        attackPowerMultiplier: 0,
        specialAbility: 'オーラがHP+20%と、毎秒1%のHPリジェネ効果になる。',
      },
    },
  },
  'slow-phage': {
    name: 'スロウファージ',
    type: 'slow-phage',
    baseHp: 90,
    baseAttackPower: 5,
    baseAttackSpeed: 1.0,
    baseRange: 4,
    baseCost: 22,
    icon: PauseIcon,
    specialAbility: '[粘着ウイルス]: 攻撃がヒットした敵の移動速度を2秒間30%低下させる。',
    evolution: {
      level2: { hpMultiplier: 1.88, attackPowerMultiplier: 2.0, specialAbilityUpgrade: '減速効果が40%に上昇。' },
      level3A: {
        name: '凍結ファージ',
        hpMultiplier: 2.0, // 90 -> 170 -> 180 (仮)
        attackPowerMultiplier: 3.0, // 5 -> 10 -> 15 (仮)
        specialAbility: '減速効果が60%に上昇。さらに攻撃対象とその周囲の敵をまとめて減速させる。',
      },
      level3B: {
        name: '停滞フィールドファージ',
        hpMultiplier: 2.5, // 90 -> 170 -> 225 (仮)
        attackPowerMultiplier: 0, // 攻撃しなくなる
        specialAbility: '攻撃しなくなる。代わりに自身の周囲2マスに常に敵の移動速度を35%低下させるフィールドを展開する。',
      },
    },
  },
  'corrosive-phage': {
    name: '侵食ファージ',
    type: 'corrosive-phage',
    baseHp: 100,
    baseAttackPower: 8,
    baseAttackSpeed: 0.5,
    baseRange: 3,
    baseCost: 25,
    icon: FireIcon,
    specialAbility: '[溶解毒]: 攻撃対象に5秒間、毎秒3ダメージの継続ダメージを与える。この効果はスタックする。',
    evolution: {
      level2: { hpMultiplier: 1.9, attackPowerMultiplier: 1.875, specialAbilityUpgrade: '継続ダメージが毎秒6に上昇。' },
      level3A: {
        name: '致死毒ファージ',
        hpMultiplier: 2.0, // 100 -> 190 -> 200 (仮)
        attackPowerMultiplier: 2.5, // 8 -> 15 -> 20 (仮)
        specialAbility: '継続ダメージが毎秒15に上昇。対象のHPが25%以下の場合、継続ダメージは2倍になる。',
      },
      level3B: {
        name: '感染爆発ファージ',
        hpMultiplier: 2.0, // 100 -> 190 -> 200 (仮)
        attackPowerMultiplier: 2.5, // 8 -> 15 -> 20 (仮)
        specialAbility: '継続ダメージを受けている敵が倒されると爆発し、周囲の敵に30ダメージと3秒間の継続ダメージを与える。',
      },
    },
  },
};
