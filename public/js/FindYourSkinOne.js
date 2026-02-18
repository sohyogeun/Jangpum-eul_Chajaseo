document.addEventListener('DOMContentLoaded', async function () {
  // =========================
  // [0] 모달 DOM
  // =========================
  const overlay = document.querySelector("#skinModal");     // .Modal-session
  const box = document.querySelector("#skinModalBox");      // .Modal (내용 주입)
  if (!overlay || !box) return;

  // =========================
  // [1] 설문 데이터
  // =========================
  const STORE_KEY = 'heve_skin_survey_v1';
  const SKINS = ['oily', 'dry', 'combo', 'normal'];
  const LABEL = { oily: '지성 피부', dry: '건성 피부', combo: '복합성 피부', normal: '중성 피부' };

  const questionSets = [
    ["너의 얼굴이 맨날 번들거려?", "모공은 왜 점점 커져?", "블랙헤드랑 뾰루지가 잘 나?", "화장이 빨리 무너져?", "피부결이 매끈해지질 않지?"],
    ["세안 후 피부가 땅기니?", "각질이 자주 일어나?", "피부가 자주 붉어지니?", "잔주름이 눈에 띄어?", "피부가 푸석해 보이니?"],
    ["이마랑 코는 기름지고 볼은 건조하지 않아?", "화장품 하나로 전체 피부 관리하기 어렵지 않아?", "T존 모공이나 블랙헤드 잘 생기지 않아?", "계절·날씨 바뀔 때 피부 상태도 같이 변하지 않아?", "보습하면 번들거리고, 유분 잡으면 땅기지 않아?"],
    ["피부 관리 안 해도 괜찮다고 방치하지 않아?", "갑작스러운 날씨 변화에 피부가 쉽게 예민해지지 않아?", "나이 들면서 피부가 건성으로 바뀌지 않아?", "트러블 생겨도 대수롭지 않게 넘기지 않아?", "피부에 큰 문제 없다 보니 루틴 정하기 애매하지 않아?"]
  ];

  let currentSet = 0;

  // =========================
  // [2] 저장/로드
  // =========================
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

  const saveCurrentSet = () => {
    const inputs = box.querySelectorAll("input[type='checkbox']");
    saveSection(currentSet, { answers: Array.from(inputs).map(input => !!input.checked) });
  };

  // (선택) 새로고침(reload)일 때 초기화하고 싶으면
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  if (nav && nav.type === 'reload') {
    localStorage.removeItem(STORE_KEY);
  }

  // =========================
  // [3] 모달 열기/닫기
  // =========================
  async function openModal() {
    // 내용이 없으면 choice.html을 box에 주입
    if (box.querySelectorAll(".ch-item").length === 0) {
      try {
        const res = await fetch("choice.html");
        if (!res.ok) throw new Error("choice.html 로드 실패: " + res.status);
        box.innerHTML = await res.text();

        // 주입 직후 내부 이벤트 연결
        initSurveyElements();
      } catch (e) {
        console.error("모달 로딩 에러:", e);
        return;
      }
    }

    // 오버레이 표시
    overlay.style.display = 'flex';
    overlay.style.visibility = 'visible';

    // 첫 세트부터 시작
    currentSet = 0;
    updateQuestions();
  }

  function closeModal() {
    overlay.style.display = 'none';
    overlay.style.visibility = 'hidden';
  }

  // =========================
  // [4] 이벤트 연결
  // =========================

  // ✅ FYSSelf가 include로 늦게 생겨도 잡히도록 이벤트 위임
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#FYSSelf");
    if (!btn) return;
    e.preventDefault();
    openModal();
  });

  // 오버레이 바깥 클릭 시 닫기
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  // =========================
  // [5] 설문 UI 로직
  // =========================
  function initSurveyElements() {
    // 🔒 중복 이벤트 방지 (주입 후 1회만)
    if (box.dataset.inited === "1") return;
    box.dataset.inited = "1";

    const inputs = box.querySelectorAll("input[type='checkbox']");
    const nextBtn = box.querySelector("#Nest");
    const backBtn = box.querySelector("#back");

    // 체크 변경 시 저장 + 버튼 상태 업데이트
    inputs.forEach(input => {
      input.addEventListener("change", () => {
        saveCurrentSet();
        updateNavState();
      });
    });

    // 다음 버튼
    if (nextBtn) {
      nextBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        if (nextBtn.classList.contains("disabled")) {
          alert("2개 이상 누르시오");
          return;
        }

        saveCurrentSet();

        if (currentSet < questionSets.length - 1) {
          currentSet++;
          updateQuestions();
        } else {
          await finalizeAndGo();
        }
      });
    }

    // 이전 버튼
    if (backBtn) {
      backBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentSet === 0) return;

        saveCurrentSet();
        currentSet--;
        updateQuestions();
      });
    }
  }

  function updateQuestions() {
    const labels = box.querySelectorAll(".question-text");
    const inputs = box.querySelectorAll("input[type='checkbox']");

    // 질문 텍스트 갱신
    labels.forEach((span, i) => {
      span.textContent = questionSets[currentSet][i];
    });

    // 체크 상태 복구
    const saved = loadSection(currentSet);
    const ans = Array.isArray(saved.answers) ? saved.answers : [];
    inputs.forEach((input, i) => {
      input.checked = !!ans[i];
    });

    updateNavState();
  }

  function updateNavState() {
    const nextBtn = box.querySelector("#Nest");
    const backBtn = box.querySelector("#back");
    const inputs = box.querySelectorAll("input[type='checkbox']");

    if (backBtn) backBtn.disabled = (currentSet === 0);

    const checkedCount = Array.from(inputs).filter(i => i.checked).length;
    const isFinal = currentSet === questionSets.length - 1;

    if (nextBtn) {
      nextBtn.classList.toggle("disabled", checkedCount < 2);
      nextBtn.textContent = isFinal ? "결과 보기" : "다음";
    }
  }

  // =========================
  // [6] 완료 처리(너 기존 로직 스타일 유지)
  // =========================
  async function finalizeAndGo() {
    saveCurrentSet();

    // 점수 계산(각 세트에서 체크된 개수)
    const all = loadAll();
    const counts = {
      oily: (all.oily?.answers || []).filter(Boolean).length,
      dry: (all.dry?.answers || []).filter(Boolean).length,
      combo: (all.combo?.answers || []).filter(Boolean).length,
      normal: (all.normal?.answers || []).filter(Boolean).length,
    };

    const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

    // 결과 저장
    localStorage.setItem('heve_skin_survey_result', JSON.stringify({
      winner,
      scores: counts,
      ts: Date.now()
    }));

    alert(`설문 완료! "${LABEL[winner]}" 입니다.`);
    location.assign('./FYS.html');
  }
  function resetSurvey() {
  // 1) 설문 저장값 삭제
  localStorage.removeItem(STORE_KEY);

  // 2) 결과 저장값도 삭제 (FYS페이지에서 결과 표시할 때 쓰는 값)
  localStorage.removeItem("heve_skin_survey_result");

  // 3) 현재 페이지 인덱스 초기화
  currentSet = 0;

  // 4) 모달 안 체크박스 전부 해제 (현재 주입된 DOM 기준)
  const inputs = box.querySelectorAll("input[type='checkbox']");
  inputs.forEach(i => i.checked = false);

  // 5) 버튼 상태/질문 갱신
  updateQuestions();
}
document.addEventListener("click", async (e) => {
  const retry = e.target.closest("#refresh");
  if (!retry) return;

  e.preventDefault();

  // 모달이 아직 로드 안 됐을 수도 있으니 먼저 열어서 box에 DOM 만들고
  await openModal();

  // 그리고 초기화
  resetSurvey();
});
});
