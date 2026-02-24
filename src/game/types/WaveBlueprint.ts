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
  units: WaveUnit[];
};
