// js/mypage.js
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const contentPane = document.querySelector('.mypageBack2');
  const menuRoot = document; // 메뉴가 나중에 include되도 동작하게 위임
  if (!contentPane) return;

  function setActiveButton(clickedButton) {
    document.querySelectorAll('.menuBtn').forEach(btn => btn.classList.remove('active'));
    clickedButton?.classList.add('active');
  }

  // ── 화면 렌더러들 ────────────────────────────────────────────────
  function renderEditInfo() {
    contentPane.innerHTML = `
      <section class="edit-info">
        <h2>회원정보 수정</h2>
        <form class="edit-form">
          <table>
            <tr><th>회원아이디<span>*</span></th><td><input type="text" value="" disabled></td></tr>
            <tr><th>비밀번호<span>*</span></th><td><input type="password" placeholder="영문 숫자 조합으로 입력해주세요."></td></tr>
            <tr><th>비밀번호 확인<span>*</span></th><td><input type="password"></td></tr>
            <tr><th>이름<span>*</span></th><td><input type="text" value=""></td></tr>
            <tr><th>이메일<span>*</span></th><td><input type="email" value=""></td></tr>
            <tr><th>전화번호</th>
              <td>
                <input type="text" size="4"> -
                <input type="text" size="4"> -
                <input type="text" size="4">
              </td>
            </tr>
            <tr><th>휴대폰번호</th>
              <td>
                <input type="text" value="010" size="3"> -
                <input type="text" value="6250" size="4"> -
                <input type="text" value="4119" size="4">
              </td>
            </tr>
            <tr><th>우편번호</th>
              <td>
                <input type="text" value="08375" size="6">
                <button type="button" class="zip-btn">우편번호검색</button>
              </td>
            </tr>
            <tr><th>주소<span>*</span></th>
              <td><input type="text" value="" style="width:95%;"></td>
            </tr>
            <tr><th>상세주소</th>
              <td><input type="text" value="503" style="width:95%;"></td>
            </tr>
          </table>

          <div class="form-foot">
            <div class="edit-actions">
              <button type="submit" class="save-btn">저장</button>
              <button type="button" class="cancel-btn">취소</button>
            </div>
            <a href="#" class="withdraw-link" aria-label="회원탈퇴">회원탈퇴</a>
          </div>
        </form>
      </section>
    `;

    // 탈퇴 확인
    const withdrawLink = contentPane.querySelector('.withdraw-link');
    withdrawLink?.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('정말 회원 탈퇴하시겠습니까? 복구는 불가능합니다.')) {
        alert('회원 탈퇴가 처리되었습니다.');
        // TODO: 실제 탈퇴 API 호출
      }
    });
  }


  function renderFYS() {
    contentPane.innerHTML = `<h2>나의 피부</h2>`;
    // TODO: 설문 결과 렌더
  }

  // ── 메뉴 클릭 라우팅(단 하나) ──────────────────────────────────
  menuRoot.addEventListener('click', (e) => {
    const btn = e.target.closest('#editInfoBtn, #counselBtn, #FYS, #myProductBtn');
    if (!btn) return;

    setActiveButton(btn);

    switch (btn.id) {
      case 'editInfoBtn':  renderEditInfo(); break;
      case 'counselBtn':   renderCounsel();  break;
      case 'FYS':          renderFYS();      break;
      case 'myProductBtn': window.loadMyCosmetics?.(); break; // 전역 함수 호출
    }
  });
});
