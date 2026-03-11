// advice/replyAdmin.js
import { Router } from "express";
import { ObjectId } from "mongodb";

// 🚨 [중요] server.js에서 이 라우터를 부를 때 inquiriesCol(유저 문의글 DB)도 같이 넘겨받아야 합니다!
export default function createReplyAdminRouter(replyAdminCol, inquiriesCol) {
  const router = Router();

  router.post("/", async (req, res) => {
    try {
      // 💡 1. 프론트엔드에서 보낸 원본 글 ID(inquiryId)를 같이 받습니다.
      const { inquiryId, title, isNotice, name, email, content } = req.body;

      if (!title || !name || !content) {
        return res.status(400).json({ success: false, message: "필수값이 누락되었습니다." });
      }

      // 2. 관리자 게시판(replyAdminCol)에 들어갈 문서 객체 생성
      const doc = {
        inquiryId: inquiryId ? new ObjectId(inquiryId) : null, // 연결고리 저장
        title: title.trim(),
        isNotice: !!isNotice,
        name: name.trim(),
        email: email ? email.trim() : null,
        content: content.trim(),
        createdAt: new Date(),
      };

      // 관리자 DB에 삽입
      const result = await replyAdminCol.insertOne(doc);

      // 🚨 3. 유저 문의글(inquiriesCol)에 답장 데이터 쏙 밀어넣기!
      if (inquiryId && inquiriesCol) {
        
        // 정규식을 이용해 썸머노트 HTML 태그를 모두 지우고 순수 텍스트만 추출합니다.
        const plainText = content.replace(/<[^>]*>?/gm, '');
        // 8글자까지만 자르고 '...' 붙이기 (목록용 요약본)
        const shortSummary = plainText.length > 8 ? plainText.substring(0, 8) + '...' : plainText;

        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // 원본 글을 찾아서 replies 배열에 답장을 추가합니다.
        await inquiriesCol.updateOne(
          { _id: new ObjectId(inquiryId) },
          { 
            $push: { 
              replies: {
                from: name.trim(),        // 작성자 (관리자)
                at: formattedDate,        // 작성 시간
                summary: shortSummary,    // ✅ 8글자 요약본 (목록용)
                content: content.trim()   // ✅ 전체 HTML 원본 (상세보기용)
              }
            },
            $set: { status: 'ANSWERED' }  // 💡 문의글 상태를 '답변완료'로 변경!
          }
        );
      }

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

  // ... (기존에 있던 GET 요청 코드는 여기에 그대로 두시면 됩니다) ...

  return router;
}