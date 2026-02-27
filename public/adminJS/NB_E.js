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
        id: doc.id ?? doc._id,
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

// --------------------------------------------------------
  // ✅ [수정된 부분] 게시물 등록 기능 (이벤트 위임 방식으로 교체)
  // --------------------------------------------------------
  document.body.addEventListener('click', async (e) => {
    
    // 클릭된 요소가 등록 버튼인지 확인 ('btn-submit' 아이디)
    if (e.target.id === 'btn-submit') {
      console.log("✅ 등록 버튼 클릭 감지됨!");

      // 1. 입력 폼의 데이터 가져오기 (RE.js에서 적어준 id와 정확히 일치시킵니다!)
      const title = document.querySelector('#title')?.value;
      
      // ✅ 공지글 체크박스 id가 "noticeCheck" 였습니다.
      const isNotice = document.querySelector('#noticeCheck')?.checked || false; 
      
      const name = document.querySelector('#name')?.value;
      const email = document.querySelector('#email')?.value;
      const password = document.querySelector('#password')?.value;
      
      // ✅ 썸머노트 아이디가 "summernote-editor" 였습니다. 이 코드로 변경해주세요!
      const content = $('#summernote-editor').summernote('code');

      console.log("수집된 데이터:", { title, name, content }); 

      // 2. 필수 값 확인
      if (!title || !name || !content) {
        return alert('제목, 이름, 내용을 모두 입력해주세요.');
      }
      // --------------------------------------------------------
      // ✅ [추가된 부분] 이메일 형식 검사 로직
      // --------------------------------------------------------
      // 이메일 칸에 무언가 입력되었을 때만 검사합니다.
      if (email && email.trim() !== '') {
        // 이메일 형식을 검사하는 정규표현식 (알파벳/숫자 @ 알파벳/숫자 . 알파벳)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // 입력한 이메일이 형식에 맞지 않으면 경고를 띄우고 함수를 종료(return)합니다.
        if (!emailRegex.test(email)) {
          return alert('올바른 이메일 형식이 아닙니다. (예: example@test.com)');
        }
      }

      // 3. 백엔드 API로 데이터 전송
      try {
        const response = await fetch('/api/reply-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, isNotice, name, email, password, content })
        });

        const result = await response.json();

        if (result.success) {
          alert('게시글이 성공적으로 등록되었습니다.');
          
          // 4. 입력 폼 비우기
          if(document.querySelector('#title')) document.querySelector('#title').value = '';
          if(document.querySelector('#isNotice')) document.querySelector('#isNotice').checked = false;
          if(document.querySelector('#name')) document.querySelector('#name').value = '';
          if(document.querySelector('#email')) document.querySelector('#email').value = '';
          if(document.querySelector('#password')) document.querySelector('#password').value = '';
          if(document.querySelector('#content')) document.querySelector('#content').value = '';

          // 5. 목록 화면으로 돌아가고 최신 데이터 다시 불러오기
          switchView('list');
          loadPage(1); 
        } else {
          alert('등록 실패: ' + result.message);
        }
      } catch (error) {
        console.error('서버 전송 에러:', error);
        alert('데이터를 저장하는 중 오류가 발생했습니다.');
      }
    }
  });
  // --------------------------------------------------------

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
    checkbox.dataset.email = r.user;
    liCheck.append(checkbox);

    const liNo = document.createElement('li');
    liNo.className = 'list-group-item two';
    liNo.textContent = r.no;

    const liTitle = document.createElement('li');
    liTitle.className = 'list-group-item three js-open-read'; 
    liTitle.style.cursor = 'pointer';
    liTitle.textContent = r.title;
    liTitle.dataset.id = String(r.id || ""); 

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

// 제목/텍스트 안전처리
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}