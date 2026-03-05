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

    // 🔹 garante que UI já receba valor inicial
    this.notifyHealthChange();
  }

  update(_delta: number) {
    // reservado para:
    // buffs
    // debuffs
    // regen
  }

  performAttack() {
    // apenas sinaliza que o ataque começou
  }

  takeDamage(amount: number) {
    if (this.isDead()) return; // 🔹 evita dano após morte

    this.hp = Math.max(0, this.hp - amount);
    this.notifyHealthChange();
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  onHealthChange(listener: HealthListener) {
    this.listeners.push(listener);

    // 🔹 opcional mas recomendado:
    // garante que novo listener já receba estado atual
    listener(this.hp, this.stats.maxHp);
  }

  private notifyHealthChange() {
    for (const listener of this.listeners) {
      listener(this.hp, this.stats.maxHp);
    }
  }
}
