// routes/admin.js
import { Router } from "express";
import path from "path";

const router = Router();

router.use((req, res, next) => {
  if (req.method !== "GET") return next();

  // ✅ 관리자 로그인(세션) 상태면 통과
  if (req.session?.admin?.adminId) return next();

  const base = path.posix.basename(req.path).toLowerCase();

  // ✅ /admin/manager*.html 직접 접근 차단 (로그인 페이지는 예외)
  const isManagerHtml =
    base.startsWith("manager") &&
    base.endsWith(".html") &&
    base !== "managerlog.html";

  const isAdminRoot = req.path === "/" || req.path === "";

  if (isManagerHtml || isAdminRoot) {
 
    return res.redirect(302, `${req.baseUrl}/managerlog.html`);

  }

  next();
});

export default router;
