const DOM = {
    section: {
        mainBannerWrapper: document.querySelector('.mainbanner'),
        eventBoxWrapper: document.getElementById('twe'),
    },
    content: {
        mainImgArea: document.querySelector('.mainIMG'), 
        
        tabTop10Wrapper: document.querySelector('.Skins'), 
        
        eventMain: document.querySelector('.eventLink-main'),
        eventServe: document.querySelector('.eventLink-serve'),

        Csc: document.querySelector('.Csc'),
        bdBanner: document.querySelector('.bdBanner'), 
    },
    btn: {
        topMainBanner: document.getElementById('mainbanner'), 
        topEvent: document.getElementById('event'),        
        mainMySkinBTN : document.getElementById('mainMySkinBTN'),
        tabMainBanner: document.getElementById('mainBTN-1'),  
        tabMySkin: document.getElementById('mainBTN-2'),  
        eventMain: document.querySelector('.EBtnM'),     
        eventSub: document.querySelector('.EBtnS'),          
        eventServeButtons: document.querySelectorAll('.eventLink-serve button'), 
    },
    upload: {
        input: document.getElementById('fileInput'),
        preview: document.getElementById('previewImg'),
    }
};

if(DOM.btn.mainMySkinBTN){
    DOM.btn.mainMySkinBTN.addEventListener('click', function(){
        // [수정 2] DOM.section이 아니라 DOM.content 안에 있습니다.
        if(DOM.content.mainImgArea) {
            DOM.content.mainImgArea.style.display = 'none';
            DOM.content.Csc.style.display = 'none';
            DOM.content.bdBanner.style.display = 'none';
        }

        // [수정 3] 감싸고 있는 부모(.Skins)를 보여줘야 화면에 나옵니다.
        if(DOM.content.tabTop10Wrapper) {
            DOM.content.tabTop10Wrapper.style.display = 'block';
        }
    });
}
if(DOM.btn.tabMainBanner){
    DOM.btn.tabMainBanner.addEventListener('click', function(){
        // Top10 (Skins) 숨기기
        if(DOM.content.tabTop10Wrapper) {
            DOM.content.tabTop10Wrapper.style.display = 'none';
            DOM.content.Csc.style.display = 'none';
            DOM.content.bdBanner.style.display = 'none';
        }


        if(DOM.content.mainImgArea) {
            DOM.content.mainImgArea.style.display = 'block';
        }
    });
}

if(DOM.btn.tabMySkin){
    DOM.btn.tabMySkin.addEventListener('click', function(){
        // Top10 (Skins) 숨기기
        if(DOM.content.tabTop10Wrapper) {
            DOM.content.tabTop10Wrapper.style.display = 'none';
            DOM.content.Csc.style.display = 'none';
            DOM.content.bdBanner.style.display = 'none';
        }


        if(DOM.content.mainImgArea) {
            DOM.content.mainImgArea.style.display = 'block';
        }
    });
}
// ============================================================
// 1. 상단 대메뉴 네비게이션 (메인 배너 <-> 이벤트)
// ============================================================

// [메인 베너] 버튼 클릭
if (DOM.btn.topMainBanner) {
    DOM.btn.topMainBanner.addEventListener('click', function() {
        if (DOM.section.eventBoxWrapper) 
            DOM.section.eventBoxWrapper.style.display = 'none';
            DOM.content.Csc.style.display = 'none';
            DOM.content.bdBanner.style.display = 'none';
        if (DOM.section.mainBannerWrapper) DOM.section.mainBannerWrapper.style.display = 'block';
    });
}

// [이벤트] 버튼 클릭
if (DOM.btn.topEvent) {
    DOM.btn.topEvent.addEventListener('click', function() {
        if (DOM.section.mainBannerWrapper) 
            DOM.section.mainBannerWrapper.style.display = 'none';
            DOM.content.Csc.style.display = 'none';
            DOM.content.bdBanner.style.display = 'none';
        if (DOM.section.eventBoxWrapper) DOM.section.eventBoxWrapper.style.display = 'block';
        
        // 이벤트 탭 초기화 (메인 켜기)
        if(DOM.content.eventServe) DOM.content.eventServe.style.display = 'none'; 
        if(DOM.content.eventMain) DOM.content.eventMain.style.display = 'grid';  
    });
}

// ============================================================
// 2. [메인 배너] 내부 탭 전환 로직 (핵심 부분)
// ============================================================

