// server.js — Express + MongoDB + ESM
import "dotenv/config"; // ✅ [추가] .env 파일 로드 (로컬 실행 시 필수)
import express from "express";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import helmet from "helmet";

import createAuthRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import createInquiriesRouter from "./advice/member.js";
import adminGuardRouter from "./routes/admin.js";
import createAdminAuthRouter from "./routes/adminAuth.js";
import createAdminAdviceRouter from './adminAdvice/advice.js'; // ✅ Import 이름 확인

const app = express();

// ── 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "heve.sid",
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    },
  })
);

// ── 정적 폴더 경로
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "public");

// ── 환경변수
const PORT = Number(process.env.PORT) || 8080;
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error("❌ MONGO_URL이 주입되지 않았습니다.");
  process.exit(1);
}

try {
  const client = new MongoClient(MONGO_URL); // client 변수 스코프 문제 해결을 위해 안으로 이동
  await client.connect();
  console.log("✅ MongoDB 연결 성공");

  const db = client.db("dboriginal");
  app.locals.db = db;

  // 1. 관리자 인증
  const adminCol = db.collection("adminId");
  app.use("/api/admin", createAdminAuthRouter(adminCol));

  // 2. 일반 인증/상품
  app.use("/api/auth", createAuthRouter(db));
  app.use("/api/products", productsRouter);

  // 3. 문의 (FAQ DB)
  const faqDb = client.db("FAQ");
  app.use("/api/inquiries", createInquiriesRouter(
    faqDb.collection("member"),
    faqDb.collection("inquire"),
    faqDb.collection("ownSkin"),
    faqDb.collection("comparison")
  ));

  // 4. 관리자 어드바이스 (adminAdvice DB)
  const adminAdviceDb = client.db("adminAdvice");
  
  // 🚨 [수정됨] Import한 이름(createAdminAdviceRouter)과 동일하게 사용해야 합니다.
  app.use('/api/admin-advice', createAdminAdviceRouter(
    adminAdviceDb.collection("user"),
    adminAdviceDb.collection("CosmeticComparison"),
    adminAdviceDb.collection("mySkin"),
    adminAdviceDb.collection("OtherInquiries")
  ));

  // 헬스체크
  app.get("/api/health/db", async (_req, res) => {
    try {
      await db.command({ ping: 1 });
      res.json({ ok: true, ping: "pong" });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

const isProd = process.env.NODE_ENV === "production";

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        // 기본값
        "default-src": ["'self'"],

        // ✅ 이미지 허용 (올리브영 + 다음 + 네이버 리소스 대비)
        "img-src": [
          "'self'",
          "data:",
          "https://image.oliveyoung.co.kr",
          "https://t1.daumcdn.net",
          "https://static.nid.naver.com",
        ],

        // 스타일/폰트
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://code.jquery.com",
        ],
        "font-src": ["'self'", "data:", "https://cdn.jsdelivr.net"],

        // ✅ API 호출(내 서버 + 네이버 로그인 통신 대비)
        "connect-src": [
          "'self'",
          "https://nid.naver.com",
          "https://openapi.naver.com",
        ],

        // ✅ 스크립트 허용 (다음 + 네이버 SDK 추가!)
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "data:",
          "https://code.jquery.com",
          "https://cdn.jsdelivr.net",
          "https://www.gstatic.com",
          "https://www.google.com",
          "https://t1.daumcdn.net",
          "https://static.nid.naver.com",
        ],
        "script-src-elem": [
          "'self'",
          "'unsafe-inline'",
          "https://code.jquery.com",
          "https://cdn.jsdelivr.net",
          "https://www.gstatic.com",
          "https://www.google.com",
          "https://t1.daumcdn.net",
          "https://static.nid.naver.com",
        ],

        // ✅ 다음 우편번호 + 네이버 로그인 프레임/팝업 대비
        "frame-src": [
          "'self'",
          "https://postcode.map.daum.net",
          "https://t1.daumcdn.net",
          "https://nid.naver.com",
        ],
      },
    },
  })
);


// ✅ 그 다음에 가드/정적서빙
app.use("/admin", adminGuardRouter);
app.use(express.static(PUBLIC_DIR));


  app.get("/", (_req, res) => res.sendFile(path.join(PUBLIC_DIR, "mainpage.html")));

  app.listen(PORT, () => {
    console.log(`🌐 Server running: http://localhost:${PORT}`);
  });

} catch (err) {
  console.error("❌ MongoDB 연결 실패:", err.message);
  process.exit(1);
}

