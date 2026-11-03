const allowedOrigins = new Set(['https://cauadevv.github.io', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']);
const encoder = new TextEncoder();
const hex = bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
async function digest(value) { return hex(await crypto.subtle.digest('SHA-256', encoder.encode(value))); }
async function passwordDigest(password, salt) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2', salt:encoder.encode(salt), iterations:100000, hash:'SHA-256'}, key, 256));
}
function equal(a,b) { if (!a || !b || a.length !== b.length) return false; let diff=0; for(let i=0;i<a.length;i++) diff |= a.charCodeAt(i)^b.charCodeAt(i); return diff===0; }
export default { async fetch(request, env) {
  const origin = request.headers.get('Origin') || '';
  const cors = allowedOrigins.has(origin) ? {'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'POST, GET, OPTIONS'} : {};
  const respond=(data,status=200)=>new Response(JSON.stringify(data), {status,headers:{...cors,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  if(request.method==='OPTIONS') return new Response(null,{status:204,headers:cors});
  if(!allowedOrigins.has(origin)) return respond({error:'Origem não autorizada.'},403);
  const path = new URL(request.url).pathname;
  try {
    if(request.method==='POST' && path==='/messages') {
      const contentLength = Number(request.headers.get('content-length') || 0);
      if(contentLength>10000) return respond({error:'Mensagem muito longa.'},413);
      const body=await request.json();
      const name=String(body.name||'').trim(), email=String(body.email||'').trim(), phone=String(body.phone||'').trim(), message=String(body.message||'').trim();
      if(!name||!email||!phone||!message||name.length>120||email.length>254||phone.length>40||message.length>4000||!/^\S+@\S+\.\S+$/.test(email)) return respond({error:'Confira os campos preenchidos.'},400);
      await env.DB.prepare('INSERT INTO messages (name,email,phone,message) VALUES (?,?,?,?)').bind(name,email,phone,message).run();
      return respond({ok:true},201);
    }
    if(request.method==='POST' && path==='/login') {
      const now=Math.floor(Date.now()/1000), ip=await digest((request.headers.get('CF-Connecting-IP')||'unknown')+env.RATE_SALT);
      const attempts=await env.DB.prepare('SELECT attempts, reset_at FROM login_attempts WHERE ip=?').bind(ip).first();
      if(attempts && attempts.reset_at>now && attempts.attempts>=5) return respond({error:'Muitas tentativas. Tente novamente em 15 minutos.'},429);
      await env.DB.prepare('INSERT INTO login_attempts (ip,attempts,reset_at) VALUES (?,1,?) ON CONFLICT(ip) DO UPDATE SET attempts=CASE WHEN reset_at<=? THEN 1 ELSE attempts+1 END, reset_at=CASE WHEN reset_at<=? THEN ? ELSE reset_at END').bind(ip,now+900,now,now,now+900).run();
      const body=await request.json(); const email=String(body.email||'').trim().toLowerCase(), password=String(body.password||'');
      if(password.length>200) return respond({error:'E-mail ou senha incorretos.'},401);
      const computed=await passwordDigest(password,env.PASSWORD_SALT);
      if(!equal(email,env.ADMIN_EMAIL.toLowerCase()) || !equal(computed,env.PASSWORD_HASH)) return respond({error:'E-mail ou senha incorretos.'},401);
      await env.DB.prepare('DELETE FROM login_attempts WHERE ip=?').bind(ip).run();
      const token=hex(crypto.getRandomValues(new Uint8Array(32))); await env.DB.prepare('INSERT INTO sessions (token_hash,expires) VALUES (?,?)').bind(await digest(token),now+28800).run();
      return respond({token});
    }
    if(path==='/messages' && request.method==='GET') {
      const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
      if(!/^[a-f0-9]{64}$/.test(token)) return respond({error:'Entre novamente.'},401);
      const now=Math.floor(Date.now()/1000); const session=await env.DB.prepare('SELECT expires FROM sessions WHERE token_hash=? AND expires>?').bind(await digest(token),now).first();
      if(!session) return respond({error:'Sessão expirada. Entre novamente.'},401);
      const rows=await env.DB.prepare('SELECT id,name,email,phone,message,created_at FROM messages ORDER BY id DESC LIMIT 500').all(); return respond({messages:rows.results});
    }
    if(path==='/logout' && request.method==='POST') {
      const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,''); if(/^[a-f0-9]{64}$/.test(token)) await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await digest(token)).run(); return respond({ok:true});
    }
    return respond({error:'Não encontrado.'},404);
  } catch (error) { console.error('CANOPA API:', error.message); return respond({error:'Não foi possível concluir agora. Tente novamente.'},500); }
}};
