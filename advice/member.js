// advice/member.js
import { Router } from "express";
import { ObjectId } from "mongodb";

export default function createInquiriesRouter(
  memberCol,
  inquireCol,
  ownSkinCol,
  comparisonCol
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
    id: String(doc._id), // ✅ 중복 방지: email 대신 _id 사용

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

  // ✅ (선택) 특정 컬렉션이 여러 category를 같이 담는다면 여기서 필터링
  // 현재 구조에서는 inquireCol(기타문의)에만 category 필터 걸어도 충분
  const buildFilter = (targetCol, category) => {
    if (!targetCol) return {};
    return targetCol === inquireCol ? { category } : {};
  };

  // ✅ ALL(4개 컬렉션) 합치기 공통 함수
  const fetchMergedSorted = async (take) => {
    const tasks = [
      memberCol
        ? memberCol.find({}).sort({ createdAt: -1 }).limit(take).toArray()
        : Promise.resolve([]),

      inquireCol
        ? inquireCol.find({}).sort({ createdAt: -1 }).limit(take).toArray()
        : Promise.resolve([]),

      ownSkinCol
        ? ownSkinCol.find({}).sort({ createdAt: -1 }).limit(take).toArray()
        : Promise.resolve([]),

      comparisonCol
        ? comparisonCol.find({}).sort({ createdAt: -1 }).limit(take).toArray()
        : Promise.resolve([]),
    ];

    const [m, i, o, c] = await Promise.all(tasks);

    return [...m, ...i, ...o, ...c].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  // =========================
  // ✅ 페이지네이션 목록
  // =========================
  // GET /api/inquiries/list?page=1&limit=5
  // GET /api/inquiries/list?category=기타문의&page=2&limit=5
  // GET /api/inquiries/list?category=회원/계정&page=3&limit=5
  // GET /api/inquiries/list?category=나의 피부 문의&page=1&limit=5
  // GET /api/inquiries/list?category=화장품 비교 문의&page=1&limit=5
  router.get("/list", async (req, res) => {
    try {
      const page = parsePage(req);
      const limit = parseLimit(req);
      const skip = (page - 1) * limit;

      const category = req.query.category; // undefined면 ALL

      // ✅ category가 있으면 해당 컬렉션만 페이지네이션
      if (category) {
        const targetCol = resolveTargetCol(category);
        if (!targetCol) {
          return res.status(400).json({ ok: false, message: "category가 올바르지 않음" });
        }

        const filter = buildFilter(targetCol, category);

        const [list, total] = await Promise.all([
          targetCol
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray(),
          targetCol.countDocuments(filter),
        ]);

        const totalPages = Math.max(Math.ceil(total / limit), 1);

        return res.json({
          ok: true,
          list: list.map(mapDoc),
          total,
          totalPages,
          page,
          limit,
        });
      }

      // ✅ category 없으면(ALL) 4개 컬렉션 합쳐서 페이지네이션
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
        ok: true,
        list: pageList,
        total,
        totalPages,
        page,
        limit,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, list: [], total: 0, totalPages: 1 });
    }
  });

  // =========================
  // ✅ 최신 문의
  // =========================
  // GET /api/inquiries/latest?limit=5
  // GET /api/inquiries/latest?category=기타문의&limit=5
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

        const list = await targetCol
          .find(filter)
          .sort({ createdAt: -1 })
          .limit(limit)
          .toArray();

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
  // POST /api/inquiries
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
        category,
        title: title.trim(),
        content: content.trim(),
        email,
        status: "NEW",
        createdAt: new Date(),
      };

      const result = await targetCol.insertOne(doc);

      return res.status(201).json({
        ok: true,
        insertedId: result.insertedId,
        savedTo: targetCol.collectionName,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "서버 오류" });
    }
  });
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

      return res.json({ ok: true, data: mapDoc(doc) }); // ✅ content 포함
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, message: "서버 오류" });
    }
  });

  return router;
}
