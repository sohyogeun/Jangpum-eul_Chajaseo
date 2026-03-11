// public/js/login.js
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-form");
  const logoutBtn = document.getElementById("logoutBtn");

  // ✅ (선택) 회원가입 후 login.html?joined=1 로 들어올 때만 1번 정리
  // 필요 없으면 이 블록 통째로 지워도 됨
  const params = new URLSearchParams(location.search);
  if (params.get("joined") === "1") {
    (async () => {
      try {
        await fetch("/api/auth/out", { credentials: "include" });
      } catch (e) {
        console.warn("logout(on joined) ignored:", e);
      }
      localStorage.removeItem("currentUser");

      // ✅ joined 파라미터 제거(새로고침해도 반복 실행/무한루프 방지)
      history.replaceState({}, "", "/login.html");
    })();
  }

  // ✅ 로그아웃 버튼 클릭
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch("/api/auth/out", { credentials: "include" });
        localStorage.removeItem("currentUser");
        location.href = "/login.html";
      } catch (e) {
        console.error(e);
        alert("로그아웃 실패");
      }
    });
  }

  if (!form) return;

const LOGIN_FAIL_KEY = "loginFailInfo";

// 실패 정보 읽기
function getLoginFailInfo() {
  const raw = localStorage.getItem(LOGIN_FAIL_KEY);
  if (!raw) return { count: 0, lockUntil: 0 };

  try {
    return JSON.parse(raw);
  } catch {
    return { count: 0, lockUntil: 0 };
  }
}

// 실패 정보 저장
function setLoginFailInfo(info) {
  localStorage.setItem(LOGIN_FAIL_KEY, JSON.stringify(info));
}

// 실패 정보 초기화
function resetLoginFailInfo() {
  localStorage.removeItem(LOGIN_FAIL_KEY);
}

// 남은 잠금 시간(초)
function getRemainSeconds() {
  const { lockUntil } = getLoginFailInfo();
  const now = Date.now();
  return lockUntil > now ? Math.ceil((lockUntil - now) / 1000) : 0;
}

// ✅ 로그인 처리
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 잠금 상태 체크
  const remain = getRemainSeconds();
  if (remain > 0) {
    return alert(`로그인 5회 실패로 인해 ${remain}초 후 다시 시도할 수 있습니다.`);
  }

  const fd = new FormData(form);
  const userId = String(fd.get("userid") || "").trim();
  const password = String(fd.get("password") || "").trim();

  if (!userId || !password) {
    return alert("아이디/비밀번호를 입력해 주세요.");
  }

  try {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId, password }),
    });

    const data = await r.json().catch(() => ({}));

    // 로그인 실패
    if (!r.ok || !data.ok) {
      const failInfo = getLoginFailInfo();
      failInfo.count += 1;

      if (failInfo.count >= 5) {
        failInfo.count = 0;
        failInfo.lockUntil = Date.now() + 30 * 1000; // 30초 잠금
        setLoginFailInfo(failInfo);
        return alert("로그인 5번 실패했습니다. 30초 후 다시 시도해 주세요.");
      }

      setLoginFailInfo(failInfo);
      return alert(
        data?.error || `로그인 실패 (${failInfo.count}/5)`
      );
    }

    // 로그인 성공
    resetLoginFailInfo();

    localStorage.setItem("currentUser", JSON.stringify(data.user));
    location.href = "/mainpage.html";
  } catch (err) {
    console.error(err);
    alert("네트워크/서버 오류");
  }
});
});
