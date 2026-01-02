var titles = [
    {id : 1, title : '회원정보' , btnId : 'MMI'},
    {id : 2, title : '멤버쉽' , btnId : 'MMB'},
    {id : 3, title : '나의 피부' , btnId : 'MSK'},
    {id : 4, title : '기타 문의' , btnId : 'MOI'},
]

document.addEventListener('DOMContentLoaded', function () {
    console.log("RE.js 로드 완료: 이벤트 감지 대기 중...");

    document.body.addEventListener('click', function (e) {
        
        // 1. 관리자 버튼 (#NB) 처리
        if (e.target.closest('#NB')) {
             // 관리자는 별도 타이틀
            showWriteForm('NB', '게시판 등록 (관리자)');
            return;
        }

        // 2. 일반 글쓰기 버튼들 (titles 배열에 있는 버튼인지 확인)
        // 클릭된 요소가 titles 배열의 btnId 중 하나와 일치하는지 찾습니다.
        const clickedItem = titles.find(item => e.target.closest('#' + item.btnId));

        if (clickedItem) {
            e.preventDefault();
            console.log(`✅ ${clickedItem.title} 글쓰기(#${clickedItem.btnId}) 클릭됨`);
            
            // 핵심: 찾은 아이템의 title을 함수로 넘겨줍니다.
            showWriteForm('USER', clickedItem.title); 
        }

        // 3. 목록으로 돌아가기 버튼
        else if (e.target.classList.contains('btn-back-to-list')) {
            showListView();
        }
    });
});

// ---------------------------------------------------------
// [수정됨] title 인자를 추가로 받아서 제목을 동적으로 표시합니다.
// ---------------------------------------------------------
function showWriteForm(mode, customTitle) {
    const listView = document.getElementById('list-view');
    const writeView = document.getElementById('write-view');

    if (!listView || !writeView) {
        console.error("HTML 요소를 찾을 수 없습니다.");
        return;
    }

    listView.style.display = 'none';
    writeView.style.display = 'block';

    // 썸머노트 초기화 방지 (기존 인스턴스 제거)
    if (typeof $ !== 'undefined' && $('#summernote-editor').length > 0) {
        $('#summernote-editor').summernote('destroy');
    }

    // 제목 설정: customTitle이 있으면 그걸 쓰고, 없으면 기본값
    const displayTitle = customTitle ? customTitle : '글쓰기';

    let html = `
    <div class="NB_W_Name" style="width: 100%; margin: 0 auto;"> 
        <div class="NB_W_list">
            <h4>${displayTitle}</h4>
            
            <div class="NB_W_listName"><p>제목</p></div>
            <div class="NB_W_listNameOne">
                <input type="text" class="form-control" placeholder="제목을 입력하세요">
                ${mode === 'NB' ? `<div class="form-check mt-2"><input type="checkbox" id="noticeCheck"><label for="noticeCheck">공지글</label></div>` : ''}
            </div>
    `;

    // 관리자 모드일 때만 추가 입력 필드 표시
    if (mode === 'NB') {
        html += `
            <div class="NB_W_listName"><p>이름</p></div><div class="NB_W_listNameOne"><input type="text" class="form-control"></div>
            <div class="NB_W_listName"><p>이메일</p></div><div class="NB_W_listNameOne"><input type="email" class="form-control"></div>
            <div class="NB_W_listName"><p>비밀번호</p></div><div class="NB_W_listNameOne"><input type="password" class="form-control"></div>
        `;
    }

    html += `
            <div class="NB_W_T"><p>내용</p></div>
            <div class="NB_W_listNameOne"><textarea id="summernote-editor"></textarea></div>
        </div>
        <div class="NB_W_button mt-4 text-center">
            <button class="btn btn-dark" onclick="alert('저장!')">등록</button>
            <button class="btn btn-secondary btn-back-to-list">목록</button>
        </div>
    </div>
    `;

    writeView.innerHTML = html;
    initSummernote();
}

function showListView() {
    const listView = document.getElementById('list-view');
    const writeView = document.getElementById('write-view');
    
    if (typeof $ !== 'undefined' && $('#summernote-editor').length > 0) {
        $('#summernote-editor').summernote('destroy');
    }

    writeView.innerHTML = ''; 
    writeView.style.display = 'none';
    listView.style.display = 'block';
}

function initSummernote() {
    if (typeof $ !== 'undefined' && $.fn.summernote) {
        $('#summernote-editor').summernote({
            height: 400,
            lang: "ko-KR",
            placeholder: '내용을 입력해주세요.',
            toolbar: [
                ['font', ['bold', 'underline', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['insert', ['picture', 'link']],
                ['view', ['codeview']]
            ]
        });
    }
}

function showListView() {
    const listView = document.getElementById('list-view');
    const writeView = document.getElementById('write-view');
    
    if (typeof $ !== 'undefined' && $('#summernote-editor').length > 0) {
        $('#summernote-editor').summernote('destroy');
    }

    writeView.innerHTML = ''; 
    writeView.style.display = 'none';
    listView.style.display = 'block';
}

function initSummernote() {
    if (typeof $ !== 'undefined' && $.fn.summernote) {
        $('#summernote-editor').summernote({
            height: 400,
            lang: "ko-KR",
            placeholder: '내용을 입력해주세요.',
            toolbar: [
                ['font', ['bold', 'underline', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['insert', ['picture', 'link']],
                ['view', ['codeview']]
            ]
        });
    }
}