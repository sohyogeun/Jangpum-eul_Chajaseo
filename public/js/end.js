/* ================================================================
   푸터 데이터
   ================================================================ */
const footerData = {
  info: [
    { label: '대표자', value: 'text' },
    { label: '주소', value: '대한민국 성남' },
    { label: '개인정보보호책임자', value: 'text' },
    { label: '사업자등록번호', value: '123-123-0000' },
    { label: '고객센터', value: '1234-0000' },
    { label: '이메일', value: 'contact@example.com' }
  ],
  copyright: 'copyright 2025 장품을 찾아서 all right reserved.'
};

/* ================================================================
   템플릿 로드(있을 때만), 푸터 채우기
   ================================================================ */
async function loadTemplate(url, mountSelector) {
  const mount = document.querySelector(mountSelector);
  if (!mount) return false; // mount가 없으면 스킵
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    mount.innerHTML = await res.text();
    return true;
  } catch (err) {
    console.error(`[loadTemplate] ${url} 로드 실패:`, err);
    mount.innerHTML = `<p style="color:red;">콘텐츠 로드 실패</p>`;
    return false;
  }
}

function populateFooter(data) {
  const infoList = document.getElementById('footer-info-list');
  const cr = document.getElementById('footer-copyright');

  if (infoList && Array.isArray(data.info)) {
    infoList.innerHTML = data.info
      .map(item => `<li>${item.label}: ${item.value}</li>`)
      .join('');
  } else {
    console.warn('[populateFooter] #footer-info-list 요소를 찾을 수 없거나 data.info 없음');
  }

  if (cr && data.copyright) {
    cr.textContent = data.copyright;
  } else {
    console.warn('[populateFooter] #footer-copyright 요소를 찾을 수 없거나 데이터 없음');
  }
}

/* ================================================================
   실행
   ================================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  // 1) end.html을 #end에 로드(있을 때만)
  await loadTemplate('end.html', '#end');

  // 2) 푸터 데이터 주입 (end.html을 로드했든, 기존 footer가 있든 둘 다 지원)
  populateFooter(footerData);

  // 3) 간단 검증 로그
  const ok =
    !!document.getElementById('footer-info-list')?.children.length &&
    !!document.getElementById('footer-copyright')?.textContent?.trim();
  console.log(`[footer] 렌더링 ${ok ? '성공' : '실패(요소/데이터 확인 필요)'}`);
});
