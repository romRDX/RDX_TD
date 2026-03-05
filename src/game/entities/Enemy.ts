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

  private healthListeners: ((hp: number, maxHp: number) => void)[] = [];
  private deathListeners: (() => void)[] = [];

  private dead = false;

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
    if (this.dead) return;

    const hpBefore = this.hp;

    this.hp = Math.max(0, this.hp - amount);

    console.log(
      "Enemy.takeDamage",
      "before:",
      hpBefore,
      "damage:",
      amount,
      "after:",
      this.hp,
    );

    this.emitHealthChange();

    if (!this.dead && this.hp <= 0) {
      this.dead = true;

      console.log("💀 Enemy death event fired");

      this.emitDeath();
    }
  }

  isDead(): boolean {
    return this.dead;
  }

  onHealthChange(cb: (hp: number, maxHp: number) => void) {
    this.healthListeners.push(cb);
  }

  onDeath(cb: () => void) {
    this.deathListeners.push(cb);
  }

  private emitHealthChange() {
    for (const cb of this.healthListeners) {
      cb(this.hp, this.stats.maxHp);
    }
  }

  private emitDeath() {
    for (const cb of this.deathListeners) {
      cb();
    }
  }
}
