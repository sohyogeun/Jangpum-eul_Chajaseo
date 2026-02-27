// ========= 1:1 상담 =========
document.addEventListener('DOMContentLoaded', () => {
  const mainArea = document.querySelector('.mypageBack2');
  const counselBtn = document.getElementById('counselBtn');
  if (!mainArea || !counselBtn) return;

  // 상태 관리를 위한 변수
  let myInquiries = [];

  // ✅ 1. 백엔드에서 데이터 가져오는 함수
  async function fetchMyInquiries() {
    try {
      const response = await fetch('/api/inquiries/my-inquiries'); 
      const result = await response.json();

      if (result.ok) {
        myInquiries = result.list; // 가져온 데이터를 변수에 저장
        renderCounselList();       // 화면에 그리기
      } else {
        alert("상담 내역을 불러오는데 실패했습니다: " + result.message);
      }
    } catch (error) {
      console.error("데이터 가져오기 에러:", error);
    }
  }

  // ✅ 2. 렌더: 내가 보낸 상담 리스트
  function renderCounselList() {
    const rows = myInquiries.map((item, index) => {
      // 날짜 포맷
      const date = new Date(item.createdAt);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      return `
        <tr>
          <td class="c-id">${String(item.id).substring(0,8)}</td> 
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
          <thead>
            <tr><th>번호</th><th>제목</th><th>작성일</th><th>상태</th></tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="4" style="text-align:center; padding:20px;">상담 내역이 없습니다.</td></tr>'}
          </tbody>
        </table>
        <p class="c-hint">최근 상담 내역이 표시됩니다.</p>
      </section>
    `;

    // 버튼: 답장 받은 보기
    mainArea.querySelector('.btn-replies').addEventListener('click', renderRepliesList);
  }

  // ✅ 3. 렌더: 답장 받은 리스트 (수정된 부분!)
  function renderRepliesList() {
    // 🚨 COUNSEL_DATA 대신 진짜 데이터가 담긴 myInquiries를 사용합니다!
    const replyRows = myInquiries
      .filter(item => item.replies && item.replies.length)
      .flatMap(item =>
        item.replies.map(rep => ({
          id: String(item.id).substring(0,8), // 아이디 짧게
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
      : `<tr><td colspan="5" class="empty" style="text-align:center; padding:20px;">아직 받은 답장이 없습니다.</td></tr>`;

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

  // ✅ 4. 사이드바 버튼 클릭 시 진입 (수정된 부분!)
  // 곧바로 그리지 않고, 데이터를 먼저 가져오는 함수를 연결합니다.
  counselBtn.addEventListener('click', fetchMyInquiries);
});