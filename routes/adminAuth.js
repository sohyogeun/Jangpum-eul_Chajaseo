// routes/adminAuth.js
import { Router } from "express";
import { pbkdf2Sync, timingSafeEqual } from "crypto";

export default function createAdminAuthRouter(adminCol) {
  const router = Router();

  const ITER = 310000;
  const KEYLEN = 32;
  const DIGEST = "sha256";

  const hashPass = (plain, saltHex) =>
    pbkdf2Sync(plain, Buffer.from(saltHex, "hex"), ITER, KEYLEN, DIGEST).toString("hex");

  // ✅ 관리자 로그인
  router.post("/login", async (req, res) => {
    try {
      const { adminId, adminPass } = req.body || {};
      if (!adminId || !adminPass) return res.status(400).json({ ok: false });

      const doc = await adminCol.findOne({ adminId });
      if (!doc) return res.status(401).json({ ok: false });

      const calc = Buffer.from(hashPass(adminPass, doc.salt), "hex");
      const saved = Buffer.from(doc.passHash, "hex");

      if (calc.length !== saved.length) return res.status(401).json({ ok: false });
      if (!timingSafeEqual(calc, saved)) return res.status(401).json({ ok: false });

      req.session.admin = { adminId: doc.adminId };
      return res.json({ ok: true, adminId: doc.adminId });
    } catch (e) {
  console.error("ADMIN LOGIN ERROR:", e);
  return res.status(500).json({ ok: false, error: e?.message || String(e) });
}

  });

  // ✅ 관리자 로그아웃
  router.post("/logout", (req, res) => {
    req.session.admin = null;
    req.session.save(() => res.json({ ok: true }));
  });

  return router;
}
