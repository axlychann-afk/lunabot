/*
  Name: Akinator — CLIENT-SIDE HTML via WebSocket (satu kartu, seluruh UI + logika di HTML)

  Arsitektur:
    Kartu HTML (WhatsApp)
        │  new WebSocket("wss://akinator.ryuu-dev.my.id/wss")
        ▼
    Cloudflare Worker (worker-akinator.js, /wss) — jembatan WebSocket <-> HTTP
        │  fetch POST https://api.ryuu-dev.my.id/akinator/*
        ▼
    Backend API (relay id.akinator.com — sesi dipegang server per token)
        ▼  response JSON
    Worker -> WebSocket -> kartu HTML render ulang

  Bot hanya mengirim kartu pertama. Setelah itu JavaScript di dalam kartu
  mengambil alih SEMUA interaksi: connect WS -> init session -> jawab ->
  kembali -> nyerah -> main lagi (init ulang lewat WS). Tidak ada fetch()
  dari HTML, tidak ada command WhatsApp per jawaban, tidak ada native button.

  Pola WebSocket client mengikuti referensi project:
  plugins/menu--search--ytplay.js (new WebSocket + JSON di onmessage +
  onopen/onerror/onclose + reconnect tanpa membuat session baru).

  Command: akinator / aki   (opsional: hewan | benda untuk ganti tema)
*/

import "../settings.js";
import crypto from "node:crypto";

/* URL WebSocket Cloudflare Worker — gampang diubah kalau domain berubah.
   Bisa dioverride lewat global.akinatorWsUrl (dipakai saat testing). */
const WS_URL = global.akinatorWsUrl || "wss://akinator.ryuu-dev.my.id/wss";

/* meta tema: numeric sid sama seperti backend relay */
const THEME_META = {
    1: { name: "Karakter", emoji: "👤", plain: "karakter/tokoh" },
    14: { name: "Hewan", emoji: "🐾", plain: "hewan" },
    2: { name: "Benda", emoji: "📦", plain: "benda" }
};
const THEME_WORDS = {
    karakter: 1, tokoh: 1, orang: 1, characters: 1, character: 1,
    hewan: 14, binatang: 14, animal: 14, animals: 14,
    benda: 2, barang: 2, objek: 2, object: 2, objects: 2
};
const STOP_WORDS = ["stop", "berhenti", "selesai", "quit", "keluar", "menyerah", "nyerah", "end"];

const ACTIVE_TTL = 60 * 60 * 1000; // kartu dianggap basi setelah 1 jam
const activeGames = new Map(); // key = chat -> { card, updatedAt }

function cleanupActive(now = Date.now()) {
    for (const [chat, g] of activeGames) {
        if (!g || now - g.updatedAt > ACTIVE_TTL) activeGames.delete(chat);
    }
}

/* ============================================================
   KIRIM / HAPUS KARTU HTML
   ============================================================ */
async function relayCard(RyuuBotz, chat, payload) {
    const { generateWAMessageFromContent } = await import("@ryuu-reinzz/baileys");

    /* struktur WAJIB sama dengan kartu lain yang berfungsi (ytplay/dino/doom/
       tetris/ttcv2): section butuh __typename "GenAIUnifiedResponseSection" dan
       view_model butuh __typename "GenAISingleLayoutViewModel" SEBELUM primitive.
       Tanpa __typename section, WhatsApp tidak merender kartu HTML sama sekali. */
    const sections = [{
        __typename: "GenAIUnifiedResponseSection",
        view_model: {
            __typename: "GenAISingleLayoutViewModel",
            primitive: {
                __typename: "FOAHtmlPrimitiveDemoDONOTUSE",
                trusted_sources: [],
                payload
            }
        }
    }];

    const html = {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: 1,
                    unifiedResponse: {
                        data: Buffer.from(JSON.stringify({
                            __typename: "GenAIUnifiedResponse",
                            response_id: crypto.randomUUID(),
                            sections
                        })).toString("base64")
                    },
                    contextInfo: {
                        isForwarded: true,
                        forwardOrigin: 4
                    }
                }
            }
        }
    };

    const msg = generateWAMessageFromContent(chat, html, {});
    await RyuuBotz.relayMessage(chat, msg.message, {
        messageId: msg.key.id
    });
    return {
        remoteJid: chat,
        id: msg.key.id
    };
}

async function deleteCard(RyuuBotz, card) {
    if (!card || !card.id) return;
    try {
        await RyuuBotz.sendMessage(card.remoteJid, {
            delete: {
                remoteJid: card.remoteJid,
                id: card.id
            }
        });
    } catch (err) {
        // abaikan — kadang kartu lama sudah tidak bisa dihapus
    }
}

/* ============================================================
   CARD CSS — dark theme, responsif; UI sengaja dibuat besar
   (lebih panjang & lebar), renderer/webview yang men-scroll.
   ============================================================ */
