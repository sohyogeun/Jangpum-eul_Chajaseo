// head_log.js (vanilla JS only)

function isLoggedIn() {
  return !!localStorage.getItem('currentUser');
}

function applyLoggedInClass() {
  document.body.classList.toggle('logged-in', isLoggedIn());
}

// (옵션) 간단 라우팅 가드
function applyEntryRedirects() {
  const path = location.pathname;
  if (path.endsWith('/login.html') && isLoggedIn()) {
    location.replace('/mainpage.html');
    return true;
  }
  return false;
}

document.addEventListener("DOMContentLoaded", async () => {
  // 1) 페이지 진입 즉시 상태 반영
  applyLoggedInClass();

  // 2) (옵션) 간단 진입 리다이렉트
  if (applyEntryRedirects()) return;

  // 3) login.html 전용: 로그인 폼 처리(성공 시 currentUser 저장)
  try {
    const file = location.pathname.split('/').pop(); // 'login.html'
    if (file === 'login.html') {
      const loginForm =
        document.querySelector('#loginForm') ||
        document.querySelector('form.login-form');

      if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          const fd = new FormData(loginForm);
          const userId = (fd.get('userId') || '').toString().trim();
          const password = (fd.get('password') || '').toString();

          if (!userId || !password) {
            alert('아이디/비밀번호를 입력해주세요.');
            return;
          }

          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, password }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.ok) {
              alert(data?.error || '로그인에 실패했습니다.');
              return;
            }

            // 로그인 성공 → localStorage에 currentUser 저장
            localStorage.setItem('currentUser', data.user?.userId || userId);

            // 즉시 UI 반영 + 메인으로 이동
            applyLoggedInClass();
            location.replace('/mainpage.html');
          } catch (err) {
            console.error('LOGIN REQ ERR:', err);
            alert('로그인 요청 중 오류가 발생했습니다.');
          }
        });
      }
    }
  } catch (e) {
    console.warn('login attach skipped:', e);
  }

  // 4) 헤더 주입 + 버튼 핸들러
  const mount = document.getElementById("site_header");
  if (!mount) return;

  try {
    const res = await fetch("head.html");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const html = await res.text();
    mount.innerHTML = html;

    // 헤더 들어온 뒤 상태 반영(로그인 버튼 토글)
    applyLoggedInClass();

    const loginBtn  = mount.querySelector("#login");
    const mypageBtn = mount.querySelector("#mypage");
    const outBtn    = mount.querySelector("#out");
    const eventBtn  = mount.querySelector("#event");

    if (loginBtn) {
      loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!isLoggedIn()) {
          location.href = "/login.html";
        } else {
          location.href = "/mainpage.html";
        }
      });
    }

    if (mypageBtn) {
      mypageBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!isLoggedIn()) {
          location.href = "/login.html";
          return;
        }
        location.href = "/mypage.html"; // 로그인 시 마이페이지로
      });
    }

    if (outBtn) {
      outBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        applyLoggedInClass(); // 즉시 UI 반영
        location.href = "/login.html";
      });
    }

    if (eventBtn) {
      eventBtn.addEventListener("click", () => {
        location.href = "event.html";
      });
    }

  } catch (err) {
    console.error("헤더 로드 실패:", err);
    mount.innerHTML =
      '<div style="padding:12px;background:#fee;border:1px solid #f99">헤더 로드 실패</div>';
  }
});


// 다른 탭/창에서 로그인/로그아웃이 바뀌어도 동기화
window.addEventListener("storage", (e) => {
  if (e.key === "currentUser") applyLoggedInClass();
});


