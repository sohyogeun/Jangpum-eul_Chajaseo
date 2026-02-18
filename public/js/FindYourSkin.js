document.addEventListener('DOMContentLoaded', function () {

  // ============================================================
  // [PART 0] 데이터 유무 확인 (기존 기능 유지)
  // ============================================================
  // 페이지 들어오자마자 검사: 결과 데이터가 없으면 바로 메인으로 보냅니다.
  const raw = localStorage.getItem('heve_skin_survey_result');

  if (!raw) {
    alert('저장된 데이터가 없습니다. 메인 화면으로 이동합니다.');
    window.location.href = 'mainpage.html'; 
    return; // 아래 코드가 실행되지 않도록 여기서 끝냄
  }

  // ============================================================
  // [PART 1] 입력 페이지 기능 (이벤트 위임)
  // ============================================================
  // 모달이 나중에 열리더라도 버튼 클릭을 감지할 수 있도록 설정
  document.addEventListener('click', function(e) {
    const skinIds = ['oily', 'dry', 'combo', 'normal'];
    
    // 클릭된 요소의 ID가 피부 타입 중 하나라면
    if (skinIds.includes(e.target.id)) {
       const dataToSave = { winner: e.target.id };
       localStorage.setItem('heve_skin_survey_result', JSON.stringify(dataToSave));
       
       // 저장 후 현재 페이지(FYS.html)를 새로고침 -> 새로운 결과가 뜸
       window.location.reload(); 
    }
  });


  // ============================================================
  // [PART 2] 결과 페이지 렌더러
  // ============================================================
  const imgEl = document.querySelector('.my-F img');
  const textBox = document.querySelector('.my-f-t');
  
  const btn1 = document.getElementById('one');
  const btn2 = document.getElementById('two');
  const btn3 = document.getElementById('three');
  const btn4 = document.getElementById('four'); 
  const btn5 = document.getElementById('five'); 

  const name1 = document.querySelector('p[data-for="one"]');
  const name2 = document.querySelector('p[data-for="two"]');
  const name3 = document.querySelector('p[data-for="three"]');
  const name4 = document.querySelector('p[data-for="four"]');
  const name5 = document.querySelector('p[data-for="five"]');

  const retry = document.getElementById('refresh');
  const saveEmpty = document.getElementById('saveEmpty');
  const saveGrid = document.getElementById('saveGrid');

  if (!imgEl || !textBox) return;

  const { winner } = JSON.parse(raw);

  // --- 1) 장단점 데이터 ---
  const CONTENT = {
    oily: {
      title: '지성 피부 (Oily Skin)',
      image: 'img/지성피부.jpg', 
      pros: [
        '피지 분비가 왕성하여 피부 노화와 잔주름 생성이 더딤',
        '피부 두께가 비교적 두꺼워 외부 자극에 강함',
        '천연 보호막(유분) 덕분에 수분이 쉽게 날아가지 않음'
      ],
      cons: [
        '과도한 유분으로 인해 얼굴이 쉽게 번들거림',
        '모공이 막히기 쉬워 여드름이나 블랙헤드 트러블이 잦음',
        '메이크업이 금방 무너지고 지속력이 낮음'
      ]
    },
    dry: {
      title: '건성 피부 (Dry Skin)',
      image: 'img/건성피부.jpg',
      pros: [
        '모공이 작고 눈에 잘 띄지 않아 피부결이 섬세함',
        '피지 분비가 적어 번들거림 없이 뽀송한 느낌',
        '트러블이 잘 생기지 않아 깨끗해 보임'
      ],
      cons: [
        '피부 장벽이 얇아 세안 후 당김이 심하고 각질이 잘 일어남',
        '유수분이 부족하여 잔주름과 탄력 저하가 빨리 옴',
        '외부 환경(바람, 온도)에 민감하게 반응하여 붉어질 수 있음'
      ]
    },
    combo: {
      title: '복합성 피부 (Combination Skin)',
      image: 'img/복합성피부.jpg',
      pros: [
        'T존의 건강한 윤기와 U존의 매끄러움을 동시에 가질 수 있음',
        '계절과 환경 변화에 따라 유연하게 적응하는 편',
        '관리만 잘하면 지성과 건성의 장점을 모두 누릴 수 있음'
      ],
      cons: [
        'T존(이마, 코)은 번들거리고 U존(볼)은 건조해 관리가 까다로움',
        '유수분 밸런스가 깨지기 쉬워 트러블과 건조함이 동시에 발생',
        '부위별로 다른 스킨케어 제품을 사용해야 할 수도 있음'
      ]
    },
    normal: {
      title: '중성 피부 (Normal Skin)',
      image: 'img/중성피부.jpg',
      pros: [
        '유수분 밸런스가 완벽하여 피부 당김이나 번들거림이 없음',
        '피부결이 매끄럽고 윤기가 흐르며 혈색이 좋음',
        '화장이 잘 먹고 별다른 트러블 없이 건강한 상태 유지'
      ],
      cons: [
        '현재 상태에 만족하여 관리를 소홀히 하면 금방 건성으로 변할 수 있음',
        '계절 변화나 컨디션 난조에 따라 일시적으로 예민해질 수 있음',
        '노화가 시작되면 급격히 건조해질 수 있으니 방심은 금물'
      ]
    }
  };

  // --- 2) 추천 제품 데이터 ---
  const PRODUCTS = {
    oily: [
      { name: '소나무 진정 로션', img: 'img/소나무 진정 로션.png' },
      { name: '이니스프리 그린티 크림', img: 'img/이니스프리 그린티 크림.png' },
      { name: '닥터자르트 로션', img: 'img/닥터자르트 로션.png' },
      { name: '이니스프리 그린티 선세럼', img: 'img/아니스프라 그린티 진정수분 선세럼.png' },
      { name: '제로이드 수딩 로션', img: 'img/제로이드 수딩 로션.png' }
    ],
    dry: [
      { name: '세라마이드 크림', img: 'img/cream.jpg' },
      { name: '히알루론산 에센스', img: 'img/essence.jpg' },
      { name: '리치 타입 선크림', img: 'img/sun.jpg' },
      { name: '고보습 앰플', img: 'img/cream.jpg' },
      { name: '오일 미스트', img: 'img/essence.jpg' },
    ],
    combo: [
      { name: 'BHA 토너 (T존용)', img: 'img/toner.jpg' },
      { name: '수분 젤 크림', img: 'img/cream.jpg' },
      { name: '유분기 없는 선크림', img: 'img/sun.jpg' },
      { name: '밸런싱 로션', img: 'img/cream.jpg' },
      { name: '수분 진정 팩', img: 'img/sun.jpg' }
    ],
    normal: [
      { name: '약산성 토너', img: 'img/toner.jpg' },
      { name: '데일리 로션', img: 'img/lotion.jpg' },
      { name: '촉촉한 선크림', img: 'img/sun.jpg' },
      { name: '비타민 세럼', img: 'img/lotion.jpg' },
      { name: '수분 마스크', img: 'img/sun.jpg' }
    ]
  };

  // --- 3) 결과 표시 ---
  const c = CONTENT[winner] || CONTENT.normal;
  imgEl.src = c.image;
  imgEl.alt = `${c.title} 이미지`;

  textBox.innerHTML = `
    <div class="skin-summary">
      <h2>${c.title}</h2>
      
      <div class="pros-cons-grid">
        <div class="pc-box">
          <h3>Good</h3>
          <ul>${(c.pros || []).map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
        
        <div class="pc-box">
          <h3>Bad</h3>
          <ul>${(c.cons || []).map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
      </div>
      
      <p style="margin-top:30px; color:#666; font-size:15px; line-height:1.6;">
        <b>${c.title}</b>를 위한 맞춤형 솔루션을 아래에서 확인해보세요.
      </p>
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

  // --- 5) 추천 버튼 세팅 ---
  const list = PRODUCTS[winner] || [];
  const buttons = [btn1, btn2, btn3, btn4, btn5];
  const names = [name1, name2, name3, name4, name5];

  buttons.forEach((b, i) => {
    const it = list[i];
    const n = names[i];

    if (!b || !n) return; 

    if (it) {
      b.textContent = ""; 
      
      b.style.backgroundImage = `url('${it.img}')`;
      b.style.backgroundSize = 'cover';
      b.style.backgroundPosition = 'center';

      n.textContent = it.name;

      b.disabled = false;
      b.onclick = () => addSaved(it);
    } else {
      b.textContent = '준비중';
      b.style.backgroundImage = 'none';
      n.textContent = ''; 
      b.disabled = true;
      b.onclick = null;
    }
  });

  renderSaved();

  // ============================================================
  // [PART 6] 다시하기 (수정됨: 모달 열기)
  // ============================================================
  if (retry) {
    retry.addEventListener('click', () => {
      if (confirm('다시 검사하시겠어요?')) {
        // 1. 기존 데이터 삭제 (중요)
        // 삭제를 해야, 만약 사용자가 모달 닫고 새로고침하면 [PART 0]에서 걸러져서 메인으로 감.
        localStorage.removeItem('heve_skin_survey_result');
        
        // 2. 메인으로 이동하지 않고, 모달만 띄움
        // choice.html을 로드해서 #skinModalBox에 넣음
        $("#skinModalBox").load("choice.html", function() {
            // 로드 성공하면 모달 보이게 처리
            $("#skinModal").css("display", "flex");
            $("body").addClass("is-modal-open");
        });
      }
    });
  }
});