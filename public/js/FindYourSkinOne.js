document.addEventListener('DOMContentLoaded', async function () {

  // ===== (추가) choice.html을 먼저 주입 =====
const mount = document.querySelector(".Ch_item"); // ✅ 붙일 자리(요소)
if (!mount) {
  console.error(".Ch_item을 찾을 수 없습니다.");
  return;
}

// ✅ 이미 .ch-item이 있으면(이미 주입됐으면) fetch 스킵
if (document.querySelectorAll(".ch-item").length === 0) {
  const res = await fetch("choice.html");
  if (!res.ok) throw new Error("choice.html 로드 실패: " + res.status);

  mount.innerHTML = await res.text();
} // ✅ 여기서 if 닫기 (이게 핵심)

// ✅ 서브에서 넘어왔으면 자동으로 모달 열기 (항상 체크)
if (typeof window.tryOpenChoiceFromQuery === 'function') {
  window.tryOpenChoiceFromQuery();
}


  const STORE_KEY = 'heve_skin_survey_v1';
  const SKINS = ['oily', 'dry', 'combo', 'normal'];
  const LABEL = { oily: '지성 피부', dry: '건성 피부', combo: '복합성 피부', normal: '중성 피부' };

  const loadAll = () => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch { return {}; }
  };
  const saveAll = (data) => localStorage.setItem(STORE_KEY, JSON.stringify(data));
  const loadSection = (idx) => (loadAll()[SKINS[idx]] || {});
  const saveSection = (idx, sectionData) => {
    const all = loadAll();
    all[SKINS[idx]] = sectionData;
    all.updatedAt = Date.now();
    saveAll(all);
  };

  // ===== 새로고침 감지 → 초기화 =====
  const navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  const isReloadNew = navEntry && navEntry.type === 'reload';
  const isReloadOld = performance.navigation && performance.navigation.type === 1;
  if (isReloadNew || isReloadOld) {
    localStorage.removeItem(STORE_KEY);
  }

  // ===== 질문 세트 =====
  const questionSets = [
    // 지성
    [
      "너의 얼굴이 맨날 번들거려?",
      "모공은 왜 점점 커져?",
      "블랙헤드랑 뾰루지가 잘 나?",
      "화장이 빨리 무너져?",
      "피부결이 매끈해지질 않지?"
    ],
    // 건성
    [
      "세안 후 피부가 땅기니?",
      "각질이 자주 일어나?",
      "피부가 자주 붉어지니?",
      "잔주름이 눈에 띄어?",
      "피부가 푸석해 보이니?"
    ],
    // 복합성
    [
      "이마랑 코는 기름지고 볼은 건조하지 않아?",
      "화장품 하나로 전체 피부 관리하기 어렵지 않아?",
      "T존 모공이나 블랙헤드 잘 생기지 않아?",
      "계절·날씨 바뀔 때 피부 상태도 같이 변하지 않아?",
      "보습하면 번들거리고, 유분 잡으면 땅기지 않아?"
    ],
    // 중성 (수정된 부분)
    [
      "피부 관리 안 해도 괜찮다고 방치하지 않아?",
      "갑작스러운 날씨 변화에 피부가 쉽게 예민해지지 않아?",
      "나이 들면서 피부가 건성으로 바뀌지 않아?",
      "트러블 생겨도 대수롭지 않게 넘기지 않아?",
      "피부에 큰 문제 없다 보니 루틴 정하기 애매하지 않아?"
    ]
  ];

  // ===== DOM 캐시 =====
  let currentSet = 0;
  const labels = document.querySelectorAll(".ch-item .question-text");
  const inputs  = document.querySelectorAll(".ch-item input[type='checkbox']");
  const nextBtn = document.getElementById("Nest");
  const backBtn = document.getElementById("back");

  // 새로고침 초기화 이후 체크박스 모두 해제
  inputs.forEach(input => input.checked = false);

  // ===== UI ↔ 저장소 동기화 =====
  function collectCurrentAnswers() {
    return { answers: Array.from(inputs).map(input => !!input.checked) };
  }
  function saveCurrentSet() {
    saveSection(currentSet, collectCurrentAnswers());
  }
  function restoreCurrentSet() {
    const saved = loadSection(currentSet);
    const ans = Array.isArray(saved.answers) ? saved.answers : [];
    inputs.forEach((input, i) => input.checked = !!ans[i]);
  }
  function updateQuestions() {
    labels.forEach((span, i) => { span.textContent = questionSets[currentSet][i]; });
    restoreCurrentSet();
    updateNavState();
  }

// 입력 변화 즉시 저장 및 버튼 상태 업데이트
inputs.forEach(input => {
  input.addEventListener('change', () => {
    saveCurrentSet();
    updateNavState(); // 이 줄을 추가하세요
  });
});


// ===== 버튼 상태 =====
function updateNavState() {
  if (backBtn) {
    backBtn.disabled = currentSet === 0;
  }
  const checkedCount = Array.from(inputs).filter(input => input.checked).length;
  const isFinalPage = currentSet === questionSets.length - 1;
  if (nextBtn) {
    // disabled 속성 대신 'disabled' 클래스를 제어하고, 조건을 3개 미만으로 변경
    nextBtn.classList.toggle('disabled', checkedCount < 2);
    nextBtn.textContent = isFinalPage ? '결과 보기' : '다음';
  }
}
 // ===== 결과 계산 + 저장 + 이동 =====
async function finalizeAndGo() {
  saveCurrentSet();

  const all = loadAll();
  const counts = {
    oily:   (all.oily?.answers   || []).filter(Boolean).length,
    dry:    (all.dry?.answers    || []).filter(Boolean).length,
    combo:  (all.combo?.answers  || []).filter(Boolean).length,
    normal: (all.normal?.answers || []).filter(Boolean).length,
  };

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [winner, topNum] = entries[0];
  const secondNum = entries[1]?.[1] ?? 0;
  const standout = topNum >= 2 && topNum > secondNum;

  // 결과 로컬 저장
  const result = { winner, scores: counts, ts: Date.now() };
  localStorage.setItem('heve_skin_survey_result', JSON.stringify(result));
  console.log('[SAVE RESULT]', result);

  // ✅ 여기서 DB 저장 (실패해도 진행되게 try/catch)
  try {
    const r = await fetch('/api/auth/skin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ skinType: winner, scores: counts })
    });

    // 서버가 401/500/404를 주면 여기서 확인 가능
    if (!r.ok) {
      console.warn('DB 저장 실패:', r.status, await r.text());
    }
  } catch (e) {
    console.warn('DB 저장 요청 자체가 실패:', e);
  }

  alert(`설문 완료! ${standout ? '가장 두드러진 특성은' : '가장 근접한 타입은'} "${LABEL[winner]}" 입니다.`);
  location.assign('./FYS.html');
}

// ===== 이전/다음 =====
if (nextBtn) {
  nextBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    if (nextBtn.classList.contains('disabled')) {
      alert("2개 이상 누르시오");
      return;
    }

    saveCurrentSet();

    if (currentSet < questionSets.length - 1) {
      currentSet++;
      updateQuestions();
    } else {
      await finalizeAndGo(); // async라면 await 붙여도 됨(안 붙여도 됨)
    }
  });
}

if (backBtn) {
  backBtn.addEventListener("click", function (e) {
    e.preventDefault();
    if (currentSet === 0) return;
    saveCurrentSet();
    currentSet--;
    updateQuestions();
  });
}
// ===== 초기 렌더 =====
updateQuestions();
});



