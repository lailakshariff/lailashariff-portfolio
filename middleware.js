// Vercel Routing Middleware — gates the Purple Fabric case study and its assets.
// Required env vars (Vercel → Settings → Environment Variables):
//   PF_PASSWORD        the password you share with recruiters
//   PF_SESSION_SECRET  long random string used to sign the access cookie
// Changing either value signs everyone out.

// Gates the case study, its unlock endpoint, and every confidential file in place
// (repo root or /dist), so nothing needs to be moved or deleted.
const PAGE = /^\/(dist\/)?purple-fabric(\.html)?\/?$/;
const PROTECTED = new RegExp('^/(dist/)?(' + [
  'purple-fabric', 'purple fabric',
  'assets/pf-', 'assets/before/', 'assets/inline/purple-fabric',
  'assets/b/(10eebd1b|a124ed6c|4b1c0284|fa7147a7|61cff4f2)',
  'exports/purple-fabric', 'pf-private/',
  'uploads/purple-fabric', 'uploads/pf-', 'backup-approved/purple',
  'scraps/pf-', 'screenshots/pf-', 'portfolio presentation', 'laila shariff - portfolio',
].join('|') + ')');

export const config = {
  matcher: ['/((?!_next|_vercel).*)'],
};

const COOKIE = 'pf_access';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const enc = new TextEncoder();
const NO_STORE = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
};

const b64url = (buf) => {
  let s = '';
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

const signingKey = (env) => `${env.secret}|${env.password}`;

async function makeToken(env) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  return `${exp}.${await hmac(signingKey(env), 'pf:' + exp)}`;
}

async function validToken(token, env) {
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!/^\d+$/.test(exp || '') || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, await hmac(signingKey(env), 'pf:' + exp));
}

