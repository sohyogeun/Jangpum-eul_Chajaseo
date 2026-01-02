document.addEventListener('click', (e) => {
  const btn = e.target.closest('.skin-btn');
  if (!btn) return;

  e.preventDefault(); // 버튼이 form 안에 있으면 submit 막기

  const winner = btn.dataset.skin || btn.value || btn.textContent.trim();
  localStorage.setItem('heve_skin_survey_result', JSON.stringify({ winner }));

  window.location.href = 'FYS.html';
});
