document.addEventListener('DOMContentLoaded', () => {
  const listView = document.getElementById('list-view');
  const writeView = document.getElementById('write-view');
  const readView = document.getElementById('read-view');

  const body = document.querySelector('.NB_E_E .NB_body');
  const pager = document.querySelector('.NB_E_U');

  if (!listView) return console.error('#list-view 없음');
  if (!writeView) return console.error('#write-view 없음');
  if (!readView) return console.error('#read-view 없음');
  if (!body) return console.error('NB_body 없음');
  if (!pager) return console.error('NB_E_U 없음');

  const LIMIT = 5;
  let currentPage = 1;

  let lastRows = []; // ✅ 상세보기용 캐시

  // ✅ 화면 전환
function switchView(view) {
  listView.style.display  = (view === 'write') ? 'none' : 'block';
  writeView.style.display = (view === 'write') ? 'block' : 'none';
  readView.style.display  = (view === 'read') ? 'block' : 'none';
}

if (readView.parentElement !== listView) {
    listView.appendChild(readView);
  }
  readView.style.display = 'none';   // 기본은 숨김
  readView.style.width = '100%';


  // ✅ 페이지 로드
  async function loadPage(page) {
    currentPage = page;

    try {
      const res = await fetch(`/api/inquiries/list?page=${page}&limit=${LIMIT}`);
      const data = await res.json();

      const rows = (data.list || []).map((doc, idx) => ({
        // ✅ 백엔드 mapDoc는 id로 내려줌 (doc.id)
        id: doc.id ?? doc._id,                // 안전하게 둘 다 대응
        content: doc.content || "",
        category: doc.category,
        no: (page - 1) * LIMIT + (idx + 1),
        title: `[${doc.category}] ${doc.title}`,
        date: formatDate(doc.createdAt),
        user: doc.userId || doc.writer || '-',
        hit: doc.hit ?? 0,
      }));

      lastRows = rows; // ✅ 캐시 저장

      renderTableRows(body, rows);
      renderPager(pager, data.totalPages ?? 1, currentPage);

      switchView('list'); // ✅ 목록 화면 유지
    } catch (e) {
      console.error(e);
      body.replaceChildren();
      pager.replaceChildren();
    }
  }

  // ✅ pager 클릭
  pager.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-page]');
    if (!btn) return;

    const page = Number(btn.dataset.page);
    if (!Number.isFinite(page)) return;

    loadPage(page);
  });

  // ✅ 제목 클릭 → 상세보기 (이벤트 위임)
  body.addEventListener('click', (e) => {
  const t = e.target.closest('.js-open-read');
  if (!t) return;

  const id = t.dataset.id;
  const row = lastRows.find(r => String(r.id) === String(id));
  if (!row) return alert('상세 데이터를 찾을 수 없습니다.');

  renderRead(readView, row);
  switchView('read');

  // ✅ 하단 상세로 자연스럽게 이동 (추가)
  readView.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

  // ✅ 상세 → 목록 버튼
  readView.addEventListener('click', (e) => {
  const back = e.target.closest('#btn-back-list');
  if (!back) return;

  switchView('list'); // ✅ list는 유지, read만 닫힘
});

  // 첫 로드
  loadPage(1);
});

// 날짜 포맷
function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ✅ 목록 렌더 (DOM API)
function renderTableRows(body, rows) {
  body.replaceChildren();
  const frag = document.createDocumentFragment();

  rows.forEach((r) => {
    const ul = document.createElement('ul');
    ul.className = 'list-group list-group-horizontal-sm';

    const liCheck = document.createElement('li');
    liCheck.className = 'list-group-item one';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    liCheck.append(checkbox);

    const liNo = document.createElement('li');
    liNo.className = 'list-group-item two';
    liNo.textContent = r.no;

    const liTitle = document.createElement('li');
    liTitle.className = 'list-group-item three js-open-read'; // ✅ 클릭 타겟 클래스
    liTitle.style.cursor = 'pointer';
    liTitle.textContent = r.title;
    liTitle.dataset.id = String(r.id || ""); // ✅ 상세보기 찾기용

    const liDate = document.createElement('li');
    liDate.className = 'list-group-item four';
    liDate.textContent = r.date;

    const liUser = document.createElement('li');
    liUser.className = 'list-group-item two';
    liUser.textContent = r.user;

    const liHit = document.createElement('li');
    liHit.className = 'list-group-item one';
    liHit.textContent = r.hit;

    ul.append(liCheck, liNo, liTitle, liDate, liUser, liHit);
    frag.append(ul);
  });

  body.append(frag);
}

// ✅ pager 렌더
function renderPager(pager, totalPages, currentPage) {
  pager.replaceChildren();
  const frag = document.createDocumentFragment();

  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.page = String(p);
    if (p === currentPage) btn.classList.add('active');

    const label = document.createElement('label');
    label.textContent = String(p);
    btn.append(label);

    frag.append(btn);
  }

  pager.append(frag);
}

// ✅ 상세보기 렌더 (read-view에 뿌림)
function renderRead(readView, row) {
  readView.innerHTML = `
    <div class="read-card" style="margin-top:20px;">
      <div class="read-head">
        <h4 class="read-title">상세보기</h4>
        <button type="button" id="btn-back-list" class="read-close">닫기</button>
      </div>

      <div class="read-subject">${escapeHtml(row.title)}</div>

      <div class="read-meta">
        작성일: ${escapeHtml(row.date)} / 작성자: ${escapeHtml(row.user)}
      </div>

      <div class="read-content">
        ${row.content || ""}
      </div>
    </div>
  `;
}


// 제목/텍스트 안전처리(상세 title, meta에만 사용)
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
