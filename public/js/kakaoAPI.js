// js/kakaoAPI.js
'use strict';

// 카카오(다음) 우편번호 API
function sample6_execDaumPostcode(targetBtn) {
  new daum.Postcode({
    oncomplete: function (data) {
      let addr = '';
      let extraAddr = '';

      if (data.userSelectedType === 'R') {
        addr = data.roadAddress;
      } else {
        addr = data.jibunAddress;
      }

      if (data.userSelectedType === 'R') {
        if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
        if (data.buildingName !== '' && data.apartment === 'Y') {
          extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
        }
        if (extraAddr !== '') extraAddr = ' (' + extraAddr + ')';
      }

      // ✔ 클릭된 버튼 기준으로 같은 블록(.field-inline.address) 안의 입력들을 찾기
      const root = targetBtn.closest('.field-inline.address');
      if (!root) return;

      const postcodeInput = root.querySelector('.zip input[placeholder="우편번호"]')
                         || root.querySelector('.zip input');
      // .field-inline.address 안의 input들을 순서대로: [우편번호, 기본주소, 상세주소]
      const inputs = root.querySelectorAll('input');
      const addressInput = inputs[1]; // 기본주소
      const detailInput  = inputs[2]; // 상세주소

      if (postcodeInput) postcodeInput.value = data.zonecode;
      if (addressInput)  addressInput.value  = addr + (extraAddr || '');
      if (detailInput)   detailInput.focus();
    }
  }).open();
}

// ✅ 이벤트 위임: 동적으로 삽입된 버튼도 항상 동작
// ✅ 이벤트 위임: 동적으로 삽입된 버튼도 항상 동작
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-line');
  if (!btn) return;

  // 버튼 안에 '우편번호'라는 글자가 있을 때만 실행하도록 조건 추가 (권장)
  if (btn.textContent.includes('우편번호')) {
    // 🚀 가장 중요한 핵심 코드! 버튼의 기본 동작(폼 제출/새로고침)을 강제로 막음
    e.preventDefault(); 
    
    sample6_execDaumPostcode(btn);
  }
});
