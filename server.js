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
import createAdminAdviceRouter from './adminAdvice/advice.js'; 
import createUserSkinRouter from "./routes/userSkin.js";

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

// ✅ 여기로 옮겨야 함!
app.use("/api/user-skin", createUserSkinRouter(db.collection("users")));
  
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
        "default-src": ["'self'"],

        "img-src": [
          "'self'",
          "data:",
          "https://image.oliveyoung.co.kr",
          "https://t1.daumcdn.net",
          "https://static.nid.naver.com",
        ],

        // ✅ style-src 하나로 합치기
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://code.jquery.com",
          "https://www.gstatic.com",
          "https://fonts.googleapis.com",
        ],

        // ✅ font-src 하나로 합치기
        "font-src": [
          "'self'",
          "data:",
          "https://cdn.jsdelivr.net",
          "https://fonts.gstatic.com",
        ],

        // ✅ fetch('/api/...')는 'self'면 되긴 하는데,
        // 혹시 프론트가 다른 포트/도메인에서 호출하면 그걸 추가해야 함
        "connect-src": [
          "'self'",
          "https://nid.naver.com",
          "https://openapi.naver.com",
          "https://cdn.jsdelivr.net",
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
        "frame-src": [
          "'self'",
          "https://postcode.map.daum.net" 
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

