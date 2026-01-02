  // js/mrg.js
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // 0) 필수 엘리먼트
    const age = document.getElementById('age14');          // 14세 체크박스
    const mrg1Btn = document.getElementById('mrg1');       // 일반회원가입 버튼
    const contentArea = document.getElementById('mrg-content'); // mrg1.html 주입 영역

    // 페이지가 다르면 조용히 종료
    if (!age || !mrg1Btn || !contentArea) return;

    // 1) 카드 활성/비활성 동기화
    const cards = document.querySelectorAll('.option-card');
    const syncCards = () => cards.forEach(el => {
      if ('disabled' in el) {
        el.disabled = !age.checked;
      } else {
        el.setAttribute('aria-disabled', String(!age.checked));
        el.classList.toggle('is-disabled', !age.checked);
      }
    });
    age.addEventListener('change', syncCards);
    syncCards();

    // 클릭 가드(버튼이 아니거나 a/div일 때 대비)
    cards.forEach(el => {
      el.addEventListener('click', (e) => {
        if (!age.checked) {
          e.preventDefault();
          alert('만 14세 이상 체크 후 진행해주세요.');
        }
      });
    });

    // 2) 일반회원가입 → mrg1.html 주입
    mrg1Btn.addEventListener('click', async (e) => {
      if (!age.checked || ('disabled' in mrg1Btn && mrg1Btn.disabled)) {
        e.preventDefault();
        return alert('만 14세 이상 체크 후 진행해주세요.');
      }

      try {
        const res = await fetch('mrg1.html', { credentials: 'same-origin' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();

        // 2-1) 기존 영역 교체
        contentArea.innerHTML = html;

        // 2-2) 단계 표시 업데이트(선택)
        const steps = document.querySelectorAll('.mrg-steps li');
        steps.forEach((step, i) => step.classList.toggle('on', i === 1));

        // 2-3) mrg1.html 내 <script> 실행
        contentArea.querySelectorAll('script').forEach(script => {
          const s = document.createElement('script');
          if (script.src) s.src = script.src;
          if (script.type) s.type = script.type;
          s.textContent = script.textContent;
          document.body.appendChild(s);
        });

        // 2-4) 주입된 폼 submit 바인딩 — 값 수집만
        const form = contentArea.querySelector('form');
        if (!form) return;

        form.addEventListener('submit', (ev) => {
          ev.preventDefault();

          // 약관 체크(있으면)
          const tosOk = contentArea.querySelector('#tosCheck')?.checked ?? true;
          const privacyOk = contentArea.querySelector('#privacyCheck')?.checked ?? true;
          if (!tosOk || !privacyOk) {
            alert('약관 및 개인정보 수집에 동의해 주세요.');
            return;
          }

          const fd = new FormData(form);
          const get = (name) => fd.get(name)?.toString().trim() || '';

          const collected = {
            userId:   get('userid'),
            password: get('pw'),
            password2:get('pw2'),
            name:     get('name'),
            email:    get('email'),
            address: (() => {
              const addrInputs = contentArea.querySelectorAll('.field-inline.address input');
              return {
                zipcode: addrInputs[0]?.value?.trim() || '',
                base:    addrInputs[1]?.value?.trim() || '',
                detail:  addrInputs[2]?.value?.trim() || '',
              };
            })(),
          };

          // 간단 검증
          if (!collected.userId || !collected.password || !collected.name || !collected.email) {
            alert('필수 항목을 입력해 주세요.');
            return;
          }
          if (collected.password2 && collected.password2 !== collected.password) {
            alert('비밀번호 확인이 일치하지 않습니다.');
            return;
          }

          try { localStorage.setItem('tempUser', JSON.stringify(collected)); } catch {}
          console.log('📦 수집된 회원가입 값:', collected);

          // 이어서 처리할 수 있도록 이벤트 발행(서버 전송/페이지 이동은 별도 코드)
          document.dispatchEvent(new CustomEvent('signup:submit', { detail: collected }));

          alert('입력값을 수집했습니다. (서버 전송/이동은 별도 코드에서 처리하세요)');
        }, { once: true });

      } catch (err) {
        console.error('mrg1.html 불러오기 실패:', err);
        contentArea.innerHTML = `<p style="color:red;">폼을 불러오지 못했습니다.</p>`;
      }
    });
  });
