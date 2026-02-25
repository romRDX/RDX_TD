export type CharacterStats = {
  maxHp: number;
  damage: number;
  attackSpeed: number; // ataques por segundo
};

type HealthListener = (hp: number, maxHp: number) => void;

export class Character {
  public hp: number;
  public readonly stats: CharacterStats;

  private listeners: HealthListener[] = [];

  constructor(stats: CharacterStats) {
    this.stats = stats;
    this.hp = stats.maxHp;
  }

  update(_delta: number) {
    // reservado para:
    // buffs
    // debuffs
    // regen
  }

  takeDamage(amount: number) {
    this.hp = Math.max(0, this.hp - amount);
    this.notifyHealthChange();
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  onHealthChange(listener: HealthListener) {
    this.listeners.push(listener);
  }

  private notifyHealthChange() {
    for (const listener of this.listeners) {
      listener(this.hp, this.stats.maxHp);
    }
  }
}
