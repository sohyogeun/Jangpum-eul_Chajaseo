document.addEventListener('DOMContentLoaded', () => {
  const products = [
    // ... (상품 데이터 기존 그대로 유지) ...
    { name: '아벤느 오 떼르말', href: '#', img: 'img/올열픽 화잘먹 마스크.png' },
    { name: '메디힐 더마 패드', href: '#', img: 'img/올브영 단독 메디힐 더마 패드.png' },
    { name: '대용량 아벤느', href: '#', img: 'img/대용량 한정기획 아벤느오때르말.png' },
    { name: '질레트 랩스', href: '#', img: 'img/질레트 랩스 딥클렌징바 면도기.png' },
    // ... 추가 상품들 ...
  ];

  const form = document.getElementById('mondayForm');
  const prevBtn = document.getElementById('mondayPrev');
  const nextBtn = document.getElementById('mondayNext');
  const pageInfo = document.getElementById('mondayPageInfo');

  if (!form) return;

  const PAGE_SIZE = 2;
  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  let currentPage = 0;

  function renderPage() {
    const start = currentPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageItems = products.slice(start, end);

    form.innerHTML = pageItems.map((item) => {
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
      }).join('');

    if (pageInfo) pageInfo.textContent = `${currentPage + 1} / ${totalPages}`;
  }

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

  renderPage();
});