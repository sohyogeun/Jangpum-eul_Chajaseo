// mypage.js
document.addEventListener('DOMContentLoaded', () => {
  // 1) 콘텐츠 영역 찾기(없으면 안전 종료)
  const contentPane = document.querySelector('.mypageBack2');
  if (!contentPane) {
    console.warn('[mypage] .mypageBack2 못 찾음');
    return;
  }

  // 2) active 토글 헬퍼
  function setActiveButton(clickedButton) {
    document.querySelectorAll('.menuBtn').forEach(btn => btn.classList.remove('active'));
    if (clickedButton) clickedButton.classList.add('active');
  }

  // 3) compareIds 로컬 저장 헬퍼
  function getCompareIds() {
    try { return JSON.parse(localStorage.getItem('compareIds') || '[]'); }
    catch { return []; }
  }
  function removeFromCompare(id) {
    const next = getCompareIds().filter(x => x !== id);
    localStorage.setItem('compareIds', JSON.stringify(next));
  }

  // 4) 뷰 렌더러
  async function loadMyCosmetics() {
    const ids = getCompareIds();
    if (!ids.length) {
      contentPane.innerHTML = `
        <div class="mcBack">
          ${['첫','두','셋','넷'].map((t,i)=>`
            <div class="comparison empty">
              <h4>${t}번째 비교</h4>
              <div class="placeholder">+ 제품을 추가해 주세요</div>
            </div>`).join('')}
        </div>`;
      return;
    }

    try {
      const res = await fetch(`/api/compare?ids=${ids.join(',')}`, { cache:'no-store' });
      const items = await res.json();

      const card = (idx, p) => `
        <div class="comparison">
          <h4>${['첫','두','셋','넷'][idx]}번째 비교</h4>
          <img class="cpsIMG" src="${p.imageUrl || 'https://placehold.co/400x300?text=No+Image'}" alt="${p.name}">
          <dl>
            <dt>제품명</dt><dd>${p.brand ? `[${p.brand}] `:''}${p.name}</dd>
            ${p.price != null ? `<dt>가격</dt><dd>${p.price.toLocaleString()}원</dd>` : ''}
            <dt>성분</dt><dd>${p.ingredients || '-'}</dd>
            <dt>특징</dt><dd>${p.features || '-'}</dd>
          </dl>
          <button class="removeBtn" data-id="${p.id}">비교에서 제거</button>
        </div>`;

      contentPane.innerHTML = `
        <div class="mcBack">
          ${[0,1,2,3].map(i => items[i] ? card(i, items[i]) : `
            <div class="comparison empty">
              <h4>${['첫','두','셋','넷'][i]}번째 비교</h4>
              <div class="placeholder">+ 제품을 추가해 주세요</div>
            </div>`).join('')}
        </div>`;
    } catch (e) {
      console.error(e);
      contentPane.innerHTML = `<p>비교 데이터를 불러오지 못했습니다.</p>`;
    }
  }

  // 5) 동적 메뉴에 대비한 **이벤트 위임**
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#editInfoBtn, #counselBtn, #FYS, #myProductBtn, .removeBtn');
    if (!btn) return;

    if (btn.id === 'editInfoBtn') {
      setActiveButton(btn);
      contentPane.innerHTML = '<h2>회원정보 수정</h2><p>회원정보 수정 폼이 여기에 표시됩니다.</p>';
    } else if (btn.id === 'counselBtn') {
      setActiveButton(btn);
      contentPane.innerHTML = '<h2>1대1 상담 내용</h2><p>상담 내역이 여기에 표시됩니다.</p>';
    } else if (btn.id === 'FYS') {
      setActiveButton(btn);
      contentPane.innerHTML = '<h2>나의 피부</h2><p>나의 피부(FYS) 정보가 여기에 표시됩니다.</p>';
    } else if (btn.id === 'myProductBtn') {
      setActiveButton(btn);
      loadMyCosmetics();
    } else if (btn.classList.contains('removeBtn')) {
      removeFromCompare(btn.dataset.id);
      function renderCounsel() {
        contentPane.innerHTML = '<h2>1대1 상담 내용</h2><p>상담 내역이 여기에 표시됩니다.</p>';
}
    }
  });

  // 6) 초기 상태 표시(원하면 주석 해제해서 기본 ‘나만의 화장품’로딩)
  // loadMyCosmetics();
});
