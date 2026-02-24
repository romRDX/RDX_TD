export type GridStageConfig = {
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
    cellWidth: 85,
    cellHeight: 85,
    originX: 350,
    originY: 80,
    radius: 3,
  },
};
