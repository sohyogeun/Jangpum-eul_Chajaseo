// managerD.js

document.addEventListener('DOMContentLoaded', async () => {
  const list = document.querySelector('.gesipan .todayBoxUser'); // ✅ 컨테이너

  try {
    const res = await fetch('/api/inquiries/latest?limit=5');
    const data = await res.json();

    list.replaceChildren(); // 비우기

    if (!data.ok || !data.list?.length) {
      const empty = document.createElement('div');
      empty.className = 'todayBoxUserRow';
      empty.textContent = '등록된 문의가 없습니다.';
      list.append(empty);
      return;
    }

    for (const item of data.list) {
      const row = document.createElement('div');
      row.className = 'todayBoxUserRow'; // ✅ row 클래스 따로

      // 화면에 제목만 보이게 (너가 원한 gd 자리)
      row.textContent = `[${item.category}] ${item.title}\t-\t${item.content}`;


      list.append(row);
    }
  } catch (err) {
    console.error(err);
    list.replaceChildren();
    const fail = document.createElement('div');
    fail.className = 'todayBoxUserRow';
    fail.textContent = '문의 불러오기 실패';
    list.append(fail);
  }
});



document.addEventListener('DOMContentLoaded', function() {

    // ----------------------------------------
    // 1. 검색 채널 (searchChart) - 도넛 차트
    // ----------------------------------------
    const searchCtx = document.getElementById('searchChart');
    
    // searchCtx 요소가 존재하는지 확인 (오류 방지)
    if (searchCtx) {
        new Chart(searchCtx, {
            type: 'doughnut', // 원형 차트: 'pie' 또는 'doughnut' (도넛)
            data: {
                // 각 항목의 이름
                labels: ['네이버', '구글', '다음', '직접방문', '기타'],
                datasets: [{
                    label: '검색 채널',
                    // 실제 통계 데이터 (위 labels 순서와 일치해야 함)
                    data: [120, 85, 30, 25, 10], // 예시 데이터
                    // 각 항목의 색상
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)', // 초록
                        'rgba(255, 99, 132, 0.7)', // 빨강
                        'rgba(54, 162, 235, 0.7)', // 파랑
                        'rgba(255, 206, 86, 0.7)', // 노랑
                        'rgba(153, 102, 255, 0.7)' // 보라
                    ],
                    hoverOffset: 4 // 마우스를 올렸을 때 조각이 튀어나오는 정도
                }]
            },
            options: {
                responsive: true, // 반응형으로 크기 조절
                maintainAspectRatio: true, // ★ 수정: 비율을 유지하도록 변경 (false -> true)
                plugins: {
                    legend: {
                        position: 'top', // 범례 위치
                    }
                }
            }
        });
    }

    // ----------------------------------------
    // 2. 접속 환경 (accessChart) - 파이 차트
    // ----------------------------------------
    const accessCtx = document.getElementById('accessChart');
    
    if (accessCtx) {
        new Chart(accessCtx, {
            type: 'pie', // 원형 차트: 'pie' 또는 'doughnut'
            data: {
                labels: ['모바일', '데스크탑', '태블릿'],
                datasets: [{
                    label: '접속 환경',
                    data: [250, 110, 15], // 예시 데이터
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(199, 199, 199, 0.7)'
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true, // ★ 수정: 비율을 유지하도록 변경 (false -> true)
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    // ----------------------------------------
    // 3. 인기 조회 상품 (productsChart) - 도넛 차트
    // ----------------------------------------
    const productsCtx = document.getElementById('productsChart');
    
    if (productsCtx) {
        new Chart(productsCtx, {
            type: 'doughnut',
            data: {
                labels: ['[BEST] 린넨 셔츠', '[SALE] 쿨링 팬츠', '시그니처 반팔티', 'UV차단 썬캡', '기타'],
                datasets: [{
                    label: '인기 조회 상품 Top 5',
                    data: [55, 40, 32, 25, 18], // 예시 데이터
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true, // ★ 수정: 비율을 유지하도록 변경 (false -> true)
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

});