document.addEventListener('DOMContentLoaded', () => {
  // 중복 실행 방지
  if (window.__skinPreview_inited) return;
  window.__skinPreview_inited = true;

  const buttons = document.querySelectorAll('.skin-btn');
  const preview = document.getElementById('skin-preview');
  
  // 텍스트 요소
  const titleEl = document.getElementById('skin-preview-title');
  const textEl  = document.getElementById('skin-preview-text');
  const layout  = document.querySelector('.skin-layout');

  // ⚠️ 중요: layout까지 모두 있는지 확인해야 에러가 안 납니다.
  if (!buttons.length || !preview || !titleEl || !textEl || !layout) {
      console.warn("피부 타입 미리보기 요소를 찾을 수 없습니다."); // 디버깅용 로그
      return;
  }

  const SKIN_INFO = {
    oily: {
      title: '지성 피부',
      text: '유분이 잘 올라오고 번들거림이 쉬운 타입이에요. 피지 컨트롤 토너와 가벼운 수분 크림이 잘 맞아요.'
    },
    dry: {
      title: '건성 피부',
      text: '당김과 각질이 잘 느껴지는 타입이에요. 보습력 높은 크림과 오일 보습이 필수예요.'
    },
    combo: {
      title: '복합성 피부',
      text: 'T존은 지성, U존은 건성인 타입이에요. 부위별로 다른 제형을 사용하는 것이 좋아요.'
    },
    normal: {
      title: '중성 피부',
      text: '유수분 밸런스가 좋은 건강한 피부예요. 현재 상태를 유지하는 기본 보습에 집중하세요.'
    }
  };

  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      const key = btn.dataset.skin;
      const info = SKIN_INFO[key];
      if (!info) return;

      // 텍스트 업데이트
      titleEl.textContent = info.title;
      textEl.textContent = info.text;

      // 박스 보이기
      preview.classList.add('is-visible');
      
      // 버튼 활성화 스타일
      buttons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  // 레이아웃 벗어나면 숨기기
  layout.addEventListener('mouseleave', () => {
    preview.classList.remove('is-visible');
    buttons.forEach(b => b.classList.remove('is-active'));
  });
});