// server.js — Express + MongoDB + ESM
import express from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import createAuthRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import session from 'express-session';


const app = express();

// ── 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(helmet(/* CSP 옵션 */));

// ── 정적 폴더
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

// ── 환경변수
const PORT = Number(process.env.PORT) || 8080;
const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error('❌ MONGO_URL이 주입되지 않았습니다. dotenvx 실행 스크립트를 확인하세요.');
  process.exit(1);
}

// ── DB 연결 (auth 등에서 사용) — 여기서는 dboriginal을 쓰고 있음
let client;
try {
  client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log('✅ MongoDB 연결 성공');

  // 🔸 auth 라우터에서 사용할 DB (필요 DB명으로 수정 가능)
  const db = client.db('dboriginal');
  app.locals.db = db;

  // ✅ 회원 관련 라우터
  app.use('/api/auth', createAuthRouter(db));

  // ✅ 헬스체크
  app.get('/api/health/db', async (_req, res) => {
    try {
      await app.locals.db.command({ ping: 1 });
      const users = app.locals.db.collection('users');
      const count = await users.estimatedDocumentCount();
      res.json({ ok: true, ping: 'pong', usersCount: count });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // ✅ 🔥 여기! productsRouter 장착 (정적 서빙보다 “위”여도/아래여도 되지만, SPA 캐치올보다 위)
  //    routes/products.js 안에서 oliveyoung_db/products에 직접 연결하는 구조라면 이대로 OK
  app.use('/api/products', productsRouter);

  // ── 루트 페이지
  app.get('/', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'mainpage.html')));

  // ❌ 아래 두 개는 “중복/충돌”이라 제거했습니다:
  // - app.get('/api/products/all', ...)  (두 번 선언되어 있었음)
  // - app.listen(...)                     (두 번 선언되어 있었음)
  // - __filename/__dirname 재선언

  // ── 서버 시작 (딱 1번만!)
  app.listen(PORT, () => {
    console.log(`🌐 Server running: http://localhost:${PORT}`);
  });

} catch (err) {
  console.error('❌ MongoDB 연결 실패:', err.message);
  process.exit(1);
}

// ── 종료 처리
async function closeAndExit(code = 0) {
  try { if (client) await client.close(); }
  finally { process.exit(code); }
}

app.use(session({
  name: 'heve.sid',
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // 로컬 http면 false여야 쿠키 들어감
  },
}));
