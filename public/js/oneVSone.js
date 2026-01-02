// ========= 1:1 상담 =========
document.addEventListener('DOMContentLoaded', () => {
  const mainArea = document.querySelector('.mypageBack2');
  const counselBtn = document.getElementById('counselBtn');
  if (!mainArea || !counselBtn) return;

  // 예시 데이터 (나중에 fetch로 교체 가능)
  const COUNSEL_DATA = [
    {
      id: 'Q2024-001',
      title: '지성 피부 저녁 루틴 상담',
      createdAt: '2024-09-02 15:21',
      status: 'answered', // answered | pending
      replies: [
        { at: '2024-09-03 11:02', from: '헤브샵 상담사', summary: '세럼 용량 조절과 수분크림 권장' },
      ],
    },
    {
      id: 'Q2024-002',
      title: '여드름 흉터 제품 추천',
      createdAt: '2024-09-10 09:10',
      status: 'pending',
      replies: [],
    },
    {
      id: 'Q2024-003',
      title: '선크림 재도포 방법',
      createdAt: '2024-09-21 18:44',
      status: 'answered',
      replies: [
        { at: '2024-09-22 10:00', from: '헤브샵 상담사', summary: '2~3시간 간격, 톤업형 주의' },
        { at: '2024-09-22 17:26', from: '헤브샵 상담사', summary: '수정메이크업 팁 추가' },
      ],
    },
  ];

  // 렌더: 내가 보낸 상담 리스트
  function renderCounselList() {
    const rows = COUNSEL_DATA.map(item => `
      <tr>
        <td class="c-id">${item.id}</td>
        <td class="c-title">${item.title}</td>
        <td class="c-date">${item.createdAt}</td>
        <td class="c-status ${item.status}">${item.status === 'answered' ? '답변완료' : '대기중'}</td>
      </tr>
    `).join('');

    mainArea.innerHTML = `
      <section class="counsel">
        <div class="c-head">
          <h2>1대1 상담</h2>
          <button type="button" class="btn-replies">답장 받은</button>
        </div>
        <table class="counsel-table">
          <thead>
            <tr><th>번호</th><th>제목</th><th>작성일</th><th>상태</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="c-hint">최근 상담 50개까지 표시됩니다.</p>
      </section>
    `;

    // 버튼: 답장 받은 보기
    mainArea.querySelector('.btn-replies').addEventListener('click', renderRepliesList);
  }

  // 렌더: 답장 받은 리스트
  function renderRepliesList() {
    // 답장이 1건 이상 있는 상담만 추려서, reply 단위로 flatten
    const replyRows = COUNSEL_DATA
      .filter(item => item.replies && item.replies.length)
      .flatMap(item =>
        item.replies.map(rep => ({
          id: item.id,
          title: item.title,
          at: rep.at,
          from: rep.from,
          summary: rep.summary
        }))
      );

    const body = replyRows.length
      ? replyRows.map(r => `
          <tr>
            <td class="c-id">${r.id}</td>
            <td class="c-title">${r.title}</td>
            <td class="c-from">${r.from}</td>
            <td class="c-date">${r.at}</td>
            <td class="c-summary">${r.summary}</td>
          </tr>
        `).join('')
      : `<tr><td colspan="5" class="empty">아직 받은 답장이 없습니다.</td></tr>`;

    mainArea.innerHTML = `
      <section class="counsel">
        <div class="c-head">
          <h2>답장 받은 목록</h2>
          <button type="button" class="btn-back">내 상담 보기</button>
        </div>
        <table class="counsel-table">
          <thead>
            <tr><th>상담번호</th><th>제목</th><th>답장 보낸 사람</th><th>답장 시각</th><th>요약</th></tr>
          </thead>
          <tbody>${body}</tbody>
        </table>
        <p class="c-hint">답장이 여러 번 온 상담은 여러 줄로 표시됩니다.</p>
      </section>
    `;

    // 버튼: 내 상담으로 돌아가기
    mainArea.querySelector('.btn-back')?.addEventListener('click', renderCounselList);
  }

  // 사이드바 버튼 클릭 시 진입
  counselBtn.addEventListener('click', renderCounselList);
});
