import express from "express";

export default function createUserSkinRouter(usersCol) {
  const router = express.Router();

  function requireLogin(req, res, next) {
    const user = req.session?.user || req.session?.currentUser || req.session?.member;
    if (!user) return res.status(401).json({ message: "login required" });
    req.user = user;
    next();
  }

  function getUserId(req) {
    return req.user.userId || req.user.id || req.user.email || req.user._id;
  }

  // 저장: users 문서에 skinType + (선택) skinResult 저장
  router.put("/me", requireLogin, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ message: "User ID missing" });

    const { winner, ts, scores } = req.body || {};
    if (!winner || !scores) {
      return res.status(400).json({ message: "winner/scores required" });
    }

    const now = new Date();

    try {
      const result = await usersCol.updateOne(
        { userId },
        {
          $set: {
            skinType: winner,              // ✅ 여기!
            skinResultDate: now,           // ✅ 날짜도 같이 저장 추천
            skinResult: {                  // ✅ 상세 결과(원하면)
              winner,
              ts: ts ?? null,
              scores,
              updatedAt: now,
            },
            updatedAt: now,
          },
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "user not found" });
      }

      res.json({ ok: true });
    } catch (error) {
      console.error("💥 [Error] DB 저장 중 에러:", error);
      res.status(500).json({ message: "DB Error" });
    }
  });

  // 조회: users에서 skinResult 꺼내기
  router.get("/me", requireLogin, async (req, res) => {
    const userId = getUserId(req);

    const u = await usersCol.findOne(
      { userId },
      { projection: { skinType: 1, skinResultDate: 1, skinResult: 1 } }
    );

    if (!u?.skinResult) return res.status(204).end();

    res.json({
      skinType: u.skinType,
      skinResultDate: u.skinResultDate,
      winner: u.skinResult.winner,
      ts: u.skinResult.ts,
      scores: u.skinResult.scores,
    });
  });

  // 삭제: users에서 skin 관련 필드 제거
  router.delete("/me", requireLogin, async (req, res) => {
    const userId = getUserId(req);

    await usersCol.updateOne(
      { userId },
      { $unset: { skinType: "", skinResultDate: "", skinResult: "" } }
    );

    res.json({ ok: true });
  });

  return router;
}