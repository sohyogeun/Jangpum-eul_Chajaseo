// advice/replyAdmin.js
import { Router } from "express";
import { ObjectId } from "mongodb";

export default function createReplyAdminRouter(replyAdminCol) {
  const router = Router();

  // =======================================================
  // ✅ 1. 관리자 게시판 등록 (POST /api/reply-admin)
  // =======================================================
  // server.js에서 '/api/reply-admin' 경로로 연결할 것이므로 여기서는 '/' 만 씁니다.
  router.post("/", async (req, res) => {
    try {
      const { title, isNotice, name, email, password, content } = req.body;

      // 간단한 유효성 검사
      if (!title || !name || !password || !content) {
        return res.status(400).json({ success: false, message: "필수값이 누락되었습니다." });
      }

      // DB에 들어갈 문서 객체 생성
      const doc = {
        title: title.trim(),
        isNotice: !!isNotice, // boolean 타입 보장
        name: name.trim(),
        email: email ? email.trim() : null,
        password,
        content: content.trim(),
        createdAt: new Date(),
      };

      // 전달받은 replyAdminCol 컬렉션에 데이터 저장
      const result = await replyAdminCol.insertOne(doc);

      if (result.acknowledged) {
        return res.status(201).json({ success: true, message: "성공적으로 등록되었습니다." });
      } else {
        throw new Error("데이터베이스 삽입에 실패했습니다.");
      }
    } catch (e) {
      console.error("관리자 게시글 저장 오류:", e);
      return res.status(500).json({ success: false, message: "서버 오류" });
    }
  });

  // =======================================================
  // ✅ 2. 관리자 게시글 상세 조회 (GET /api/reply-admin/:id)
  // (나중에 관리자용 상세보기가 필요할 때를 대비해 분리해 둡니다)
  // =======================================================
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ ok: false, message: "id 형식이 올바르지 않음" });
      }

      const doc = await replyAdminCol.findOne({ _id: new ObjectId(id) });
      
      if (!doc) {
        return res.status(404).json({ ok: false, message: "데이터 없음" });
      }

      // 여기서 mapDoc처럼 _id를 id로 바꿔서 내려줍니다.
      const mappedDoc = {
        id: String(doc._id),
        title: doc.title,
        content: doc.content,
        isNotice: doc.isNotice,
        name: doc.name,
        email: doc.email,
        createdAt: doc.createdAt
      };

      return res.json({ ok: true, data: mappedDoc }); 
    } catch (e) {
      console.error("상세 조회 오류:", e);
      return res.status(500).json({ ok: false, message: "서버 오류" });
    }
  });

  return router;
}