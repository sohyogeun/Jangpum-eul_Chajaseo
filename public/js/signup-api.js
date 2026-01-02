// public/js/signup-api.js
document.addEventListener('signup:submit', async (e) => {
  const c = e.detail; // mrg.js가 수집한 값

  const payload = {
    userId:   c.userId,
    password: c.password,
    name:     c.name,
    email:    c.email,
    phone:    null,
    question: null,
    answer:   null,
    skinType: null,
    skinNotes: null,
  };

  try {
    const r = await fetch('/api/auth/join', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!r.ok || !data.ok) throw new Error(data?.error || `가입 실패 (HTTP ${r.status})`);

    alert('회원가입 완료! 로그인 페이지로 이동합니다.');
    location.href = '/login.html?joined=1';
  } catch (err) {
    console.error(err);
    alert(err.message || '서버 오류');
  }
});
