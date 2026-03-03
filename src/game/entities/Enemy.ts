export type EnemyArchetype = "melee" | "ranged" | "hybrid";

export type EnemyStats = {
  maxHp: number;
  damage: number;
  attackSpeed: number; // ataques por segundo
  archetype: EnemyArchetype;
};

export class Enemy {
  public readonly stats: EnemyStats;
  public hp: number;

  private attackCooldown = 0;

  private listeners: ((hp: number, maxHp: number) => void)[] = [];

  constructor(stats: EnemyStats) {
    this.stats = stats;
    this.hp = stats.maxHp;
  }

  update(delta: number, target: { takeDamage: (amount: number) => void }) {
    if (this.isDead()) return;

    const attackInterval = 1000 / this.stats.attackSpeed;

    this.attackCooldown -= delta;

    if (this.attackCooldown <= 0) {
      target.takeDamage(this.stats.damage);
      this.attackCooldown = attackInterval;
    }
  }

  takeDamage(amount: number) {
    this.hp = Math.max(0, this.hp - amount);
    this.emitHealthChange();
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  onHealthChange(cb: (hp: number, maxHp: number) => void) {
    this.listeners.push(cb);
  }

  private emitHealthChange() {
    for (const cb of this.listeners) {
      cb(this.hp, this.stats.maxHp);
    }
  }
}