const CARD_CSS = `
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
html,body{height:100%}
body{background:radial-gradient(120% 90% at 50% -10%,#3b2a63 0%,#241a45 38%,#0d0a1f 100%);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#fff;padding:12px;overflow:auto;touch-action:manipulation}
#app{width:100%;max-width:640px;margin:0 auto;transform-origin:top center}
.card{background:linear-gradient(180deg,rgba(124,58,237,.22),rgba(15,11,34,.94) 42%);border:1px solid rgba(255,255,255,.10);border-radius:26px;padding:16px 20px 14px;box-shadow:0 22px 60px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.06)}
.head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 2px 10px}
.h-left{display:flex;align-items:center;gap:10px;min-width:0}
.h-ava{width:44px;height:44px;border-radius:50%;object-fit:cover;border:2.5px solid rgba(255,255,255,.22);flex:none}
.h-tit{font-size:20px;font-weight:800;letter-spacing:.4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.h-sub{font-size:11px;opacity:.55;font-weight:600;letter-spacing:.3px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.badge{flex:none;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:20px;padding:5px 12px;font-size:12px;font-weight:800;letter-spacing:.3px;color:#c7d2fe;white-space:nowrap}
.conn{flex:none;width:18px;height:18px;border-radius:50%;border:2.5px solid rgba(255,255,255,.25);background:#64748b;box-shadow:0 0 0 0 rgba(74,222,128,0)}
.conn.open{background:#4ade80}
.conn.conn{background:#facc15}
.conn.closed{background:#f87171}
.char{display:flex;align-items:center;justify-content:center;position:relative;margin:0 0 8px}
.char-bg{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,.28) 0%,rgba(168,85,247,.12) 45%,transparent 72%)}
#cimg{position:relative;width:112px;height:112px}
#cimg img{width:100%;height:100%;object-fit:cover;border-radius:50%;border:3px solid rgba(255,255,255,.16);box-shadow:0 12px 28px rgba(0,0,0,.5);background:rgba(10,8,26,.6);display:block}
#cimg img.rect{border-radius:22px}
#cimg .cfb{width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,rgba(99,102,241,.4),rgba(168,85,247,.25));display:flex;align-items:center;justify-content:center;font-size:52px;border:3px solid rgba(255,255,255,.16)}
#cimg .spin{width:42px;height:42px;border-radius:50%;border:4px solid rgba(255,255,255,.15);border-top-color:#a78bfa;animation:rot 1s linear infinite}
@keyframes rot{to{transform:rotate(360deg)}}
.qbox{background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:14px 18px 15px;margin:0 1px 10px;text-align:center}
.q-tag{font-size:10px;font-weight:800;letter-spacing:2px;color:#a5b4fc;margin-bottom:5px}
.q-text{font-size:19px;font-weight:700;line-height:1.45}
.q-sub{font-size:13px;opacity:.72;margin-top:6px;line-height:1.45}
.progress{margin:0 2px 12px}
.prow{display:flex;align-items:center;justify-content:space-between;font-size:12px;margin-bottom:5px}
.prow b{color:#a5b4fc;font-weight:800}
.track{height:9px;background:rgba(255,255,255,.10);border-radius:8px;overflow:hidden}
.fill{height:100%;width:0;background:linear-gradient(90deg,#4facfe,#a78bfa,#f472b6);border-radius:8px;transition:width .6s ease}
.extra{margin:0 1px 10px;text-align:center}
.extra .big{font-size:20px;font-weight:800;line-height:1.4}
.extra .desc{font-size:14px;opacity:.8;margin-top:7px;line-height:1.5}
.btns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 1px}
.btn{display:flex;align-items:center;justify-content:center;gap:7px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px 6px;font-size:16px;font-weight:800;color:#fff;cursor:pointer;transition:transform .08s ease,filter .15s ease;background:rgba(255,255,255,.06);white-space:nowrap;font-family:inherit}
.btn:active{transform:scale(.95);filter:brightness(1.35)}
.btn.full{grid-column:1/-1}
.btn .emoji{font-size:16px}
.btn[disabled]{opacity:.55;pointer-events:none}
.b-yes{background:linear-gradient(180deg,rgba(34,197,94,.30),rgba(34,197,94,.10));border-color:rgba(34,197,94,.5)}
.b-no{background:linear-gradient(180deg,rgba(239,68,68,.30),rgba(239,68,68,.10));border-color:rgba(239,68,68,.5)}
.b-maybe{background:linear-gradient(180deg,rgba(234,179,8,.24),rgba(234,179,8,.08));border-color:rgba(234,179,8,.45)}
.b-unk{background:linear-gradient(180deg,rgba(148,163,184,.24),rgba(148,163,184,.08));border-color:rgba(148,163,184,.45)}
.b-back{background:linear-gradient(180deg,rgba(99,102,241,.26),rgba(99,102,241,.08));border-color:rgba(99,102,241,.5)}
.b-stop{background:linear-gradient(180deg,rgba(239,68,68,.22),rgba(88,28,35,.55));border-color:rgba(248,113,113,.55)}
.b-go{background:linear-gradient(180deg,rgba(34,197,94,.34),rgba(34,197,94,.12));border-color:rgba(34,197,94,.55)}
.b-gold{background:linear-gradient(180deg,rgba(234,179,8,.30),rgba(146,110,5,.25));border-color:rgba(250,204,21,.5)}
.err{margin:0 1px 10px;background:rgba(239,68,68,.10);border:1px solid rgba(239,68,68,.45);border-radius:14px;padding:11px 14px;font-size:14px;line-height:1.5;text-align:center;color:#fecaca}
.hint{margin:10px 2px 0;font-size:10.5px;line-height:1.6;color:rgba(226,232,240,.55);text-align:center}
.hint b{color:#e2e8f0}
#busy{position:fixed;left:50%;top:10px;transform:translate(-50%,-10px);opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;background:rgba(10,8,26,.95);border:1px solid rgba(255,255,255,.18);color:#fff;font-size:14px;font-weight:700;padding:9px 16px;border-radius:14px;z-index:99;box-shadow:0 10px 28px rgba(0,0,0,.5);white-space:nowrap}
#busy.on{opacity:1;transform:translate(-50%,0)}
@media(max-height:600px){
  body{padding:9px}
  #cimg{width:96px;height:96px}
  #cimg .cfb{font-size:44px}
  .char{margin-bottom:5px}
  .qbox{padding:10px 14px 11px;margin-bottom:8px}
  .q-text{font-size:16.5px}
  .btn{padding:10px 5px;font-size:14px}
  .head{padding-bottom:7px}
  .progress{margin-bottom:8px}
}
@media(max-height:500px){
  .h-sub{display:none}
  #cimg{width:76px;height:76px}
  #cimg .cfb{font-size:34px}
  .q-text{font-size:15px}
  .btn{padding:8px 3px;font-size:13px;border-radius:11px}
  .btns{gap:6px}
  .hint{display:none}
  .q-tag{margin-bottom:3px}
}
@media(max-width:380px){.btn{font-size:14px}.q-text{font-size:17px}}

/* ===== DEBUG TERMINAL — status WebSocket realtime (pola ytplay) ===== */
.dbg-wrap{margin:12px 0 0;background:rgba(10,8,26,.85);border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:13px 15px 14px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.dbg-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.dbg-title{font-size:12.5px;font-weight:800;letter-spacing:1.2px;opacity:.85;white-space:nowrap}
.dbg-state{font-size:11.5px;font-weight:800;padding:3px 11px;border-radius:20px;background:rgba(255,255,255,.08);color:#ffd166;letter-spacing:.5px;white-space:nowrap}
.dbg-state.connected{background:rgba(74,222,128,.16);color:#4ade80}
.dbg-state.connecting{background:rgba(250,204,21,.14);color:#facc15}
.dbg-state.reconnecting{background:rgba(250,204,21,.14);color:#facc15}
.dbg-state.closed{background:rgba(248,113,113,.14);color:#f87171}
.dbg-state.error{background:rgba(248,113,113,.18);color:#f87171}
.dbg-state.complete{background:rgba(74,222,128,.16);color:#4ade80}
.dbg-server{font-size:10px;opacity:.5;word-break:break-all;margin-bottom:9px;line-height:1.4}
.dbg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:9px}
.dbg-cell{background:rgba(255,255,255,.05);border-radius:9px;padding:6px 9px}
.dbg-cell span{display:block;font-size:8.5px;opacity:.5;letter-spacing:.6px}
.dbg-cell b{display:block;font-size:12.5px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dbg-bar{height:6px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden;margin-bottom:9px}
.dbg-bar-fill{height:100%;width:0;background:linear-gradient(90deg,#4cc9f0,#a78bfa);transition:width .3s}
.dbg-log{height:120px;overflow-y:auto;background:rgba(0,0,0,.4);border-radius:9px;padding:7px 10px;font-size:10px;line-height:1.65;color:rgba(255,255,255,.8);word-break:break-all;-webkit-overflow-scrolling:touch}
.dbg-log .log-line{white-space:pre-wrap}
`;

