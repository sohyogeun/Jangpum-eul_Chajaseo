document.addEventListener('DOMContentLoaded', () => {
  // ===== 1️⃣ FAQ 데이터 =====
  const FAQ_DATA = {
    top10: [
      { title: '회원가입이 안돼요', content: '이메일 인증이 오지 않을 때' },
      { title: '비밀번호를 잊었어요', content: '비밀번호 재설정 방법' },
      { title: '아이디를 잊었어요', content: '가입 이메일로 아이디 찾기' },
      { title: '로그인이 안돼요', content: '아이디/비밀번호 확인 후 재시도' },
      { title: '회원 탈퇴는 어떻게 하나요?', content: '마이페이지 > 회원정보에서 가능합니다.' },
      { title: '휴면계정은 어떻게 해제하나요?', content: '로그인 시 자동 해제됩니다.' },
      { title: '인증메일이 오지 않아요', content: '스팸함을 확인해주세요.' },
      { title: '비밀번호 변경 주기', content: '보안을 위해 6개월마다 변경 권장' },
      { title: '중복가입이 되나요?', content: '같은 이메일은 중복가입이 불가합니다.' },
      { title: 'SNS 로그인 오류', content: 'SNS 연동 해제 후 다시 시도해주세요.' }
    ],
    CSC: [
      { title: '배송이 지연돼요', content: '출고 후 평균 2~3일 소요됩니다.' },
      { title: '상품이 파손됐어요', content: '사진과 함께 1:1 문의를 남겨주세요.' },
      { title: '주소를 잘못 입력했어요', content: '출고 전이면 수정 가능합니다.' },
      { title: '배송조회는 어디서 하나요?', content: '마이페이지 > 주문내역에서 확인' },
      { title: '주문취소는 언제까지 되나요?', content: '출고 전까지만 가능합니다.' },
      { title: '묶음배송 가능한가요?', content: '같은 주문건에 한해 가능' },
      { title: '주문내역이 안보여요', content: '로그인 계정을 확인해주세요.' },
      { title: '배송완료인데 안받았어요', content: '택배사에 문의 후 고객센터 연락' },
      { title: '선물배송 가능한가요?', content: '주문 시 배송메시지에 입력' },
      { title: '배송메모는 어디서 적나요?', content: '주문서 작성 단계에서 가능합니다.' }
    ],
    USER: [
      { title: '멤버십 등급은 어떻게 되나요?', content: '누적 구매금액 기준 자동 적용됩니다.' },
      { title: '포인트는 어디서 확인하나요?', content: '마이페이지 > 포인트 내역 확인' },
      { title: '등급 유지 기간은?', content: '매월 1일 기준으로 갱신됩니다.' },
      { title: '포인트 유효기간은?', content: '적립일로부터 1년입니다.' },
      { title: '쿠폰은 어디서 확인하나요?', content: '마이페이지 > 쿠폰함에서 확인' },
      { title: '쿠폰이 적용 안돼요', content: '유효기간과 적용 조건을 확인해주세요.' },
      { title: '회원정보 수정은?', content: '마이페이지 > 회원정보수정' },
      { title: '비밀번호 변경 방법', content: '마이페이지에서 직접 변경 가능' },
      { title: '멤버십 혜택은?', content: '등급별 할인 및 포인트 적립 제공' },
      { title: '로그인 유지 설정', content: '보안상 30일 이후 자동 해제됩니다.' }
    ],
    NFT: [
      { title: '신고는 어디서 하나요?', content: '하단 1:1 문의 이용' },
      { title: '부적절한 리뷰가 있어요', content: '관리자 확인 후 조치됩니다.' },
      { title: '사기 피해를 당했어요', content: '고객센터 신고접수로 전달됩니다.' },
      { title: '광고성 게시글 신고', content: '해당 게시물 신고 버튼 이용' },
      { title: '부정 사용자 제보', content: '스크린샷과 함께 제보 부탁드립니다.' },
      { title: '리뷰 조작 제보', content: '증거와 함께 전달 시 확인 후 조치' },
      { title: '허위정보 신고', content: '1:1 문의를 통해 접수' },
      { title: '개인정보 유출 신고', content: '즉시 고객센터로 문의해주세요.' },
      { title: '불법 게시물 신고', content: '검토 후 삭제 조치됩니다.' },
      { title: '기타 신고', content: '상세 내용을 작성해주세요.' }
    ]
  };

  // ===== 2️⃣ 요소 가져오기 =====
  const buttons = document.querySelectorAll('.QNA-body2-2 input[type="button"]');
  const list = document.querySelector('.faq-list');
  const titleEl = document.querySelector('.faq-head h3');

  if (!buttons.length || !list || !titleEl) return;

  // ===== 3️⃣ 리스트 렌더링 함수 =====
  function renderList(key, label) {
    const data = FAQ_DATA[key] || [];
    titleEl.textContent = label; // ✅ 버튼 이름으로 제목 변경
    list.innerHTML = '';

    data.slice(0, 10).forEach(item => {
      const li = document.createElement('li');
      li.className = 'row';
      li.innerHTML = `
        <span class="title">${item.title}</span>
        <span class="content">${item.content}</span>
      `;
      list.appendChild(li);
    });
  }

  // ===== 4️⃣ 버튼 클릭 이벤트 =====
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.id;
      const label = btn.value; // ✅ 버튼 표시 이름 가져옴
      renderList(key, label);

      // 눌린 버튼 강조
      buttons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  // ===== 5️⃣ 초기화: 첫 번째 버튼 표시 =====
  const firstBtn = buttons[0];
  if (firstBtn) renderList(firstBtn.id, firstBtn.value);
});