function readCookie(req, name) {
  const raw = req.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

const pass = () => new Response(null, { headers: { 'x-middleware-next': '1' } });

export default async function middleware(req) {
  const url = new URL(req.url);
  let path = url.pathname;
  try { path = decodeURIComponent(path); } catch (e) {}
  path = path.toLowerCase();
  if (!PROTECTED.test(path)) return; // everything else on the site is untouched
  const env = { password: process.env.PF_PASSWORD, secret: process.env.PF_SESSION_SECRET };

  // Fail closed if not configured.
  if (!env.password || !env.secret || env.secret.length < 32) {
    return new Response('This page is temporarily unavailable.', { status: 503, headers: { ...NO_STORE, 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  if (path === '/purple-fabric/unlock') {
    if (req.method !== 'POST') return Response.redirect(new URL('/purple-fabric', url), 303);
    const origin = req.headers.get('origin');
    if (origin && origin !== url.origin) return new Response('Forbidden', { status: 403, headers: NO_STORE });

    let attempt = '';
    try { attempt = String((await req.formData()).get('password') || ''); } catch (e) {}
    const ok = attempt.length > 0 && attempt.length <= 256 &&
      safeEqual(await hmac(env.secret, attempt), await hmac(env.secret, env.password));

    if (!ok) {
      await new Promise((r) => setTimeout(r, 700)); // slow down guessing
      return lockPage(true);
    }
    return new Response(null, {
      status: 303,
      headers: {
        ...NO_STORE,
        Location: '/purple-fabric',
        'Set-Cookie': `${COOKIE}=${await makeToken(env)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }

  if (await validToken(readCookie(req, COOKIE), env)) return pass();

  if (PAGE.test(path)) return lockPage(false);
  return new Response('Not found', { status: 404, headers: NO_STORE });
}

function lockPage(error) {
  return new Response(lockHTML(error), {
    status: 401,
    headers: { ...NO_STORE, 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function lockHTML(error) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>Purple Fabric · Laila Shariff</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script src="/theme.js"></script>
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
:root{--bg:#ffffff;--ink:#22201d;--body:#5b564f;--muted:#8a847c;--field:#f4f1eb;--line:rgba(34,32,29,.12);--accent:#a8544a;--blue:#6f87ab;--err:#a8544a;--btn:#22201d;--btn-ink:#ffffff;--star:url(/assets/star-solid.png)}
html[data-theme="dark"]{--bg:#17160f;--ink:#f2efe6;--body:#c2bcae;--muted:#958f83;--field:#211f18;--line:rgba(242,239,230,.14);--accent:#d98d7e;--blue:#8ba2c4;--err:#e3a294;--btn:#f2efe6;--btn-ink:#17160f;--star:url(/assets/star-solid-blue.png)}
*{box-sizing:border-box}
html{background:var(--bg)}
body{margin:0;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;background:var(--bg);color:var(--ink);font-family:'Satoshi',system-ui,-apple-system,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;transition:background .4s ease,color .4s ease}
a{color:var(--body);text-decoration:none}
a:hover{color:var(--ink)}
::selection{background:rgba(168,84,74,.18)}
.top{padding:28px 64px}
.back{display:inline-flex;align-items:center;gap:8px;font-size:15px;color:var(--muted);padding:6px 0;border-radius:6px;transition:color .25s ease}
.back:hover{color:var(--ink)}
.back svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;transition:transform .25s ease}
.back:hover svg{transform:translateX(-3px)}
main{flex:1;display:flex;align-items:center;justify-content:center;padding:24px 24px 14vh}
.card{width:100%;max-width:520px}
.star{width:34px;height:34px;background:var(--star) center/contain no-repeat;margin-bottom:30px;animation:float 6s ease-in-out infinite,appear .9s ease both}
h1{margin:0 0 20px;font-family:'EB Garamond',Garamond,Georgia,serif;font-weight:400;line-height:1.12;letter-spacing:-.01em;text-wrap:balance;animation:appear .9s .08s ease both}
p{margin:0 0 14px;font-size:17px;line-height:1.6;color:var(--body);text-wrap:pretty;max-width:46ch}
.copy{animation:appear .9s .16s ease both}
form{margin-top:34px;animation:appear .9s .24s ease both}
.row{display:flex;gap:10px}
.sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
input{flex:1;min-width:0;height:52px;padding:0 18px;border-radius:12px;border:1px solid var(--line);background:var(--field);color:var(--ink);font:inherit;font-size:16px;transition:border-color .2s ease,box-shadow .2s ease}
input::placeholder{color:var(--muted)}
input:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 3px color-mix(in oklab,var(--blue) 26%,transparent)}
input[aria-invalid="true"]{border-color:var(--err)}
button{flex:0 0 auto;height:52px;padding:0 22px;border:0;border-radius:12px;background:var(--btn);color:var(--btn-ink);font:inherit;font-size:15px;font-weight:500;cursor:pointer;transition:background .25s ease,transform .15s ease}
button:hover{background:var(--accent);color:#fff}
button:active{transform:translateY(1px)}
button:focus-visible,.back:focus-visible{outline:2px solid var(--blue);outline-offset:3px}
.err{display:flex;align-items:center;gap:8px;margin-top:14px;font-size:14.5px;line-height:1.45;color:var(--err)}
.err svg{width:15px;height:15px;flex:0 0 auto;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}
.shake{animation:shake .38s ease}
@keyframes appear{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes float{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-4px) rotate(6deg)}}
@keyframes shake{0%,100%{transform:none}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
h1{font-size:clamp(32px,4.2vw + 12px,44px)}
.top{padding-left:max(64px,env(safe-area-inset-left));padding-right:max(64px,env(safe-area-inset-right))}
@media (max-width:1024px){.top{padding:24px max(40px,env(safe-area-inset-right)) 24px max(40px,env(safe-area-inset-left))}main{padding:32px 40px 12vh}.card{max-width:560px}}
@media (max-width:640px){.top{padding:16px max(22px,env(safe-area-inset-right)) 8px max(22px,env(safe-area-inset-left))}.back{min-height:44px;font-size:15px}main{align-items:flex-start;padding:8vh 22px calc(40px + env(safe-area-inset-bottom))}.star{width:28px;height:28px;margin-bottom:24px}h1{margin-bottom:16px;line-height:1.14}p{font-size:16px;line-height:1.58}form{margin-top:28px}.row{flex-direction:column;gap:10px}input,button{height:54px;width:100%}input{flex:none;font-size:16px}}
@media (max-width:360px){main{padding-top:5vh}h1{font-size:29px}}
@media (max-height:500px) and (orientation:landscape){main{align-items:flex-start;padding-top:12px;padding-bottom:32px}.star{display:none}h1{font-size:30px;margin-bottom:12px}form{margin-top:20px}.row{flex-direction:row}input{flex:1}button{width:auto}}
@media (prefers-reduced-motion:reduce){*{animation:none !important;transition:none !important}}
</style>
</head>
<body>
<div class="top"><a class="back" href="/"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg>Back to portfolio</a></div>
<main>
<div class="card">
<div class="star" aria-hidden="true"></div>
<h1>A little something behind the scenes.</h1>
<div class="copy">
<p>This case study is password-protected because it features work completed during my time at Intellect Design Arena.</p>
<p>If you've been given access, enter the password below to explore the project.</p>
</div>
<form method="post" action="/purple-fabric/unlock" autocomplete="off">
<label class="sr" for="pw">Password</label>
<div class="row${error ? ' shake' : ''}">
<input id="pw" name="password" type="password" placeholder="Enter password" required autocomplete="current-password" autocapitalize="off" spellcheck="false"${error ? ' aria-invalid="true" aria-describedby="pw-err" autofocus' : ''}>
<button type="submit">View Case Study</button>
</div>
${error ? '<div class="err" id="pw-err" role="alert"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.25"/><path d="M8 4.9v3.6M8 11.1v.01"/></svg>That password doesn&#39;t seem right. Please try again.</div>' : ''}
</form>
</div>
</main>
</body>
</html>`;
}
