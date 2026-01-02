// 1. loadHTML 함수 (제공해주신 코드 그대로 사용)
async function loadHTML(selector, url) {
    try {
        // fetch로 HTML 파일을 불러옵니다.
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        const html = await response.text();

        // 지정된 위치(selector)를 찾습니다.
        const element = document.querySelector(selector);

        // 찾은 위치에 불러온 HTML을 삽입합니다.
        if (element) {
            element.innerHTML = html;
        } else {
            console.warn(`Element with selector "${selector}" not found.`);
        }
    } catch (error) {
        console.error('Error loading HTML:', error);
    }
}


// 2. 삭제 버튼 이벤트 리스너를 *별도의 함수*로 정의
// (이 코드는 managerPManu.html이 로드된 *후*에 호출되어야 함)
function initializeDeleteButtons() {
    // 모든 행을 감싸고 있는 부모 요소를 선택
    const container = document.getElementById('input-list-container');

    // ★★★ 중요 ★★★
    // 컨테이너가 존재하는지 *반드시* 확인
    if (container) {
        // 부모 요소에 'click' 이벤트 리스너를 추가 (이벤트 위임)
        container.addEventListener('click', (event) => {
            
            // 클릭된 요소가 'delete-btn' 클래스를 가지고 있는지 확인
            if (event.target.classList.contains('delete-btn')) {
                
                // 클릭된 버튼에서 가장 가까운 부모 '.input-row' 요소를 찾음
                const row = event.target.closest('.input-row');
                
                // 해당 행(row)이 존재하면
                if (row) {
                    // DOM에서 그 행을 제거
                    row.remove();
                }
            }
        });
    } else {
        // 만약 이 에러가 보인다면, managerPManu.html 파일 안에
        // id="input-list-container" 요소가 없는 것입니다.
        console.error('#input-list-container 요소를 찾을 수 없습니다.');
    }
}

// 3. 페이지 로드 시 실행할 메인 함수 (async로 변경)
document.addEventListener('DOMContentLoaded', async () => {
    
    // 헤더 로드를 *기다립니다.*
    await loadHTML('#header-container', 'managerH.html');
    
    // 메뉴 로드를 *기다립니다.*
    await loadHTML('#admin-menu-container', 'managerPManu.html');

    await loadHTML('#admin-menuOne-container', 'managerU_Manu.html');

    await loadHTML('#admin-menuTwo-container', 'managerNB_E_Manu.html');

    // --- 모든 HTML 로드가 완료된 시점 ---
    
    // 이제 managerPManu.html이 로드되었으므로,
    // 그 안의 #input-list-container에 대한 이벤트 리스너를 초기화합니다.
    initializeDeleteButtons();

    // (참고)
    // 만약 managerH.js에도 초기화 함수가 있다면(예: initializeHeaderScripts()),
    // 여기서 호출해야 합니다.
    // 예: if (typeof initializeHeaderScripts === 'function') {
    //     initializeHeaderScripts();
    // }
});