const mainDate = [
    { id: 1, title: '메인 베너' },
    { id: 2, title: '내피부 아는데' },
];

function renderMainTab(targetId) {
    const targetArea = DOM.content.mainImgArea; // .mainIMG 선택
    if (!targetArea) return;

    // 데이터 찾기
    const data = mainDate.find(item => item.id === targetId);
    if (!data) return;

    // HTML 주입 (기존 HTML 구조인 .BImg_title 등을 유지)
    // ID 충돌 방지를 위해 dynamic- 접두어 사용
    targetArea.innerHTML = `
        <div class="BImg_title">
            <p>${data.title}</p>
            <div class="bannerIMG">
                <img id="dynamic-preview-${data.id}" alt="배너 미리보기" style="display:none; max-width:100%;">
            </div>
            
            <div class="BImg_title_one">
                <input type="file" id="dynamic-file-${data.id}" accept="image/*">
                <button type="button">저장</button>
            </div>    
        </div>
    `;

    // [중요] 동적으로 생성된 요소에 이벤트 다시 연결
    const newFileInput = document.getElementById(`dynamic-file-${data.id}`);
    const newPreviewImg = document.getElementById(`dynamic-preview-${data.id}`);

    if (newFileInput && newPreviewImg) {
        newFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    newPreviewImg.src = event.target.result;
                    newPreviewImg.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// 탭 버튼 클릭 이벤트 연결
if (DOM.btn.tabMainBanner) {
    DOM.btn.tabMainBanner.addEventListener('click', () => renderMainTab(1));
}
if (DOM.btn.tabMySkin) {
    DOM.btn.tabMySkin.addEventListener('click', () => renderMainTab(2));
}
if (DOM.btn.tabTop10) {
    DOM.btn.tabTop10.addEventListener('click', () => renderMainTab(3));
}

// ※ 페이지 로드 시 '메인 베너(1번)' 내용을 자동으로 그려줍니다.
//   (HTML에 하드코딩된 내용이 있어도, JS 로직 연결을 위해 덮어씁니다)
renderMainTab(1);


// ============================================================
// 3. [이벤트] 내부 로직 (메인 <-> 서브)
// ============================================================

if (DOM.btn.eventMain) {
    DOM.btn.eventMain.addEventListener('click', function() {
        if(DOM.content.eventServe) DOM.content.eventServe.style.display = 'none'; 
        if(DOM.content.eventMain) DOM.content.eventMain.style.display = 'grid';  
    });
}

if (DOM.btn.eventSub) {
    DOM.btn.eventSub.addEventListener('click', function() {
        if(DOM.content.eventMain) DOM.content.eventMain.style.display = 'none';  
        if(DOM.content.eventServe) DOM.content.eventServe.style.display = 'block'; 
    });
}

// ============================================================
// 4. [이벤트 - 메인] 박스 4개 그리기 (E_main_box)
// ============================================================

var SkinName = [
    {id : 1, title : '올리브영', },
    {id : 2, title : '아모레퍼시픽', },
    {id : 3, title : '이니스프리', },
    {id : 4, title : '제로이드', },
];

function E_main_box (){
    const targetClasses = ['.eventLinkOne', '.eventLinktwe', '.eventLinkthree', '.eventLinkfour'];
    
    SkinName.forEach((Ndate, index) => {
        const targetDiv = document.querySelector(targetClasses[index]);
        if (targetDiv) {
            targetDiv.innerHTML = `
            <h3 style="margin: 0; margin-bottom: 10px; font-size:16px;">${Ndate.title}</h3>
            <div class="img-area">
                <img id="img-${Ndate.id}" style="display:none;">
            </div>
            <div class="E_File">
                <input type="file" id="file-${Ndate.id}">
                <button>저장</button>
            </div>
            `;
        }
    });
    
    SkinName.forEach((Ndate) => {
        const itemFileInput = document.getElementById(`file-${Ndate.id}`);
        const imgTag = document.getElementById(`img-${Ndate.id}`);
        
        if (itemFileInput && imgTag) {
            itemFileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        imgTag.src = event.target.result;
                        imgTag.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });
}
E_main_box();


// ============================================================
// 5. [이벤트 - 서브] 브랜드 버튼 클릭 로직
// ============================================================

const targetClasses = ['serveOne', 'servetwe', 'servethree', 'servefour', 'servefive'];

if (DOM.btn.eventServeButtons) {
    DOM.btn.eventServeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const brandName = this.getAttribute('data-brand') || this.innerText; 
            renderBoxes(brandName); 
        });
    });
}

