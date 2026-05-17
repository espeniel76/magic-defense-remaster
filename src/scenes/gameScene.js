import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.add.text(w / 2, h / 2, 'GameScene\n(임시 골격)', {
      fontSize: '36px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    // Tap anywhere to end game (temporary)
    this.input.once('pointerdown', () => {
      this.scene.start('GameOverScene', { wave: 1 });
    });
  }
}
