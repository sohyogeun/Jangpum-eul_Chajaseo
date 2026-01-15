// routes/auth.js
import express from 'express';
import crypto from 'crypto';
import axios from 'axios';

// ─── 유틸: 비밀번호 해시/검증 ───────────────────────────────────────────────
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 100_000, keylen = 32, digest = 'sha256';
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
  return { salt, iterations, keylen, digest, hash };
}
function verifyPassword(plain, stored) {
  const { salt, iterations, keylen, digest, hash } = stored;
  const test = crypto.pbkdf2Sync(plain, salt, iterations, keylen, digest).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(test, 'hex'), Buffer.from(hash, 'hex'));
}

// ─── 간단 검증 ──────────────────────────────────────────────────────────────
const isValidUserId = v => /^[a-zA-Z0-9_]{4,20}$/.test(v || '');
const isValidEmail  = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
const isStrongPw    = v => typeof v === 'string' && v.length >= 8;

// ─── 라우터 본체 ────────────────────────────────────────────────────────────
export default function createAuthRouter(db) {
  const router = express.Router();
  const users  = db.collection('users');

  // 유니크 인덱스(여러 번 호출돼도 안전)
  users.createIndexes([
    { key: { userId: 1 }, unique: true, name: 'uniq_userId' },
    { key: { email: 1 }, unique: true, name: 'uniq_email' },
  ]).catch(() => {});

  // 1) 회원가입: POST /api/auth/join
  router.post('/join', async (req, res) => {
    try {
      const { userId, password, name, email, phone, question, answer, skinType, skinNotes } = req.body;

      // 필수값
      if (!userId || !password || !name || !email) {
        return res.status(400).json({ ok:false, error: '필수 항목 누락' });
      }
      if (!isValidUserId(userId)) return res.status(400).json({ ok:false, error: 'userId 형식(영문/숫자/_) 4~20자' });
      if (!isValidEmail(email))   return res.status(400).json({ ok:false, error: 'email 형식 오류' });
      if (!isStrongPw(password))  return res.status(400).json({ ok:false, error: '비밀번호는 8자 이상' });

      // 중복 체크
      const dup = await users.findOne({ $or: [{ userId }, { email }] });
      if (dup) return res.status(409).json({ ok:false, error: '이미 사용 중인 userId 또는 email' });

      const now = new Date();
      const pw  = hashPassword(password);

      const doc = {
        userId, name, email,
        phone: phone ?? null,
        password: pw,                 // {hash, salt, iterations, keylen, digest}
        question: question ?? null,
        answer:   answer   ?? null,
        skinType: skinType ?? null,   // 'oily' | 'dry' | 'combo' | 'normal'
        skinResultDate: skinType ? now.toISOString() : null,
        skinNotes: skinNotes ?? null,
        createdAt: now, updatedAt: now,
      };

      await users.insertOne(doc);

      // 민감정보 제외한 응답
      res.json({
        ok: true,
        user: {
          userId, name, email,
          phone: doc.phone, skinType: doc.skinType,
          createdAt: doc.createdAt
        }
      });
    } catch (err) {
      console.error('JOIN ERR:', err);
      res.status(500).json({ ok:false, error: '서버 오류' });
    }
  });

  // 2) 로그인: POST /api/auth/login
  // 2) 로그인: POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return res.status(400).json({ ok:false, error: 'userId/password 필요' });
    }

    const u = await users.findOne({ userId });
    if (!u || !u.password || !verifyPassword(password, u.password)) {
      return res.status(401).json({ ok:false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    // ✅✅✅ 이 2줄 추가 (세션에 저장해야 쿠키가 발급됨)
    req.session.user = { userId: u.userId, name: u.name, email: u.email };
    await new Promise((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));

    res.json({
      ok: true,
      user: { userId: u.userId, name: u.name, email: u.email, skinType: u.skinType }
    });
  } catch (err) {
    console.error('LOGIN ERR:', err);
    res.status(500).json({ ok:false, error: '서버 오류' });
  }
});


