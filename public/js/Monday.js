document.addEventListener('DOMContentLoaded', () => {
  // ✅ 1) 상품 데이터 (원하는 만큼 10개 정도로 늘리면 됨)
  const products = [
    {
      name: '아벤느 오 떼르말',
      href: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000200805&t_page=%ED%86%B5%ED%95%A9%EA%B2%80%EC%83%89%EA%B2%B0%EA%B3%BC%ED%8E%98%EC%9D%B4%EC%A7%80&t_click=%EA%B2%80%EC%83%89%EC%83%81%ED%92%88%EC%83%81%EC%84%B8&t_search_name=%ED%99%94%EC%9E%98%EB%A8%B9%20%EB%A7%88%EC%8A%A4%ED%81%AC&t_number=1&dispCatNo=1000001000900020002&trackingCd=Result_1',
      img: 'img/올열픽 화잘먹 마스크.png',
    },
    {
      name: '메디힐 더마 패드',
      href: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000171427&t_page=%ED%86%B5%ED%95%A9%EA%B2%80%EC%83%89%EA%B2%B0%EA%B3%BC%ED%8E%98%EC%9D%B4%EC%A7%80&t_click=%EA%B2%80%EC%83%89%EC%83%81%ED%92%88%EC%83%81%EC%84%B8&t_search_name=%EB%A9%94%EB%94%94%ED%9E%90%20%EB%8D%94%EB%A7%88%20%ED%8C%A8%EB%93%9C&t_number=1&dispCatNo=1000001000900040001&trackingCd=Result_1',
      img: 'img/올브영 단독 메디힐 더마 패드.png',
    },
    {
      name: '대용량 한정기획 아벤느 오 떼르말',
      href: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000234345&t_page=%ED%86%B5%ED%95%A9%EA%B2%80%EC%83%89%EA%B2%B0%EA%B3%BC%ED%8E%98%EC%9D%B4%EC%A7%80&t_click=%EA%B2%80%EC%83%89%EC%83%81%ED%92%88%EC%83%81%EC%84%B8&t_search_name=%EC%95%84%EB%B2%A4%EB%8A%90&t_number=1&dispCatNo=1000001000100100001,1000001000800130006&trackingCd=Result_1',
      img: 'img/대용량 한정기획 아벤느오때르말.png',
    },
    {
      name: '질레트 랩스 딥클렌징바 면도기',
      href: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000236897&dispCatNo=90000010001&trackingCd=Home_Recommand&t_page=%ED%99%88&t_click=%EC%9D%B4%EC%83%81%ED%92%88%EC%96%B4%EB%95%8C%EC%9A%94_%EC%83%81%ED%92%88%EC%83%81%EC%84%B8&t_number=2',
      img: 'img/질레트 랩스 딥클렌징바 면도기.png',
    },

    // 👉 여기부터는 예시로 더 채워놓은 거야. 실제로는 네가 원하는 상품으로 10개까지 채우면 돼.
    {
      name: '추가 상품 5',
      href: '#',
      img: 'img/sample5.png',
    },
    {
      name: '추가 상품 6',
      href: '#',
      img: 'img/sample6.png',
    },
    {
      name: '추가 상품 7',
      href: '#',
      img: 'img/sample7.png',
    },
    {
      name: '추가 상품 8',
      href: '#',
      img: 'img/sample8.png',
    },
    {
      name: '추가 상품 9',
      href: '#',
      img: 'img/sample9.png',
    },
    {
      name: '추가 상품 10',
      href: '#',
      img: 'img/sample10.png',
    },
  ];

  const form = document.getElementById('mondayForm');
  const prevBtn = document.getElementById('mondayPrev');
  const nextBtn = document.getElementById('mondayNext');
  const pageInfo = document.getElementById('mondayPageInfo');

  if (!form) return;

  // ✅ 2) 한 화면에 2개씩 보여주기
  const PAGE_SIZE = 2;
  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  let currentPage = 0;  // 0페이지부터 시작

  // ✅ 3) 현재 페이지 렌더링 함수
  function renderPage() {
    const start = currentPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageItems = products.slice(start, end);

    form.innerHTML = pageItems
      .map((item) => {
        return `
          <div class="Monday_box">
            <div class="top">
              <a href="${item.href}">
                <img src="${item.img}" alt="${item.name}">
              </a>
            </div>
            <span>${item.name}</span>
          </div>
        `;
      })
      .join('');

    // (옵션) 페이지 정보 표시: 1 / 5 이런 식
    if (pageInfo) {
      pageInfo.textContent = `${currentPage + 1} / ${totalPages}`;
    }
  }

  // ✅ 4) 버튼 이벤트 (끝까지 가면 다시 처음으로 돌아오는 방식)
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentPage = (currentPage - 1 + totalPages) % totalPages;
      renderPage();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentPage = (currentPage + 1) % totalPages;
      renderPage();
    });
  }

  // ✅ 5) 첫 페이지 그리기
  renderPage();
});
