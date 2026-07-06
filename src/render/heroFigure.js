// 클래스 설정(GAME_CONFIG.classes[*])으로 간단한 마법사 피규어를 그린다.
// 보드/뽑기연출/영웅미리보기 등 여러 화면에서 재사용.

function hexToInt(hex) {
  if (typeof hex === 'number') return hex;
  return parseInt(String(hex).replace('#', ''), 16);
}

// 몸통(원) + 모자(삼각형) + 눈. cx,cy 중심의 컨테이너 반환. size = 몸통 반지름.
export function drawHeroFigure(scene, cx, cy, size, classConfig) {
  const bodyColor = hexToInt(classConfig.color);
  const hatColor = hexToInt(classConfig.hatColor ?? classConfig.color);
  const container = scene.add.container(cx, cy);

  const hat = scene.add.graphics();
  hat.fillStyle(hatColor, 1);
  hat.beginPath();
  hat.moveTo(0, -size * 1.7);
  hat.lineTo(-size * 0.6, -size * 0.9);
  hat.lineTo(size * 0.6, -size * 0.9);
  hat.closePath();
  hat.fillPath();

  const body = scene.add.circle(0, size * 0.15, size, bodyColor);
  body.setStrokeStyle(Math.max(2, size * 0.05), 0xffffff);

  const eyeR = size * 0.24;
  const eyeY = size * 0.05;
  const eyeOffX = size * 0.36;
  const eyeL = scene.add.circle(-eyeOffX, eyeY, eyeR, 0xffffff);
  const eyeRr = scene.add.circle(eyeOffX, eyeY, eyeR, 0xffffff);

  container.add([hat, body, eyeL, eyeRr]);
  return container;
}

// effect 종류 → 특성 한 줄 설명
export function traitText(classConfig) {
  const c = classConfig;
  switch (c.effect) {
    case 'single':
      return '단일 대상 강타';
    case 'slow':
      return `공격한 적 이동속도 ${Math.round((c.slowFactor ?? 0) * 100)}% 감속`;
    case 'chain':
      return `근처 ${c.chainCount ?? 0}명에게 연쇄 (${Math.round((c.chainDamageRatio ?? 0) * 100)}%)`;
    case 'aoe':
      return '범위 피해 + 기절';
    case 'poison':
      return `중독 지속 피해 (${Math.round((c.poisonRatio ?? 0) * 100)}%)`;
    case 'knockback':
      return '적을 뒤로 밀어냄';
    default:
      return '−';
  }
}
