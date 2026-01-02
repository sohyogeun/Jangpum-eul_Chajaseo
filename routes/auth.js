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

      // 세션/JWT 없이 기본 정보만 반환(실무는 JWT/세션 권장)
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
    const naverClientSecret = process.env.NAVER_CLIENT_SECRET; // [★ 키 사용]
    const { code, state } = req.query; // 네이버가 보내준 code와 state

    // (원래는 state 값 비교 로직 필요)

    const token_api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${naverClientId}&client_secret=${naverClientSecret}&code=${code}&state=${state}`;
    const profile_api_url = 'https://openapi.naver.com/v1/nid/me';

    try {
      // 1. 네이버에 code를 보내서 Access Token 받기
      const tokenRes = await axios.get(token_api_url);
      const accessToken = tokenRes.data.access_token;

      if (!accessToken) {
        throw new Error('네이버 토큰 발급 실패');
      }

      // 2. Access Token으로 네이버 사용자 프로필 정보 받기
      const profileRes = await axios.get(profile_api_url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      const naverProfile = profileRes.data.response;
      if (!naverProfile || !naverProfile.id) {
        throw new Error('네이버 프로필 조회 실패');
      }

      // 3. [★ DB 처리 ★]
      //    네이버 ID (naverProfile.id)로 우리 DB에서 유저 찾기
      //    [중요] DB의 users 컬렉션에 naverId 같은 필드가 있어야 합니다.
      
      let user = await users.findOne({ naverId: naverProfile.id });

      if (!user) {
        // 네이버 ID로 가입한 적이 없음 -> 신규 회원 처리
        
        // (선택) 혹시 네이버 이메일과 동일한 이메일로 가입한 로컬 계정이 있는지 확인
        const existingEmailUser = await users.findOne({ email: naverProfile.email });
        
        if (existingEmailUser) {
          // 이미 이메일로 가입한 경우 -> 해당 계정에 네이버 ID를 연결(update)
          await users.updateOne(
            { _id: existingEmailUser._id },
            { $set: { naverId: naverProfile.id, updatedAt: new Date() } }
          );
          user = await users.findOne({ _id: existingEmailUser._id }); // 정보 다시 로드
        } else {
          // 완전 신규 유저 -> DB에 insert
          const now = new Date();
          const newUserDoc = {
            // [중요] userId는 필수값이므로, naverId를 기반으로 생성하거나 
            // 별도 페이지로 넘겨 받도록 처리해야 합니다.
            // 여기서는 naverId를 임시로 사용 (기존 로직과 충돌 가능성 있음)
            userId: `naver_${naverProfile.id.substring(0, 10)}`, // 임시 ID
            name: naverProfile.name || '네이버회원',
            email: naverProfile.email,
            phone: naverProfile.mobile || null,
            naverId: naverProfile.id, // [★ 네이버 고유 ID 저장]
            password: null, // 소셜 로그인이므로 로컬 비밀번호 없음
            skinType: null,
            createdAt: now,
            updatedAt: now,
          };
          await users.insertOne(newUserDoc);
          user = newUserDoc;
        }
      }

      // 4. 로그인 성공 처리 (세션 또는 JWT 토큰 발급)
      //    (예제에서는 JWT/세션이 없으므로, 로그인 성공했다는 의미로 JSON 응답)
      //    (실제로는 토큰 발급 후 프론트엔드 메인 페이지로 리다이렉트)
      
      console.log('네이버 로그인 성공:', user.email);

      const clientUserId = user.userId; 
      res.redirect(`/login-handler.html?userId=${clientUserId}`);

    } catch (err) {
      console.error('NAVER CALLBACK ERR:', err.message);
      // (err.response?.data 에 네이버가 보낸 상세 에러가 있을 수 있음)
      console.error(err.response?.data);
      res.status(500).json({ ok: false, error: '네이버 로그인 처리 중 서버 오류' });
    }
  });
  

  return router;
}
