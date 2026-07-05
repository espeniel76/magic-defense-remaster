import { GAME_CONFIG } from '../config/gameConfig.js';

// 하단 고정 탭. 각 메타 화면(뽑기/영웅/플레이) 아래에 붙인다.
const TABS = [
  { key: 'shop',  scene: 'ShopScene',  label: '뽑기' },
  { key: 'units', scene: 'UnitsScene', label: '영웅' },
  { key: 'play',  scene: 'TitleScene', label: '플레이' },
];

// scene 에 하단 탭을 그리고, 콘텐츠가 침범하지 않도록 바 높이를 반환.
export function addNavBar(scene, activeKey) {
  const w = scene.scale.width;
  const h = scene.scale.height;
  const barH = Math.round(h * 0.09);
  const topY = h - barH;

  scene.add.rectangle(0, topY, w, barH, 0x141c30).setOrigin(0, 0).setDepth(50);
  scene.add.rectangle(0, topY, w, 3, 0x2a3a5a).setOrigin(0, 0).setDepth(51);

  const tabW = w / TABS.length;
  TABS.forEach((t, i) => {
    const cx = tabW * i + tabW / 2;
    const cy = topY + barH / 2;
    const active = t.key === activeKey;

    const zone = scene.add.rectangle(cx, cy, tabW, barH, 0xffffff, 0.001)
      .setDepth(52).setInteractive({ useHandCursor: true });
    if (active) {
      scene.add.rectangle(cx, topY + 2, tabW * 0.5, 4, 0xffd700).setDepth(52);
    }
    scene.add.text(cx, cy, t.label, {
      fontFamily: GAME_CONFIG.font.family,
      fontSize: '26px',
      color: active ? '#ffd700' : '#8a93a6',
      fontStyle: active ? 'bold' : 'normal',
    }).setOrigin(0.5).setDepth(52);

    if (!active) zone.on('pointerup', () => scene.scene.start(t.scene));
  });

  return barH;
}
