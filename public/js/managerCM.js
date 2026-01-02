const list = {
  M_D: "managerD.html",
  M_AMS: "managerP.html",
  M_U : "managerU.html",
  M_NB_E : "managerNB_E.html",
  BBM : "managerBBM.html",
  M_SDN : "managerDSN.html",
  Jg : "managerJg.html",
};

// 하나의 통합된 클릭 이벤트 리스너
document.addEventListener("click", (e) => {
  const target = e.target.closest("a, button");
  if (!target) {
    return;
  }

  // --- 경우 1: 클릭된 것이 <a> 태그일 때 (내부/외부 링크 구분) ---
  if (target.tagName === 'A' && target.href) {
    const currentHost = window.location.hostname;
    const linkHost = target.hostname;

    // 외부 링크인지 확인 (링크의 도메인이 있고, 현재 도메인과 다를 경우)
    if (linkHost && linkHost !== currentHost) {
      // 외부 링크이면 -> 새 탭으로 열기
      e.preventDefault();
      window.open(target.href, "_blank", "noopener,noreferrer");
    }
    // 내부 링크이면 -> 아무것도 하지 않고 브라우저의 기본 동작(현재 탭에서 이동)에 맡깁니다.
    return; // <a> 태그에 대한 처리는 여기서 끝냅니다.
  }

  // --- 경우 2: 클릭된 것이 <button> 태그이고, id가 list 객체에 있을 때 ---
  if (target.tagName === 'BUTTON' && list[target.id]) {
    const url = list[target.id];
    
    // list를 통해 이동하는 것은 모두 내부 페이지이므로 -> 현재 탭에서 이동
    e.preventDefault(); // 버튼의 기본 동작(예: form 전송) 방지
    window.location.href = url;
  }
});