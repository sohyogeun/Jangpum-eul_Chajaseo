// public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const userId = (fd.get('userid') || '').toString().trim();
    const password = (fd.get('password') || '').toString().trim();
    if (!userId || !password) return alert('아이디/비밀번호를 입력해 주세요.');

    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ userId, password }),
      });
      const data = await r.json().catch(()=>({}));
      if (!r.ok || !data.ok) return alert(data?.error || '로그인 실패');

      localStorage.setItem('currentUser', JSON.stringify(data.user));
      location.href = '/mainpage.html';
    } catch (err) {
      console.error(err);
      alert('네트워크/서버 오류');
    }
  }, { once: true });
});

