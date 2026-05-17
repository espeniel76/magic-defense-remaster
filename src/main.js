import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0f1419',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 1280,
  },
  scene: {
    create() {
      this.add.text(360, 640, '매직디펜스', {
        fontSize: '64px',
        color: '#ffffff',
      }).setOrigin(0.5);
    },
  },
};

new Phaser.Game(config);
