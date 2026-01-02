document.addEventListener('DOMContentLoaded', function () {

  // ============================================================
  // [PART 1] 입력 페이지 기능 (FYS1.html)
  // : 지성/건성/복합성/중성 버튼을 누르면 -> 저장하고 -> 결과페이지로 이동
  // ============================================================
  const skinIds = ['oily', 'dry', 'combo', 'normal'];

  skinIds.forEach(id => {
    const btn = document.getElementById(id); // HTML의 ID(oily, dry...)를 찾음
    if (btn) {
      btn.addEventListener('click', function () {
        // 1. 클릭한 버튼의 ID를 winner 값으로 설정
        const dataToSave = { winner: id };

        // 2. 로컬스토리지에 저장
        localStorage.setItem('heve_skin_survey_result', JSON.stringify(dataToSave));

        // 3. 결과 페이지로 이동
        window.location.href = 'FYS.html';
      });
    }
  });


  // ============================================================
  // [PART 2] 결과 페이지 렌더러 (FYS.html)
  // : 저장된 데이터를 읽어서 화면에 뿌려주는 기능 (보여주신 코드)
  // ============================================================
  
  // 주요 요소 찾기
  const imgEl = document.querySelector('.my-F img');
  const textBox = document.querySelector('.my-f-t');
  
  // 추천 제품 버튼들 (ID가 one ~ five 라고 가정)
  const btn1 = document.getElementById('one');
  const btn2 = document.getElementById('two');
  const btn3 = document.getElementById('three');
  const btn4 = document.getElementById('four'); // 추가됨
  const btn5 = document.getElementById('five'); // 추가됨

  const retry = document.getElementById('FYS1');
  const saveEmpty = document.getElementById('saveEmpty');
  const saveGrid = document.getElementById('saveGrid');

  // 이미지나 텍스트 박스가 없으면(즉, 결과 페이지가 아니면) 여기서 멈춤
  if (!imgEl || !textBox) return;

  // --- 0) 결과 불러오기 ---
  const raw = localStorage.getItem('heve_skin_survey_result');
  if (!raw) {
    alert('설문 결과가 없습니다. 다시 검사해주세요.');
    window.location.href = 'FYS1.html';
    return;
  }
  const { winner } = JSON.parse(raw);

  // --- 1) 장단점 데이터 ---
  const CONTENT = {
    oily: {
      title: '지성 피부',
      image: 'img/지성.jpg',
      pros: ['유분막으로 수분손실이 비교적 적음', '광/탄력 유지가 쉬움'],
      cons: ['번들거림·모공확장/블랙헤드 발생 쉬움', '메이크업 유지 어려움']
    },
    dry: {
      title: '건성 피부',
      image: 'img/건성.jpg',
      pros: ['번들거림 적고 메이크업 안정적'],
      cons: ['각질/당김/미세주름 쉬움', '보습 부족 시 자극/트러블']
    },
    combo: {
      title: '복합성 피부',
      image: 'img/복합성.jpg',
      pros: ['부위별 맞춤 관리 시 컨디션 유지 용이'],
      cons: ['T존 번들 + U존 건조 동시 발생', '제품 선택 난이도 있음']
    },
    normal: {
      title: '중성 피부',
      image: 'img/중성.jpg',
      pros: ['유수분 밸런스 양호', '자극/트러블 빈도 낮음'],
      cons: ['환경/계절에 따라 쉽게 치우칠 수 있음']
    }
  };

  // --- 2) 추천 제품 데이터 ---
  const PRODUCTS = {
    oily: [
      { name: '소나무 진정 로션', img: '../img/소나무 진정 로션.png' },
      { name: '이니스프리 그린티 크림', img: '../img/이니스프리 그린티 크림.png' },
      { name: '닥터자르트 로션', img: '../img/닥터자르트 로션.png' },
      { name: '이니스프라 그린티 진정수분 선세럼', img: '../img/아니스프라 그린티 진정수분 선세럼.png' },
      { name: '제로이드 수딩 로션', img: '../img/제로이드 수딩 로션.png' }
    ],
    dry: [
      { name: '세라마이드 크림', img: 'img/cream.jpg' },
      { name: '히알루론산 에센스', img: 'img/essence.jpg' },
      { name: '리치 타입 선크림', img: 'img/sun.jpg' },
      { name: '세라마이드 크림(대용량)', img: 'img/cream.jpg' },
      { name: '히알루론산 에센스(리필)', img: 'img/essence.jpg' },
    ],
    combo: [
      { name: 'T존: BHA 토너', img: 'img/toner.jpg' },
      { name: 'U존: 세라마이드 크림', img: 'img/cream.jpg' },
      { name: '라이트 선크림', img: 'img/sun.jpg' },
      { name: 'U존: 세라마이드 크림(튜브)', img: 'img/cream.jpg' },
      { name: '라이트 선크림(스틱)', img: 'img/sun.jpg' }
    ],
    normal: [
      { name: '밸런싱 토너', img: 'img/toner.jpg' },
      { name: '라이트 로션', img: 'img/lotion.jpg' },
      { name: '데일리 선크림', img: 'img/sun.jpg' },
      { name: '라이트 로션(대용량)', img: 'img/lotion.jpg' },
      { name: '데일리 선크림(무기자차)', img: 'img/sun.jpg' }
    ]
  };

  // --- 3) 결과 표시 ---
  const c = CONTENT[winner] || CONTENT.normal;
  imgEl.src = c.image;
  imgEl.alt = `${c.title} 예시 이미지`;

  textBox.innerHTML = `
    <div class="skin-summary">
      <h2>${c.title}</h2>
      <div class="pros-cons">
        <div>
          <h3>장점</h3>
          <ul>${(c.pros || []).map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
        <div>
          <h3>단점</h3>
          <ul>${(c.cons || []).map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
  `;

  // --- 4) 저장 관련 로직 ---
  const SAVE_KEY = 'heve_saved_products_v2';

  function loadSaved() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveSaved(list) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(list));
  }

  function renderSaved() {
    if (!saveGrid || !saveEmpty) return;
    const saved = loadSaved();
    saveGrid.innerHTML = '';
    saveEmpty.style.display = saved.length ? 'none' : 'block';

    for (let i = 0; i < 3; i++) {
      const item = saved[i];
      const card = document.createElement('div');
      card.className = 'save-card';

      if (item) {
        const img = document.createElement('img');
        img.src = item.img || 'img/default.jpg';
        img.alt = item.name;
        img.className = 'save-thumb';

        const title = document.createElement('div');
        title.className = 'save-title';
        title.textContent = item.name;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'save-remove';
        removeBtn.textContent = '삭제';
        removeBtn.addEventListener('click', () => {
          const arr = loadSaved();
          arr.splice(i, 1);
          saveSaved(arr);
          renderSaved();
        });

        const inner = document.createElement('div');
        inner.className = 'save-info';
        inner.appendChild(title);
        inner.appendChild(removeBtn);

        card.appendChild(img);
        card.appendChild(inner);
      } else {
        const empty = document.createElement('div');
        empty.className = 'save-title';
        empty.style.color = '#a0a0a0';
        empty.textContent = '비어 있음';
        card.appendChild(empty);
      }
      saveGrid.appendChild(card);
    }
  }

  function addSaved(item) {
    if (!item) return;
    const arr = loadSaved();

    const idx = arr.findIndex(v => v.name === item.name);
    if (idx !== -1) arr.splice(idx, 1);
    arr.unshift(item);
    if (arr.length > 3) arr.pop();

    saveSaved(arr);
    renderSaved();
  }

  // --- 5) 추천 버튼 세팅 (5개 모두 처리) ---
  const list = PRODUCTS[winner] || [];
  const buttons = [btn1, btn2, btn3, btn4, btn5];

  buttons.forEach((b, i) => {
    const it = list[i];
    if (!b) return; // 버튼이 없으면 패스

    if (it) {
      b.textContent = it.name;
      b.disabled = false;
      b.onclick = () => addSaved(it);
    } else {
      b.textContent = '추천 준비중';
      b.disabled = true;
      b.onclick = null;
    }
  });

  renderSaved();

  // --- 6) 다시하기 ---
  if (retry) {
    retry.addEventListener('click', () => {
      if (confirm('다시 검사하시겠어요? 이전 결과는 삭제됩니다.')) {
        localStorage.removeItem('heve_skin_survey_result');
        localStorage.removeItem('heve_skin_survey_v1');
        window.location.href = 'FYS1.html';
      }
    });
  }
});