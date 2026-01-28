// js/include.js

document.addEventListener("DOMContentLoaded", function() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch('Hreader.html')
            .then(response => response.text())
            .then(htmlData => {
                headerPlaceholder.innerHTML = htmlData;

                // ✅ [추가할 위치] 바로 이 곳입니다.
                document.dispatchEvent(new CustomEvent('headerLoaded'));
            })
            .catch(error => {
                console.error('헤더를 불러오는 중 오류가 발생했습니다:', error);
            });
    }
});