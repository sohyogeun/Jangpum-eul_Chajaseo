// js/skinPreview.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('[skinPreview.js] DOMContentLoaded fired');

  // ✅ 중복 로드/중복 초기화 방지
  if (window.__skinPreview_inited) {
    console.warn('[skinPreview.js] already initialized (duplicate load)');
    return;
  }
  window.__skinPreview_inited = true;

  const buttons = document.querySelectorAll('.skin-btn');
  const preview = document.getElementById('skin-preview');
  const titleEl = document.getElementById('skin-preview-title');
  const textEl  = document.getElementById('skin-preview-text');
  const layout  = document.querySelector('.skin-layout');

  if (!buttons.length || !preview || !titleEl || !textEl || !layout) return;

  const SKIN_INFO = {
    oily: {
      title: '지성 피부 미리보기',
      text: '유분이 잘 올라오고 번들거림이 쉬운 타입이에요. 피지 컨트롤 토너, 가벼운 수분 크림을 위주로 사용하는 루틴이 잘 맞아요.'
    },
    dry: {
      title: '건성 피부 미리보기',
      text: '당김과 각질이 잘 느껴지는 타입이에요. 보습력 높은 크림과 유수분을 함께 채워주는 제품들이 필수예요.'
    },
    combo: {
      title: '복합성 피부 미리보기',
      text: 'T존은 지성, 볼·턱은 건조한 느낌이라 구역별로 다른 제형을 사용하는 게 좋아요.'
    },
    normal: {
      title: '중성 피부 미리보기',
      text: '유수분 밸런스가 비교적 안정적인 타입으로, 기본 보습과 자극 적은 제품 위주로 루틴을 관리하면 좋아요.'
    }
  };

  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      const key  = btn.dataset.skin;
      const info = SKIN_INFO[key];
      if (!info) return;

      titleEl.textContent = info.title;
      textEl.textContent  = info.text;

      const offsetTop = btn.offsetTop;
      preview.style.top = (offsetTop - 4) + 'px';

      preview.classList.add('is-visible');
    });

    btn.addEventListener('mouseleave', () => {
      preview.classList.remove('is-visible');
    });
  });

  layout.addEventListener('mouseleave', () => {
    preview.classList.remove('is-visible');
  });
});
