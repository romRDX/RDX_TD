export class Enemy {
  public readonly maxHp: number;
  public hp: number;
  private listeners: ((hp: number, maxHp: number) => void)[] = [];

  constructor(maxHp: number) {
    this.maxHp = maxHp;
    this.hp = maxHp;
  }

  takeDamage(amount: number) {
    this.hp -= amount;
    this.notifyHealthChange();
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  onHealthChange(listener: (hp: number, maxHp: number) => void) {
    this.listeners.push(listener);
  }

  private notifyHealthChange() {
    for (const l of this.listeners) {
      l(this.hp, this.maxHp);
    }
  }
}
