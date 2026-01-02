(() => {
  // 1. 내 장바구니 (4칸)
  let mySlots = [null, null, null, null];
  const slotLabels = ['첫번째', '두번째', '세번째', '네번째'];

  // 2. 검색 결과 임시 저장소 (여기가 핵심! 데이터를 HTML에 넣지 않고 여기에 둡니다)
  let currentSearchResults = []; 

  // -----------------------------------------------------------
  // [1] 화면 그리는 함수 (슬롯)
  // -----------------------------------------------------------
  function renderSlots() {
    const container = document.getElementById('slotContainer');
    if (!container) return;
    
    container.innerHTML = mySlots.map((item, i) => {
      if (!item) return `
        <div class="comparison empty">
          <h4>${slotLabels[i]}</h4>
          <div class="placeholder" style="color:#aaa; padding:20px 0;">+ 비어있음</div>
        </div>`;
      
      // 가격에 콤마 찍기
      const displayPrice = item.price ? Number(item.price).toLocaleString() : '0';

      return `
        <div class="comparison">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <h4>${slotLabels[i]}</h4>
            <button onclick="window.removeSlot(${i})" style="font-size:12px; background:#ffebec; border:none; cursor:pointer; padding:2px 8px; border-radius:4px;">🗑삭제</button>
          </div>
          <a href="${item.product_url || '#'}" target="_blank">
            <img class="cpsIMG" src="${item.image_url}" alt="${item.name}" style="width:100px;height:100px;object-fit:cover;">
          </a>
          <dl>
            <dt>상품명</dt><dd>${item.name}</dd>
            <dt>브랜드</dt><dd>${item.brand}</dd>
            <dt>가격</dt><dd>${displayPrice}원</dd>
          </dl>
        </div>`;
    }).join('');
  }

  // -----------------------------------------------------------
  // [2] 메인 로드 함수 (외부에서 호출)
  // -----------------------------------------------------------
  window.loadMyCosmetics = function () {
    const contentPane = document.querySelector('.mypageBack2'); // 혹은 .content-pane 등 본인의 메인 영역 클래스
    if (!contentPane) return;

    contentPane.innerHTML = `
      <div class="mcBack">
        <h3>나만의 화장품 비교</h3>
        <div class="comparison-grid" id="slotContainer"></div>

        <div class="search-section" style=" width: 800px; mrgin-top:30px;border-top:1px solid #ddd; min-height: 500px;">
          <h4>화장품 추가하기</h4>
          <div class="search-bar" style="display:flex; gap:10px;">
            <input id="searchInput" placeholder="상품명 검색..." style="padding:10px; flex-grow:1;">
            <button id="searchBtn" style="padding:10px; width:80px; cursor:pointer;">검색</button>
          </div>
          <div id="searchResultList" style="margin-top:10px; max-height:300px; overflow-y:auto; border:1px solid #eee;"></div>
        </div>
      </div>`;

    renderSlots();
  };

  // -----------------------------------------------------------
  // [3] 이벤트 리스너 (검색 버튼만 담당)
  // -----------------------------------------------------------
  document.addEventListener('click', async (e) => {
    // 검색 버튼 클릭 시
    if (e.target.id === 'searchBtn') {
        const searchInput = document.getElementById('searchInput');
        const resultList = document.getElementById('searchResultList');
        
        const keyword = searchInput.value.trim();
        if (!keyword) return alert('검색어를 입력해주세요.');
        
        resultList.innerHTML = '<p style="padding:15px;">🔎 검색 중...</p>';
        
        try {
            const res = await fetch(`/api/products/search?q=${encodeURIComponent(keyword)}`);
            const products = await res.json();
            
            // [중요] 검색 결과를 전역 변수에 저장해둡니다.
            currentSearchResults = products || [];

            if (!currentSearchResults.length) { 
                resultList.innerHTML = '<p style="padding:15px;">검색 결과가 없습니다.</p>'; 
                return; 
            }
            
            // [중요] 버튼에 onclick="window.pickProduct(번호)" 를 직접 심어버립니다.
            // 복잡한 데이터를 HTML 태그에 넣지 않으므로 에러가 날 수 없습니다.
            resultList.innerHTML = currentSearchResults.map((p, index) => {
                const displayPrice = p.price ? Number(p.price).toLocaleString() : '0';
                
                return `
                <div style="border-bottom:1px solid #eee; padding:10px; display:flex; align-items:center; background:#fff; padding-bottom: 50px;">
                    <img src="${p.image_url}" style="width:50px; height:50px; object-fit:cover; margin-right:15px; border-radius:4px;">
                    <div style="flex-grow:1;">
                        <strong style="font-size:14px; display:block;">${p.name}</strong>
                        <span style="font-size:12px; color:#666;">${p.brand} | ${displayPrice}원</span>
                    </div>
                    <button onclick="window.pickProduct(${index})" 
                        style="padding:8px 15px; cursor:pointer; background:#333; color:#fff; border:none; border-radius:4px; font-weight:bold;">
                        선택
                    </button>
                </div>`;
            }).join('');
            
        } catch (err) {
            console.error(err);
            resultList.innerHTML = '<p style="padding:15px; color:red;">서버 통신 오류가 발생했습니다.</p>';
        }
    }
  });

  // -----------------------------------------------------------
  // [4] 전역 함수들 (HTML onclick에서 호출됨)
  // -----------------------------------------------------------
  
  // (1) 검색 결과에서 선택했을 때 호출되는 함수
  window.pickProduct = function(index) {
    // 저장해둔 배열에서 꺼냅니다.
    const product = currentSearchResults[index];
    
    if (!product) return alert('상품 정보를 찾을 수 없습니다.');
    
    console.log("선택된 상품:", product); // 콘솔 확인용

    const emptyIndex = mySlots.findIndex(s => s === null);
    if (emptyIndex === -1) {
        alert('4칸이 모두 찼습니다! 기존 상품을 삭제하고 추가하세요.');
        return;
    }

    mySlots[emptyIndex] = product;
    renderSlots(); // 화면 갱신
    
    // 선택 후 검색창 좀 깔끔하게 비우고 싶다면 아래 주석 해제
    // document.getElementById('searchResultList').innerHTML = ''; 
  };

  // (2) 비교함에서 삭제 버튼
  window.removeSlot = function (index) {
    mySlots[index] = null;
    renderSlots();
  };

})();