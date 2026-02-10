import Phaser from "phaser";

export function createAnimations(anims: Phaser.Animations.AnimationManager) {
  anims.create({
    key: "knight-idle",
    frames: anims.generateFrameNumbers("knight-idle", { start: 0, end: 6 }),
    frameRate: 8,
    repeat: -1,
  });

  anims.create({
    key: "knight-attack",
    frames: anims.generateFrameNumbers("knight-attack", { start: 0, end: 6 }),
    frameRate: 20,
    repeat: 0,
  });

  anims.create({
    key: "knight-attack-loop",
    frames: anims.generateFrameNumbers("knight-attack", { start: 0, end: 6 }),
    frameRate: 20,
    repeat: -1,
  });

  anims.create({
    key: "kobold-idle",
    frames: anims.generateFrameNumbers("kobold-idle", { start: 0, end: 5 }),
    frameRate: 8,
    repeat: -1,
  });
}
