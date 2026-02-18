document.addEventListener("DOMContentLoaded", () => {
    
    // ============================================
    // 1. 요소 선택 (ID는 HTML과 일치해야 함)
    // ============================================
    const buttons = {
        wep: document.getElementById("wep"),          // 소개 버튼
        storytwo: document.getElementById("storytwo"),    // 스토리 버튼
        targetThree: document.getElementById("targetThree") // 목표 버튼
    };

    const sections = {
        wep: document.getElementById("sec-intro"),
        storytwo: document.getElementById("sec-story"),
        targetThree: document.getElementById("sec-goal")
    };

    // 요소가 하나라도 없으면 실행 중단 (에러 방지)
    if (!buttons.wep || !sections.wep) return;


    // ============================================
    // 2. 텍스트 데이터 (HTML 태그 포함)
    // ============================================
    const TAB_DATA = {
        wep: {
            html: `
                <p>우리는 종종 '지성 피부'라고 생각하고 화장품을 고르지만 실제로는 전혀 다른 피부 타입일 수 있습니다.
                잘못된 판단은 피부 트러블, 불필요한 지출, 만족도 저하로 이어지곤 합니다.</p>
                <p>그래서 우리는 단순한 추측이 아닌 <strong>정확한 피부 분석</strong>을 통해 나에게 꼭 맞는 화장품을 찾을 수 있는 길을 만들었습니다.
                우리 사이트는 누구나 간단한 질문에 답하는 것만으로 본인의 피부 타입을 정확히 알아낼 수 있고,
                그 결과에 맞춰 다양한 화장품들을 한눈에 비교할 수 있습니다.</p>
                <p>이제는 '어떤 제품이 나한테 잘 맞을까?'를 고민하기보다
                '내 피부에 맞는지부터 정확히 알고, 그에 맞는 제품을 객관적으로 비교해 보세요'.
                당신의 피부에 딱 맞는 화장품, 이제는 감이 아니라 <strong>데이터</strong>로 찾으세요.</p>
            `
        },
        storytwo: {
            html: `
                <p>6학년 때부터 시작된 트러블과 여드름은 저에게 큰 스트레스였습니다.
                하지만 누구도 "피부과에 가서 검사를 받아보라"고 알려주지 않았습니다.
                피부과는 비싸다는 인식 때문에 망설였고, 성인이 되어서야 단순히 기름이 많으니 '지성'이겠거니 추측하며 화장품을 샀습니다.</p>
                <p>하지만 돌아온 건 더 심해진 트러블과 흉터뿐이었습니다.
                '그때 정확히 진단받고 관리할걸' 하는 후회가 밀려왔습니다.</p>
                <p>그래서 저는 결심했습니다. 비싼 병원이 아니더라도,
                누구나 가볍게 자신의 피부를 진단받고, <strong>객관적인 데이터로 제품을 비교할 수 있는 공간</strong>을 만들겠다고요.
                부족하지만 개발자로서의 꿈을 담아, 여러분이 더 나은 뷰티 라이프를 즐길 수 있도록 이 사이트를 만들게 되었습니다.</p>
            `
        },
        targetThree: {
            // CSS에서 ul/li 스타일을 잡아뒀으므로 깔끔하게 태그만 넣으면 됩니다.
            html: `
                <ul>
                    <li>피부타입/성분/가성비 기준의 투명한 추천</li>
                    <li>브랜드 편향 없는 비교 테이블 제공</li>
                    <li>사용자 후기 품질 향상과 스팸 필터링</li>
                    <li>관리자 화면과 본 사이트 기능 연동</li>
                    <li>오류 리스트업 & 수정</li>
                    <li>사이트 출시</li>
                </ul>
            `
        }
    };


    // ============================================
    // 3. 데이터 주입 (복잡한 로직 제거 -> innerHTML로 단순화)
    // ============================================
    // querySelector로 넣을 공간 찾기 (CSS 클래스명과 일치)
    const targets = {
        wep: sections.wep.querySelector(".section-text"),
        storytwo: sections.storytwo.querySelector(".section-text"),
        targetThree: sections.targetThree.querySelector(".section-list") // 목표는 list 공간에
    };

    if (targets.wep) targets.wep.innerHTML = TAB_DATA.wep.html;
    if (targets.storytwo) targets.storytwo.innerHTML = TAB_DATA.storytwo.html;
    if (targets.targetThree) targets.targetThree.innerHTML = TAB_DATA.targetThree.html;


    // ============================================
    // 4. 버튼 클릭 이벤트 (부드러운 스크롤 이동)
    // ============================================
    Object.keys(buttons).forEach(key => {
        const btn = buttons[key];
        const section = sections[key];

        btn.addEventListener("click", (e) => {
            e.preventDefault(); // 폼 제출 등 기본 동작 방지
            
            // 1. 스크롤 이동 (CSS scroll-margin-top 덕분에 헤더에 안 가림)
            section.scrollIntoView({ behavior: "smooth", block: "start" });
            
            // 2. 버튼 활성화 (즉시 반영)
            updateActiveButton(key);
        });
    });


    // ============================================
    // 5. 스크롤 스파이 (보고 있는 위치에 따라 버튼 자동 활성화)
    // ============================================
    const observerOptions = {
        threshold: 0.25,      // 섹션이 25% 정도 보이면 감지
        rootMargin: "-100px"  // 헤더 높이만큼 보정
    };

    const observer = new IntersectionObserver((entries) => {
        // 화면에 들어온 녀석들 중 가장 비율이 높은 녀석 찾기
        const visibleSection = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleSection) {
            // ID 역추적: section-intro -> wep
            let activeKey = null;
            if (visibleSection.target.id === "sec-intro") activeKey = "wep";
            if (visibleSection.target.id === "sec-story") activeKey = "storytwo";
            if (visibleSection.target.id === "sec-goal")  activeKey = "targetThree";

            if (activeKey) updateActiveButton(activeKey);
        }
    }, observerOptions);

    // 관찰 시작
    Object.values(sections).forEach(sec => observer.observe(sec));


    // 버튼 스타일 업데이트 함수
    function updateActiveButton(activeKey) {
        Object.keys(buttons).forEach(key => {
            if (key === activeKey) {
                buttons[key].classList.add("is-active");
            } else {
                buttons[key].classList.remove("is-active");
            }
        });
    }

    // 초기값: 소개 버튼 활성화
    updateActiveButton("wep");


    // ============================================
    // 6. 헤더 높이 실측 (Sticky 위치 계산용)
    // ============================================
    const headerRoot = document.querySelector("#site_header");
    const root = document.documentElement;

    function updateHeaderReal() {
        const h = headerRoot?.getBoundingClientRect().height || 0;
        // CSS 변수 --header-real에 값 할당 -> CSS에서 top: var(--header-real)로 받음
        root.style.setProperty("--header-real", `${h}px`);
    }

    // 처음 로드될 때 실행
    updateHeaderReal();

    // 헤더 내용이 늦게 로딩되거나 바뀔 때를 대비
    if (headerRoot) {
        const mo = new MutationObserver(updateHeaderReal);
        mo.observe(headerRoot, { childList: true, subtree: true });
    }
    
    // 화면 크기 바뀔 때 실행
    window.addEventListener("resize", updateHeaderReal);

});