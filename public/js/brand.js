// js/brand-tabs.js
document.addEventListener('DOMContentLoaded', () => {
  // 버튼
  const btnWep    = document.getElementById('wep');
  const btnStory  = document.getElementById('storytwo');
  const btnTarget = document.getElementById('targetThree');

  // 내용 컨테이너
  const mw = document.querySelector('.mw');
  if (!btnWep || !btnStory || !btnTarget || !mw) return;

  // 탭 데이터
  const TAB_DATA = {
    wep: {
      title: '소개',
      html: `
        <p>우리는 종종’지성 피부’라고 생각하고 화장품을 고르지만 
실제로는 전혀 다른 피부 타입일 수 있습니다.
잘못된 판단은 피부 트러블, 불필요한 지출, 만족도 저하로 이어지곤 한다.
그래서 우리는, 단순한 추측이 아닌 정확한 피부 분석을 통해
나에게 꼭 맞는 화장품을 찾을 수 있는 길을 만들었습니다.
우리 사이트는 누구나 간단한 질문에 답하는 것만으로,
본인의 피부 타입을 정확히 알아낼 수 있고
그 결과에 맞춰 다양한 화장품들을 한눈에 비교할 수 있습니다.
브랜드별 가격, 주요 성분, 사용자 리뷰까지 빠르게 확인할 수 있어
시간은 줄이고, 만족은 높이는 똑똑한 뷰티 선택이 가능합니다.
이제는, ‘어떤 제품이 나한테 잘 맞을까?’ 
를 고민하기 보다 ‘내 피부에 맞는지부터 정확히 알고, 
그에 맞는 제품을 객관적으로 비교해 보세요’
당신의 피부에 딱 맞는 화장품, 이제는 감이 아니라 데이터로 찾으세요.</p>
      `
    },
    storytwo: {
      title: '스토리',
      html: `
        <p>어느덧 6학년 때부터 트러블이 일어나고 점점 여드름이 심해지면서 스트레스가 심해졌다
하지만 누구도 안 알려준다, 피부가 가서 검사받아 보라고, 아니면 피부
가는 비싸다는 이미지가 크기 때문에
아무 말도 안 했을 수도 있다.
그래서 성인 대서까지 그냥 기름 많으니까 ‘지성’이게 거니 생각해서 올리브영에 있는 ‘지성 피부’ 전용 화장품을 막 썼다.
하지만 돌아오는 게 트러블, 여드름... 그리고 여드름 흉터..
한 살, 두 살 먹게 되면 알게 된다 하...그때 그냥 피부과 가서 진단받고 그때부터 잡아갈걸..
그래서 나는 지금이라도 본인 피부를 모르는 사람들에게 해주고 싶다.
비싼 피부과 말고 가볍게 진단받고 여러 제품을 확인하여 조금이라도 비교하여 편하게 찾을 수 있는 방법을 개발자 꿈을 가지고
부족하지만 조금씩 성장하여 더 나은 사이트를 만들자고 생각하여 만들게 되었다.</p>
      `
    },
    targetThree: {
      title: '목표',
      html: `
        <ul>
          <li>피부타입/성분/가성비 기준의 투명한 추천</li>
          <li>브랜드 편향 없는 비교 테이블 제공</li>
          <li>사용자 후기 품질 향상과 스팸 필터링</li>
          <li>관리자 화면과 본 사이트 기능 연동</li>
          <li>본 사이트 가끔 오류나는 것들 리스트 만들어 수정</li>
          <li>사이트 출시</li>
        </ul>
      `
    }
  };

  // 렌더 함수
  function renderTab(key) {
    const data = TAB_DATA[key];
    if (!data) return;

    [btnWep, btnStory, btnTarget].forEach(b => {
      b.classList.toggle('is-active', b.id === key);
      b.setAttribute('aria-pressed', b.id === key ? 'true' : 'false');
    });

    mw.innerHTML = `
      <div class="mw-inner">
        <h3 class="mw-title">${data.title}</h3>
        <div class="mw-body">${data.html}</div>
      </div>
    `;
  }

  // 이벤트 바인딩
  btnWep.addEventListener('click',    () => renderTab('wep'));
  btnStory.addEventListener('click',  () => renderTab('storytwo'));
  btnTarget.addEventListener('click', () => renderTab('targetThree'));

  // 키보드 접근성
  [btnWep, btnStory, btnTarget].forEach((btn, idx, arr) => {
    btn.setAttribute('role', 'button');
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') arr[(idx + 1) % arr.length].focus();
      if (e.key === 'ArrowLeft')  arr[(idx - 1 + arr.length) % arr.length].focus();
    });
  });

  // 초기 탭
  renderTab('wep');
});
