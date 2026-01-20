// public/js/login.js
await fetch("/api/auth/out", { credentials: "include" });
localStorage.removeItem("currentUser");
location.href = "/login.html";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login-form');

  // ✅ 로그아웃 버튼 처리 (submit 바깥!)
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/out', { credentials: 'include' });
        localStorage.removeItem('currentUser');
        location.href = '/login.html';
      } catch (e) {
        console.error(e);
        alert('로그아웃 실패');
      }
    });
  }

  if (!form) return;

  // ✅ 로그인 처리
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const userId = (fd.get('userid') || '').toString().trim();
    const password = (fd.get('password') || '').toString().trim();
    if (!userId || !password) return alert('아이디/비밀번호를 입력해 주세요.');

    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ (권장) 세션 기반이면 같이 넣는 게 안정적
        body: JSON.stringify({ userId, password }),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) return alert(data?.error || '로그인 실패');

      localStorage.setItem('currentUser', JSON.stringify(data.user));
      location.href = '/mainpage.html';
    } catch (err) {
      console.error(err);
      alert('네트워크/서버 오류');
    }
  });
});
