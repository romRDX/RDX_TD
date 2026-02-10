export type GridStageConfig = {
  rows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
  originX: number;
  originY: number;
  radius: number;
};

export type StageConfig = {
  grid: GridStageConfig;
};

// config TEMPORÁRIA (hardcoded)
// depois isso vira factory / loader
export const defaultStageConfig: StageConfig = {
  grid: {
    rows: 3,
    cols: 3,
    cellWidth: 130,
    cellHeight: 95,
    originX: 520,
    originY: 360,
    radius: 3,
  },
};
