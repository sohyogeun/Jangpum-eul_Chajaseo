document.addEventListener("DOMContentLoaded", () => {
  const eventData = {
    oreve: [
      { title: "올리브영 pink 10", imgSrc: "img/올리브영pick.png", link: "https://www.oliveyoung.co.kr/" },
      { title: "오헤이오 입점기념", imgSrc: "img/올리브영새로입점화장품.png", link: "https://www.oliveyoung.co.kr/" },
      { title: "브러렛 소르베 틴트 런칭", imgSrc: "img/브러렛 소르베 틴트 런칭 기념이벤트.png", link: "https://www.oliveyoung.co.kr/" },
      { title: "핫한 10월 이벤트", imgSrc: "img/올리브영 10월이벤트.png", link: "https://www.oliveyoung.co.kr/" },
      { title: "취향 안타는 이벤트", imgSrc: "img/취향안타는이벤트.png", link: "https://www.oliveyoung.co.kr/" },
    ],
    amola: [
      { title: "마피 파우치 특가", imgSrc: "img/마피 파우치 특가.png", link: "https://www.amoremall.com/kr/ko/display/event" },
      { title: "저스트메이크업 콜라보", imgSrc: "img/저스트메이크업 콜라보.png", link: "https://www.amoremall.com/kr/ko/display/event" },
      { title: "[토스페이] 즉시 할인", imgSrc: "img/토스페이 즉시 할인.png", link: "https://www.amoremall.com/kr/ko/display/event" },
      { title: "최저가 도전", imgSrc: "img/최저가 도전.png", link: "https://www.amoremall.com/kr/ko/display/event" },
      { title: "[퍼즐우드] 선물하기", imgSrc: "img/퍼즐우드 선물하기.png", link: "https://www.amoremall.com/kr/ko/display/event" },
    ],
    inne: [
      { title: "환절기 그린티", imgSrc: "img/그린티.png", link: "https://www.innisfree.com/kr/ko/ca/event" },
      { title: "공병수거 혜택", imgSrc: "img/온라인 공병수거.png", link: "https://www.innisfree.com/kr/ko/ca/event" },
      { title: "3종 아이 라이너", imgSrc: "img/아이라이너.png", link: "https://www.innisfree.com/kr/ko/ca/event" },
      { title: "[오프라인] 마켓 체험", imgSrc: "img/오프라인 마켓 체험.png", link: "https://www.innisfree.com/kr/ko/ca/event" },
      { title: "10월 특가 이벤트", imgSrc: "img/10월 특가.png", link: "https://www.innisfree.com/kr/ko/ca/event" },
    ],
    jalo: [
      { title: "제로이드 이벤트 1", imgSrc: "img/zeroid1.jpg", link: "https://www.zeroid.co.kr/web/event/event_list.asp" },
      { title: "제로이드 이벤트 2", imgSrc: "img/zeroid2.jpg", link: "https://www.zeroid.co.kr/web/event/event_list.asp" },
      { title: "제로이드 이벤트 3", imgSrc: "img/zeroid3.jpg", link: "https://www.zeroid.co.kr/web/event/event_list.asp" },
      { title: "제로이드 이벤트 4", imgSrc: "img/zeroid4.jpg", link: "https://www.zeroid.co.kr/web/event/event_list.asp" },
      { title: "제로이드 이벤트 5", imgSrc: "img/zeroid5.jpg", link: "https://www.zeroid.co.kr/web/event/event_list.asp" },
    ],
  };

  const eventContent = document.getElementById("event-content");
  const tabs = document.querySelectorAll(".et");
  const brandCards = document.querySelectorAll(".brand-card[data-brand]");
  const brandTitle = document.getElementById("event-brand-title");
  const eventCount = document.getElementById("event-count");
  const sortSelect = document.getElementById("event-sort");

  if (!eventContent) return;

  function setActiveTab(brand) {
    tabs.forEach(b => b.classList.toggle("active", b.id === brand));
  }

  function getBrandLabel(brand) {
    const map = { oreve: "올리브영", amola: "아모레퍼시픽", inne: "이니스프리", jalo: "제로이드" };
    return map[brand] || brand;
  }

  function renderEvents(brand) {
    let events = [...(eventData[brand] || [])];

    // 정렬 (옵션)
    const sort = sortSelect?.value || "default";
    if (sort === "title") {
      events.sort((a, b) => (a.title || "").localeCompare(b.title || "", "ko"));
    }

    brandTitle.textContent = getBrandLabel(brand);
    eventCount.textContent = `총 ${events.length}건`;

    eventContent.innerHTML = events.map(ev => `
      <div class="event-item">
        <a href="${ev.link}" target="_blank" rel="noopener noreferrer">
          <img src="${ev.imgSrc}" alt="${ev.title}">
          <span class="event-title">${ev.title}</span>
        </a>
      </div>
    `).join("");
  }

  // 탭 클릭
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const brand = btn.id;
      setActiveTab(brand);
      renderEvents(brand);
    });
  });

  // 상단 브랜드 카드 클릭 → 탭과 동일 동작
  brandCards.forEach(card => {
    card.addEventListener("click", () => {
      const brand = card.dataset.brand;
      setActiveTab(brand);
      renderEvents(brand);
      window.scrollTo({ top: document.querySelector(".event-tabs").offsetTop - 20, behavior: "smooth" });
    });
  });

  // 정렬 변경
  sortSelect?.addEventListener("change", () => {
    const active = document.querySelector(".et.active")?.id || "oreve";
    renderEvents(active);
  });

  // 초기 로드
  setActiveTab("oreve");
  renderEvents("oreve");
});
