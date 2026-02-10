export type CharacterStats = {
  maxHp: number;
  damage: number;
  attackSpeed: number; // ataques por segundo
};

export class Character {
  hp: number;
  stats: CharacterStats;

  constructor(stats: CharacterStats) {
    this.stats = stats;
    this.hp = stats.maxHp;
  }

  /**
   * Atualização passiva do personagem.
   * NÃO aplica ataque.
   * O ataque é controlado pelo GameScene (hit frame da animação).
   */
  update(_delta: number) {
    // reservado para:
    // buffs / debuffs
    // regen
    // efeitos temporais futuros
  }
}
