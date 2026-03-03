import type { WaveBlueprint } from "../types/WaveBlueprint";

export const WAVES: WaveBlueprint[] = [
  {
    id: 1,
    units: [
      { enemyTypeId: 1, position: { row: 3, col: 0 } },
      { enemyTypeId: 1, position: { row: 3, col: 1 } },
      { enemyTypeId: 1, position: { row: 3, col: 2 } },
    ],
  },
  {
    id: 2,
    units: [
      { enemyTypeId: 1, position: { row: 2, col: 1 } },
      { enemyTypeId: 1, position: { row: 3, col: 0 } },
      { enemyTypeId: 1, position: { row: 4, col: 2 } },
    ],
  },
];
