document.addEventListener('DOMContentLoaded', () => {
  const listView   = document.querySelector('.BBM_Name'); // 게시판 관리 화면
  const createView = document.querySelector('.CCBack');   // 컨텐츠 생성 화면

  const goCreateBtn = document.getElementById('CC');      // "컨텐츠 생성" 버튼
  const goListBtn   = document.getElementById('BBM');     // "게시판 관리" 버튼

  if (!listView || !createView || !goCreateBtn || !goListBtn) {
    console.warn('필요한 요소를 찾지 못했습니다.');
    return;
  }

  const showListView = () => {
    listView.style.display   = 'block';
    createView.style.display = 'none';
  };

  const showCreateView = () => {
    listView.style.display   = 'none';
    createView.style.display = 'block';
  };

  showListView(); // 처음엔 게시판 관리 화면

  goCreateBtn.addEventListener('click', showCreateView);
  goListBtn.addEventListener('click', showListView);
});
