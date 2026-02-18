    //  public/admin/managerJg.js
    
    // 1. 구글 차트 로드
    google.charts.load('current', {'packages':['bar', 'geochart', 'corechart', 'table']});

    // 2. 현재 모드 변수
    let currentMode = 'time'; 

    // 3. 페이지 로드 시 실행 (오늘 날짜로 시작)
    google.charts.setOnLoadCallback(function() {
        const today = new Date().toISOString().split('T')[0];
        drawHourlyChart(today); 
    });

    // ---------------- [차트 그리는 함수들] ----------------
    // (이 함수들이 배열보다 먼저, 혹은 같은 스코프에 있어야 합니다)

    // 1. 시간대별
    function drawHourlyChart(dateStr) {
        var chartData = [['시간', '접속자 수']];
        for(let i=0; i<24; i++) {
            chartData.push([i + '시', Math.floor(Math.random() * 100)]);
        }
        var data = google.visualization.arrayToDataTable(chartData);
        var options = google.charts.Bar.convertOptions({
            chart: { title: dateStr + ' 접속 통계 (시간대별)', subtitle: '00:00 ~ 23:00' },
            legend: { position: 'none' },
            colors: ['#4285F4'] // 파란색
        });
        var chart = new google.charts.Bar(document.getElementById('columnchart_material'));
        chart.draw(data, options);
    }

    // 2. 일별
    function drawDailyChart(dateStr) {
        let monthStr = dateStr.substring(0, 7); 
        var chartData = [['일', '접속자 수']];
        for(let i=1; i<=31; i++) {
            chartData.push([i + '일', Math.floor(Math.random() * 500) + 100]);
        }
        var data = google.visualization.arrayToDataTable(chartData);
        var options = google.charts.Bar.convertOptions({
            chart: { title: monthStr + ' 월간 접속 통계 (일별)', subtitle: '1일 ~ 31일' },
            legend: { position: 'none' },
            colors: ['#0f9d58'] // 초록색
        });
        var chart = new google.charts.Bar(document.getElementById('columnchart_material'));
        chart.draw(data, options);
    }

    // 3. 국가별
    function drawCountryChart(dateStr) {
        var data = google.visualization.arrayToDataTable([
            ['국가', '접속자 수'],
            ['한국', 1500], ['미국', 950], ['일본', 600], ['중국', 300], ['베트남', 150]
        ]);
        var options = google.charts.Bar.convertOptions({
            chart: { title: dateStr + ' 접속 통계 (국가별)', subtitle: '상위 5개 국가' },
            bars: 'vertical',
            legend: { position: 'none' },
            colors: ['#db4437'] // 빨간색
        });
        var chart = new google.charts.Bar(document.getElementById('columnchart_material'));
        chart.draw(data, options);
    }

    // 4. 월별
    function drawMonthChart(dateStr) {
        let yearStr = dateStr.split('-')[0]; 
        var chartData = [['월', '접속자 수']];
        for(let i=1; i<=12; i++) {
            chartData.push([i + '월', Math.floor(Math.random() * 2000) + 500]);
        }
        var data = google.visualization.arrayToDataTable(chartData);
        var options = google.charts.Bar.convertOptions({
            chart: { title: yearStr + '년 접속 통계 (월별)', subtitle: '1월 ~ 12월' },
            bars: 'vertical',
            legend: { position: 'none' },
            colors: ['#9c27b0'] // 보라색
        });
        var chart = new google.charts.Bar(document.getElementById('columnchart_material'));
        chart.draw(data, options);
    }

    //년도
    function drawYearChart(dateStr) {
        // 1. 선택된 날짜에서 '연도'만 뽑아서 숫자로 변환 (예: "2025")
        let selectedYear = parseInt(dateStr.split('-')[0]); 
        
        // 2. 시작 연도 계산 (선택한 연도 포함 과거 5년치 -> 2025년이면 2021년부터)
        let startYear = selectedYear - 4;

        var chartData = [['년도', '접속자 수']];

        // 3. 5번 반복하면서 연도 생성
        for(let i=0; i<5; i++) {
            let year = startYear + i; // 2021, 2022, 2023... 순서대로 증가
            let visitors = Math.floor(Math.random() * 10000) + 2000; // 년도별이니 숫자를 좀 크게 잡음
            
            chartData.push([year + '년', visitors]);
        }

        var data = google.visualization.arrayToDataTable(chartData);

        var options = google.charts.Bar.convertOptions({
            chart: { 
                // 제목을 "2021년 ~ 2025년" 처럼 범위로 표시
                title: startYear + '년 ~ ' + selectedYear + '년 접속 통계 (연도별)', 
                subtitle: '최근 5년간 추이' 
            },
            bars: 'vertical',
            legend: { position: 'none' },
            colors: ['#07ffea'] // 민트색/형광하늘색
        });

        var chart = new google.charts.Bar(document.getElementById('columnchart_material'));
        chart.draw(data, options);
    }

    //운영체계
    function drawOperatingSystemChart(dateStr) {
        // 요청하신 항목들로 데이터 구성
        var data = google.visualization.arrayToDataTable([
            ['플랫폼', '접속자 수'],
            ['네이버', Math.floor(Math.random() * 1500) + 500],   // 랜덤 데이터
            ['구글',   Math.floor(Math.random() * 1200) + 400],
            ['iOS',    Math.floor(Math.random() * 1000) + 600],
            ['안드로이드', Math.floor(Math.random() * 1800) + 800],
            ['Edge',   Math.floor(Math.random() * 600) + 100]
        ]);

        var options = google.charts.Bar.convertOptions({
            chart: { 
                title: dateStr + ' 접속 환경 통계', 
                subtitle: '주요 유입 경로 및 운영체제' 
            },
            bars: 'vertical', // 세로 막대
            legend: { position: 'none' },
            colors: ['#ffb300'] // 노란색/골드색 (다른 그래프와 구분)
        });

        var chart = new google.charts.Bar(document.getElementById('columnchart_material'));
        chart.draw(data, options);
    }

    //검색엔진
    function drawSearchEngineChart(dateStr) {
        // 데이터 준비
        var data = google.visualization.arrayToDataTable([
            ['검색엔진', '유입 비율'],
            ['네이버', 65],  // 예시 데이터
            ['구글', 35]     // 예시 데이터
        ]);

        var options = {
            title: dateStr + ' 검색엔진 유입 비중',
            pieHole: 0.4, // 이 값이 0보다 크면 도넛 모양이 됩니다 (0이면 꽉 찬 원)
            colors: ['#03C75A', '#4285F4'], // 네이버 공식 초록색, 구글 공식 파란색
            chartArea: {width: '80%', height: '80%'},
            legend: { position: 'bottom' } // 범례를 아래로 내림
        };


    var chart = new google.visualization.PieChart(document.getElementById('columnchart_material'));
    chart.draw(data, options);
}
//접속로그
function drawAccessLogTable(dateStr) {
    var data = new google.visualization.DataTable();
    
    // 1. 컬럼(열) 정의
    data.addColumn('string', '접속 시간');
    data.addColumn('string', 'IP 주소');
    data.addColumn('string', '접속 국가');
    data.addColumn('string', '운영체제');
    data.addColumn('string', '브라우저');

    // 2. 가짜 데이터 생성 (실제로는 DB에서 가져옴)
    // 예: 10개의 로그만 생성
    for(let i=0; i<15; i++) {
        let hour = Math.floor(Math.random() * 24).toString().padStart(2, '0');
        let min = Math.floor(Math.random() * 60).toString().padStart(2, '0');
        let sec = Math.floor(Math.random() * 60).toString().padStart(2, '0');
        let time = `${hour}:${min}:${sec}`;
        
        // 랜덤 IP 생성
        let ip = `192.168.0.${Math.floor(Math.random() * 255)}`; 
        
        data.addRow([time, ip, '한국', 'Windows 10', 'Chrome']);
    }

    // 3. 표 옵션 설정
    var options = {
        showRowNumber: true, // 줄 번호 표시
        width: '100%', 
        height: '100%'
    };

    // ★ 핵심: BarChart나 PieChart가 아니라 'Table'을 사용합니다.
    var table = new google.visualization.Table(document.getElementById('columnchart_material'));
    table.draw(data, options);
}

    
    // Func 속성을 여기에 꼭 넣어줘야 에러가 안 납니다! ★
    const AccessStatistics = [
        {id : 1, ById :'ByTimeZone', Mode : 'time', ModeName : '시간대별', Func: drawHourlyChart},
        {id : 2, ById :'Glance', Mode : 'day', ModeName : '일별', Func: drawDailyChart},
        {id : 3, ById :'ByCountry', Mode : 'country', ModeName : '국가별', Func: drawCountryChart},
        {id : 4, ById :'Monthly', Mode : 'month', ModeName : '월별', Func: drawMonthChart},
        {id : 5, ById :'ByYear', Mode : 'Year', ModeName : '년도별', Func: drawYearChart},
        {id : 6, ById :'ByOperatingSystem', Mode : 'os', ModeName : '운영체계별', Func: drawOperatingSystemChart},
        {id : 7, ById :'searchEngine', Mode : 'search', ModeName : '검색엔진', Func: drawSearchEngineChart},
        {id : 8, ById :'AccessLog', Mode : 'Log', ModeName : '접속로그', Func: drawAccessLogTable}
    ];

    AccessStatistics.forEach((item)=>{
        var btn = document.getElementById(`${item.ById}`)

        if(btn){
            btn.addEventListener('click',function(){
                currentMode = item.Mode;
                console.log('모드 변경 : ', item.Mode);
                const today = new Date().toISOString().split('T')[0];
            
                // item.Func가 함수인지 확인하고 실행
                if (typeof item.Func === 'function') {
                    item.Func(today); 
                }
            
                datepicker.clear();
            })
        }
    })
    
    // ---------------- [달력 설정] ----------------
    const datepicker = new AirDatepicker('#airDatepicker', {
        locale: {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            today: 'Today',
            clear: 'Clear',
            dateFormat: 'yyyy-MM-dd',
            timeFormat: 'hh:mm aa',
            firstDay: 0
        },
        
        onSelect: function({date, formattedDate}) {
            if(formattedDate) {
                // 배열에서 현재 모드와 일치하는 객체 찾기
                const target = AccessStatistics.find(item => item.Mode === currentMode);
    
                // target이 있고, 그 안에 Func(함수)가 있는지 확인 후 실행
                if (target && typeof target.Func === 'function') {
                    target.Func(formattedDate);
                } else {
                    console.log("해당 모드에 연결된 함수가 없습니다.");
                }
            }
        }
    });

    const defaultBtn = document.getElementById('ByTimeZone');
    if(defaultBtn) defaultBtn.classList.add('active');
    AccessStatistics.forEach((item)=>{
        var btn = document.getElementById(`${item.ById}`)

        if(btn){
            btn.addEventListener('click', function(){
                
                document.querySelectorAll('.bannerBTN').forEach(b => b.classList.remove('active'));

                // 2. 지금 클릭한 버튼(this)에만 'active' 클래스를 붙입니다.
                this.classList.add('active');

                // ------------------------------------------

                currentMode = item.Mode;
                console.log('모드 변경 : ', item.Mode);
                const today = new Date().toISOString().split('T')[0];
            
                if (typeof item.Func === 'function') {
                    item.Func(today); 
                }
            
                datepicker.clear();
            })
        }
    })
