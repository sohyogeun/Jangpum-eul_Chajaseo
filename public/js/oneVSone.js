// ========= 1:1 상담 =========
document.addEventListener('DOMContentLoaded', () => {
  const mainArea = document.querySelector('.mypageBack2');
  const counselBtn = document.getElementById('counselBtn');
  if (!mainArea || !counselBtn) return;

  let myInquiries = [];

  async function fetchMyInquiries() {
    try {
      const response = await fetch('/api/inquiries/my-inquiries');
      const result = await response.json();

      if (result.ok) {
        myInquiries = result.list || [];
        renderCounselList();
      } else {
        alert("상담 내역을 불러오는데 실패했습니다: " + (result.message || ''));
      }
    } catch (error) {
      console.error("데이터 가져오기 에러:", error);
    }
  }

  function renderCounselList() {
    const rows = myInquiries.map((item) => {
      const date = new Date(item.createdAt);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      return `
        <tr>
          <td class="c-id">${String(item.id || item._id).substring(0,8)}</td>
          <td class="c-title">${item.title}</td>
          <td class="c-date">${formattedDate}</td>
          <td class="c-status ${item.status === 'NEW' ? 'pending' : 'answered'}">
            ${item.status === 'NEW' ? '대기중' : '답변완료'}
          </td>
        </tr>
      `;
    }).join('');

    mainArea.innerHTML = `
      <section class="counsel">
        <div class="c-head">
          <h2>1대1 상담</h2>
          <button type="button" class="btn-replies">답장 받은</button>
        </div>
        <table class="counsel-table">
          <thead class="table-light">
            <tr><th>번호</th><th>제목</th><th>작성일</th><th>상태</th></tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="4" style="text-align:center; padding:20px;">상담 내역이 없습니다.</td></tr>'}
          </tbody>
        </table>
        <p class="c-hint">최근 상담 내역이 표시됩니다.</p>
      </section>
    `;

    mainArea.querySelector('.btn-replies')?.addEventListener('click', renderRepliesList);
  }

  // ✅ 답장 목록 렌더
  function renderRepliesList() {
    const replyRows = myInquiries
      .filter(item => item.replies && item.replies.length)
      .flatMap(item =>
        item.replies.map(rep => {
          // ✅ 상세는 무조건 rep.content (백엔드에서 내려줘야 함)
          const fullContent = rep.content ?? null;

          return {
            id: String(item.id || item._id).substring(0,8),
            title: item.title,
            at: rep.at || rep.createdAt || '-',
            from: rep.from || rep.name || '관리자',

            // ✅ 목록 요약은 서버 summary 우선
            summary: rep.summary || '(요약 없음)',

            // ✅ 상세 원본
            content: fullContent
          };
        })
      );

    const body = replyRows.length
      ? replyRows.map((r, idx) => `
          <tr>
            <td class="c-id">${r.id}</td>
            <td class="c-title">${r.title}</td>
            <td class="c-from">${r.from}</td>
            <td class="c-date">${r.at}</td>
            <td class="c-summary">
              ${r.summary}
              <button
                type="button"
                class="btn-detail btn btn-sm btn-outline-secondary"
                data-idx="${idx}"
                style="margin-left: 10px;"
              >상세보기</button>
            </td>
          </tr>
        `).join('')
      : `<tr><td colspan="5" class="empty" style="text-align:center; padding:20px;">아직 받은 답장이 없습니다.</td></tr>`;

    mainArea.innerHTML = `
      <section class="counsel">
        <div class="c-head" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <h2>답장 받은 목록</h2>
          <button type="button" class="btn-back btn btn-secondary">내 상담 보기</button>
        </div>

        <table class="counsel-table table table-hover">
          <thead class="table-light">
            <tr><th>상담번호</th><th>제목</th><th>답장 보낸 사람</th><th>답장 시각</th><th>요약 및 확인</th></tr>
          </thead>
          <tbody>${body}</tbody>
        </table>
      </section>
    `;

    mainArea.querySelector('.btn-back')?.addEventListener('click', renderCounselList);

    // ✅ 이벤트 위임으로 상세보기 처리
    mainArea.addEventListener('click', function onClick(e) {
      const btn = e.target.closest('.btn-detail');
      if (!btn) return;

      const idx = Number(btn.dataset.idx);
      const target = replyRows[idx];
      if (!target) return;

      // 중복 리스너 방지
      mainArea.removeEventListener('click', onClick);

      renderReplyDetail(target, replyRows);
    }, { once: false });
  }

  // ✅ 답장 상세 보기
  function renderReplyDetail(reply, replyRows) {
    // ✅ content가 없으면: 백엔드 응답 확인용 메시지
    const detailHtml = reply.content
      ? reply.content
      : `<div style="color:#666;">상세 내용이 없습니다. (서버 응답에 replies.content가 포함되어야 전체가 보입니다)</div>`;

    mainArea.innerHTML = `
      <section class="counsel-detail" style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.05);">
        <div class="c-head" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
          <h2 style="margin:0;">답장 상세 보기</h2>
          <button type="button" class="btn-back-replies btn btn-secondary">목록으로</button>
        </div>

        <div class="detail-info" style="background:#f8f9fa; padding:15px; border-radius:5px; margin-bottom:20px;">
          <p style="margin-bottom: 8px;"><strong>원본 상담 제목 :</strong> ${reply.title}</p>
          <p style="margin-bottom: 8px;"><strong>답변자 :</strong> ${reply.from}</p>
          <p style="margin-bottom: 0;"><strong>답변 시각 :</strong> ${reply.at}</p>
        </div>

        <div class="detail-content"
          style="
            min-height:200px;
            padding:20px;
            border:1px solid #dee2e6;
            border-radius:5px;
            background:#fff;

            white-space: normal;
            overflow: visible;
            text-overflow: unset;
            max-height: none;
            word-break: break-word;
            overflow-wrap: anywhere;
          ">
          ${detailHtml}
        </div>
      </section>
    `;

    mainArea.querySelector('.btn-back-replies')?.addEventListener('click', renderRepliesList);
  }

  counselBtn.addEventListener('click', fetchMyInquiries);
});