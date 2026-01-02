// security.js (서버 분리 원칙 지키려면 별 파일에서 export)
export function applyDevCSP(app) {
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
        "style-src 'self' 'unsafe-inline' https:",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data: https:",
        "connect-src 'self' https: ws:",
        "frame-src 'self' https:",
        "object-src 'none'",
        // 크롬 번역·구글 리소스를 허용하려면 추가:
        "style-src-elem 'self' 'unsafe-inline' https://www.gstatic.com https://fonts.googleapis.com",
        "script-src-elem 'self' https://www.gstatic.com https://www.google.com"
      ].join('; ')
    );
    next();
  });
}