/* ============================================================
   CARD JS — aplikasi Akinator di dalam HTML.
   Transport: WebSocket (pola menu--search--ytplay.js). TANPA fetch.
   Dilarang pakai backtick / ${ di dalam sini.
   ============================================================ */
const CARD_JS = `
(function(){
var WS_URL = window.__AKI_WS__ || '';
var state = {
  connected: false,
  session: null,
  question: null,
  progression: 0,
  step: 0,
  probs: [],
  history: [],
  loading: false,
  mode: 'init',        // init | question | candidate | won | lost | stopped
  theme: window.__AKI_THEME__ || '1',
  avatarData: null,
  candidate: null,
  win: null,
  err: null
};
var ws = null;                  // satu objek WebSocket, pola ytplay (wsAudio)
var finished = false;           // stop / won / lost -> jangan reconnect
var reconnectTimer = null;
var wsReconnectAttempt = 0;     // batas percobaan reconnect (anti spam error di log)
var MAX_RECONNECT = 4;
var initTimer = null;           // watchdog init — kalau server tak merespons, kirim ulang
var lastAct = null;             // {type:'answer'|'back', value} untuk Coba Lagi

function esc(s){
  return String(s==null?'':s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function $(id){ return document.getElementById(id); }
function pct(){ return Math.max(0, Math.min(100, Math.round(state.progression || 0))); }
function themeName(){
  var m = { '1':'Karakter','14':'Hewan','2':'Benda' };
  return m[String(state.theme)] || 'Karakter';
}

/* ================= WEBSOCKET (pola ytplay) ================= */
function setConn(cls){
  var el = $('conn');
  if(el){ el.className = 'conn ' + cls; }
}

/* ================= DEBUG TERMINAL — status sambungan realtime (pola ytplay) ================= */
var dbgCount = 0;
function setWsState(st){
  var el = $('wsState');
  if(el){ el.textContent = st; el.className = 'dbg-state ' + String(st).toLowerCase(); }
}
function writeLog(line){
  var box = $('debugLog');
  if(!box) return;
  var div = document.createElement('div');
  div.className = 'log-line';
  div.textContent = line;
  box.appendChild(div);
  while(box.childNodes.length > 60){ box.removeChild(box.firstChild); }
  box.scrollTop = box.scrollHeight;
}
function dbgHost(){
  try{ return new URL(WS_URL).host; }catch(e){ return WS_URL; }
}
function updateDbg(){
  var set = function(id, v){ var el = $(id); if(el){ el.textContent = v; } };
  set('dbgSession', state.session ? String(state.session).slice(0, 10) + '…' : '-');
  set('dbgMode', state.mode || '-');
  set('dbgStep', String(parseInt(state.step, 10) || 0));
  set('dbgProg', pct() + '%');
  set('dbgMsg', String(dbgCount));
  var f = $('dbgBarFill');
  if(f){ f.style.width = pct() + '%'; }
  var s = $('wsServer');
  if(s && (!s.textContent || s.textContent === '-')){ s.textContent = dbgHost(); }
}
function sendWs(text){
  if(ws && ws.readyState === WebSocket.OPEN){ ws.send(text); return true; }
  return false;
}
function clearInitWatchdog(){
  if(initTimer){ clearTimeout(initTimer); initTimer = null; }
}
function armInitWatchdog(){
  clearInitWatchdog();
  initTimer = setTimeout(function(){
    initTimer = null;
    if(finished) return;
    if(ws && ws.readyState === WebSocket.OPEN && !state.session){
      writeLog('⚠ Tidak ada respon init — kirim ulang…');
      sendInit();
    } else if(!state.connected){
      writeLog('✗ Socket tidak siap — coba sambung ulang');
      connectWs();
    }
  }, 8000);
}
function sendInit(){
  state.mode = 'init';
  state.loading = true;
  render();
  writeLog('→ kirim init (tema ' + themeName() + ')');
  if(!sendWs(JSON.stringify({ type:'init', theme: state.theme }))){
    state.loading = false;
    setWsState('ERROR');
    writeLog('✗ Gagal kirim init — WebSocket belum siap');
    state.err = { msg:'⚠ Koneksi ke server Akinator gagal.', canRetry:true };
    render();
    return;
  }
  armInitWatchdog();
}
function connectWs(){
  if(reconnectTimer){ clearTimeout(reconnectTimer); reconnectTimer = null; }
  if(ws){ try{ ws.close(); }catch(e){} ws = null; }
  setConn('conn');
  setWsState('CONNECTING');
  var srvEl = $('wsServer');
  if(srvEl){ srvEl.textContent = dbgHost(); }
  writeLog('→ Menghubungkan ke ' + dbgHost() + ' …');
  if(typeof WebSocket === 'undefined'){
    state.connected = false;
    setConn('closed');
    setWsState('ERROR');
    writeLog('✗ WebSocket API tidak tersedia di webview ini');
    state.err = { msg:'⚠ WebSocket tidak didukung di perangkat ini.', canRetry:true };
    render();
    return;
  }
  var s;
  try {
    s = new WebSocket(WS_URL);
  } catch(e) {
    state.connected = false;
    setConn('closed');
    setWsState('ERROR');
    writeLog('✗ Gagal buat WebSocket: ' + ((e && e.message) || e));
    state.err = { msg:'⚠ Koneksi ke server Akinator gagal.', canRetry:true };
    render();
    return;
  }
  ws = s;
  s.onopen = function(){
    wsReconnectAttempt = 0;
    state.connected = true;
    state.err = null;
    setConn('open');
    setWsState('CONNECTED');
    writeLog('✓ WebSocket OPEN — terhubung');
    if(!state.session){ sendInit(); }
    else { render(); updateDbg(); }
  };
  s.onmessage = function(event){ handleMsg(event); };
  s.onerror = function(){
    state.connected = false;
    setConn('closed');
    setWsState('ERROR');
    writeLog('✗ WebSocket error');
  };
  s.onclose = function(event){
    state.connected = false;
    setConn('closed');
    clearInitWatchdog();
    if(finished){
      setWsState('CLOSED');
      writeLog('✗ Koneksi ditutup (kode ' + event.code + ')');
      return;
    }
    if(wsReconnectAttempt < MAX_RECONNECT){
      wsReconnectAttempt++;
      setWsState('RECONNECTING');
      writeLog('✗ Koneksi terputus (kode ' + event.code + ') — sambung ulang ' + wsReconnectAttempt + '/' + MAX_RECONNECT);
      scheduleReconnect();
    } else {
      setWsState('CLOSED');
      writeLog('✗ Gagal terhubung setelah ' + MAX_RECONNECT + ' percobaan — ketuk Coba Lagi');
      state.err = { msg:'⚠ Koneksi ke server terputus. Ketuk Coba Lagi untuk menyambung.', canRetry:true };
      render();
    }
  };
}
function scheduleReconnect(){
  if(reconnectTimer) return;
  reconnectTimer = setTimeout(function(){
    reconnectTimer = null;
    if(!finished && !state.connected){ connectWs(); }
  }, 2500);
}
function handleMsg(event){
  if(typeof event.data !== 'string') return;
  var msg = null;
  try { msg = JSON.parse(event.data); } catch(e){ return; }
  if(!msg) return;
  dbgCount++;
  if(msg.type === 'connected'){
    /* sinyal server (pola ytplay): socket terbukti hidup dari sisi server.
       Jangan clear watchdog — pertanyaan belum tentu langsung datang. */
    writeLog('← connected — server siap');
    updateDbg();
    return;
  }
  clearInitWatchdog();
  if(msg.type === 'question'){
    state.session = msg.session || state.session;
    state.mode = 'question';
    state.question = msg.question || '';
    state.progression = Number(msg.progression) || 0;
    state.step = Number(msg.step) || 0;
    state.probs = Array.isArray(msg.probs) ? msg.probs : [];
    state.avatarData = msg.avatarData || state.avatarData;
    if(msg.theme != null) state.theme = String(msg.theme);
    state.history.push({ q: state.question, a: null });
    state.loading = false;
    state.err = null;
    render();
    fitUI();
    writeLog('← question #' + (parseInt(state.step, 10) + 1) + ' — keyakinan ' + pct() + '%');
  }
  else if(msg.type === 'candidate'){
    state.session = msg.session || state.session;
    state.mode = 'candidate';
    state.candidate = msg.candidate || {};
    state.progression = Number(msg.progression) || 0;
    state.loading = false;
    state.err = null;
    render();
    fitUI();
    writeLog('← candidate: ' + ((msg.candidate && msg.candidate.name) || '???'));
  }
  else if(msg.type === 'result'){
    finished = true;
    state.loading = false;
    state.err = null;
    if(msg.won){
      state.mode = 'won';
      state.win = msg.character || {};
      writeLog('★ AKINATOR MENANG: ' + ((msg.character && msg.character.name) || '???'));
    } else {
      state.mode = 'lost';
      state.win = null;
      writeLog('★ KAMU MENANG — Akinator kehabisan tebakan');
    }
    render();
    fitUI();
  }
  else if(msg.type === 'stopped'){
    state.loading = false;
    writeLog('← stopped');
  }
  else if(msg.type === 'error'){
    state.loading = false;
    var m = msg.message || 'Terjadi kesalahan.';
    writeLog('✗ server error: ' + m);
    setWsState('ERROR');
    if(/kedaluwarsa|tidak ditemukan|mulai permainan baru/i.test(m)){
      finished = true;
      state.err = { msg: m, canRetry:false };
    } else {
      state.err = { msg: m, canRetry:true };
    }
    render();
    fitUI();
  }
  updateDbg();
}

/* ================= tombol ================= */
function setBusy(on){
  state.loading = on;
  var b = $('busy');
  if(b){ b.classList.toggle('on', on); }
  var btns = document.querySelectorAll('.btn');
  for(var i=0;i<btns.length;i++){ btns[i].disabled = on; }
}
function mkBtn(o){
  var b = document.createElement('button');
  b.className = 'btn ' + (o.cls || '');
  if(o.full) b.classList.add('full');
  b.setAttribute('data-a', o.a);
  if(o.emoji){ var s=document.createElement('span'); s.className='emoji'; s.textContent=o.emoji; b.appendChild(s); }
  var l=document.createElement('span'); l.textContent=o.label; b.appendChild(l);
  b.addEventListener('click', function(){ tap(o.a); });
  return b;
}
function tap(act){
  if(state.loading) return;
  if(act === 'again'){ again(); return; }
  if(act === 'retry'){ retry(); return; }
  if(act === 'stop'){ stopGame(); return; }
  if(act === 'back'){ goBack(); return; }
  answer(act);
}
function answer(value){
  if(!state.connected || !state.session){
    state.err = { msg:'⚠ WebSocket belum terhubung.', canRetry:true };
    render();
    return;
  }
  state.loading = true;
  lastAct = { type:'answer', value:value };
  setBusy(true);
  render();
  writeLog('→ jawab: ' + value);
  if(!sendWs(JSON.stringify({ type:'answer', session: state.session, answer: value }))){
    setBusy(false);
    state.err = { msg:'⚠ Koneksi ke server terputus. Coba lagi.', canRetry:true };
    render();
  }
}
function goBack(){
  if(!state.connected || !state.session){
    state.err = { msg:'⚠ WebSocket belum terhubung.', canRetry:true };
    render();
    return;
  }
  state.loading = true;
  lastAct = { type:'back', value:null };
  setBusy(true);
  render();
  writeLog('→ mundur (back)');
  if(!sendWs(JSON.stringify({ type:'back', session: state.session }))){
    setBusy(false);
    state.err = { msg:'⚠ Koneksi ke server terputus. Coba lagi.', canRetry:true };
    render();
  }
}
function stopGame(){
  finished = true;
  writeLog('→ stop');
  setWsState('CLOSED');
  if(state.connected && state.session){
    sendWs(JSON.stringify({ type:'stop', session: state.session }));
  }
  state.session = null;
  state.mode = 'stopped';
  state.loading = false;
  state.err = null;
  render();
  fitUI();
  updateDbg();
}
function again(){
  finished = false;
  state.session = null;
  state.mode = 'init';
  state.loading = false;
  state.err = null;
  state.history = [];
  writeLog('→ main lagi');
  render();
  if(state.connected){ sendInit(); }
  else { connectWs(); }
}
function retry(){
  if(!state.connected){ connectWs(); return; }
  if(lastAct && lastAct.type === 'back'){ goBack(); return; }
  if(lastAct && lastAct.type === 'answer'){ answer(lastAct.value); return; }
  if(!state.session){ sendInit(); }
}

/* ================= render UI ================= */
function drawChar(){
  var box = $('cimg');
  if(!box) return;
  box.innerHTML = '';
  var data = null, rect = false, fb = '\u{1F9DE}';
  if(state.mode === 'init'){
    var sp = document.createElement('div');
    sp.className = 'spin';
    box.appendChild(sp);
    return;
  }
  if(state.mode === 'candidate'){ data = state.candidate && state.candidate.photoData; rect = true; fb = '\u{1F3AD}'; }
  else if(state.mode === 'won'){ data = state.win && state.win.image; rect = true; fb = '\u{1F389}'; }
  else if(state.mode === 'question'){ data = state.avatarData; fb = '\u{1F9DE}'; }
  if(data){
    var img = document.createElement('img');
    img.src = data;
    img.alt = '';
    if(rect) img.className = 'rect';
    box.appendChild(img);
  } else {
    var d = document.createElement('div');
    d.className = 'cfb';
    d.textContent = fb;
    box.appendChild(d);
  }
}
function fmtButtons(list, stopLabel){
  var wrap = document.createElement('div');
  wrap.className = 'btns';
  for(var i=0;i<list.length;i++){ wrap.appendChild(mkBtn(list[i])); }
  wrap.appendChild(mkBtn({ a:'stop', cls:'b-stop', full:true, emoji:'\u{1F6D1}', label: stopLabel || 'Nyerah' }));
  return wrap;
}
function renderQuestion(){
  $('qtag').textContent = '\u{1F914} PIKIRKAN SEBUAH ' + themeName().toUpperCase();
  $('qtext').innerHTML = esc(state.question || '');
  $('qsub').textContent = '';
  $('badge').textContent = 'Pertanyaan #' + ((parseInt(state.step,10)||0)+1);
  $('plabel').textContent = '\u{1F9E0} keyakinan';
  $('pval').textContent = pct() + '%';
  $('pfill').style.width = pct() + '%';
  drawChar();
  $('body').innerHTML = '';
  $('hint').innerHTML = 'Ketuk tombol untuk menjawab \u2014 semua lewat WebSocket, tanpa mengetik apa pun.';
  var list = [
    { a:'yes', emoji:'\u2705', label:'Ya', cls:'b-yes' },
    { a:'no', emoji:'\u274C', label:'Tidak', cls:'b-no' },
    { a:'probably', emoji:'\u{1F914}', label:'Mungkin', cls:'b-maybe' },
    { a:'probably_not', emoji:'\u{1F615}', label:'Mgkn Tdk', cls:'b-maybe' },
    { a:'dont_know', emoji:'\u{1F937}', label:'Gak Tau', cls:'b-unk' },
    { a:'back', emoji:'\u2B05\uFE0F', label:'Kembali', cls:'b-back' }
  ];
  $('actions').innerHTML = '';
  $('actions').appendChild(fmtButtons(list, 'Nyerah'));
}
function renderCandidate(){
  var c = state.candidate || {};
  $('qtag').textContent = '\u{1F3AF} TEBAKANKU UNTUKMU';
  $('qtext').innerHTML = 'Apakah kamu memikirkan <b>' + esc(c.name || '???') + '</b>?';
  $('qsub').textContent = '';
  $('badge').textContent = pct() + '% yakin';
  $('plabel').textContent = '\u{1F9E0} keyakinan';
  $('pval').textContent = pct() + '%';
  $('pfill').style.width = pct() + '%';
  drawChar();
  var extra = document.createElement('div');
  extra.className = 'extra';
  if(c.description){ var d=document.createElement('div'); d.className='desc'; d.textContent = c.description; extra.appendChild(d); }
  if(c.pseudo && c.pseudo !== 'X'){ var p=document.createElement('div'); p.className='desc'; p.textContent = 'dikenal sebagai ' + c.pseudo; extra.appendChild(p); }
  $('body').innerHTML = '';
  $('body').appendChild(extra);
  $('hint').innerHTML = 'Kalau benar ketuk \u2705 Ya, benar! Kalau bukan dia, Akinator akan terus mencari.';
  var list = [
    { a:'yes', emoji:'\u2705', label:'Ya, benar!', cls:'b-yes' },
    { a:'no', emoji:'\u274C', label:'Bukan dia', cls:'b-no' }
  ];
  $('actions').innerHTML = '';
  $('actions').appendChild(fmtButtons(list, 'Nyerah'));
}
function renderWon(){
  var w = state.win || {};
  $('qtag').textContent = '\u{1F389} AKINATOR MENANG!';
  $('qtext').innerHTML = '<b>' + esc(w.name || '???') + '</b>';
  $('qsub').textContent = '';
  $('badge').textContent = '100% yakin';
  $('plabel').textContent = '\u{1F9E0} keyakinan';
  $('pval').textContent = '100%';
  $('pfill').style.width = '100%';
  drawChar();
  var extra = document.createElement('div');
  extra.className = 'extra';
  if(w.description){ var d=document.createElement('div'); d.className='desc'; d.textContent = w.description; extra.appendChild(d); }
  if(w.pseudo && w.pseudo !== 'X'){ var p=document.createElement('div'); p.className='desc'; p.textContent = 'dikenal sebagai ' + w.pseudo; extra.appendChild(p); }
  $('body').innerHTML = '';
  $('body').appendChild(extra);
  $('hint').innerHTML = 'Akinator menang lagi! \u{1F60E} Main lagi?';
  var wrap = document.createElement('div'); wrap.className='btns';
  wrap.appendChild(mkBtn({ a:'again', cls:'b-gold', full:true, emoji:'\u{1F504}', label:'Main Lagi' }));
  $('actions').innerHTML = '';
  $('actions').appendChild(wrap);
}
function renderLost(){
  $('qtag').textContent = '\u{1F3C6} KAMU MENANG!';
  $('qtext').innerHTML = 'Akinator kehabisan tebakan \u2014 kamu berhasil mengalahkannya! \u{1F923}';
  $('qsub').textContent = '';
  $('badge').textContent = '\u{1F3C6}';
  $('plabel').textContent = '\u{1F9E0} keyakinan';
  $('pval').textContent = '0%';
  $('pfill').style.width = '0%';
  drawChar();
  $('body').innerHTML = '';
  $('hint').innerHTML = 'Coba lagi, kali ini pikirkan karakter yang lebih terkenal!';
  var wrap = document.createElement('div'); wrap.className='btns';
  wrap.appendChild(mkBtn({ a:'again', cls:'b-go', full:true, emoji:'\u{1F504}', label:'Main Lagi' }));
  $('actions').innerHTML = '';
  $('actions').appendChild(wrap);
}
function renderStopped(){
  $('qtag').textContent = '\u23F9 GAME DIHENTIKAN';
  $('qtext').innerHTML = 'Sampai jumpa di tebakan berikutnya! \u{1F44B}';
  $('qsub').textContent = '';
  $('badge').textContent = 'Selesai';
  $('plabel').textContent = '\u{1F9E0} keyakinan';
  $('pval').textContent = '-';
  $('pfill').style.width = '0%';
  drawChar();
  $('body').innerHTML = '';
  $('hint').innerHTML = 'Ketuk Main Lagi kalau ingin bermain lagi.';
  var wrap = document.createElement('div'); wrap.className='btns';
  wrap.appendChild(mkBtn({ a:'again', cls:'b-go', full:true, emoji:'\u{1F504}', label:'Main Lagi' }));
  $('actions').innerHTML = '';
  $('actions').appendChild(wrap);
}
function renderInit(){
  $('qtag').textContent = '\u{1F50C} MENGHUBUNGKAN';
  $('qtext').innerHTML = state.connected
    ? 'Membuat session Akinator\u2026'
    : 'Menghubungkan ke server\u2026';
  $('qsub').textContent = '';
  $('badge').textContent = '⏳';
  $('plabel').textContent = '\u{1F9E0} keyakinan';
  $('pval').textContent = '-';
  $('pfill').style.width = '0%';
  drawChar();
  $('body').innerHTML = '';
  $('hint').innerHTML = 'Menggunakan WebSocket ' + esc(WS_URL);
  $('actions').innerHTML = '';
}
function renderErrorOverlay(){
  var e = document.createElement('div');
  e.className = 'err';
  e.textContent = '\u26A0\uFE0F ' + ((state.err && state.err.msg) || 'Terjadi kesalahan.');
  $('body').appendChild(e);
  $('hint').innerHTML = 'Error ditampilkan di dalam kartu \u2014 tidak ada pesan WhatsApp terpisah.';
  var wrap = document.createElement('div'); wrap.className='btns';
  if(state.err && state.err.canRetry){
    wrap.appendChild(mkBtn({ a:'retry', cls:'b-back', full:true, emoji:'\u21BB', label:'Coba Lagi' }));
    wrap.appendChild(mkBtn({ a:'again', cls:'b-go', full:true, emoji:'\u{1F504}', label:'Main Lagi' }));
  } else {
    wrap.appendChild(mkBtn({ a:'again', cls:'b-go', full:true, emoji:'\u{1F504}', label:'Main Lagi' }));
  }
  $('actions').innerHTML = '';
  $('actions').appendChild(wrap);
}
function paintMode(){
  var mode = state.mode;
  if(mode === 'question') renderQuestion();
  else if(mode === 'candidate') renderCandidate();
  else if(mode === 'won') renderWon();
  else if(mode === 'lost') renderLost();
  else if(mode === 'stopped') renderStopped();
  else renderInit();
}
function syncHead(){
  var head = $('hava');
  if(head){
    if(state.avatarData){ head.src = state.avatarData; head.style.display = ''; }
    else { head.style.display = 'none'; }
  }
  var hs = $('hsub');
  if(hs) hs.textContent = 'id.akinator.com \u00B7 ' + themeName();
}
function render(){
  syncHead();
  if(state.err){
    if(state.err.canRetry){
      paintMode();
      renderErrorOverlay();
    } else {
      paintMode();
      renderErrorOverlay();
    }
    return;
  }
  paintMode();
}

/* ================= fit (seluruh UI terlihat) ================= */
/* UI dibiarkan seukuran aslinya (lebih panjang & lebar), webview yang scroll —
   tidak di-scale lagi supaya teks dan tombol tetap besar. */
function fitUI(){
  try{
    var app = $('app');
    if(app){ app.style.transform = 'none'; }
    document.body.style.height = '';
    document.body.style.overflow = 'auto';
  }catch(e){}
}
function scheduleFit(){
  setTimeout(fitUI, 30); setTimeout(fitUI, 200); setTimeout(fitUI, 600);
}

/* ================= start ================= */
function boot(){
  if(!WS_URL){
    state.err = { msg:'⚠ WebSocket URL tidak tersedia.', canRetry:false };
    render();
    return;
  }
  connectWs();
  scheduleFit();
}
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
window.addEventListener('load', scheduleFit);
window.addEventListener('resize', function(){ fitUI(); });
window.addEventListener('beforeunload', function(){
  if(ws){ try{ ws.close(); }catch(e){} }
});
})();
`;

