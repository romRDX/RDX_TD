export type GridCell = {
  row: number;
  col: number;
};

export function generateDiamondGrid(radius: number): GridCell[] {
  const cells: GridCell[] = [];

  for (let row = -radius; row <= radius; row++) {
    for (let col = -radius; col <= radius; col++) {
      const manhattan = Math.abs(row) + Math.abs(col);

      if (
        manhattan <= radius + 1 &&
        !(manhattan === radius + 1 && row !== 0 && col !== 0)
      ) {
        cells.push({ row, col });
      }
    }
  }

  return cells;
}
