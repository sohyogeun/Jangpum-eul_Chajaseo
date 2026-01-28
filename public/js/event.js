// 1. (코드 1의 장점) DOM이 로드된 후 스크립트를 실행합니다.
document.addEventListener("DOMContentLoaded", () => {
  
  // 2. (데이터 정의) 코드 2의 데이터 구조를 사용하되, 
  //    코드 1의 키(oreve, amola)를 사용합니다. (버튼 ID와 일치)
  const eventData = {
    oreve: [
      { title: "올리브영 pink 10", imgSrc: "../img/올리브영pick.png", link: "https://www.oliveyoung.co.kr/store/planshop/getPlanShopDetail.do?dispCatNo=500000104680010&t_page=%EC%9D%B4%EB%B2%A4%ED%8A%B8&t_click=%EC%A7%80%EA%B8%88%20%EC%A7%84%ED%96%89%EC%A4%91%EC%9D%B8%20%EC%9D%B4%EB%B2%A4%ED%8A%B8_%EC%9D%B4%EB%B2%A4%ED%8A%B8%EB%B2%A0%EB%84%88&t_form_type=&t_plan_name=%EC%98%AC%EB%A6%AC%EB%B8%8C%EC%98%81%EC%97%90%EC%84%9C%20%EB%A7%8C%EB%82%98%EB%8A%94%3Cbr%3E%EC%9D%B4%EB%8B%AC%EC%9D%98%20%EC%98%AC%EC%98%81PICK&t_number=18" },
      { title: "오헤이오 입점기념", imgSrc: "../img/올리브영새로입점화장품.png", link: "https://www.oliveyoung.co.kr/store/event/getEventDetail.do?evtNo=00000000033582&t_page=%EC%9D%B4%EB%B2%A4%ED%8A%B8&t_click=%EC%A7%80%EA%B8%88%20%EC%A7%84%ED%96%89%EC%A4%91%EC%9D%B8%20%EC%9D%B4%EB%B2%A4%ED%8A%B8_%EC%9D%B4%EB%B2%A4%ED%8A%B8%EB%B2%A0%EB%84%88&t_form_type=&t_event_name=%EC%98%A4%ED%97%A4%EC%9D%B4%EC%98%A4%20%EC%9E%85%EC%A0%90%20%EA%B8%B0%EB%85%90%3Cbr%3E%EA%B2%BD%ED%92%88+%EA%B8%B0%ED%94%84%ED%8A%B8%EC%B9%B4%EB%93%9C!&t_number=22" },
      { title: "브러렛 소르베 틴트 런칭 기념이벤트", imgSrc: "../img/브러렛 소르베 틴트 런칭 기념이벤트.png", link: "https://www.oliveyoung.co.kr/store/event/getEventDetail.do?evtNo=00000000033947&t_page=%EC%9D%B4%EB%B2%A4%ED%8A%B8&t_click=%EC%A7%80%EA%B8%88%20%EC%A7%84%ED%96%89%EC%A4%91%EC%9D%B8%20%EC%9D%B4%EB%B2%A4%ED%8A%B8_%EC%9D%B4%EB%B2%A4%ED%8A%B8%EB%B2%A0%EB%84%88&t_form_type=&t_event_name=%EB%B8%94%EB%9F%AC%EB%A0%9B%20%EC%86%8C%EB%A5%B4%EB%B2%A0%20%ED%8B%B4%ED%8A%B8%3Cbr%3E%EB%9F%B0%EC%B9%AD%20%EA%B8%B0%EB%85%90%20%EC%9D%B4%EB%B2%A4%ED%8A%B8!&t_number=47" },
      { title: "핫한 10월 이벤트", imgSrc: "../img/올리브영 10월이벤트.png", link: "https://www.oliveyoung.co.kr/store/planshop/getPlanShopDetail.do?dispCatNo=500000104700001&t_page=%EC%9D%B4%EB%B2%A4%ED%8A%B8&t_click=%EC%A7%80%EA%B8%88%20%EC%A7%84%ED%96%89%EC%A4%91%EC%9D%B8%20%EC%9D%B4%EB%B2%A4%ED%8A%B8_%EC%9D%B4%EB%B2%A4%ED%8A%B8%EB%B2%A0%EB%84%88&t_form_type=&t_plan_name=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EB%A9%A4%EB%B2%84%EC%8A%A4%EB%9D%BC%EB%A9%B4%3Cbr%3E10%EC%9B%94%20%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EB%8D%B0%EC%9D%B4&t_number=5" },
      { title: "취향 안타는 이벤트", imgSrc: "../img/취향안타는이벤트.png", link: "https://www.oliveyoung.co.kr/store/event/getEventDetail.do?evtNo=00000000029664&t_page=%EC%9D%B4%EB%B2%A4%ED%8A%B8&t_click=%EC%A7%80%EA%B8%88%20%EC%A7%84%ED%96%89%EC%A4%91%EC%9D%B8%20%EC%9D%B4%EB%B2%A4%ED%8A%B8_%EC%9D%B4%EB%B2%A4%ED%8A%B8%EB%B2%A0%EB%84%88&t_form_type=&t_event_name=%EC%B7%A8%ED%96%A5%20%EC%95%88%20%ED%83%80%EB%8A%94%20%EC%84%A0%EB%AC%BC%3Cbr%3E%EA%B8%B0%ED%94%84%ED%8A%B8%EC%B9%B4%EB%93%9C%20%EC%84%A0%EB%AC%BC%ED%95%98%EC%84%B8%EC%9A%94&t_number=52" },
    ],
    amola: [
      { title: "마피 파우치 특가", imgSrc: "../img/마피 파우치 특가.png", link: "https://www.amoremall.com/kr/ko/display/event_detail?planDisplaySn=13523" },
      { title: "저스트메이크업 콜라보", imgSrc: "../img/저스트메이크업 콜라보.png", link: "https://www.amoremall.com/kr/ko/display/event_detail?planDisplaySn=13570" },
      { title: "[토스페이]즉시 할인", imgSrc: "../img/토스페이 즉시 할인.png", link: "https://www.amoremall.com/kr/ko/display/event_detail?planDisplaySn=12747" },
      { title: "최저가 도전", imgSrc: "../img/최저가 도전.png", link: "https://www.amoremall.com/kr/ko/display/event_detail?planDisplaySn=2012" },
      { title: "[퍼즐우드] 선물하기", imgSrc: "../img/퍼즐우드 선물하기.png", link: "https://www.amoremall.com/kr/ko/display/event_detail?planDisplaySn=11794" },
    ],
    inne: [
      { title: "환절기 그린티", imgSrc: "../img/그린티.png", link: "https://www.innisfree.com/kr/ko/ca/event/101692" },
      { title: "공병수 주고 혜택", imgSrc: "../img/온라인 공병수거.png", link: "https://www.innisfree.com/kr/ko/ca/event/100169" },
      { title: "3종 아이 라이너", imgSrc: "../img/아이라이너.png", link: " https://www.innisfree.com/kr/ko/dp/hot-deal#926" },
      { title: "[오프라인]샘플 마케 체험", imgSrc: "../img/오프라인 마켓 체험.png", link: "https://www.innisfree.com/kr/ko/ca/event/100170" },
      { title: "10월 특가 이벤트", imgSrc: "../img/10월 특가.png", link: "https://www.innisfree.com/kr/ko/ca/event/101699" },
    ],
    jalo: [
      { title: "제로이드 1", imgSrc: "img/zeroid1.jpg", link: "/events/zero1" },
      { title: "제로이드 2", imgSrc: "img/zeroid2.jpg", link: "/events/zero2" },
      { title: "제로이드 3", imgSrc: "img/zeroid3.jpg", link: "/events/zero3" },
      { title: "제로이드 4", imgSrc: "img/zeroid4.jpg", link: "/events/zero4" },
      { title: "제로이드 5", imgSrc: "img/zeroid5.jpg", link: "/events/zero5" },
    ],
  };

  // 3. (HTML 요소 선택) 
  //    (코드 1의 "eventList" 대신 "event-content"를 사용합니다)
  const eventContentContainer = document.getElementById("event-content");
  const allTabs = document.querySelectorAll(".et"); // 모든 탭 버튼

  /**
   * 4. (코드 2의 함수) HTML을 생성하고 삽입하는 함수
   */
  function displayEvents(brand) {
    const events = eventData[brand]; 
    if (!events) return; // 데이터가 없으면 중단

    // .map()으로 HTML 문자열 5개 만들기
    const eventsHtml = events.map(event => {
      // CSS 디자인에 맞는 .event-item 구조
      return `
        <div class="event-item">
          <a href="${event.link}">
            <img src="${event.imgSrc}" alt="${event.title}">
            <span class="event-title">${event.title}</span>
          </a>
        </div>
      `;
    }).join(''); // 5개 문자열을 하나로 합치기

    // 회색 영역에 HTML을 통째로 삽입
    eventContentContainer.innerHTML = eventsHtml;
  }

  /**
   * 5. (필수) 탭 활성화('active' 클래스)를 처리하는 함수
   */
  function handleActiveTab(clickedButton) {
    // 모든 탭에서 'active' 클래스 제거
    allTabs.forEach(button => {
      button.classList.remove('active');
    });
    // 클릭된 탭에만 'active' 클래스 추가
    clickedButton.classList.add('active');
  }

  // 6. (코드 1의 장점) 효율적인 이벤트 리스너
  allTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const brand = btn.id; // 클릭된 버튼의 ID (oreve, amola...)
      
      handleActiveTab(btn); // 활성화 스타일 변경
      displayEvents(brand); // 콘텐츠 변경
    });
  });

  // 7. (필수) 페이지 첫 로드 시 '올리브영' 기본 표시
  displayEvents('oreve');
});