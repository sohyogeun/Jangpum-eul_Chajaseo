var titles = [
    {id : 1, title : '회원정보' , btnId : 'MMI'},
    {id : 2, title : '비교' , btnId : 'MMB'},
    {id : 3, title : '나의 피부' , btnId : 'MSK'},
    {id : 4, title : '기타 문의' , btnId : 'MOI'},
]

document.addEventListener('DOMContentLoaded', function () {
    console.log("RE.js 로드 완료: 이벤트 감지 대기 중...");

    document.body.addEventListener('click', function (e) {
        
        // 1. 관리자 버튼 (#NB) 처리
        if (e.target.closest('#NB')) {
            const checkedBoxes = document.querySelectorAll('.NB_body input[type="checkbox"]:checked');
            
            let targetEmail = "";
            let targetId = ""; // ✅ 원본 글의 ID를 담을 변수 추가!

            if (checkedBoxes.length > 0) {
                targetEmail = checkedBoxes[0].dataset.email;
                targetId = checkedBoxes[0].dataset.id; // ✅ 체크박스에서 원본 글 ID 가져오기

                if(checkedBoxes.length > 1) {
                    alert("여러 개를 선택하셨습니다. 첫 번째 항목에만 답장합니다.");
                }
            }

            if (!targetId) {
                return alert("답장할 게시글을 먼저 선택해주세요!");
            }

            // 3) 가져온 이메일과 함께 'targetId'도 폼으로 넘겨줍니다!
            showWriteForm('NB', '답장 쓰기 (관리자)', targetEmail, targetId);
            return;
        }

        // 2. 일반 글쓰기 버튼들 처리
        const clickedItem = titles.find(item => e.target.closest('#' + item.btnId));
        if (clickedItem) {
            e.preventDefault();
            console.log(`✅ ${clickedItem.title} 글쓰기(#${clickedItem.btnId}) 클릭됨`);
            showWriteForm('USER', clickedItem.title); 
        }

        // 3. 목록으로 돌아가기 버튼
        else if (e.target.classList.contains('btn-back-to-list')) {
            showListView();
        }
    });
});

// ---------------------------------------------------------
// [수정됨] targetId 인자를 추가로 받아 숨겨진 input에 저장합니다.
// ---------------------------------------------------------
function showWriteForm(mode, customTitle, targetEmail = "", targetId = "") {
    const listView = document.getElementById('list-view');
    const writeView = document.getElementById('write-view');

    if (!listView || !writeView) return;

    listView.style.display = 'none';
    writeView.style.display = 'block';

    if (typeof $ !== 'undefined' && $('#summernote-editor').length > 0) {
        $('#summernote-editor').summernote('destroy');
    }

    const displayTitle = customTitle ? customTitle : '글쓰기';

    let html = `
    <div class="NB_W_Name" style="width: 100%; margin: 0 auto;"> 
        <input type="hidden" id="targetInquiryId" value="${targetId}">
        
        <div class="NB_W_list">
            <h4>${displayTitle}</h4>
            
            <div class="NB_W_listName"><p>제목</p></div>
            <div class="NB_W_listNameOne">
                <input type="text" id="title" class="form-control" placeholder="제목을 입력하세요">
                ${mode === 'NB' ? `<div class="form-check mt-2"><input type="checkbox" id="noticeCheck"><label for="noticeCheck">공지글</label></div>` : ''}
            </div>
    `;

    // 관리자 모드일 때만 추가 입력 필드 표시
    if (mode === 'NB') {
        html += `
            <div class="NB_W_listName"><p>이름</p></div><div class="NB_W_listNameOne"><input type="text" id="name" class="form-control" value="관리자" readonly></div>
            <div class="NB_W_listName"><p>받는 이메일</p></div>
            <div class="NB_W_listNameOne"><input type="email" id="email" class="form-control" value="${targetEmail}" readonly></div>
        `;
    }

    html += `
            <div class="NB_W_T"><p>내용</p></div>
            <div class="NB_W_listNameOne"><textarea id="summernote-editor"></textarea></div>
        </div>
        <div class="NB_W_button mt-4 text-center">
            <button class="btn btn-dark" id="btn-submit">등록</button>
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

    if (typeof $ !== 'undefined' && $.fn && $.fn.summernote) {
        const $ed = $('#summernote-editor');
        if ($ed.length > 0) {
            try { $ed.summernote('destroy'); } catch(e) {}
        }
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