// [★ 2. 여기에 네이버 로그인 관련 라우트 2개 추가 ★]

  // 3) 네이버 로그인 시작: GET /api/auth/naver
  // (프론트엔드에서 <a href="/api/auth/naver">네이버로 로그인</a> 버튼 클릭 시)
  router.get('/naver', (req, res) => {
    const naverClientId = process.env.NAVER_CLIENT_ID;

    console.log('읽어온 Naver Client ID:', naverClientId);
    // server.js가 실행되는 주소 (예: http://localhost:8080)
    const serverUrl = process.env.SERVER_URL || 'http://localhost:8080';
    
    // 네이버에 등록한 'Callback URL'과 정확히 일치해야 합니다.
    const redirectURI = encodeURIComponent(`${serverUrl}/api/auth/naver/callback`);
    
    // CSRF 공격 방지용 state (세션을 쓴다면 세션에 저장/비교 권장)
    const state = crypto.randomBytes(16).toString('hex'); 
    
    const api_url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${redirectURI}&state=${state}`;
    
    res.redirect(api_url); // 네이버 로그인 페이지로 리다이렉트
  });

  // 4) 네이버 로그인 콜백: GET /api/auth/naver/callback
  // (네이버 로그인이 성공하면, 네이버가 이 주소로 사용자를 리다이렉트시킴)
  router.get('/naver/callback', async (req, res) => {
  const naverClientId = process.env.NAVER_CLIENT_ID;
  const naverClientSecret = process.env.NAVER_CLIENT_SECRET;
  const { code, state } = req.query;

  const token_api_url =
    `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${naverClientId}&client_secret=${naverClientSecret}&code=${code}&state=${state}`;
  const profile_api_url = 'https://openapi.naver.com/v1/nid/me';

  try {
    // 1) 토큰 받기
    const tokenRes = await axios.get(token_api_url);
    const accessToken = tokenRes.data.access_token;

    if (!accessToken) {
      throw new Error('네이버 토큰 발급 실패');
    }

    // ❌❌❌ 여기 있던 세션/redirect는 user가 없어서 터짐 + 너무 일찍 redirect됨
    // req.session.user = { userId: user.userId, name: user.name, email: user.email };
    // await new Promise((resolve, reject) =>
    //   req.session.save(err => (err ? reject(err) : resolve()))
    // );
    // const clientUserId = user.userId;
    // res.redirect(`/login-handler.html?userId=${clientUserId}`);

    // 2) 프로필 받기
    const profileRes = await axios.get(profile_api_url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const naverProfile = profileRes.data.response;
    if (!naverProfile || !naverProfile.id) {
      throw new Error('네이버 프로필 조회 실패');
    }

    // 3) DB에서 유저 찾기/생성
    let user = await users.findOne({ naverId: naverProfile.id });

    if (!user) {
      const existingEmailUser = await users.findOne({ email: naverProfile.email });

      if (existingEmailUser) {
        await users.updateOne(
          { _id: existingEmailUser._id },
          { $set: { naverId: naverProfile.id, updatedAt: new Date() } }
        );
        user = await users.findOne({ _id: existingEmailUser._id });
      } else {
        const now = new Date();
        const newUserDoc = {
          userId: `naver_${naverProfile.id.substring(0, 10)}`,
          name: naverProfile.name || '네이버회원',
          email: naverProfile.email,
          phone: naverProfile.mobile || null,
          naverId: naverProfile.id,
          password: null,
          skinType: null,
          createdAt: now,
          updatedAt: now,
        };
        await users.insertOne(newUserDoc);

        // ✅ insertOne 후 DB에서 다시 읽어오는 게 가장 안전
        user = await users.findOne({ naverId: naverProfile.id });
      }
    }

    // ✅✅✅ 4) 여기서 user는 확정된 상태 → 이제 세션 저장
    req.session.user = { userId: user.userId, name: user.name, email: user.email };
    await new Promise((resolve, reject) =>
      req.session.save(err => (err ? reject(err) : resolve()))
    );

    console.log('네이버 로그인 성공:', user.email);

    // ✅ redirect는 딱 1번만!
    return res.redirect(`/login-handler.html?userId=${encodeURIComponent(user.userId)}`);

  } catch (err) {
    console.error('NAVER CALLBACK ERR:', err.message);
    console.error(err.response?.data);
    return res.status(500).json({ ok: false, error: '네이버 로그인 처리 중 서버 오류' });
  }
});

  return router;
}