function renderBoxes(brandName) {
    const mockData = Array.from({ length: 5 }, (_, index) => ({
        id: index + 1,
        defaultTitle: `${brandName} 추천템 ${index + 1}`
    }));

    mockData.forEach((item, index) => {
        const targetClass = targetClasses[index];
        const targetDiv = document.querySelector(`.${targetClass}`);

        if (targetDiv) {
            targetDiv.innerHTML = ''; 
            const boxDiv = document.createElement('div');
            boxDiv.className = 'product-box';
            
            boxDiv.innerHTML = `
                <input type="text" class="title-input" placeholder="이름 입력" value="${item.defaultTitle}">
                <div class="img-areaOne">
                    <img id="serve-img-${item.id}" src="" alt="미리보기" style="display:none; max-width:100%;">
                </div>
                <div class="E_File_S">
                    <input type="file" id="serve-file-${item.id}">
                    <button>저장</button>
                </div>
            `;
            targetDiv.appendChild(boxDiv);

            const fileInput = boxDiv.querySelector(`#serve-file-${item.id}`);
            const imgElement = boxDiv.querySelector(`#serve-img-${item.id}`);

            if (fileInput && imgElement) {
                fileInput.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            imgElement.src = event.target.result;
                            imgElement.style.display = 'block'; 
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        }
    });
}

window.onload = function() {
    console.log("1. 스크립트 시작됨");

    const container = document.querySelector('.mainMySkin');
    console.log("2. 컨테이너 찾음:", container);

    // 데이터 10개 생성
    const skinData = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Top ${i + 1} 화장품`
    }));

    const btnPage1 = document.getElementById('btnPrev');
    const btnPage2 = document.getElementById('btnNext');

    function renderPage(pageNumber) {
        console.log("3. renderPage 실행됨:", pageNumber);
        
        const startIndex = (pageNumber - 1) * 5; 
        const endIndex = startIndex + 5;
        const currentItems = skinData.slice(startIndex, endIndex);

        // 1. HTML 그리기
        container.innerHTML = currentItems.map(item => `
            <div class="mainMySkinBack">
                <p style="font-weight:bold; text-align:center; margin:0px">${item.title}</p>
                <div class="mainMySkinNI">
                    <input type="text" placeholder="제품명">
                    <div class="mainMySkinNImg">
                        <img alt="사진" style="max-width:100%; max-height:100%;">
                    </div>
                </div>
                <div class="mainMyskinFile">
                    <input type="file" accept="image/*">
                    <button>저장</button>
                </div>
            </div>
        `).join('');

        // 2. 버튼 상태 변경
        if(pageNumber === 1) {
            btnPage1?.classList.add('active');
            btnPage2?.classList.remove('active');
        } else {
            btnPage1?.classList.remove('active');
            btnPage2?.classList.add('active');
        }

        // ========================================================
        // [추가된 부분] 파일 선택 시 이미지 미리보기 기능 연결하기
        // ========================================================
        
        // 방금 만든 5개의 파일 인풋을 모두 찾습니다.
        const fileInputs = container.querySelectorAll('input[type="file"]');

        fileInputs.forEach(input => {
            input.addEventListener('change', function(e) {
                // 선택한 파일 가져오기
                const file = e.target.files[0];
                
                // 파일이 있다면 읽기 시작
                if (file) {
                    const reader = new FileReader();
                    
                    // 다 읽었으면 실행되는 함수
                    reader.onload = function(event) {
                        // 현재 인풋이 속한 박스(.mainMySkinBack) 안에서 이미지를 찾음
                        const parentBox = input.closest('.mainMySkinBack');
                        const imgTag = parentBox.querySelector('.mainMySkinNImg img');
                        
                        // 이미지 src에 읽은 파일 내용(URL)을 넣어줌
                        if(imgTag) {
                            imgTag.src = event.target.result;
                        }
                    };
                    
                    // 파일을 URL 형태로 읽어라 명령
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    if(container) {
        renderPage(1);
    } else {
        console.error("4. [중요] HTML에 class='mainMySkin'이 없습니다!");
    }

    if(btnPage1 && btnPage2) {
        btnPage1.addEventListener('click', () => renderPage(1));
        btnPage2.addEventListener('click', () => renderPage(2));
    }
};