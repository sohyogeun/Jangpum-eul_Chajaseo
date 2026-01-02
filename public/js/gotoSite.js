// js/siteSlider.js
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('go-site-list');
  const prevBtn = document.getElementById('site-prev');
  const nextBtn = document.getElementById('site-next');
  const pageText = document.getElementById('site-page');

  if (!container || !prevBtn || !nextBtn || !pageText) return;

  // ✅ 1) 사이트 목록을 JS 데이터로 관리
  const SITE_LIST = [
    {
      name: '올리브영',
      url: 'https://www.oliveyoung.co.kr/',
      img: 'img/올리브영1차.png',
      alt: '올리브영'
    },
    {
      name: '아모레몰',
      url: 'https://www.amoremall.com/',
      img: 'img/아모레시퍼시픽1차.png',
      alt: '아모레몰'
    },
    {
      name: '이니스프리',
      url: 'https://www.innisfree.com/',
      img: 'img/이니스프리1차.jpg',
      alt: '이니스프리'
    },
    {
      name: '제로이드',
      url: 'https://www.zeroid.co.kr/',
      img: 'img/제로이드1차.png',
      alt: '제로이드'
    }
  ];

  // ✅ 2) JS로 HTML 동적으로 생성
  SITE_LIST.forEach(site => {
    const wrap = document.createElement('div');
    wrap.className = 'go_back';

    const a = document.createElement('a');
    a.href = site.url;
    a.target = '_blank';

    const img = document.createElement('img');
    img.src = site.img;
    img.alt = site.alt || site.name;

    a.appendChild(img);
    wrap.appendChild(a);
    container.appendChild(wrap);
  });

  // ✅ 3) 방금 만든 카드들을 기준으로 슬라이더 동작
  const items = container.querySelectorAll('.go_back');

  const STEP = 2; // 한 번에 2개씩
  let index = 0;

  function render() {
    items.forEach((item, i) => {
      if (i >= index && i < index + STEP) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });

    const currentPage = Math.floor(index / STEP) + 1;
    const totalPage = Math.ceil(items.length / STEP);
    pageText.textContent = `${currentPage} / ${totalPage}`;

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index >= items.length - STEP;
  }

  render();

  nextBtn.addEventListener('click', () => {
    if (index < items.length - STEP) {
      index += STEP;
      render();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (index > 0) {
      index -= STEP;
      render();
    }
  });
});
