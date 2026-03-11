// advice/member.js
import { Router } from "express";
import { ObjectId } from "mongodb";

export default function createInquiriesRouter(
  memberCol,
  inquireCol,
  ownSkinCol,
  comparisonCol,
  replyAdminCol // ✅ 관리자 답장 컬렉션 꼭 받아야 합니다!
) {
  const router = Router();

  // =========================
  // ✅ 공통 유틸(중복 제거)
  // =========================
  const clampInt = (value, def, min, max) => {
    const n = parseInt(value ?? String(def), 10);
    const safe = Number.isFinite(n) ? n : def;
    return Math.min(Math.max(safe, min), max);
  };

  const parseLimit = (req) => clampInt(req.query.limit, 5, 1, 20);
  const parsePage = (req) => clampInt(req.query.page, 1, 1, 1_000_000);

  // =========================
  // ✅ category → 컬렉션 매핑
  // =========================
  const resolveTargetCol = (category) => {
    if (!category) return null;

    return category === "회원/계정" ? memberCol
      : category === "화장품 비교 문의" ? comparisonCol
      : category === "나의 피부 문의" ? ownSkinCol
      : category === "기타문의" ? inquireCol
      : null;
  };

  // =========================
  // ✅ 문서 내려줄 때 형태 통일
  // =========================
  const mapDoc = (doc) => ({
    id: String(doc._id),

    category: doc.category,
    title: doc.title,
    content: doc.content,
    createdAt: doc.createdAt,
    status: doc.status,

    userId: doc.userId ?? doc.email ?? null,
    writer: doc.writer ?? doc.email ?? null,
    hit: doc.hit ?? 0,
    email: doc.email ?? null,
  });

  const buildFilter = (targetCol, category) => {
    if (!targetCol) return {};
    return targetCol === inquireCol ? { category } : {};
  };

  const fetchMergedSorted = async (take) => {
    const tasks = [
      memberCol ? memberCol.find({}).sort({ createdAt: -1 }).limit(take).toArray() : Promise.resolve([]),
      inquireCol ? inquireCol.find({}).sort({ createdAt: -1 }).limit(take).toArray() : Promise.resolve([]),
      ownSkinCol ? ownSkinCol.find({}).sort({ createdAt: -1 }).limit(take).toArray() : Promise.resolve([]),
      comparisonCol ? comparisonCol.find({}).sort({ createdAt: -1 }).limit(take).toArray() : Promise.resolve([])
    ];

    const [m, i, o, c] = await Promise.all(tasks);

    return [...m, ...i, ...o, ...c].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  // =========================
  // ✅ 페이지네이션 목록
  // =========================
  router.get("/list", async (req, res) => {
    try {
      const page = parsePage(req);
      const limit = parseLimit(req);
      const skip = (page - 1) * limit;

      const category = req.query.category; 

      if (category) {
        const targetCol = resolveTargetCol(category);
        if (!targetCol) {
          return res.status(400).json({ ok: false, message: "category가 올바르지 않음" });
        }

        const filter = buildFilter(targetCol, category);

        const [list, total] = await Promise.all([
          targetCol.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
          targetCol.countDocuments(filter),
        ]);

        const totalPages = Math.max(Math.ceil(total / limit), 1);

        return res.json({
          ok: true, list: list.map(mapDoc), total, totalPages, page, limit,
        });
      }

      const [mTotal, iTotal, oTotal, cTotal] = await Promise.all([
        memberCol?.countDocuments({}) ?? Promise.resolve(0),
        inquireCol?.countDocuments({}) ?? Promise.resolve(0),
        ownSkinCol?.countDocuments({}) ?? Promise.resolve(0),
        comparisonCol?.countDocuments({}) ?? Promise.resolve(0),
      ]);

      const total = mTotal + iTotal + oTotal + cTotal;
      const totalPages = Math.max(Math.ceil(total / limit), 1);

      const take = skip + limit;
      const mergedSorted = await fetchMergedSorted(take);
      const pageList = mergedSorted.slice(skip, skip + limit).map(mapDoc);

      return res.json({
        ok: true, list: pageList, total, totalPages, page, limit,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, list: [], total: 0, totalPages: 1 });
    }
  });

  // =========================
  // ✅ 최신 문의
  // =========================
  router.get("/latest", async (req, res) => {
    try {
      const limit = parseLimit(req);
      const category = req.query.category;

      if (category) {
        const targetCol = resolveTargetCol(category);
        if (!targetCol) {
          return res.status(400).json({ message: "category가 올바르지 않음" });
        }

        const filter = buildFilter(targetCol, category);
        const list = await targetCol.find(filter).sort({ createdAt: -1 }).limit(limit).toArray();

        return res.json({ ok: true, list: list.map(mapDoc) });
      }

      const mergedSorted = await fetchMergedSorted(limit);
      return res.json({ ok: true, list: mergedSorted.slice(0, limit).map(mapDoc) });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "서버 오류" });
    }
  });

  // =========================
  // ✅ 저장
  // =========================
  router.post("/", async (req, res) => {
    try {
      const { category, title, content } = req.body;

      if (!category || !title || !content) {
        return res.status(400).json({ message: "필수값 누락" });
      }

      const targetCol = resolveTargetCol(category);
      if (!targetCol) {
        return res.status(400).json({ message: "문의분류(category)가 올바르지 않음" });
      }

      const email = req.body.email || req.session?.user?.email || null;
      if (!email) return res.status(401).json({ ok: false, message: "로그인이 필요합니다." });

      const doc = {
        category, title: title.trim(), content: content.trim(), email, status: "NEW", createdAt: new Date(),
      };

      const result = await targetCol.insertOne(doc);

      return res.status(201).json({
        ok: true, insertedId: result.insertedId, savedTo: targetCol.collectionName,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "서버 오류" });
    }
  });

  // --------------------------------------------------------
  // ✅ [최종 완성본] 내 문의 내역 + 관리자 답장 매칭 API
  // 🚨 순서 주의: 반드시 /:id 라우터보다 위에 있어야 합니다!
  // --------------------------------------------------------
  router.get("/my-inquiries", async (req, res) => {
  try {
    const email = req.session?.user?.email;
    if (!email) {
      return res.status(401).json({ ok: false, message: "로그인이 필요합니다." });
    }

    // 1) 내 문의들(4개 컬렉션) 가져오기
    const tasks = [
      memberCol ? memberCol.find({ email }).toArray() : Promise.resolve([]),
      inquireCol ? inquireCol.find({ email }).toArray() : Promise.resolve([]),
      ownSkinCol ? ownSkinCol.find({ email }).toArray() : Promise.resolve([]),
      comparisonCol ? comparisonCol.find({ email }).toArray() : Promise.resolve([]),
    ];
    const [m, i, o, c] = await Promise.all(tasks);

    const myAllInquiries = [...m, ...i, ...o, ...c].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // 2) 내 답장들 가져오기 (replyAdminCol에는 inquiryId가 있음)
    let adminReplies = [];
    if (replyAdminCol) {
      adminReplies = await replyAdminCol
        .find({ email })
        .sort({ createdAt: -1 })
        .toArray();
    }

    // 3) inquiryId 기준으로 replies를 묶기(Map)
    const repliesByInquiryId = new Map(); // key: String(inquiryId) -> replies[]
    for (const r of adminReplies) {
      const key = r.inquiryId ? String(r.inquiryId) : null;
      if (!key) continue;

      const plainText = (r.content || "").replace(/<[^>]*>?/gm, "");
      const now = new Date(r.createdAt);
      const replyDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const replyObj = {
        at: replyDate,
        from: r.name || "관리자",
        summary: plainText.length > 30 ? plainText.substring(0, 30) + "..." : plainText,
        content: r.content || "", // ✅ 핵심: 상세용 전체 HTML 포함
      };

      const arr = repliesByInquiryId.get(key) || [];
      arr.push(replyObj);
      repliesByInquiryId.set(key, arr);
    }

    // 4) 내 문의에 replies 붙이기 (id로 매칭)
    const list = myAllInquiries.map((doc) => {
      const mapped = mapDoc(doc);

      // ✅ 혹시 원본 문서에 doc.replies가 이미 있으면 그것도 살릴 수 있음(선택)
      // 여기서는 replyAdminCol 기준 매칭을 우선으로 사용
      const matchedReplies = repliesByInquiryId.get(mapped.id) || [];

      mapped.replies = matchedReplies;
      mapped.status = matchedReplies.length ? "ANSWERED" : (mapped.status || "NEW");

      return mapped;
    });

    return res.json({ ok: true, list });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "서버 오류" });
  }
});

  // =========================
  // ✅ 상세조회 (무조건 가장 아래에 있어야 합니다!)
  // =========================
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { category } = req.query;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ ok: false, message: "id 형식이 올바르지 않음" });
      }

      const targetCol = resolveTargetCol(category);
      if (!targetCol) {
        return res.status(400).json({ ok: false, message: "category가 올바르지 않음" });
      }

      const doc = await targetCol.findOne({ _id: new ObjectId(id) });
      if (!doc) {
        return res.status(404).json({ ok: false, message: "데이터 없음" });
      }

      return res.json({ ok: true, data: mapDoc(doc) }); 
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, message: "서버 오류" });
    }
  });

  return router;
}