/* escape aman untuk disisipkan ke <script> */
function jsSafeJson(value) {
    return JSON.stringify(String(value ?? ""))
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e")
        .replace(/&/g, "\\u0026");
}

function buildCard(themeMeta) {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Akinator</title>
<style>${CARD_CSS}</style>
</head>
<body>
  <div id="app">
    <div class="card">
      <div class="head">
        <div class="h-left">
          <img id="hava" class="h-ava" alt="">
          <div>
            <div class="h-tit">🔮 Akinator</div>
            <div class="h-sub" id="hsub">id.akinator.com · ${themeMeta.name}</div>
          </div>
        </div>
        <div class="conn" id="conn" title="Status WebSocket"></div>
        <div class="badge" id="badge">…</div>
      </div>
      <div class="char"><div class="char-bg"></div><div id="cimg"></div></div>
      <div class="qbox">
        <div class="q-tag" id="qtag"></div>
        <div class="q-text" id="qtext"></div>
        <div class="q-sub" id="qsub"></div>
      </div>
      <div class="progress">
        <div class="prow"><span id="plabel">🧠 keyakinan</span><b id="pval"></b></div>
        <div class="track"><div class="fill" id="pfill"></div></div>
      </div>
      <div id="body"></div>
      <div id="actions"></div>
      <div class="hint" id="hint"></div>
    </div>
    <div class="dbg-wrap">
      <div class="dbg-head">
        <div class="dbg-title">WEBSOCKET AKINATOR</div>
        <div class="dbg-state" id="wsState">CONNECTING</div>
      </div>
      <div class="dbg-server" id="wsServer">-</div>
      <div class="dbg-grid">
        <div class="dbg-cell"><span>Session</span><b id="dbgSession">-</b></div>
        <div class="dbg-cell"><span>Mode</span><b id="dbgMode">init</b></div>
        <div class="dbg-cell"><span>Step</span><b id="dbgStep">0</b></div>
        <div class="dbg-cell"><span>Keyakinan</span><b id="dbgProg">0%</b></div>
        <div class="dbg-cell"><span>Pesan</span><b id="dbgMsg">0</b></div>
        <div class="dbg-cell"><span>Tema</span><b id="dbgTheme">${themeMeta.name}</b></div>
      </div>
      <div class="dbg-bar"><div class="dbg-bar-fill" id="dbgBarFill"></div></div>
      <div class="dbg-log" id="debugLog"></div>
    </div>
  </div>
  <div id="busy">⏳ Memproses…</div>
  <script>
window.__AKI_WS__ = ${jsSafeJson(WS_URL)};
window.__AKI_THEME__ = ${jsSafeJson(themeMeta.sid)};
${CARD_JS}
  <\/script>
</body>
</html>`;
}

/* ============================================================
   PLUGIN COMMAND
   ============================================================ */
export default {
    command: ["akinator", "aki"],
    group: false,
    premium: false,
    limit: true,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, { text, RyuuBotz, reply }) => {
        cleanupActive();
        const raw = String(text || "").trim().toLowerCase();
        const chat = m.chat;
        const prev = activeGames.get(chat);

        /* kata berhenti (cadangan dari chat, kalau kartu tidak bisa disentuh) */
        if (raw && STOP_WORDS.includes(raw)) {
            if (prev && prev.card) await deleteCard(RyuuBotz, prev.card);
            activeGames.delete(chat);
            return reply("⏹️ Permainan Akinator di chat ini dihentikan. Mulai baru kapan saja dengan *akinator*! 👋");
        }

        /* kata tema dikenali, selain itu tema default karakter */
        let sid = 1;
        if (raw) {
            const w = THEME_WORDS[raw];
            if (w) sid = w;
        }
        const meta = THEME_META[sid];

        if (prev && prev.card) {
            await deleteCard(RyuuBotz, prev.card);
            activeGames.delete(chat);
        }

        const payload = buildCard({ sid: String(sid), name: `${meta.emoji} ${meta.name}` });
        const card = await relayCard(RyuuBotz, chat, payload);

        activeGames.set(chat, { card, updatedAt: Date.now() });

        /* intro singkat — SEMUA kontrol ada di dalam kartu */
        await reply(
            `🧠 *Akinator — ${meta.emoji} ${meta.name}*\n\n` +
            `Pikirkan satu ${meta.plain}, lalu mainkan *semuanya dari kartu di atas*: ` +
            `kartu terhubung lewat WebSocket, jawab/mundur/nyerah/main lagi tanpa mengetik apa pun.`
        );
    }
};