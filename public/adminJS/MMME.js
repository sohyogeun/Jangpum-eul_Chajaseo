// js/MMME.js
// ✅ innerHTML 버전 (DOM API 버전 → innerHTML로 변환)

(() => {
  const listEl = document.getElementById("list-view");
  const writeEl = document.getElementById("write-view");

  if (!listEl || !writeEl) {
    console.error("[MMME.js] #list-view 또는 #write-view 없음");
    return;
  }

  // ✅ 카테고리 (uiBtnId = 버튼 id, apiCategory = 서버로 보낼 category)
  // 백엔드가 MMI/MMB/MSK/MOI라면 apiCategory만 바꿔주면 됨.
  const CATEGORIES = [
    { title: "회원 정보 관련", uiBtnId: "MI", apiCategory: "MI" },
    { title: "화장품(비교) 관련", uiBtnId: "MB", apiCategory: "MB" },
    { title: "나의 피부 관련", uiBtnId: "SK", apiCategory: "SK" },
    { title: "기타 문의", uiBtnId: "OI", apiCategory: "OI" },
  ];

  let current = CATEGORIES[0];
  let lastPosts = [];
  // =========================
  // 화면 전환
  // =========================
  function show(view) {
    if (view === "list") {
      listEl.style.display = "block";
      writeEl.style.display = "none";
      destroySummernoteIfAny();
    } else {
      listEl.style.display = "none";
      writeEl.style.display = "block";
    }
  }

  function destroySummernoteIfAny() {
    if (!window.jQuery) return;
    const $sn = window.jQuery("#summernote");
    if ($sn.length) {
      try { $sn.summernote("destroy"); } catch (e) {}
    }
  }

  // =========================
  // API
  // =========================
  async function apiList(category) {
    const res = await fetch(`/api/admin-advice/list?category=${encodeURIComponent(category)}`);
    if (!res.ok) throw new Error(`목록 실패 HTTP ${res.status}`);
    return await res.json();
  }

  async function apiWrite(payload) {
    const res = await fetch("/api/admin-advice/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || `저장 실패 HTTP ${res.status}`);
    return data;
  }

  // =========================
  // 안전 출력(제목에 태그 들어오는 것 방지)
  // =========================
  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // =========================
  // 렌더: 목록 (innerHTML)
  // =========================
  function renderList(cat, posts) {
    show("list");

    lastPosts = posts || [];              // ✅ 추가
    const box = document.getElementById("detail-box"); // ✅ 추가
    if (box) box.style.display = "none";

    const rowsHtml = (posts && posts.length)
      ? posts.map((post, idx) => {
          const date = post.createdAt
            ? new Date(post.createdAt).toISOString().split("T")[0]
            : "-";
          const no = (posts.length - idx);

          return `
            <tr>
                <td class="T_nameTwe_One_one">
                <input type="checkbox" value="${escapeHtml(post._id || "")}">
                </td>
                <td class="T_nameTwe_One_twe">${no}</td>

                <td class="T_nameTwe_One_three js-open-post"
                    data-id="${escapeHtml(post._id || "")}"
                    style="text-align:left; padding-left:10px; cursor:pointer;">
                ${escapeHtml(post.title || "")}
                </td>

                <td class="T_nameTwe_One_twe">${date}</td>
            </tr>
            `;
        }).join("")
      : `
        <tr>
          <td class="T_nameTwe_One_one"><input type="checkbox" disabled></td>
          <td class="T_nameTwe_One_twe">-</td>
          <td class="T_nameTwe_One_three">등록된 게시글이 없습니다.</td>
          <td class="T_nameTwe_One_twe">-</td>
        </tr>
      `;

    listEl.innerHTML = `
      <div class="T_nameOne">
        <p>${escapeHtml(cat.title)}</p>
        <div>
          <select id="search-type">
            <option value="content">내용</option>
            <option value="title">제목</option>
          </select>
          <input type="text" id="search-keyword" />
          <button type="button" id="btn-search">검색</button>
        </div>
      </div>

      <div class="T_nameTwe">
        <table>
          <tbody>
            <tr class="column">
              <td class="T_nameTwe_One_one">V</td>
              <td class="T_nameTwe_One_twe">번호</td>
              <td class="T_nameTwe_One_three">제목</td>
              <td class="T_nameTwe_One_twe">작성일</td>
            </tr>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="NB_E_B">
          <button type="button" id="btn-go-write">글쓰기</button>
          <button type="button" id="btn-delete">삭제</button>
        </div>
      </div>
    `;
  }

  // =========================
  // 렌더: 글쓰기 (innerHTML)
  // =========================
  function renderWriteShell(titleText, bodyHtml, buttonsHtml) {
  show("write");
  writeEl.innerHTML = `
    <div class="T_nameOne">
      <p>${escapeHtml(titleText)}</p>
      <div></div>
    </div>

    <div class="T_nameTwe">
      ${bodyHtml}
      <div class="NB_E_B">
        ${buttonsHtml}
      </div>
    </div>
  `;
}
function renderWrite(cat) {
  renderWriteShell(
    `${cat.title} - 글쓰기`,
    `
      <div style="padding: 20px;">
        <div style="margin-bottom: 10px;">
          <input type="text" id="input-title" placeholder="제목을 입력하세요"
            style="width:100%; padding:10px; border:1px solid #ccc; box-sizing:border-box;">
        </div>
        <div>
          <textarea id="summernote"></textarea>
        </div>
      </div>
    `,
    `
      <button type="button" id="btn-save">저장</button>
      <button type="button" id="btn-cancel">취소</button>
    `
  );

  // ✅ Summernote init (쓰기 화면일 때만)
  if (window.jQuery) {
    window.jQuery("#summernote").summernote({
      placeholder: "내용을 입력해주세요",
      tabsize: 2,
      height: 600,
      lang: "ko-KR",
      toolbar: [
        ["style", ["style"]],
        ["font", ["bold", "underline", "clear"]],
        ["color", ["color"]],
        ["para", ["ul", "ol", "paragraph"]],
        ["table", ["table"]],
        ["insert", ["link", "picture"]],
        ["view", ["codeview", "help"]],
      ],
    });
  }
}
function renderReadHtml(cat, post) {
  const date = post?.createdAt
    ? new Date(post.createdAt).toISOString().split("T")[0]
    : "-";

  return `
    <div style="padding: 20px;">
      <div style="margin-bottom:10px;">
        <input type="text" value="${escapeHtml(post.title || "")}" disabled
          style="width:100%; padding:10px; border:1px solid #ccc; box-sizing:border-box; background:#f7f7f7;">
      </div>

      <div style="margin-bottom:15px; font-size:12px; color:#666;">
        작성일: ${date}
      </div>

      <div style="border:1px solid #e5e5e5; padding:15px; min-height:200px;">
        ${post.content || ""}
      </div>
    </div>
  `;
}

function openDetailBox(cat, post) {
  const box = document.getElementById("detail-box");
  if (!box) return;

  box.innerHTML = `
    <div class="detail-head">
      <strong class="detail-title">${escapeHtml(cat.title)} - 상세보기</strong>
      <button type="button" id="btn-close-detail">닫기</button>
    </div>
    ${renderReadHtml(cat, post)}
  `;

  box.style.display = "block";
  box.scrollIntoView({ behavior: "smooth", block: "start" });
}

  // =========================
  // 동작: 목록 로드
  // =========================
  async function loadList(cat) {
    current = cat;
    show("list");
    listEl.innerHTML = `<div style="padding:20px;">로딩 중...</div>`;

    try {
      const data = await apiList(cat.apiCategory);
      renderList(cat, data);
    } catch (e) {
      console.error(e);
      listEl.innerHTML = `<div style="padding:20px;">목록 로딩 실패(콘솔 확인)</div>`;
    }
  }

  // =========================
  // 동작: 저장
  // =========================
  async function savePost() {
    const titleEl = document.getElementById("input-title");
    if (!titleEl) return;

    const title = titleEl.value.trim();
    const content = window.jQuery ? window.jQuery("#summernote").summernote("code") : "";

    if (!title) return alert("제목을 입력해주세요.");
    if (window.jQuery && window.jQuery("#summernote").summernote("isEmpty")) {
      return alert("내용을 입력해주세요.");
    }

    try {
      await apiWrite({ category: current.apiCategory, title, content });
      alert("저장 완료!");
      loadList(current);
    } catch (e) {
      console.error(e);
      alert("저장 실패: " + e.message);
    }
  }

  // =========================
  // 이벤트(위임)
  // =========================
document.addEventListener("click", (e) => {
  const target = e.target;
  
  if (target.closest("#btn-close-detail")) {
    e.preventDefault();
    const box = document.getElementById("detail-box");
    if (box) box.style.display = "none";
    return;
  }
  // ✅ (1) 제목 클릭 → 상세보기 (버튼 체크보다 먼저!)
  const openTd = target.closest(".js-open-post");
  if (openTd) {
    e.preventDefault();
    const postId = openTd.dataset.id;
    const post = lastPosts.find(p => String(p._id) === String(postId));
    if (!post) return alert("게시글 정보를 찾을 수 없습니다.");
    openDetailBox(current, post); // ✅ 여기!
    return;
  }


  // ✅ 버튼 처리
  const btn = target.closest("button");
  if (!btn) return;

  const id = btn.id;

  // ✅ 상세보기에서 목록
  if (id === "btn-back-list") {
    e.preventDefault();
    loadList(current);
    return;
  }

  // 좌측 메뉴 버튼 (MI/MB/SK/OI)
  const cat = CATEGORIES.find((c) => c.uiBtnId === id);
  if (cat) {
    e.preventDefault();
    loadList(cat);
    return;
  }

  if (id === "btn-go-write") {
    e.preventDefault();
    renderWrite(current);
    return;
  }

  if (id === "btn-save") {
    e.preventDefault();
    savePost();
    return;
  }

  if (id === "btn-cancel") {
    e.preventDefault();
    if (confirm("작성을 취소하시겠습니까?")) loadList(current);
    return;
  }

  if (id === "btn-search") {
    e.preventDefault();
    alert("검색 기능은 아직 연결되지 않았습니다.");
    return;
  }

  if (id === "btn-delete") {
    e.preventDefault();
    alert("삭제 기능은 아직 연결되지 않았습니다.");
    return;
  }
});


  // 시작
  document.addEventListener("DOMContentLoaded", () => {
    loadList(CATEGORIES[0]);
  });
})();
