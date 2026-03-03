export type GridCell = {
  row: number;
  col: number;
};

export type WaveUnit = {
  enemyTypeId: number;
  position: {
    row: number;
    col: number;
  };
};

export type WaveBlueprint = {
  id: number;
  units: {
    enemyTypeId: number;
    position: { row: number; col: number };
  }[];
};
