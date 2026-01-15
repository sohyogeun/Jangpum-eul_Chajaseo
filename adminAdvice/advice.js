import express from 'express';

// server.js에서 넘겨준 컬렉션들을 인자로 받음
function createAdminAdviceRouter(UserCol, CCCol, mySkinCol, OICol) {
    const router = express.Router();

    // 컬렉션 매핑 객체
    const collectionMap = {
        'MI': UserCol,
        'MB': CCCol,
        'SK': mySkinCol,
        'OI': OICol
    };

    // ✅ 1. 목록 조회 API (프론트엔드 related 함수에서 호출함)
    // 이 부분이 없으면 리스트가 안 뜹니다.
    router.get('/list', async (req, res) => {
        try {
            const { category } = req.query; // GET 요청은 query로 받음
            const targetCollection = collectionMap[category];

            if (!targetCollection) {
                // 카테고리가 없거나 잘못된 경우 빈 배열 반환
                return res.json([]);
            }

            // 최신순(-1)으로 정렬하여 리스트 반환
            const list = await targetCollection.find({}).sort({ createdAt: -1 }).toArray();
            res.json(list);

        } catch (error) {
            console.error("리스트 불러오기 에러:", error);
            res.status(500).json({ message: "리스트 로딩 실패" });
        }
    });

    // ✅ 2. 글 저장 API (POST)
    router.post('/write', async (req, res) => {
    try {
        console.log("🔥 [서버] POST /write 요청 도착!"); // [체크포인트 4]
        console.log("🔥 [서버] 받은 Body 데이터:", req.body); // [체크포인트 5]

        const { category, title, content } = req.body;
        const targetCollection = collectionMap[category];

        console.log(`🔥 [서버] 선택된 카테고리: ${category}`);
        console.log(`🔥 [서버] 컬렉션 연결 여부: ${targetCollection ? "성공" : "실패(undefined)"}`);

        if (!targetCollection) {
            console.log("🔥 [서버] ❌ 컬렉션을 찾을 수 없음");
            return res.status(400).json({ message: "잘못된 카테고리입니다." });
        }

            const result = await targetCollection.insertOne({
                category,
                title,
                content,
                createdAt: new Date() // 생성일 자동 저장
            });

            res.status(200).json({ success: true, message: "저장 완료", id: result.insertedId });

        } catch (error) {
            console.error("글쓰기 에러:", error);
            res.status(500).json({ message: "서버 에러 발생" });
        }
    });

    return router;
}

// ES Module 내보내기 방식
export default createAdminAdviceRouter;