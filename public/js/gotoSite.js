document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('go-site-list');
    const prevBtn = document.getElementById('site-prev');
    const nextBtn = document.getElementById('site-next');
    const pageText = document.getElementById('site-page');
  
    if (!container || !prevBtn || !nextBtn || !pageText) return;
  
    const SITE_LIST = [
      { name: '올리브영', url: 'https://www.oliveyoung.co.kr/', img: 'img/올리브영1차.png', alt: '올리브영' },
      { name: '아모레몰', url: 'https://www.amoremall.com/', img: 'img/아모레시퍼시픽1차.png', alt: '아모레몰' },
      { name: '이니스프리', url: 'https://www.innisfree.com/', img: 'img/이니스프리1차.jpg', alt: '이니스프리' },
      { name: '제로이드', url: 'https://www.zeroid.co.kr/', img: 'img/제로이드1차.png', alt: '제로이드' }
    ];
  
    SITE_LIST.forEach(site => {
      const wrap = document.createElement('div');
      wrap.className = 'go_back'; // ✅ 오타 수정됨
  
      const topDiv = document.createElement('div');
      topDiv.className = 'site-top';
      
      const a = document.createElement('a');
      a.href = site.url;
      a.target = '_blank';
  
      const img = document.createElement('img');
      img.src = site.img;
      img.alt = site.alt || site.name;
  
      a.appendChild(img);
      topDiv.appendChild(a);
      
      const span = document.createElement('span');
      span.textContent = site.name;
  
      wrap.appendChild(topDiv);
      wrap.appendChild(span);
      
      container.appendChild(wrap);
    });
  
    // 슬라이더 로직
    const items = container.querySelectorAll('.go_back');
    const STEP = 2; 
    let index = 0;
  
    function render() {
      items.forEach((item, i) => {
        if (i >= index && i < index + STEP) {
          item.style.display = 'flex'; 
        } else {
          item.style.display = 'none';
        }
      });
  
      const currentPage = Math.ceil((index + 1) / STEP);
      const totalPage = Math.ceil(items.length / STEP);
      pageText.textContent = `${currentPage} / ${totalPage}`;
  
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index >= items.length - STEP;
    }
  
    render();
  
    nextBtn.addEventListener('click', () => {
      if (index < items.length - STEP) { index += STEP; render(); }
    });
  
    prevBtn.addEventListener('click', () => {
      if (index > 0) { index -= STEP; render(); }
    });
  });