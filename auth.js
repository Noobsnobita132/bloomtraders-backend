<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<script>
// ── AUTH GUARD — runs before anything else ──
(function(){
  const API_BASE = 'https://your-backend.railway.app/api'; // <-- apna URL yahan
  const token = localStorage.getItem('bt_token');
  if(!token){ window.location.href='index.html'; return; }

  // Verify subscription is still active
  fetch(API_BASE+'/verify', { headers:{ 'Authorization':'Bearer '+token } })
    .then(r=>r.json())
    .then(data=>{
      if(!data.valid){
        localStorage.removeItem('bt_token');
        window.location.href='index.html?reason=expired';
      } else {
        // Show user info in top bar once DOM ready
        document.addEventListener('DOMContentLoaded', ()=>{
          const bar = document.getElementById('authUserBar');
          if(bar){
            const u=data.user;
            bar.innerHTML=`
              <span style="color:var(--text3);font-size:10px;font-family:'JetBrains Mono',monospace;">
                👤 ${u.name} &nbsp;|&nbsp;
                <span style="color:var(--green)">${u.plan?.toUpperCase()} — ${u.days_remaining} دن باقی</span>
              </span>
              <button onclick="btLogout()" style="padding:3px 10px;border-radius:6px;border:1px solid rgba(248,113,113,.3);background:rgba(248,113,113,.06);color:#f87171;font-size:10px;cursor:pointer;">Logout</button>
            `;
          }
        });
      }
    })
    .catch(()=>{}); // network error — allow app to still load

  window.btLogout = function(){
    localStorage.removeItem('bt_token');
    localStorage.removeItem('bt_user');
    window.location.href='index.html';
  };
})();
</script>
<meta name="theme-color" content="#7c6af7">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>BloomTraders — AI Trade Agent</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/luxon@3.4.4/build/global/luxon.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon@1.3.1/dist/chartjs-adapter-luxon.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-chart-financial@0.2.1/dist/chartjs-chart-financial.min.js"></script>
<style>
:root{
  --bg:#0f1117;--bg2:#161b26;--bg3:#1c2333;
  --border:#2a3347;--border2:#374159;
  --purple:#7c6af7;--purple2:#9b8df9;
  --green:#34d399;--green2:#6ee7b7;
  --red:#f87171;--red2:#fca5a5;
  --blue:#60a5fa;--blue2:#93c5fd;
  --gold:#fbbf24;--gold2:#fcd34d;
  --text:#e2e8f0;--text2:#94a3b8;--text3:#64748b;
  --safe-top:env(safe-area-inset-top,0px);
  --safe-bot:env(safe-area-inset-bottom,0px);
}
body.light-mode{
  --bg:#dfe3ec;--bg2:#eaecf4;--bg3:#d4d9e6;
  --border:#bfc8db;--border2:#a8b4cc;
  --purple:#6c5ce7;--purple2:#7c6af7;
  --green:#059669;--green2:#10b981;
  --red:#dc2626;--red2:#ef4444;
  --blue:#2563eb;--blue2:#3b82f6;
  --gold:#b45309;--gold2:#d97706;
  --text:#1a2236;--text2:#3a4f70;--text3:#6a7d9a;
}
body.light-mode::before{background-image:linear-gradient(rgba(108,92,231,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(108,92,231,0.03) 1px,transparent 1px);}
/* ── THEME TOGGLE ── */
.theme-toggle{width:38px;height:22px;border-radius:11px;border:1px solid var(--border2);background:var(--bg3);cursor:pointer;position:relative;transition:all .3s;flex-shrink:0;display:flex;align-items:center;padding:2px;}
.theme-toggle-ball{width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--blue));transition:transform .3s cubic-bezier(.34,1.56,.64,1);}
body.light-mode .theme-toggle-ball{transform:translateX(16px);}
.theme-icon{font-size:13px;cursor:pointer;padding:5px 8px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);transition:all .2s;line-height:1;}
.theme-icon:hover{border-color:var(--purple2);}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html{scroll-behavior:smooth;}
body{background:var(--bg);color:var(--text);font-family:'Inter','Segoe UI',sans-serif;min-height:100vh;overflow-x:hidden;padding-top:var(--safe-top);padding-bottom:calc(var(--safe-bot)+8px);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;}
body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(124,106,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,106,247,0.03) 1px,transparent 1px);background-size:48px 48px;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:var(--bg);}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:4px;}
.app{position:relative;z-index:1;padding:14px;max-width:1600px;margin:0 auto;}

/* ── TOAST ── */
#toast{position:fixed;bottom:calc(20px + var(--safe-bot));left:50%;transform:translateX(-50%) translateY(100px);background:var(--bg2);border:1px solid var(--border2);border-radius:12px;padding:12px 20px;font-size:12px;color:var(--text);box-shadow:0 16px 48px rgba(0,0,0,.7);z-index:9999;transition:transform .4s cubic-bezier(.34,1.56,.64,1);min-width:240px;max-width:92vw;text-align:center;pointer-events:none;font-family:'JetBrains Mono',monospace;}
#toast.show{transform:translateX(-50%) translateY(0);}
#toast.ok{border-color:var(--green);color:var(--green);}
#toast.err{border-color:var(--red);color:var(--red);}
#toast.info{border-color:var(--purple);color:var(--purple2);}

/* ── FLOATING SIGNAL NOTIFICATIONS ── */
#floatBox{position:fixed;top:16px;right:16px;z-index:99990;display:flex;flex-direction:column;gap:10px;pointer-events:none;max-width:300px;}
.fn{background:var(--bg2);border-radius:14px;padding:14px 16px;box-shadow:0 8px 32px rgba(0,0,0,.75);pointer-events:all;transform:translateX(340px);transition:transform .45s cubic-bezier(.34,1.2,.64,1),opacity .3s;opacity:0;min-width:270px;}
.fn.in{transform:translateX(0);opacity:1;}
.fn.out{transform:translateX(340px);opacity:0;}
.fn.long-fn{border-left:3px solid var(--green);border-top:1px solid rgba(52,211,153,.2);border-right:1px solid rgba(52,211,153,.08);border-bottom:1px solid rgba(52,211,153,.08);}
.fn.short-fn{border-left:3px solid var(--red);border-top:1px solid rgba(248,113,113,.2);border-right:1px solid rgba(248,113,113,.08);border-bottom:1px solid rgba(248,113,113,.08);}
.fn-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.fn-sym{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:var(--text);}
.fn-dir{font-size:13px;font-weight:800;font-family:'JetBrains Mono',monospace;}
.fn-dir.long{color:var(--green);} .fn-dir.short{color:var(--red);}
.fn-x{width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.06);border:none;color:var(--text3);cursor:pointer;font-size:10px;line-height:18px;text-align:center;transition:background .15s;}
.fn-x:hover{background:rgba(255,255,255,.14);}
.fn-row{display:flex;gap:12px;flex-wrap:wrap;font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--text3);margin-bottom:7px;}
.fn-row b{color:var(--text);}
.fn-act{font-size:9px;font-weight:700;letter-spacing:.8px;padding:3px 9px;border-radius:5px;font-family:'JetBrains Mono',monospace;}
.fn-act.enter{background:rgba(52,211,153,.1);color:var(--green);border:1px solid rgba(52,211,153,.3);}
.fn-act.wait{background:rgba(251,191,36,.1);color:var(--gold);border:1px solid rgba(251,191,36,.3);}
.fn-act.avoid{background:rgba(248,113,113,.1);color:var(--red);border:1px solid rgba(248,113,113,.3);}
.fn-bar{height:2px;background:rgba(255,255,255,.05);border-radius:1px;margin-top:8px;overflow:hidden;}
.fn-prog{height:100%;border-radius:1px;}
.fn-prog.long{background:var(--green);} .fn-prog.short{background:var(--red);}

/* ── HEADER ── */
.header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;margin-bottom:14px;background:linear-gradient(135deg,rgba(124,106,247,.06),rgba(96,165,250,.04));border:1px solid var(--border);border-radius:16px;gap:10px;flex-wrap:wrap;backdrop-filter:blur(10px);}
.logo{display:flex;align-items:center;gap:12px;}
.logo-icon{width:40px;height:40px;border-radius:12px;flex-shrink:0;background:linear-gradient(135deg,var(--purple),var(--blue));display:flex;align-items:center;justify-content:center;font-size:20px;animation:lgPulse 3s ease-in-out infinite;}
@keyframes lgPulse{0%,100%{box-shadow:0 0 16px rgba(124,106,247,.3)}50%{box-shadow:0 0 32px rgba(124,106,247,.6)}}
.logo-title{font-size:18px;font-weight:700;letter-spacing:-.5px;}
.logo-title span{color:var(--purple2);}
.logo-sub{font-size:10px;color:var(--text3);margin-top:1px;}
.hdr-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.live-badge{display:flex;align-items:center;gap:6px;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.3);padding:5px 11px;border-radius:20px;font-size:10px;color:var(--green);font-family:'JetBrains Mono',monospace;}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:blink 1.2s ease-in-out infinite;}
@keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.7)}}
.clock{font-size:11px;color:var(--text3);min-width:76px;font-family:'JetBrains Mono',monospace;}
.scan-btn{padding:9px 18px;border-radius:10px;background:linear-gradient(135deg,rgba(124,106,247,.15),rgba(96,165,250,.1));border:1px solid rgba(124,106,247,.4);color:var(--purple2);cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;transition:all .25s;}
.scan-btn:hover:not(:disabled){box-shadow:0 0 20px rgba(124,106,247,.3);transform:translateY(-1px);}
.scan-btn:disabled{opacity:.5;cursor:not-allowed;}
.spin{display:inline-block;animation:spinA .8s linear infinite;}
@keyframes spinA{to{transform:rotate(360deg)}}

/* ── WS BADGE ── */
.ws-badge{display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:20px;font-size:9px;font-family:'JetBrains Mono',monospace;font-weight:600;border:1px solid;transition:all .3s;}
.ws-badge.connected{background:rgba(52,211,153,.08);border-color:rgba(52,211,153,.35);color:var(--green);}
.ws-badge.connecting{background:rgba(251,191,36,.08);border-color:rgba(251,191,36,.35);color:var(--gold);}
.ws-badge.disconnected{background:rgba(248,113,113,.08);border-color:rgba(248,113,113,.35);color:var(--red);}
.ws-dot{width:5px;height:5px;border-radius:50%;background:currentColor;animation:blink 1s infinite;}

/* ── STATUS BAR ── */
.status-bar{font-size:11px;padding:8px 15px;border-radius:10px;margin-bottom:12px;border:1px solid;display:none;font-family:'JetBrains Mono',monospace;}
.status-bar.show{display:block;}
.status-bar.live{background:rgba(52,211,153,.05);border-color:rgba(52,211,153,.25);color:var(--green);}
.status-bar.warn{background:rgba(251,191,36,.05);border-color:rgba(251,191,36,.25);color:var(--gold);}
.status-bar.err{background:rgba(248,113,113,.05);border-color:rgba(248,113,113,.25);color:var(--red);}
.status-bar.info{background:rgba(124,106,247,.05);border-color:rgba(124,106,247,.25);color:var(--purple2);}

/* ── SYM BAR ── */
.sym-bar{display:flex;gap:7px;margin-bottom:12px;flex-wrap:wrap;align-items:center;}
.sym-btn{padding:7px 14px;border-radius:9px;border:1px solid var(--border);background:var(--bg2);color:var(--text2);cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:11px;transition:all .18s;font-weight:500;}
.sym-btn:hover{border-color:var(--blue2);color:var(--blue);}
.sym-btn.active{background:rgba(124,106,247,.12);border-color:rgba(124,106,247,.5);color:var(--purple2);}
.tf-group{display:flex;gap:4px;margin-left:auto;}
.tf-btn{padding:6px 11px;border-radius:7px;border:1px solid var(--border);background:transparent;color:var(--text3);cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:10px;transition:all .18s;}
.tf-btn:hover{border-color:var(--blue);color:var(--blue);}
.tf-btn.active{background:rgba(96,165,250,.12);border-color:rgba(96,165,250,.4);color:var(--blue);}
.sym-search-wrap{position:relative;flex:1;min-width:180px;}
#symSearch{width:100%;padding:7px 13px;border-radius:9px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-family:'JetBrains Mono',monospace;font-size:11px;outline:none;transition:border .2s;}
#symSearch:focus{border-color:rgba(124,106,247,.5);}
#symDropdown{display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:500;background:var(--bg2);border:1px solid var(--border2);border-radius:10px;max-height:220px;overflow-y:auto;box-shadow:0 16px 48px rgba(0,0,0,.8);}
.dd-item{padding:8px 14px;cursor:pointer;font-size:11px;font-family:'JetBrains Mono',monospace;border-bottom:1px solid rgba(42,51,71,.5);color:var(--text2);transition:all .12s;}
.dd-item:hover{background:rgba(124,106,247,.1);color:var(--purple2);}
.dd-item:last-child{border-bottom:none;}

/* ── MARKET MOVERS ── */
.gl-section{margin-bottom:12px;}
.gl-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px;}
.gl-tabs{display:flex;gap:6px;}
.gl-tab{padding:6px 16px;border-radius:8px;font-size:11px;cursor:pointer;border:1px solid var(--border);background:var(--bg2);color:var(--text3);font-family:'JetBrains Mono',monospace;font-weight:600;transition:all .2s;}
.gl-tab.active-g{background:rgba(52,211,153,.1);border-color:rgba(52,211,153,.4);color:var(--green);}
.gl-tab.active-l{background:rgba(248,113,113,.1);border-color:rgba(248,113,113,.4);color:var(--red);}
.gl-tab.active-v{background:rgba(124,106,247,.1);border-color:rgba(124,106,247,.4);color:var(--purple2);}
.gl-refresh{padding:5px 12px;border-radius:7px;background:rgba(124,106,247,.08);border:1px solid rgba(124,106,247,.25);color:var(--purple2);cursor:pointer;font-size:10px;font-family:'JetBrains Mono',monospace;transition:all .2s;}
.gl-refresh:hover{border-color:var(--purple2);}
.gl-refresh:disabled{opacity:.5;cursor:not-allowed;}
.gl-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;}
.gl-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:11px 13px;cursor:pointer;transition:all .2s;position:relative;}
.gl-card.gain{border-color:rgba(52,211,153,.25);}
.gl-card.gain:hover{border-color:rgba(52,211,153,.5);transform:translateY(-2px);}
.gl-card.loss{border-color:rgba(248,113,113,.25);}
.gl-card.loss:hover{border-color:rgba(248,113,113,.5);transform:translateY(-2px);}
.gl-card.vol-top{border-color:rgba(124,106,247,.25);}
.gl-card.vol-top:hover{border-color:rgba(124,106,247,.5);transform:translateY(-2px);}
.gl-rank{position:absolute;top:7px;right:9px;font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;}
.gl-sym{font-size:13px;font-weight:700;color:var(--text);font-family:'JetBrains Mono',monospace;margin-bottom:3px;}
.gl-price{font-size:10px;color:var(--text2);font-family:'JetBrains Mono',monospace;margin-bottom:4px;}
.gl-pct{font-size:15px;font-weight:800;font-family:'JetBrains Mono',monospace;}
.gl-pct.g{color:var(--green);} .gl-pct.r{color:var(--red);} .gl-pct.p{color:var(--purple2);}
.gl-vol{font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:3px;}
.gl-sig-badge{font-size:8px;padding:2px 6px;border-radius:4px;font-weight:700;margin-top:5px;display:inline-block;font-family:'JetBrains Mono',monospace;}
.gl-sig-badge.buy{background:rgba(52,211,153,.15);color:var(--green);border:1px solid rgba(52,211,153,.3);}
.gl-sig-badge.sell{background:rgba(248,113,113,.15);color:var(--red);border:1px solid rgba(248,113,113,.3);}
.gl-loading{display:flex;align-items:center;justify-content:center;height:80px;color:var(--text3);font-size:11px;font-family:'JetBrains Mono',monospace;gap:8px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;}

/* ── MKT STRIP ── */
.mkt-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px;}
.mkt-tile{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;}
.mkt-tile-lbl{font-size:9px;color:var(--text3);letter-spacing:1.2px;text-transform:uppercase;margin-bottom:5px;font-family:'JetBrains Mono',monospace;}
.mkt-tile-val{font-size:16px;font-weight:700;color:var(--text);}
.mkt-tile-sub{font-size:9px;margin-top:3px;font-family:'JetBrains Mono',monospace;color:var(--text3);}

/* ── TREND BAR ── */
.trend-bar{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:12px 15px;margin-bottom:12px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.trend-tag{padding:5px 13px;border-radius:20px;font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace;}
.trend-tag.up{background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.3);color:var(--green);}
.trend-tag.dn{background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.3);color:var(--red);}
.trend-tag.side{background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.3);color:var(--gold);}
.trend-detail{font-size:11px;color:var(--text2);}
.trend-sep{flex:1;}
.vol-pill{padding:5px 12px;border-radius:20px;font-size:10px;font-family:'JetBrains Mono',monospace;font-weight:600;}
.vol-pill.hi{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);color:var(--red);}
.vol-pill.md{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.25);color:var(--gold);}
.vol-pill.lo{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.25);color:var(--green);}

/* ── MAIN GRID ── */
.main-grid{display:grid;grid-template-columns:1fr 300px;gap:12px;margin-bottom:12px;}
.chart-panel{background:var(--bg2);border:1px solid var(--border);border-radius:16px;overflow:hidden;}
.chart-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px;}
.sym-name{font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--text2);font-weight:600;}
.price-big{font-size:26px;font-weight:700;letter-spacing:-1px;font-family:'Inter',sans-serif;transition:color .3s;}
.price-big.flash-up{color:var(--green)!important;}
.price-big.flash-dn{color:var(--red)!important;}
.price-chg{font-size:12px;padding:3px 8px;border-radius:6px;margin-left:6px;font-family:'JetBrains Mono',monospace;font-weight:600;}
.price-chg.up{background:rgba(52,211,153,.12);color:var(--green);}
.price-chg.dn{background:rgba(248,113,113,.12);color:var(--red);}
.hl-info{display:flex;gap:16px;font-size:10px;font-family:'JetBrains Mono',monospace;}
.chart-tabs{display:flex;gap:4px;}
.chart-tab{padding:4px 10px;border-radius:6px;font-size:10px;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--text3);transition:all .15s;font-family:'JetBrains Mono',monospace;}
.chart-tab.active{background:rgba(124,106,247,.12);border-color:rgba(124,106,247,.4);color:var(--purple2);}

/* ── AI SIGNAL STRIP (below chart header, above candles) ── */
.sig-strip{display:flex;align-items:center;gap:14px;padding:7px 16px;background:rgba(15,17,23,.6);border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace;font-size:10px;flex-wrap:wrap;}
.sig-strip-lbl{color:var(--text3);letter-spacing:1.2px;font-size:9px;}
.sig-strip-dir{font-size:13px;font-weight:800;}
.sig-strip-dir.long{color:var(--green);} .sig-strip-dir.short{color:var(--red);}
.sig-strip-conf{color:var(--text2);}
.sig-strip-action{padding:2px 8px;border-radius:4px;font-size:9px;font-weight:700;}
.sig-strip-action.enter{background:rgba(52,211,153,.1);color:var(--green);border:1px solid rgba(52,211,153,.3);}
.sig-strip-action.wait{background:rgba(251,191,36,.1);color:var(--gold);border:1px solid rgba(251,191,36,.3);}
.sig-strip-action.avoid{background:rgba(248,113,113,.1);color:var(--red);border:1px solid rgba(248,113,113,.3);}
.sig-strip-score{color:var(--text3);margin-left:auto;font-size:9px;}

.chart-body{padding:10px;}
#mainChart{width:100%!important;height:520px!important;cursor:crosshair;}

/* ── SIDE PANEL ── */
.side-panel{display:flex;flex-direction:column;gap:10px;}
.pbox{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:14px;}
.pttl{font-size:10px;color:var(--text3);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;font-family:'JetBrains Mono',monospace;font-weight:600;display:flex;align-items:center;gap:6px;}
.pttl::before{content:'';display:block;width:3px;height:10px;background:var(--purple);border-radius:2px;}

/* ── SIGNAL CARD ── */
.sig-card{background:var(--bg2);border-radius:14px;overflow:hidden;border:1px solid var(--border);transition:all .3s;}
.sig-card.long-s{border-color:rgba(52,211,153,.3);box-shadow:0 0 24px rgba(52,211,153,.05);}
.sig-card.short-s{border-color:rgba(248,113,113,.3);box-shadow:0 0 24px rgba(248,113,113,.05);}
.sc-hdr{padding:13px 15px;}
.sc-hdr.long{background:linear-gradient(135deg,rgba(52,211,153,.1),rgba(52,211,153,.03));}
.sc-hdr.short{background:linear-gradient(135deg,rgba(248,113,113,.1),rgba(248,113,113,.03));}
.sc-sub{font-size:9px;color:var(--text3);letter-spacing:1.5px;margin-bottom:3px;font-family:'JetBrains Mono',monospace;}
.sc-dir{font-size:17px;font-weight:700;}
.sc-dir.long{color:var(--green);} .sc-dir.short{color:var(--red);}
.sc-badge{font-size:9px;padding:4px 9px;border-radius:20px;font-weight:600;letter-spacing:1px;font-family:'JetBrains Mono',monospace;}
.sc-badge.strong{background:rgba(251,191,36,.12);color:var(--gold);border:1px solid rgba(251,191,36,.3);}
.sc-badge.moderate{background:rgba(96,165,250,.12);color:var(--blue);border:1px solid rgba(96,165,250,.3);}
.sc-badge.weak{background:rgba(248,113,113,.12);color:var(--red);border:1px solid rgba(248,113,113,.3);}
.sc-body{padding:13px 15px;}
.conf-row{display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:5px;font-family:'JetBrains Mono',monospace;}
.conf-track{height:5px;background:rgba(255,255,255,.04);border-radius:3px;overflow:hidden;margin-bottom:10px;}
.conf-fill{height:100%;border-radius:3px;transition:width 1s ease;}
.conf-fill.hi{background:linear-gradient(90deg,var(--green),var(--green2));}
.conf-fill.md{background:linear-gradient(90deg,var(--gold),var(--gold2));}
.conf-fill.lo{background:linear-gradient(90deg,var(--red),var(--red2));}
.sr{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
.sk{color:var(--text3);font-size:10px;font-family:'JetBrains Mono',monospace;}
.sv{font-weight:600;font-family:'JetBrains Mono',monospace;font-size:11px;}
.sv.g{color:var(--green);} .sv.r{color:var(--red);} .sv.gold{color:var(--gold);} .sv.w{color:var(--text);}
.action-badge{display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;border-radius:10px;margin-top:10px;font-weight:700;font-size:12px;font-family:'JetBrains Mono',monospace;}
.action-badge.enter{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:var(--green);}
.action-badge.wait{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);color:var(--gold);}
.action-badge.avoid{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.3);color:var(--red);}

/* ── GAUGE ── */
.gauge-wrap{display:flex;justify-content:center;height:80px;}
#gaugeCanvas{max-width:150px;}
.gauge-lbl{text-align:center;font-size:9px;color:var(--text3);margin-top:5px;font-family:'JetBrains Mono',monospace;letter-spacing:1px;}
.gauge-val{text-align:center;font-size:18px;font-weight:700;margin-top:3px;}
.gauge-val.bull{color:var(--green);} .gauge-val.bear{color:var(--red);} .gauge-val.neut{color:var(--gold);}

/* ── PATTERNS ── */
.pat-list{display:flex;flex-direction:column;gap:5px;}
.pat-item{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border-radius:8px;border:1px solid var(--border);background:rgba(255,255,255,.015);}
.pat-name{font-size:10px;color:var(--text2);}
.pat-type{font-size:9px;padding:2px 7px;border-radius:6px;font-weight:600;font-family:'JetBrains Mono',monospace;}
.pat-type.bull{background:rgba(52,211,153,.12);color:var(--green);}
.pat-type.bear{background:rgba(248,113,113,.12);color:var(--red);}
.pat-str{font-size:9px;color:var(--text3);}

/* ── INDICATORS ── */
.ind-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.ind-item{background:rgba(255,255,255,.015);border:1px solid var(--border);border-radius:10px;padding:10px 12px;}
.ind-name{font-size:8px;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;font-family:'JetBrains Mono',monospace;}
.ind-val{font-size:14px;font-weight:700;font-family:'JetBrains Mono',monospace;}
.ind-sig{font-size:9px;margin-top:3px;font-family:'JetBrains Mono',monospace;}
.bull{color:var(--green);} .bear{color:var(--red);} .neut{color:var(--gold);}

/* ── MINI CHARTS ── */
.mini-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px;}
.mpanel{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:13px;}
#rsiChart,#macdChart,#volChart{width:100%!important;height:90px!important;}

/* ── TRADE PLAN ── */
.trade-plan{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:15px;margin-bottom:12px;}
.plan-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px;}
.plan-item{padding:11px;border-radius:10px;text-align:center;border:1px solid var(--border);}
.pi-ent{background:rgba(96,165,250,.04);border-color:rgba(96,165,250,.2);}
.pi-tp1{background:rgba(52,211,153,.03);border-color:rgba(52,211,153,.2);}
.pi-tp2{background:rgba(52,211,153,.05);border-color:rgba(52,211,153,.25);}
.pi-sl{background:rgba(248,113,113,.03);border-color:rgba(248,113,113,.2);}
.pi-lbl{font-size:8px;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;font-family:'JetBrains Mono',monospace;}
.pi-price{font-size:15px;font-weight:700;font-family:'JetBrains Mono',monospace;}
.pi-pct{font-size:9px;margin-top:3px;font-family:'JetBrains Mono',monospace;}
.tips-box{margin-top:12px;padding:10px 13px;background:rgba(251,191,36,.04);border:1px solid rgba(251,191,36,.15);border-radius:10px;}
.tips-ttl{font-size:9px;color:var(--gold);font-weight:600;margin-bottom:5px;font-family:'JetBrains Mono',monospace;}
.tips-txt{font-size:9px;color:var(--text3);line-height:1.9;}

/* ── ALERTS ── */
.alert-panel{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:15px;margin-bottom:12px;}
.alert-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px;}
.alert-item{display:flex;align-items:center;justify-content:space-between;padding:9px 12px;border-radius:9px;border:1px solid var(--border);background:rgba(255,255,255,.015);}
.alert-label{font-size:10px;color:var(--text2);}
.toggle{position:relative;width:36px;height:20px;cursor:pointer;}
.toggle input{opacity:0;width:0;height:0;}
.toggle-slider{position:absolute;inset:0;background:var(--border2);border-radius:10px;transition:.3s;}
.toggle-slider::before{content:'';position:absolute;width:14px;height:14px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.3s;}
.toggle input:checked+.toggle-slider{background:var(--purple);}
.toggle input:checked+.toggle-slider::before{transform:translateX(16px);}


/* ── TRADE STATS PANEL ── */
.stats-panel{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:12px;}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px;}
.stat-box{background:rgba(255,255,255,.015);border:1px solid var(--border);border-radius:10px;padding:11px 13px;text-align:center;}
.stat-lbl{font-size:8px;color:var(--text3);letter-spacing:1.2px;text-transform:uppercase;font-family:'JetBrains Mono',monospace;margin-bottom:4px;}
.stat-val{font-size:20px;font-weight:800;font-family:'JetBrains Mono',monospace;}
.stat-sub{font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:3px;}
.stat-val.total{color:var(--blue);}
.stat-val.wins{color:var(--green);}
.stat-val.loss{color:var(--red);}
.stat-val.wr{color:var(--gold);}
.trade-log{margin-top:10px;max-height:160px;overflow-y:auto;}
.trade-row{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:8px;border-bottom:1px solid rgba(42,51,71,.5);font-family:'JetBrains Mono',monospace;font-size:10px;transition:background .15s;}
.trade-row:hover{background:rgba(255,255,255,.03);}
.tr-time{color:var(--text3);font-size:9px;min-width:50px;}
.tr-sym{color:var(--text);font-weight:600;min-width:80px;}
.tr-dir{min-width:50px;}
.tr-entry{color:var(--text2);min-width:80px;}
.tr-result{font-weight:700;margin-left:auto;}
.tr-result.win{color:var(--green);}
.tr-result.loss{color:var(--red);}
.tr-result.open{color:var(--gold);}
.no-trades{color:var(--text3);font-size:11px;text-align:center;padding:16px;font-family:'JetBrains Mono',monospace;}
.stat-actions{display:flex;gap:8px;margin-top:10px;}
.stat-btn{padding:7px 14px;border-radius:8px;font-size:10px;font-family:'JetBrains Mono',monospace;font-weight:600;cursor:pointer;border:1px solid;transition:all .2s;}
.stat-btn.enter-trade{background:rgba(52,211,153,.1);border-color:rgba(52,211,153,.3);color:var(--green);}
.stat-btn.enter-trade:hover{background:rgba(52,211,153,.2);}
.stat-btn.reset-stats{background:rgba(248,113,113,.08);border-color:rgba(248,113,113,.25);color:var(--red);}
.stat-btn.reset-stats:hover{background:rgba(248,113,113,.15);}

/* ── SIGNAL ALERT CARD (enhanced) ── */
.fn-enter-btn{width:100%;margin-top:8px;padding:8px;border-radius:8px;background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.4);color:var(--green);cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.8px;transition:background .2s;}
.fn-enter-btn:hover{background:rgba(52,211,153,.28);}
.fn-short-btn{width:100%;margin-top:8px;padding:8px;border-radius:8px;background:rgba(248,113,113,.15);border:1px solid rgba(248,113,113,.4);color:var(--red);cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.8px;transition:background .2s;}
.fn-short-btn:hover{background:rgba(248,113,113,.28);}
.fn-rr{font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:4px;text-align:center;}

/* ── MULTI-PAIR SCANNER ── */
.scanner-panel{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:12px;}
.scanner-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:7px;margin-top:10px;max-height:320px;overflow-y:auto;}
.scan-card{background:rgba(255,255,255,.015);border:1px solid var(--border);border-radius:9px;padding:9px 11px;cursor:pointer;transition:all .2s;}
.scan-card:hover{transform:translateY(-2px);border-color:var(--purple);}
.scan-card.enter-signal{border-color:rgba(52,211,153,.5);background:rgba(52,211,153,.05);}
.scan-card.short-signal{border-color:rgba(248,113,113,.5);background:rgba(248,113,113,.05);}
.sc-pair{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:var(--text);}
.sc-pct{font-family:'JetBrains Mono',monospace;font-size:10px;}
.sc-action{font-size:8px;font-weight:700;font-family:'JetBrains Mono',monospace;margin-top:3px;padding:2px 6px;border-radius:4px;display:inline-block;}
.sc-action.enter{background:rgba(52,211,153,.15);color:var(--green);}
.sc-action.short{background:rgba(248,113,113,.15);color:var(--red);}
.sc-action.wait{background:rgba(251,191,36,.1);color:var(--gold);}
.sc-conf{font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;}
.scanner-running{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text3);font-family:'JetBrains Mono',monospace;padding:8px 0;}

/* ── NEWS / DISCLAIMER ── */
.news-bar{background:rgba(251,191,36,.04);border:1px solid rgba(251,191,36,.15);border-radius:10px;padding:8px 13px;margin-bottom:10px;display:flex;align-items:center;gap:10px;overflow:hidden;}
.news-lbl{font-size:10px;color:var(--gold);white-space:nowrap;font-weight:700;letter-spacing:1px;font-family:'JetBrains Mono',monospace;}
.news-txt{font-size:10px;color:var(--text3);white-space:nowrap;animation:newsTick 55s linear infinite;}
@keyframes newsTick{0%{transform:translateX(100%)}100%{transform:translateX(-300%)}}
.disclaimer{padding:10px 13px;background:rgba(248,113,113,.03);border:1px solid rgba(248,113,113,.15);border-radius:10px;font-size:9px;color:var(--text3);line-height:1.8;margin-bottom:12px;}

/* ── NOTIF BAR ── */
#notifBar{display:none;position:sticky;top:0;z-index:199;background:rgba(251,191,36,.06);border-bottom:1px solid rgba(251,191,36,.2);padding:9px 16px;justify-content:space-between;align-items:center;gap:10px;}
#notifBar.show{display:flex;}
.nb-text{font-size:12px;color:var(--gold);}
.nb-btn{padding:6px 14px;border-radius:7px;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);color:var(--gold);cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;}

/* ── RESPONSIVE ── */
@media(max-width:1200px){.gl-grid{grid-template-columns:repeat(4,1fr);}.stats-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:1100px){.main-grid{grid-template-columns:1fr;}.ind-grid{grid-template-columns:repeat(2,1fr);}.plan-grid{grid-template-columns:repeat(2,1fr);}.mini-grid{grid-template-columns:1fr 1fr;}.mkt-strip{grid-template-columns:repeat(2,1fr);}.gl-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:700px){.gl-grid{grid-template-columns:repeat(2,1fr);}.stats-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:600px){.app{padding:9px;}.tf-group{display:none;}.mini-grid{grid-template-columns:1fr;}.ind-grid{grid-template-columns:repeat(2,1fr);}.alert-grid{grid-template-columns:1fr;}.live-badge,.clock{display:none;}.mkt-strip{grid-template-columns:repeat(2,1fr);}.gl-grid{grid-template-columns:repeat(2,1fr);}.stats-grid{grid-template-columns:repeat(2,1fr);}}
</style>
</head>
<body>
<div id="notifBar">
  <div class="nb-text">🔔 <b>Notifications Enable کریں</b> — کوئی signal miss نہ ہو</div>
  <button class="nb-btn" onclick="requestNotifPermission()">Allow</button>
</div>
<div id="toast"></div>
<div id="floatBox"></div>

<div class="app">
<!-- HEADER -->
<div class="header">
  <div class="logo">
    <div class="logo-icon">🌸</div>
    <div>
      <div class="logo-title">Bloom<span>Traders</span></div>
      <div class="logo-sub">AI-Powered Signal Engine • Real-Time Analysis</div>
      <div style="font-size:9px;color:var(--purple2);margin-top:2px;font-family:'JetBrains Mono',monospace;opacity:.7;">Made by Hassan Raza</div>
    </div>
    <div id="authUserBar" style="display:flex;align-items:center;gap:10px;padding:6px 10px;background:rgba(124,106,247,.06);border:1px solid rgba(124,106,247,.15);border-radius:10px;"></div>
    </div>
  </div>
  <div class="hdr-right">
    <div class="ws-badge disconnected" id="wsBadge"><div class="ws-dot"></div><span id="wsLabel">WS OFF</span></div>
    <div class="live-badge"><div class="live-dot"></div>LIVE</div>
    <span class="clock" id="clock">--:--:-- UTC</span>
    <button class="theme-icon" id="themeBtn" onclick="toggleTheme()" title="Light/Dark Mode">🌙</button>
    <button class="scan-btn" id="scanBtn" onclick="runScan()">🔍 SCAN</button>
    <button class="scan-btn" style="background:rgba(52,211,153,.08);border-color:rgba(52,211,153,.3);color:var(--green);" onclick="requestNotifPermission()">🔔</button>
  </div>
</div>

<!-- STATUS -->
<div class="status-bar" id="statusBar"></div>

<!-- SYM BAR -->
<div class="sym-bar">
  <button class="sym-btn active" onclick="quickSym(this,'BTC/USDT')">₿ BTC</button>
  <button class="sym-btn" onclick="quickSym(this,'ETH/USDT')">⬡ ETH</button>
  <button class="sym-btn" onclick="quickSym(this,'BNB/USDT')">◈ BNB</button>
  <button class="sym-btn" onclick="quickSym(this,'SOL/USDT')">◎ SOL</button>
  <button class="sym-btn" onclick="quickSym(this,'XRP/USDT')">✕ XRP</button>
  <button class="sym-btn" onclick="quickSym(this,'DOGE/USDT')">🐕 DOGE</button>
  <button class="sym-btn" onclick="quickSym(this,'SUI/USDT')">SUI</button>
  <button class="sym-btn" onclick="quickSym(this,'PEPE/USDT')">🐸 PEPE</button>
  <button class="sym-btn" onclick="quickSym(this,'AVAX/USDT')">🏔 AVAX</button>
  <button class="sym-btn" onclick="quickSym(this,'LINK/USDT')">🔗 LINK</button>
  <button class="sym-btn" onclick="quickSym(this,'ADA/USDT')">ADA</button>
  <button class="sym-btn" onclick="quickSym(this,'SHIB/USDT')">🐕 SHIB</button>
  <div class="sym-search-wrap">
    <input id="symSearch" type="text" placeholder="🔍 Koi bhi pair search karo..." autocomplete="off"
      oninput="filterSyms()" onfocus="openDd()" onblur="setTimeout(closeDd,200)"/>
    <div id="symDropdown"></div>
  </div>
  <div class="tf-group">
    <button class="tf-btn" onclick="setTF(this,'1m')">1m</button>
    <button class="tf-btn" onclick="setTF(this,'5m')">5m</button>
    <button class="tf-btn" onclick="setTF(this,'15m')">15m</button>
    <button class="tf-btn" onclick="setTF(this,'30m')">30m</button>
    <button class="tf-btn active" onclick="setTF(this,'1h')">1h</button>
    <button class="tf-btn" onclick="setTF(this,'4h')">4h</button>
    <button class="tf-btn" onclick="setTF(this,'1D')">1D</button>
  </div>
</div>

<!-- MARKET MOVERS -->
<div class="gl-section">
  <div class="gl-header">
    <div style="display:flex;align-items:center;gap:10px;">
      <div class="pttl" style="margin-bottom:0;">📊 Market Movers</div>
      <span id="glLastUpdate" style="font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;"></span>
    </div>
    <div style="display:flex;gap:8px;align-items:center;">
      <div class="gl-tabs">
        <button class="gl-tab active-g" id="tabGain" onclick="showGainers()">🚀 Gainers</button>
        <button class="gl-tab" id="tabLoss" onclick="showLosers()">📉 Losers</button>
        <button class="gl-tab" id="tabVol" onclick="showTopVol()">🔥 Volume</button>
      </div>
      <button class="gl-refresh" id="glRefreshBtn" onclick="loadGainersLosers(true)">↺ Refresh</button>
    </div>
  </div>
  <div id="glContainer"><div class="gl-loading"><span class="spin">⟳</span> Binance data loading...</div></div>
</div>


<!-- MULTI-PAIR SIGNAL SCANNER -->
<div class="scanner-panel">
  <div class="pttl">⚡ Live Signal Scanner — تمام Pairs</div>
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
    <div class="scanner-running" id="scannerStatus"><span class="spin" id="scannerSpinner" style="display:none">⟳</span><span id="scannerTxt">Scan کریں — تمام pairs کے live signals یہاں آئیں گے</span></div>
    <div style="display:flex;gap:8px;">
      <button class="stat-btn enter-trade" style="padding:7px 16px;" onclick="runMultiScan()">⚡ Scan All Pairs</button>
    </div>
  </div>
  <div class="scanner-grid" id="scannerGrid">
    <div style="color:var(--text3);font-size:11px;font-family:'JetBrains Mono',monospace;padding:20px;grid-column:1/-1;text-align:center;">Scanner تیار — Scan کریں تاکہ signals یہاں آئیں</div>
  </div>
</div>

<!-- MKT STRIP -->
<div class="mkt-strip">
  <div class="mkt-tile"><div class="mkt-tile-lbl">Volatility</div><div class="mkt-tile-val" id="mktVol">--</div><div class="mkt-tile-sub" id="mktVolSub">ATR based</div></div>
  <div class="mkt-tile"><div class="mkt-tile-lbl">Session</div><div class="mkt-tile-val" id="mktSession">--</div><div class="mkt-tile-sub" id="mktSessionSub">Trading session</div></div>
  <div class="mkt-tile"><div class="mkt-tile-lbl">24h Range</div><div class="mkt-tile-val" id="mkt24h">--</div><div class="mkt-tile-sub" id="mkt24hSub">H-L spread</div></div>
  <div class="mkt-tile"><div class="mkt-tile-lbl">Market Bias</div><div class="mkt-tile-val" id="mktBias">--</div><div class="mkt-tile-sub" id="mktBiasSub">Multi-TF</div></div>
</div>

<!-- TREND BAR -->
<div class="trend-bar">
  <div class="trend-tag side" id="trendTag">◆ SIDEWAYS</div>
  <div class="trend-detail" id="trendDetail">Market scanning...</div>
  <div class="trend-sep"></div>
  <div class="vol-pill md" id="volPill">◈ MED VOL</div>
</div>

<!-- MAIN GRID -->
<div class="main-grid">
  <div class="chart-panel">
    <div class="chart-hdr">
      <div>
        <div class="sym-name" id="chartSymName">BTC/USDT</div>
        <div style="display:flex;align-items:baseline;gap:5px;margin-top:2px;">
          <div class="price-big" id="priceBig" style="color:var(--text)">--</div>
          <div class="price-chg up" id="priceChg">▲ 0.00%</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
        <div class="hl-info">
          <div><span style="color:var(--text3)">H: </span><span id="priceH" style="color:var(--green)">--</span></div>
          <div><span style="color:var(--text3)">L: </span><span id="priceL" style="color:var(--red)">--</span></div>
          <div><span style="color:var(--text3)">ATR: </span><span id="atrDisp" style="color:var(--blue)">--</span></div>
        </div>
        <div class="chart-tabs">
          <button class="chart-tab active" onclick="switchChartType('candle',this)">🕯 Candles</button>
          <button class="chart-tab" onclick="switchChartType('line',this)">📈 Line</button>
          <button class="chart-tab" onclick="resetChartZoom()" title="Reset Zoom" style="padding:4px 8px;">⊞ Reset</button>
        </div>
      </div>
    </div>
    <!-- AI SIGNAL STRIP — below header, above candles, no overlap -->
    <div class="sig-strip">
      <span class="sig-strip-lbl">AI SIGNAL</span>
      <span class="sig-strip-dir long" id="ssDir">--</span>
      <span class="sig-strip-conf" id="ssConf">Conf: --%</span>
      <span class="sig-strip-action enter" id="ssAction">--</span>
      <span class="sig-strip-score" id="ssScore">Score: --</span>
    </div>
    <div class="chart-body">
      <canvas id="mainChart"></canvas>
      <div id="chartLegend" style="display:flex;gap:14px;padding:6px 8px 2px;flex-wrap:wrap;font-family:'JetBrains Mono',monospace;font-size:9px;align-items:center;">
        <span style="display:flex;align-items:center;gap:4px;color:var(--blue)"><span style="width:18px;height:2px;background:#60a5fa;display:inline-block;"></span>Entry</span>
        <span style="display:flex;align-items:center;gap:4px;color:var(--green)"><span style="width:18px;height:2px;background:#34d399;display:inline-block;border-top:2px dashed #34d399;"></span>TP</span>
        <span style="display:flex;align-items:center;gap:4px;color:var(--red)"><span style="width:18px;height:2px;background:#f87171;display:inline-block;border-top:2px dashed #f87171;"></span>SL</span>
        <span style="color:var(--text3);margin-left:auto;">🖱 Scroll=Zoom &nbsp; Drag=Pan</span>
      </div>
    </div>
  </div>

  <!-- SIDE PANEL -->
  <div class="side-panel">
    <div class="sig-card long-s" id="sigCard">
      <div class="sc-hdr long" id="scHdr">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div><div class="sc-sub">AI RECOMMENDATION</div><div class="sc-dir long" id="scDir">⬆ LONG POSITION</div></div>
          <div class="sc-badge strong" id="scBadge">STRONG</div>
        </div>
      </div>
      <div class="sc-body">
        <div class="conf-row"><span>Signal Confidence</span><span id="confPct">--%</span></div>
        <div class="conf-track"><div class="conf-fill hi" id="confFill" style="width:0%"></div></div>
        <div class="sr"><span class="sk">📍 Entry Zone</span><span class="sv w" id="entV">--</span></div>
        <div class="sr"><span class="sk">🎯 TP1</span><span class="sv g" id="tp1V">--</span></div>
        <div class="sr"><span class="sk">🏆 TP2</span><span class="sv g" id="tp2V">--</span></div>
        <div class="sr"><span class="sk">🛑 Stop Loss</span><span class="sv r" id="slV">--</span></div>
        <div class="sr"><span class="sk">⚖️ R/R Ratio</span><span class="sv gold" id="rrV">--</span></div>
        <div class="sr"><span class="sk">⏰ Timeframe</span><span class="sv w" id="tfV">15m</span></div>
        <div class="action-badge enter" id="actionBadge">✅ ENTER — Signal Confirm</div>
      </div>
    </div>
    <div class="pbox">
      <div class="pttl">Market Sentiment</div>
      <div class="gauge-wrap"><canvas id="gaugeCanvas"></canvas></div>
      <div class="gauge-lbl">OVERALL BIAS</div>
      <div class="gauge-val bull" id="gaugeVal">--</div>
    </div>
    <div class="pbox">
      <div class="pttl">Detected Patterns</div>
      <div class="pat-list" id="patList">
        <div class="pat-item"><span class="pat-name" style="color:var(--text3)">Scanning...</span></div>
      </div>
    </div>
    <div class="pbox">
      <div class="pttl">📐 Chart Patterns</div>
      <div class="pat-list" id="chartPatList">
        <div class="pat-item"><span class="pat-name" style="color:var(--text3)">Detecting...</span></div>
      </div>
    </div>
  </div>
</div>

<!-- SUPPLY & DEMAND ZONES -->
<div class="pbox" style="margin-bottom:12px;" id="sdPanel">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
    <div class="pttl" style="margin-bottom:0;">⚡ Supply & Demand Zones</div>
    <div style="font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;" id="sdSymLabel">--</div>
  </div>
  <div id="sdContent">
    <div style="color:var(--text3);font-size:11px;text-align:center;padding:16px;font-family:'JetBrains Mono',monospace;">Scan karo — S&D zones detect hongi</div>
  </div>
</div>

<!-- INDICATORS -->
<div class="pbox" style="margin-bottom:12px;">
  <div class="pttl">Technical Indicators</div>
  <div class="ind-grid">
    <div class="ind-item"><div class="ind-name">RSI (14)</div><div class="ind-val" id="iRSI">--</div><div class="ind-sig" id="iRSIs">--</div></div>
    <div class="ind-item"><div class="ind-name">MACD</div><div class="ind-val" id="iMACD">--</div><div class="ind-sig" id="iMACDs">--</div></div>
    <div class="ind-item"><div class="ind-name">MA 20/50</div><div class="ind-val" id="iMA">--</div><div class="ind-sig" id="iMAs">--</div></div>
    <div class="ind-item"><div class="ind-name">Bollinger</div><div class="ind-val" id="iBB">--</div><div class="ind-sig" id="iBBs">--</div></div>
    <div class="ind-item"><div class="ind-name">Stoch %K</div><div class="ind-val" id="iStoch">--</div><div class="ind-sig" id="iStochs">--</div></div>
    <div class="ind-item"><div class="ind-name">ATR</div><div class="ind-val" id="iATR" style="color:var(--blue)">--</div><div class="ind-sig" id="iATRs" style="color:var(--blue)">--</div></div>
    <div class="ind-item"><div class="ind-name">Volume</div><div class="ind-val" id="iVol">--</div><div class="ind-sig" id="iVols">--</div></div>
    <div class="ind-item"><div class="ind-name">EMA 200</div><div class="ind-val" id="iEMA">--</div><div class="ind-sig" id="iEMAs">--</div></div>
  </div>
</div>

<!-- MINI CHARTS -->
<div class="mini-grid">
  <div class="mpanel"><div class="pttl">RSI (14)</div><canvas id="rsiChart"></canvas></div>
  <div class="mpanel"><div class="pttl">MACD Histogram</div><canvas id="macdChart"></canvas></div>
  <div class="mpanel"><div class="pttl">Volume Bars</div><canvas id="volChart"></canvas></div>
</div>

<!-- TRADE PLAN -->
<div class="trade-plan">
  <div class="pttl">Full Trade Plan</div>
  <div class="plan-grid">
    <div class="plan-item pi-ent"><div class="pi-lbl">📍 Entry</div><div class="pi-price" id="pEntry" style="color:var(--blue)">--</div><div class="pi-pct" style="color:var(--text3)">Current zone</div></div>
    <div class="plan-item pi-tp1"><div class="pi-lbl">🎯 TP1</div><div class="pi-price" id="pTP1" style="color:var(--green)">--</div><div class="pi-pct" id="pTP1p" style="color:var(--green)">--</div></div>
    <div class="plan-item pi-tp2"><div class="pi-lbl">🏆 TP2</div><div class="pi-price" id="pTP2" style="color:var(--green)">--</div><div class="pi-pct" id="pTP2p" style="color:var(--green)">--</div></div>
    <div class="plan-item pi-sl"><div class="pi-lbl">🛑 Stop Loss</div><div class="pi-price" id="pSL" style="color:var(--red)">--</div><div class="pi-pct" id="pSLp" style="color:var(--red)">--</div></div>
  </div>
    <div class="tips-box">
      <div class="tips-ttl">⚠️ TRADE MANAGEMENT RULES</div>
      <div class="tips-txt">
        • ہر trade میں account کا زیادہ سے زیادہ 1–2% risk لیں &nbsp;• TP1 hit ہونے پر 50% position close کریں<br>
        • TP1 کے بعد Stop Loss کو breakeven پر shift کریں &nbsp;• Major news سے 30 منٹ پہلے trade avoid کریں<br>
        • صرف ENTER signal پر trade کریں — WAIT signal پر کوئی action نہ لیں
      </div>
    </div>
</div>

<!-- TRADE STATS PANEL -->
<div class="stats-panel">
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
    <div class="pttl" style="margin-bottom:0;">📊 آج کی Performance</div>
    <div style="font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;" id="statsDate">Today</div>
  </div>
  <div class="stats-grid">
    <div class="stat-box"><div class="stat-lbl">Total Trades</div><div class="stat-val total" id="stTotal">0</div><div class="stat-sub">آج کی trades</div></div>
    <div class="stat-box"><div class="stat-lbl">✅ Wins</div><div class="stat-val wins" id="stWins">0</div><div class="stat-sub">درست signal</div></div>
    <div class="stat-box"><div class="stat-lbl">❌ Losses</div><div class="stat-val loss" id="stLoss">0</div><div class="stat-sub">غلط signal</div></div>
    <div class="stat-box"><div class="stat-lbl">Win Rate</div><div class="stat-val wr" id="stWR">0%</div><div class="stat-sub">Accuracy</div></div>
  </div>
  <div class="stat-actions">
    <button class="stat-btn enter-trade" onclick="logCurrentTrade()">✅ Current Signal Trade Log Karo</button>
    <button class="stat-btn reset-stats" onclick="resetStats()">🗑 Reset</button>
  </div>
  <div class="trade-log" id="tradeLog">
    <div class="no-trades">ابھی کوئی trade نہیں — Signal پر click کریں یا "Log Trade" use کریں</div>
  </div>
</div>

<!-- ALERTS -->
<div class="alert-panel" id="alertPanel">
  <div class="pttl">🔔 Alert Settings</div>
  <div id="notifStatus" style="font-size:11px;color:var(--text3);margin-bottom:10px;font-family:'JetBrains Mono',monospace;">Status: Checking...</div>
  <div class="alert-grid">
    <div class="alert-item"><span class="alert-label">📊 Signal Alerts (LONG/SHORT)</span><label class="toggle"><input type="checkbox" id="togSignal" checked onchange="saveAlerts()"><span class="toggle-slider"></span></label></div>
    <div class="alert-item"><span class="alert-label">📈 Price Move ≥2%</span><label class="toggle"><input type="checkbox" id="togPrice" checked onchange="saveAlerts()"><span class="toggle-slider"></span></label></div>
    <div class="alert-item"><span class="alert-label">📉 RSI Extreme Levels</span><label class="toggle"><input type="checkbox" id="togRSI" checked onchange="saveAlerts()"><span class="toggle-slider"></span></label></div>
    <div class="alert-item"><span class="alert-label">⏰ Auto-scan (30s/60s)</span><label class="toggle"><input type="checkbox" id="togAuto" checked onchange="saveAlerts()"><span class="toggle-slider"></span></label></div>
    <div class="alert-item"><span class="alert-label">🔔 Floating Notifications</span><label class="toggle"><input type="checkbox" id="togFloat" checked onchange="saveAlerts()"><span class="toggle-slider"></span></label></div>
    <div class="alert-item"><span class="alert-label">🎯 Enter/Wait Signal</span><label class="toggle"><input type="checkbox" id="togAction" checked onchange="saveAlerts()"><span class="toggle-slider"></span></label></div>
  </div>
  <button id="notifEnableBtn" onclick="requestNotifPermission()" style="margin-top:12px;width:100%;padding:11px;border-radius:10px;background:linear-gradient(135deg,rgba(124,106,247,.12),rgba(96,165,250,.08));border:1px solid rgba(124,106,247,.35);color:var(--purple2);cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:11px;display:none;font-weight:600;">
    🔔 Browser Notifications Enable Karo
  </button>
</div>

<!-- NEWS -->
<div class="news-bar">
  <div class="news-lbl">📰 LIVE</div>
  <div class="news-txt" id="newsTicker">🌸 BloomTraders v9 • Real-Time Binance WebSocket • 200+ Crypto Pairs • AI Signal Engine • RSI • MACD • Bollinger Bands • Supply & Demand Zones • Chart Pattern Detection • ہمیشہ Stop Loss لگائیں</div>
</div>
<div class="disclaimer">
  <strong style="color:var(--red)">⚠️ Risk Disclaimer:</strong> BloomTraders صرف educational analysis tool ہے۔ Signals کو trade recommendation نہ سمجھیں۔ Crypto trading میں capital loss کا خطرہ ہے — ہمیشہ proper risk management کریں اور اپنی research کریں۔
</div>
</div><!-- .app -->

<script>
'use strict';
// ═══ AbortSignal.timeout polyfill ═══
if(!AbortSignal.timeout){
  AbortSignal.timeout=ms=>{const c=new AbortController();setTimeout(()=>c.abort(),ms);return c.signal;};
}

// ═══ STATE ═══
let curSym='BTC/USDT',curTF='15m',chartType='candle';
let charts={};
let isScanning=false,autoTimer=null;
let lastSignal=null,lastPrice=null,lastCandles=null;
let allTickerData=[],glMode='gain';
let wsConn=null,wsReconnTimer=null,wsActive=false;
let lastWsPrice=null;
const symCache={},tickerCache={};

// ═══ SYMBOL LIST ═══
const CRYPTO_LIST=[
  ['BTC',84000],['ETH',3200],['BNB',580],['SOL',170],['XRP',0.62],
  ['ADA',0.55],['DOGE',0.17],['AVAX',38],['TRX',0.12],['DOT',8],
  ['MATIC',0.85],['LINK',15],['TON',5.5],['NEAR',6],['ICP',12],['SHIB',0.000025],
  ['LTC',80],['BCH',450],['UNI',9],['APT',12],['XLM',0.12],['ATOM',10],
  ['ETC',25],['FIL',6],['ARB',1.2],['OP',2.8],['MKR',2800],['INJ',28],
  ['AAVE',110],['RUNE',5.5],['GRT',0.18],['ALGO',0.18],['FTM',0.7],
  ['THETA',1.4],['HBAR',0.09],['SEI',0.5],['SUI',1.5],['TIA',8],
  ['JUP',1.2],['WIF',2.5],['PEPE',0.000012],['BONK',0.000025],['FLOKI',0.00018],
  ['FET',2.3],['RENDER',7],['ORDI',45],['KAS',0.12],['BLUR',0.4],
  ['APE',1.5],['VET',0.03],['DASH',30],['ZEC',25],['NEO',13],
  ['CRV',0.45],['COMP',60],['ENS',18],['QNT',100],['DYDX',2.2],
  ['CHZ',0.1],['MAGIC',0.7],['GMT',0.2],['1INCH',0.45],['ANKR',0.04],
  ['CYBER',9],['MEME',0.03],['STRK',0.7],['ZK',0.18],['DOGS',0.0008],
  ['PNUT',0.5],['MOVE',0.7],['PENGU',0.04],['VIRTUAL',2.5],['TRUMP',10],
  ['WLD',1.8],['GMX',25],['LDO',1.2],['RNDR',7],['ROSE',0.06],
  ['KAVA',0.7],['IOTA',0.22],['JTO',2.5],['STX',2.2],
  ['IMX',1.9],['SAND',0.6],['MANA',0.55],['AXS',8],['NOT',0.012],
  ['IO',4.5],['ZRO',3.5],['EIGEN',2.8],['NEIRO',0.0009],['ACT',0.1],
  ['ME',3.2],['USUAL',0.8],['AI16Z',0.5],['AIXBT',0.25],['LAYER',0.8],
  ['RAY',0.8],['PYTH',0.45],['W',0.5],['BOME',0.012],['SSV',18],
  ['XMR',160],['ZETA',0.8],['PEOPLE',0.04],['GNS',2.5],['RPL',8],
  // Additional Binance pairs
  ['WOO',0.2],['JASMY',0.015],['LUNC',0.00012],['HOT',0.003],['GALA',0.035],
  ['CHR',0.15],['OCEAN',0.45],['BAND',1.5],['COTI',0.07],['CELR',0.02],
  ['ONT',0.18],['ZIL',0.02],['ICX',0.18],['RVN',0.025],['SC',0.006],
  ['DGB',0.008],['XVG',0.006],['LSK',0.85],['WAVES',1.5],['GLM',0.22],
  ['CTSI',0.12],['REQ',0.08],['OGN',0.1],['BAL',2.5],['BADGER',2.8],
  ['REN',0.045],['ALPHA',0.045],['PERP',0.7],['DENT',0.0008],['IOTX',0.04],
  ['XEM',0.025],['STMX',0.007],['BEL',0.7],['WING',5.5],['TWT',0.9],
  ['SFP',0.55],['PAXG',2600],['BAKE',0.2],['BURGER',1.2],['XVS',7],
  ['CREAM',15],['ALPACA',0.08],['NULS',0.25],['TROY',0.004],['FOR',0.02],
  // MEXC exclusive / new listings
  ['AGLD',0.7],['MBOX',0.18],['PHA',0.1],['VOXEL',0.12],['RARE',0.08],
  ['DUSK',0.18],['POLS',0.22],['LINA',0.008],['REEF',0.003],['PROS',0.25],
  ['FLUX',0.5],['ERN',1.2],['HARD',0.08],['BETA',0.065],['FARM',35],
  ['TKO',0.25],['BZRX',0.045],['OOKI',0.002],['CHESS',0.12],['FORTH',3.5],
  ['RAD',1.5],['DF',0.035],['ACH',0.025],['ARDR',0.08],['SPARTA',0.03],
  ['SLP',0.002],['ATA',0.05],['XNO',0.65],['TOMO',0.8],['VITE',0.012],
  ['IDEX',0.04],['HIVE',0.3],['ELF',0.22],['OXT',0.06],['STPT',0.015],
  ['BNT',0.5],['SUPER',0.06],['MTL',1.1],['EPS',0.04],['VIDT',0.08],
  // Additional trending MEXC/Binance coins
  ['PORTAL',0.5],['PIXEL',0.35],['MYRO',0.18],['WEN',0.00015],['SATS',0.000004],
  ['1000SATS',0.00004],['BOBA',0.18],['ORN',0.7],['HIGH',1.2],['SXP',0.25],
  ['GTC',0.8],['WNXM',14],['BOND',1.8],['TLM',0.012],['ALICE',0.5],
  ['DODO',0.1],['CLV',0.025],['PUNDIX',0.35],['ROSE',0.06],['CFX',0.12],
  ['LOOKS',0.06],['SPELL',0.0004],['ILV',25],['YGG',0.35],['QUICK',0.06],
  ['GHST',0.7],['AGIX',0.22],['NMR',12],['RLC',1.2],['LPT',7],
  ['OMG',0.55],['SKL',0.035],['CVC',0.065],['IDEX',0.04],['WTC',0.35],
];
const SYMS={};
const _seen=new Set();
CRYPTO_LIST.forEach(([sym,base])=>{
  if(_seen.has(sym))return;_seen.add(sym);
  const vol=base>1000?0.016:base>100?0.022:base>1?0.03:base>0.01?0.04:0.05;
  SYMS[sym+'/USDT']={base,vol,binance:sym+'USDT'};
});
let ALL_SYM_KEYS=Object.keys(SYMS);

const TF_MINS={'1m':1,'5m':5,'15m':15,'30m':30,'1h':60,'4h':240,'1D':1440};
const TF_NEXT={'1m':'5m','5m':'15m','15m':'30m','30m':'1h','1h':'4h','4h':'1D','1D':'W'};
const BIN_TF={'1m':'1m','5m':'5m','15m':'15m','30m':'30m','1h':'1h','4h':'4h','1D':'1d'};

// ═══ HELPERS ═══
function showToast(msg,type='ok'){
  const t=document.getElementById('toast');if(!t)return;
  t.textContent=msg;t.className='show '+type;
  clearTimeout(t._t);t._t=setTimeout(()=>{t.className='';},3500);
}
function setStatus(msg,cls='info'){
  const el=document.getElementById('statusBar');if(!el)return;
  el.textContent=msg;el.className='status-bar show '+cls;
}
function sI(id,val){const e=document.getElementById(id);if(e)e.textContent=val;}
function sC(id,cls){const e=document.getElementById(id);if(e)e.className=cls;}
function fmt(v){
  if(v==null||isNaN(v)||!isFinite(v))return '--';
  if(v>=10000)return '$'+v.toLocaleString(undefined,{maximumFractionDigits:0});
  if(v>=1000)return '$'+v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  if(v>=100)return '$'+v.toFixed(2);
  if(v>=10)return '$'+v.toFixed(3);
  if(v>=1)return '$'+v.toFixed(4);
  if(v>=0.1)return '$'+v.toFixed(5);
  if(v>=0.01)return '$'+v.toFixed(5);
  if(v>=0.001)return '$'+v.toFixed(6);
  if(v>=0.0001)return '$'+v.toFixed(7);
  return '$'+v.toFixed(8);
}

// ═══ TRADE STATS SYSTEM ═══
let tradeStats={total:0,wins:0,losses:0,open:0,log:[]};
function loadStats(){
  try{const s=JSON.parse(localStorage.getItem('btStats')||'{}');
    const today=new Date().toDateString();
    if(s.date!==today){tradeStats={total:0,wins:0,losses:0,open:0,log:[],date:today};}
    else tradeStats=s;
  }catch{tradeStats={total:0,wins:0,losses:0,open:0,log:[],date:new Date().toDateString()};}
  renderStats();
}
function saveStats(){
  try{tradeStats.date=new Date().toDateString();localStorage.setItem('btStats',JSON.stringify(tradeStats));}catch(e){}
}
function renderStats(){
  const el=document.getElementById('stTotal');if(el)el.textContent=tradeStats.total;
  const ew=document.getElementById('stWins');if(ew)ew.textContent=tradeStats.wins;
  const el2=document.getElementById('stLoss');if(el2)el2.textContent=tradeStats.losses;
  const wr=tradeStats.total>0?Math.round(tradeStats.wins/tradeStats.total*100):0;
  const ewr=document.getElementById('stWR');if(ewr){ewr.textContent=wr+'%';ewr.style.color=wr>=60?'var(--green)':wr>=40?'var(--gold)':'var(--red)';}
  const log=document.getElementById('tradeLog');
  if(!log)return;
  if(!tradeStats.log||!tradeStats.log.length){
    log.innerHTML='<div class="no-trades">ابھی کوئی trade نہیں — Signal پر click کریں یا "Log Trade" use کریں</div>';return;
  }
  log.innerHTML=[...tradeStats.log].reverse().map(t=>`
    <div class="trade-row">
      <span class="tr-time">${t.time}</span>
      <span class="tr-sym">${t.sym}</span>
      <span class="tr-dir" style="color:${t.dir==='LONG'?'var(--green)':'var(--red)'}">${t.dir==='LONG'?'⬆':'⬇'} ${t.dir}</span>
      <span class="tr-entry">${t.entry}</span>
      <span class="tr-result ${t.result}">${t.result==='win'?'✅ WIN':t.result==='loss'?'❌ LOSS':'⏳ OPEN'}</span>
    </div>`).join('');
}
function logTradeEntry(sym,sig,result='open'){
  if(!tradeStats.log)tradeStats.log=[];
  const now=new Date();
  const time=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  // Check if already logged same pair in last 2 minutes
  const recent=tradeStats.log.find(t=>t.sym===sym&&t.result==='open'&&(now-new Date(t.ts))<120000);
  if(recent){showToast('⚠️ '+sym+' already open hai','err');return;}
  const entry={sym,dir:sig.isLong?'LONG':'SHORT',entry:fmt(sig.entry),
    tp1:fmt(sig.tp1),sl:fmt(sig.sl),conf:sig.conf,result,time,ts:now.toISOString()};
  tradeStats.log.push(entry);
  tradeStats.total++;
  if(result==='win')tradeStats.wins++;
  else if(result==='loss')tradeStats.losses++;
  else tradeStats.open++;
  saveStats();renderStats();
  showToast('📝 Trade logged: '+sym+' '+entry.dir,'ok');
}
function logCurrentTrade(){
  if(!lastSignal){showToast('⚠️ Pehle scan karo','err');return;}
  logTradeEntry(curSym,lastSignal);
}
function resetStats(){
  if(!confirm('Sab trades reset ho jayengi?'))return;
  tradeStats={total:0,wins:0,losses:0,open:0,log:[],date:new Date().toDateString()};
  saveStats();renderStats();showToast('🗑 Stats reset','info');
}
function markTradeResult(idx,result){
  if(!tradeStats.log[idx])return;
  const old=tradeStats.log[idx].result;
  if(old===result)return;
  if(old==='open')tradeStats.open=Math.max(0,tradeStats.open-1);
  else if(old==='win')tradeStats.wins=Math.max(0,tradeStats.wins-1);
  else if(old==='loss')tradeStats.losses=Math.max(0,tradeStats.losses-1);
  tradeStats.log[idx].result=result;
  if(result==='win')tradeStats.wins++;
  else if(result==='loss')tradeStats.losses++;
  else tradeStats.open++;
  saveStats();renderStats();
}

// ═══ FLOATING NOTIFICATIONS (Enhanced) ═══
let fnCount=0;
function showFloatNotif(sig,sym){
  const prefs=loadAlerts();
  if(!prefs.float)return;
  const box=document.getElementById('floatBox');if(!box)return;
  while(box.children.length>=4)dismissFN(box.firstChild,true);
  const id='fn'+(++fnCount);
  const isLong=sig.isLong;
  const isEnter=sig.action==='ENTER';
  const actCls=isEnter?'enter':sig.action==='CONFIRM'?'wait':'avoid';
  const actTxt=isEnter?'✅ ENTER NOW':sig.action==='CONFIRM'?'⏳ WAIT CONFIRM':'🚫 AVOID';
  const DURATION=isEnter?15000:9000; // ENTER signals stay longer
  const el=document.createElement('div');
  el.id=id;
  el.className='fn '+(isLong?'long-fn':'short-fn');
  const sigCopy=JSON.parse(JSON.stringify(sig));
  el.innerHTML=`
    <div class="fn-top">
      <span class="fn-sym">🌸 ${sym.replace('/USDT','')} / USDT</span>
      <span class="fn-dir ${isLong?'long':'short'}">${isLong?'⬆ LONG':'⬇ SHORT'}</span>
      <button class="fn-x" onclick="dismissFN(document.getElementById('${id}'))">✕</button>
    </div>
    <div class="fn-row">
      <span>Conf: <b>${sig.conf}%</b></span>
      <span>Entry: <b>${fmt(sig.entry)}</b></span>
      <span>TP1: <b style="color:var(--green)">${fmt(sig.tp1)}</b></span>
      <span>SL: <b style="color:var(--red)">${fmt(sig.sl)}</b></span>
    </div>
    <div class="fn-row"><span>Score: <b>${sig.score>0?'+':''}${sig.score}</b></span><span>R/R: <b>1:${sig.rr}</b></span><span>TF: <b>${curTF}</b></span></div>
    <div class="fn-act ${actCls}">${actTxt}</div>
    ${isEnter?`<button class="${isLong?'fn-enter-btn':'fn-short-btn'}" onclick="logTradeEntry('${sym}',${JSON.stringify(sigCopy)});dismissFN(document.getElementById('${id}'));selectSym('${sym}')">📝 ENTER LOG + CHART OPEN</button>
    <div class="fn-rr">TP1: ${fmt(sig.tp1)} | SL: ${fmt(sig.sl)} | R/R 1:${sig.rr}</div>`:''}
    <div class="fn-bar"><div class="fn-prog ${isLong?'long':'short'}" id="fp${id}" style="width:100%"></div></div>
  `;
  box.appendChild(el);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{el.classList.add('in');}));
  const pb=document.getElementById('fp'+id);
  if(pb){pb.style.transition=`width ${DURATION}ms linear`;setTimeout(()=>{pb.style.width='0%';},50);}
  el._t=setTimeout(()=>dismissFN(el),DURATION);
  // Sound alert for ENTER signals (if browser allows)
  if(isEnter){try{const ac=new(window.AudioContext||window.webkitAudioContext)();const osc=ac.createOscillator();const gain=ac.createGain();osc.connect(gain);gain.connect(ac.destination);osc.frequency.setValueAtTime(isLong?880:440,ac.currentTime);gain.gain.setValueAtTime(0.1,ac.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.3);osc.start();osc.stop(ac.currentTime+0.3);}catch(e){}}
}
function dismissFN(el,instant=false){
  if(!el||el._dismissed)return;
  el._dismissed=true;clearTimeout(el._t);
  if(instant){if(el.parentNode)el.parentNode.removeChild(el);return;}
  el.classList.remove('in');el.classList.add('out');
  setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el);},400);
}

// ═══ NOTIFICATIONS ═══
function checkNotifStatus(){
  const btn=document.getElementById('notifEnableBtn');
  const st=document.getElementById('notifStatus');if(!st)return;
  if(!('Notification' in window)){st.textContent='⚠️ Browser notifications support nahi karta';return;}
  if(Notification.permission==='granted'){
    st.innerHTML='<span style="color:var(--green)">✅ Notifications ON</span>';
    if(btn)btn.style.display='none';
    const bar=document.getElementById('notifBar');if(bar)bar.classList.remove('show');
  } else if(Notification.permission==='denied'){
    st.innerHTML='<span style="color:var(--red)">❌ Blocked — browser settings mein allow karo</span>';
    if(btn)btn.style.display='none';
  } else {
    st.textContent='🔔 Allow karo — signals milenge';
    if(btn)btn.style.display='block';
    const bar=document.getElementById('notifBar');if(bar)bar.classList.add('show');
  }
}
async function requestNotifPermission(){
  if(!('Notification' in window)){showToast('⚠️ Support nahi karta','err');return;}
  const p=await Notification.requestPermission();
  checkNotifStatus();
  if(p==='granted'){showToast('✅ Notifications ON!','ok');}
  else showToast('❌ Notifications blocked','err');
}
function sendNotif(title,body,tag='signal'){
  if(Notification.permission!=='granted')return;
  const p=loadAlerts();
  if(tag==='signal'&&!p.signal)return;
  if(tag==='price'&&!p.price)return;
  if(tag==='rsi'&&!p.rsi)return;
  try{new Notification(title,{body,tag,renotify:true});}catch(e){}
}
function saveAlerts(){
  try{
    localStorage.setItem('btPrefs',JSON.stringify({
      signal:document.getElementById('togSignal').checked,
      price:document.getElementById('togPrice').checked,
      rsi:document.getElementById('togRSI').checked,
      auto:document.getElementById('togAuto').checked,
      float:document.getElementById('togFloat').checked,
      action:document.getElementById('togAction').checked,
    }));
    if(document.getElementById('togAuto').checked)startAutoScan();else stopAutoScan();
  }catch(e){}
}
function loadAlerts(){
  try{const p=JSON.parse(localStorage.getItem('btPrefs')||'{}');
    return{signal:p.signal!==false,price:p.price!==false,rsi:p.rsi!==false,
           auto:p.auto!==false,float:p.float!==false,action:p.action!==false};}
  catch{return{signal:true,price:true,rsi:true,auto:true,float:true,action:true};}
}
function applyAlertPrefs(){
  const p=loadAlerts();
  [['togSignal',p.signal],['togPrice',p.price],['togRSI',p.rsi],
   ['togAuto',p.auto],['togFloat',p.float],['togAction',p.action]].forEach(([id,v])=>{
    const el=document.getElementById(id);if(el)el.checked=v;
  });
}

// ═══ WEBSOCKET ═══
const WS_HOSTS=[
  'wss://stream.binance.com:9443',
  'wss://stream.binance.com:443',
  'wss://stream1.binance.com:9443',
  'wss://stream2.binance.com:9443',
];
let wsHostIdx=0;

function setWsStatus(state){
  const b=document.getElementById('wsBadge'),l=document.getElementById('wsLabel');
  if(!b||!l)return;
  b.className='ws-badge '+state;
  l.textContent=state==='connected'?'WS LIVE':state==='connecting'?'WS...':'WS OFF';
}
function connectWebSocket(){
  if(wsConn&&(wsConn.readyState===0||wsConn.readyState===1))return;
  const info=SYMS[curSym];if(!info||!info.binance)return;
  const sym=info.binance.toLowerCase();
  setWsStatus('connecting');
  const host=WS_HOSTS[wsHostIdx%WS_HOSTS.length];
  try{
    wsConn=new WebSocket(`${host}/ws/${sym}@miniTicker`);
    wsConn.onopen=()=>{wsActive=true;setWsStatus('connected');wsHostIdx=wsHostIdx; /* keep working host */};
    wsConn.onmessage=(e)=>{
      try{
        const d=JSON.parse(e.data);
        if(!d)return;
        const price=parseFloat(d.c);
        const open=parseFloat(d.o);
        if(!price||isNaN(price))return;
        const pct=open>0?((price-open)/open*100):0;
        const high=parseFloat(d.h);
        const low=parseFloat(d.l);
        updateLivePrice(price,pct,high,low);
        tickerCache[curSym]={lastPrice:d.c,priceChangePercent:pct.toFixed(2),highPrice:d.h,lowPrice:d.l,quoteVolume:d.q};
      }catch(err){}
    };
    wsConn.onerror=()=>{wsHostIdx++;};
    wsConn.onclose=()=>{
      wsActive=false;setWsStatus('disconnected');
      clearTimeout(wsReconnTimer);
      wsReconnTimer=setTimeout(connectWebSocket,4000);
    };
  }catch(e){setWsStatus('disconnected');wsHostIdx++;}
}
function disconnectWebSocket(){
  clearTimeout(wsReconnTimer);
  if(wsConn){try{wsConn.close();}catch(e){}}
  wsConn=null;wsActive=false;setWsStatus('disconnected');
}
function updateLivePrice(price,pct,high,low){
  if(!price||isNaN(price))return;
  const pb=document.getElementById('priceBig');
  if(pb){
    const wasUp=lastWsPrice?price>=lastWsPrice:pct>=0;
    pb.textContent=fmt(price);
    pb.classList.remove('flash-up','flash-dn');
    void pb.offsetWidth;
    pb.classList.add(wasUp?'flash-up':'flash-dn');
    setTimeout(()=>pb.classList.remove('flash-up','flash-dn'),700);
  }
  const pc=document.getElementById('priceChg');
  if(pc){pc.textContent=(pct>=0?'▲ +':'▼ ')+Math.abs(pct).toFixed(2)+'%';pc.className='price-chg '+(pct>=0?'up':'dn');}
  if(high&&!isNaN(high))sI('priceH',fmt(high));
  if(low&&!isNaN(low))sI('priceL',fmt(low));
  lastWsPrice=price;
}

// ═══ BINANCE REST API — Multi-source with CORS proxies ═══
// Parse response text — handles direct JSON and allorigins wrapper
function parseResp(txt){
  if(!txt||!txt.trim())throw new Error('Empty response');
  let d;
  try{d=JSON.parse(txt);}catch(e){throw new Error('JSON parse fail');}
  // allorigins.win wraps: {contents:'...', status:{...}}
  if(d&&typeof d==='object'&&!Array.isArray(d)&&typeof d.contents==='string'){
    try{d=JSON.parse(d.contents);}catch(e){throw new Error('Proxy unwrap fail');}
  }
  return d;
}

// Fetch one URL with timeout, returns parsed data or throws
async function fetchOne(url,ms=12000){
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),ms);
  try{
    const res=await fetch(url,{signal:ctrl.signal,cache:'no-store'});
    clearTimeout(timer);
    if(!res.ok)throw new Error('HTTP '+res.status);
    const txt=await res.text();
    return parseResp(txt);
  }catch(e){
    clearTimeout(timer);
    throw new Error(e.name==='AbortError'?'Timeout':e.message);
  }
}

// Try a list of URLs in order, return first success
async function fetchAny(urls,ms=12000){
  let lastErr='No URLs';
  for(const url of urls){
    try{return await fetchOne(url,ms);}
    catch(e){lastErr=e.message;console.warn('URL fail:',url,'—',e.message);}
  }
  throw new Error(lastErr);
}

// Build URL lists for klines
function klinesUrls(symbol,interval,limit){
  const direct=`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const enc=encodeURIComponent(direct);
  return[
    direct,
    `https://api1.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
    `https://api2.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
    `https://corsproxy.io/?${enc}`,
    `https://api.allorigins.win/raw?url=${enc}`,
    `https://thingproxy.freeboard.io/fetch/${direct}`,
  ];
}

// Build URL lists for single ticker
function ticker24Urls(symbol){
  const direct=`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
  const enc=encodeURIComponent(direct);
  return[
    direct,
    `https://api1.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
    `https://corsproxy.io/?${enc}`,
    `https://api.allorigins.win/raw?url=${enc}`,
  ];
}

// Build URL lists for all tickers
function allTickersUrls(){
  const direct='https://api.binance.com/api/v3/ticker/24hr';
  const enc=encodeURIComponent(direct);
  return[
    direct,
    'https://api1.binance.com/api/v3/ticker/24hr',
    `https://corsproxy.io/?${enc}`,
    `https://api.allorigins.win/raw?url=${enc}`,
  ];
}

async function fetchBinanceKlines(symbol,tf,limit=200){
  const interval=BIN_TF[tf]||'15m';
  const urls=klinesUrls(symbol,interval,limit);
  const data=await fetchAny(urls,13000);
  if(!Array.isArray(data))throw new Error('Klines response array nahi hai');
  if(data.length<5)throw new Error('Sirf '+data.length+' candles mili');
  return data.map(k=>({t:+k[0],o:+k[1],h:+k[2],l:+k[3],c:+k[4],v:+k[5]}));
}

async function fetchBinanceTicker24(symbol){
  try{
    const urls=ticker24Urls(symbol);
    return await fetchAny(urls,9000);
  }catch(e){return null;}
}

async function fetchAllTickers(){
  try{
    const urls=allTickersUrls();
    const data=await fetchAny(urls,20000);
    if(Array.isArray(data)&&data.length>10)return data;
    return null;
  }catch(e){return null;}
}

// ═══ DATA LAYER ═══
async function getData(sym,tf){
  const info=SYMS[sym];if(!info)return null;
  if(info.binance){
    try{
      setStatus(`⟳ Data fetch ho raha hai — ${sym} ${tf}...`,'info');
      const candles=await fetchBinanceKlines(info.binance,tf,200);
      fetchBinanceTicker24(info.binance).then(t=>{if(t)tickerCache[sym]=t;}).catch(()=>{});
      setStatus(`✅ LIVE — ${sym} | ${tf} | ${candles.length} candles`,'live');
      symCache[sym+'|'+tf]=candles;
      if(sym===curSym){disconnectWebSocket();setTimeout(connectWebSocket,200);}
      return candles;
    }catch(e){
      setStatus(`⚠️ Fetch fail: ${e.message}`,'warn');
      console.warn('Data fail:',e.message);
    }
  }
  if(symCache[sym+'|'+tf]){
    setStatus('📦 Cached data use ho raha hai — Internet slow/blocked?','warn');
    return symCache[sym+'|'+tf];
  }
  setStatus('🔄 Simulated data — Binance blocked. VPN/network check karo.','warn');
  return genSimCandles(info.base,info.vol,200,tf,sym+'|'+tf);
}

function genSimCandles(base,vol,n,tf,cacheKey){
  if(symCache[cacheKey]&&symCache[cacheKey].length>=n){
    const arr=symCache[cacheKey];
    const last=arr[arr.length-1],prev=arr[arr.length-2]||last;
    const mom=(last.c-prev.c)/prev.c*0.5;
    const move=(mom+(Math.random()-0.49))*vol;
    const o=last.c,c=+(o*(1+move)).toFixed(o<10?6:2);
    const h=+(Math.max(o,c)*(1+Math.random()*vol*0.3)).toFixed(o<10?6:2);
    const l=+(Math.min(o,c)*(1-Math.random()*vol*0.3)).toFixed(o<10?6:2);
    arr.push({t:Date.now(),o,h,l,c,v:Math.random()*1000});
    if(arr.length>n+20)arr.shift();
    return arr;
  }
  const arr=[];let p=base,mom=0;
  const now=Date.now(),ms=TF_MINS[tf]*60000;
  for(let i=n;i>=0;i--){
    mom=mom*0.65+(Math.random()-0.48)*vol;
    const o=p,c=+(p*(1+mom)).toFixed(p<10?6:2);
    const h=+(Math.max(o,c)*(1+Math.random()*vol*0.3)).toFixed(p<10?6:2);
    const ll=+(Math.min(o,c)*(1-Math.random()*vol*0.3)).toFixed(p<10?6:2);
    arr.push({t:now-i*ms,o,h,l:ll,c,v:Math.random()*1000+100});
    p=c;
  }
  symCache[cacheKey]=arr;return arr;
}

// ═══ GAINERS / LOSERS ═══
async function loadGainersLosers(force=false){
  if(!force&&allTickerData.length>0){renderGL();return;}
  const btn=document.getElementById('glRefreshBtn');
  const cont=document.getElementById('glContainer');
  if(btn)btn.disabled=true;
  if(cont)cont.innerHTML='<div class="gl-loading"><span class="spin">⟳</span> Binance 24hr data loading...</div>';
  const data=await fetchAllTickers();
  if(!data){
    if(cont)cont.innerHTML='<div class="gl-loading" style="color:var(--red)">⚠️ Binance data nahi aaya — Network/VPN check karo</div>';
    if(btn)btn.disabled=false;return;
  }
  allTickerData=data
    .filter(t=>t.symbol.endsWith('USDT')&&parseFloat(t.quoteVolume)>100000)
    .map(t=>({
      symbol:t.symbol.replace('USDT','')+'/USDT',
      binSym:t.symbol,
      price:parseFloat(t.lastPrice),
      pctChange:parseFloat(t.priceChangePercent),
      volume:parseFloat(t.quoteVolume),
      high:parseFloat(t.highPrice),
      low:parseFloat(t.lowPrice),
    }))
    .filter(t=>!isNaN(t.price)&&t.price>0);
  // Register unknown pairs
  allTickerData.forEach(t=>{
    if(!SYMS[t.symbol]){
      SYMS[t.symbol]={base:t.price,vol:0.03,binance:t.binSym};
      if(!ALL_SYM_KEYS.includes(t.symbol))ALL_SYM_KEYS.push(t.symbol);
    }
  });
  const now=new Date();
  sI('glLastUpdate',`Updated ${now.getUTCHours().toString().padStart(2,'0')}:${now.getUTCMinutes().toString().padStart(2,'0')} UTC`);
  renderGL();
  if(btn)btn.disabled=false;
}
function renderGL(){
  const cont=document.getElementById('glContainer');
  if(!cont||!allTickerData.length)return;
  let sorted;
  if(glMode==='gain')sorted=[...allTickerData].sort((a,b)=>b.pctChange-a.pctChange).slice(0,10);
  else if(glMode==='loss')sorted=[...allTickerData].sort((a,b)=>a.pctChange-b.pctChange).slice(0,10);
  else sorted=[...allTickerData].sort((a,b)=>b.volume-a.volume).slice(0,10);
  const html=sorted.map((t,i)=>{
    const pct=t.pctChange,isPos=pct>=0;
    const pctStr=(isPos?'+':'')+pct.toFixed(2)+'%';
    const vol=t.volume>=1e9?(t.volume/1e9).toFixed(2)+'B':t.volume>=1e6?(t.volume/1e6).toFixed(1)+'M':(t.volume/1e3).toFixed(0)+'K';
    const cardCls=glMode==='vol'?'vol-top':(isPos?'gain':'loss');
    const pctCls=glMode==='vol'?'p':(isPos?'g':'r');
    const sig=pct>5?'<span class="gl-sig-badge buy">STRONG BUY</span>':
               pct>2?'<span class="gl-sig-badge buy">BUY</span>':
               pct<-5?'<span class="gl-sig-badge sell">STRONG SELL</span>':
               pct<-2?'<span class="gl-sig-badge sell">SELL</span>':'';
    const pctDisp=glMode==='vol'?('$'+vol):pctStr;
    return`<div class="gl-card ${cardCls}" onclick="selectGLSym('${t.symbol}')">
      <div class="gl-rank">#${i+1}</div>
      <div class="gl-sym">${t.symbol.replace('/USDT','')}</div>
      <div class="gl-price">${fmt(t.price)}</div>
      <div class="gl-pct ${pctCls}">${pctDisp}</div>
      <div class="gl-vol">${glMode==='vol'?'Change: '+pctStr:'Vol: $'+vol}</div>
      ${sig}
    </div>`;
  }).join('');
  cont.innerHTML='<div class="gl-grid">'+html+'</div>';
}
function showGainers(){glMode='gain';document.getElementById('tabGain').className='gl-tab active-g';document.getElementById('tabLoss').className='gl-tab';document.getElementById('tabVol').className='gl-tab';renderGL();}
function showLosers(){glMode='loss';document.getElementById('tabGain').className='gl-tab';document.getElementById('tabLoss').className='gl-tab active-l';document.getElementById('tabVol').className='gl-tab';renderGL();}
function showTopVol(){glMode='vol';document.getElementById('tabGain').className='gl-tab';document.getElementById('tabLoss').className='gl-tab';document.getElementById('tabVol').className='gl-tab active-v';renderGL();}
function selectGLSym(sym){
  if(!SYMS[sym]){const f=allTickerData.find(t=>t.symbol===sym);if(f)SYMS[sym]={base:f.price,vol:0.03,binance:f.binSym};}
  document.querySelectorAll('.sym-btn').forEach(b=>b.classList.remove('active'));
  curSym=sym;lastSignal=null;lastPrice=null;lastWsPrice=null;
  const si=document.getElementById('symSearch');if(si)si.value=sym;
  disconnectWebSocket();runScan();startAutoScan();
  showToast('📊 '+sym,'info');
}
setInterval(()=>loadGainersLosers(true),60000);

// ═══ INDICATORS ═══
const closes=c=>c.map(x=>x.c);
const highs=c=>c.map(x=>x.h);
const lows=c=>c.map(x=>x.l);

function calcRSI(prices,p=14){
  if(prices.length<p+2)return 50;
  let ag=0,al=0;
  for(let i=1;i<=p;i++){const d=prices[i]-prices[i-1];if(d>0)ag+=d;else al-=d;}
  ag/=p;al/=p;
  for(let i=p+1;i<prices.length;i++){
    const d=prices[i]-prices[i-1];
    ag=(ag*(p-1)+(d>0?d:0))/p;al=(al*(p-1)+(d<0?-d:0))/p;
  }
  return al===0?100:+(100-100/(1+ag/al)).toFixed(1);
}

function calcEMA(arr,p){
  if(arr.length<p)return arr[arr.length-1]||0;
  const k=2/(p+1);let e=arr.slice(0,p).reduce((a,b)=>a+b,0)/p;
  for(let i=p;i<arr.length;i++)e=arr[i]*k+e*(1-k);
  return e;
}

function calcMACDFull(prices){
  if(prices.length<30)return{macd:0,signal:0,hist:0};
  const k=2/(12+1),k2=2/(26+1),ks=2/(9+1);
  let e12=prices.slice(0,12).reduce((a,b)=>a+b,0)/12;
  let e26=prices.slice(0,26).reduce((a,b)=>a+b,0)/26;
  const macdArr=[];
  for(let i=12;i<prices.length;i++){
    if(i<26){e12=prices[i]*k+e12*(1-k);continue;}
    e12=prices[i]*k+e12*(1-k);e26=prices[i]*k2+e26*(1-k2);
    macdArr.push(e12-e26);
  }
  if(!macdArr.length)return{macd:0,signal:0,hist:0};
  let sig=macdArr.slice(0,9).reduce((a,b)=>a+b,0)/Math.min(9,macdArr.length);
  for(let i=9;i<macdArr.length;i++)sig=macdArr[i]*ks+sig*(1-ks);
  const m=macdArr[macdArr.length-1];
  return{macd:+m.toFixed(6),signal:+sig.toFixed(6),hist:+(m-sig).toFixed(6)};
}

function calcMA(prices,p){
  if(!prices.length)return 0;
  return prices.length<p?prices[prices.length-1]:+(prices.slice(-p).reduce((a,b)=>a+b,0)/p).toFixed(8);
}

function calcBB(prices,p=20){
  if(prices.length<p){const v=prices[prices.length-1]||0;return{upper:v,lower:v,mid:v,pct:50};}
  const sl=prices.slice(-p),mean=sl.reduce((a,b)=>a+b,0)/p;
  const std=Math.sqrt(sl.reduce((a,b)=>a+(b-mean)**2,0)/p);
  const upper=mean+2*std,lower=mean-2*std;
  const last=prices[prices.length-1];
  const range=upper-lower;
  const pct=range===0?50:Math.max(0,Math.min(100,((last-lower)/range*100)));
  return{upper,lower,mid:mean,pct:+pct.toFixed(1)};
}

function calcStoch(candles,p=14){
  if(candles.length<p)return 50;
  const sl=candles.slice(-p);
  const hh=Math.max(...sl.map(c=>c.h)),ll=Math.min(...sl.map(c=>c.l));
  return hh===ll?50:+((candles[candles.length-1].c-ll)/(hh-ll)*100).toFixed(1);
}

function calcATR(candles,p=14){
  if(candles.length<2)return 0;
  const trs=candles.slice(1).map((c,i)=>Math.max(c.h-c.l,Math.abs(c.h-candles[i].c),Math.abs(c.l-candles[i].c)));
  const sl=trs.slice(-p);
  // Return full float precision — no toFixed rounding that zeroes out micro-cap ATR
  return sl.reduce((a,b)=>a+b,0)/sl.length;
}

// ═══ SUPPORT & RESISTANCE ═══
function calcSupportResistance(candles,lookback=50){
  const sl=candles.slice(-lookback);
  const closes_arr=sl.map(c=>c.c);
  const highs_arr=sl.map(c=>c.h);
  const lows_arr=sl.map(c=>c.l);
  const last=closes_arr[closes_arr.length-1];
  
  // Pivot-based S/R
  const pivots=[];
  for(let i=2;i<sl.length-2;i++){
    // Resistance pivot high
    if(sl[i].h>sl[i-1].h&&sl[i].h>sl[i-2].h&&sl[i].h>sl[i+1].h&&sl[i].h>sl[i+2].h){
      pivots.push({level:sl[i].h,type:'R',strength:0});
    }
    // Support pivot low
    if(sl[i].l<sl[i-1].l&&sl[i].l<sl[i-2].l&&sl[i].l<sl[i+1].l&&sl[i].l<sl[i+2].l){
      pivots.push({level:sl[i].l,type:'S',strength:0});
    }
  }
  
  // Cluster nearby levels (within 0.3%)
  const clustered=[];
  const used=new Set();
  for(let i=0;i<pivots.length;i++){
    if(used.has(i))continue;
    let sum=pivots[i].level,cnt=1;
    const t=pivots[i].type;
    for(let j=i+1;j<pivots.length;j++){
      if(used.has(j))continue;
      if(Math.abs(pivots[j].level-pivots[i].level)/pivots[i].level<0.003){
        sum+=pivots[j].level;cnt++;used.add(j);
      }
    }
    clustered.push({level:+(sum/cnt).toFixed(8),type:t,strength:cnt,touches:cnt});
    used.add(i);
  }
  
  // Sort and pick top S/R levels relative to current price
  const resistances=clustered.filter(p=>p.level>last).sort((a,b)=>a.level-b.level).slice(0,3);
  const supports=clustered.filter(p=>p.level<last).sort((a,b)=>b.level-a.level).slice(0,3);
  
  // Always ensure we have values
  const atr=calcATR(sl);
  if(!resistances.length)resistances.push({level:+(last+atr*2).toFixed(8),type:'R',strength:1,touches:1});
  if(!supports.length)supports.push({level:+(last-atr*2).toFixed(8),type:'S',strength:1,touches:1});
  
  return{supports,resistances,
    nearestS:supports[0]?.level||last*0.97,
    nearestR:resistances[0]?.level||last*1.03};
}

// ═══ CHART PATTERN DETECTION ═══
function detectChartPatterns(candles){
  const patterns=[];
  const n=candles.length;
  if(n<20)return patterns;
  
  const highs_arr=candles.map(c=>c.h);
  const lows_arr=candles.map(c=>c.l);
  const closes_arr=candles.map(c=>c.c);
  
  // ── Head & Shoulders ──
  if(n>=30){
    const sl=candles.slice(-30);
    const h=sl.map(c=>c.h);
    const mid=Math.floor(h.length/2);
    const leftMax=Math.max(...h.slice(0,mid-3));
    const head=Math.max(...h.slice(mid-3,mid+3));
    const rightMax=Math.max(...h.slice(mid+3));
    const neckL=Math.min(...sl.slice(0,mid).map(c=>c.l));
    const neckR=Math.min(...sl.slice(mid).map(c=>c.l));
    const neckline=(neckL+neckR)/2;
    if(head>leftMax*1.015&&head>rightMax*1.015&&Math.abs(leftMax-rightMax)/leftMax<0.03){
      patterns.push({name:'Head & Shoulders',type:'BEAR',strength:'Strong',desc:'Bearish reversal pattern'});
    }
    // Inverse H&S
    const lo=sl.map(c=>c.l);
    const leftMin=Math.min(...lo.slice(0,mid-3));
    const headLow=Math.min(...lo.slice(mid-3,mid+3));
    const rightMin=Math.min(...lo.slice(mid+3));
    if(headLow<leftMin*0.985&&headLow<rightMin*0.985&&Math.abs(leftMin-rightMin)/leftMin<0.03){
      patterns.push({name:'Inverse H&S',type:'BULL',strength:'Strong',desc:'Bullish reversal pattern'});
    }
  }
  
  // ── Double Top / Bottom ──
  if(n>=20){
    const sl=candles.slice(-20);
    const hh=sl.map(c=>c.h);
    const ll=sl.map(c=>c.l);
    const max1=Math.max(...hh.slice(0,10));
    const max2=Math.max(...hh.slice(10));
    if(Math.abs(max1-max2)/max1<0.015&&closes_arr[closes_arr.length-1]<(max1+max2)/2*0.985){
      patterns.push({name:'Double Top',type:'BEAR',strength:'Moderate',desc:'Resistance rejection x2'});
    }
    const min1=Math.min(...ll.slice(0,10));
    const min2=Math.min(...ll.slice(10));
    if(Math.abs(min1-min2)/min1<0.015&&closes_arr[closes_arr.length-1]>(min1+min2)/2*1.015){
      patterns.push({name:'Double Bottom',type:'BULL',strength:'Moderate',desc:'Support bounce x2'});
    }
  }
  
  // ── Ascending / Descending Triangle ──
  if(n>=15){
    const sl=candles.slice(-15);
    const hh=sl.map(c=>c.h);
    const ll=sl.map(c=>c.l);
    const maxH=Math.max(...hh);const minH=Math.min(...hh);
    const maxL=Math.max(...ll);const minL=Math.min(...ll);
    // Ascending triangle: flat top, rising lows
    if((maxH-minH)/maxH<0.02&&maxL>minL*1.01){
      patterns.push({name:'Ascending Triangle',type:'BULL',strength:'Moderate',desc:'Breakout pending'});
    }
    // Descending triangle: flat bottom, falling highs
    if((maxL-minL)/maxL<0.02&&maxH>minH*1.01&&hh[0]>hh[hh.length-1]){
      patterns.push({name:'Descending Triangle',type:'BEAR',strength:'Moderate',desc:'Breakdown pending'});
    }
  }
  
  // ── Bull / Bear Flag ──
  if(n>=12){
    const sl=candles.slice(-12);
    const first5=sl.slice(0,5);const last7=sl.slice(5);
    const pole=first5[4].c-first5[0].o;
    const flagRange=Math.max(...last7.map(c=>c.h))-Math.min(...last7.map(c=>c.l));
    if(pole>0&&pole/first5[0].o>0.03&&flagRange<pole*0.5){
      patterns.push({name:'Bull Flag',type:'BULL',strength:'Moderate',desc:'Continuation upward'});
    }
    if(pole<0&&Math.abs(pole)/first5[0].o>0.03&&flagRange<Math.abs(pole)*0.5){
      patterns.push({name:'Bear Flag',type:'BEAR',strength:'Moderate',desc:'Continuation downward'});
    }
  }
  
  // ── Rising / Falling Wedge ──
  if(n>=10){
    const sl=candles.slice(-10);
    const hSlope=(sl[sl.length-1].h-sl[0].h)/sl.length;
    const lSlope=(sl[sl.length-1].l-sl[0].l)/sl.length;
    if(hSlope>0&&lSlope>0&&lSlope>hSlope){
      patterns.push({name:'Rising Wedge',type:'BEAR',strength:'Moderate',desc:'Bearish reversal likely'});
    }
    if(hSlope<0&&lSlope<0&&hSlope<lSlope){
      patterns.push({name:'Falling Wedge',type:'BULL',strength:'Moderate',desc:'Bullish reversal likely'});
    }
  }
  
  return patterns.slice(0,4);
}

// ═══ SUPPLY & DEMAND ZONES ═══
function calcSupplyDemandZones(candles){
  const zones=[];
  const n=candles.length;
  if(n<20)return{supply:[],demand:[]};
  for(let i=2;i<n-2;i++){
    const prev=candles[i-1];
    const base=candles[i];
    const next=candles[i+1];
    const baseBody=Math.abs(base.c-base.o);
    const nextBody=Math.abs(next.c-next.o);
    const prevBody=Math.abs(prev.c-prev.o);
    const baseRange=base.h-base.l;
    const nextRange=next.h-next.l;
    if(baseRange===0||nextRange===0)continue;
    const isBase=baseBody<baseRange*0.4;
    if(!isBase)continue;
    if(next.c>next.o&&nextBody>prevBody*1.3&&next.c>base.h){
      const zHigh=Math.max(base.h,base.o,base.c);
      const zLow=Math.min(base.l,base.o,base.c);
      zones.push({type:'demand',high:+zHigh.toFixed(8),low:+zLow.toFixed(8),mid:+((zHigh+zLow)/2).toFixed(8),strength:+(nextBody/baseRange).toFixed(2),fresh:i>n-30,idx:i,label:'Demand Zone'});
    }
    if(next.c<next.o&&nextBody>prevBody*1.3&&next.c<base.l){
      const zHigh=Math.max(base.h,base.o,base.c);
      const zLow=Math.min(base.l,base.o,base.c);
      zones.push({type:'supply',high:+zHigh.toFixed(8),low:+zLow.toFixed(8),mid:+((zHigh+zLow)/2).toFixed(8),strength:+(nextBody/baseRange).toFixed(2),fresh:i>n-30,idx:i,label:'Supply Zone'});
    }
  }
  const lastPrice=candles[candles.length-1].c;
  const atr=calcATR(candles);
  const supply=zones.filter(z=>z.type==='supply'&&z.low>lastPrice).sort((a,b)=>a.low-b.low).filter((z,i,arr)=>i===0||Math.abs(z.mid-arr[i-1].mid)/arr[i-1].mid>0.005).slice(0,4);
  const demand=zones.filter(z=>z.type==='demand'&&z.high<lastPrice).sort((a,b)=>b.high-a.high).filter((z,i,arr)=>i===0||Math.abs(z.mid-arr[i-1].mid)/arr[i-1].mid>0.005).slice(0,4);
  if(!supply.length)supply.push({type:'supply',high:+(lastPrice+atr*3).toFixed(8),low:+(lastPrice+atr*2).toFixed(8),mid:+(lastPrice+atr*2.5).toFixed(8),strength:1,fresh:false,label:'Supply Zone'});
  if(!demand.length)demand.push({type:'demand',high:+(lastPrice-atr*2).toFixed(8),low:+(lastPrice-atr*3).toFixed(8),mid:+(lastPrice-atr*2.5).toFixed(8),strength:1,fresh:false,label:'Demand Zone'});
  return{supply,demand,lastPrice};
}

function renderSDZones(sig,sym){
  const el=document.getElementById('sdContent');
  const lb=document.getElementById('sdSymLabel');
  if(!el||!lastCandles||lastCandles.length<10)return;
  if(lb)lb.textContent=sym+' • '+curTF;
  const {supply,demand}=calcSupplyDemandZones(lastCandles);
  const last=sig.last;
  const zoneCard=(z,i,isSup)=>{
    const dist=isSup?((z.low-last)/last*100).toFixed(2):(((last-z.high)/last)*100).toFixed(2);
    const col=isSup?'#f87171':'#34d399';
    const bg=isSup?'rgba(248,113,113,.05)':'rgba(52,211,153,.05)';
    const brd=isSup?'rgba(248,113,113,.25)':'rgba(52,211,153,.25)';
    const strBar=Math.min(100,z.strength*25);
    const freshBadge=z.fresh
      ?`<span style="font-size:7px;background:${bg};color:${col};border:1px solid ${brd};padding:1px 5px;border-radius:3px;font-family:'JetBrains Mono',monospace">${isSup?'⚡ FRESH':'⚡ FRESH'}</span>`
      :`<span style="font-size:7px;background:rgba(100,116,139,.08);color:var(--text3);border:1px solid rgba(100,116,139,.15);padding:1px 5px;border-radius:3px;font-family:'JetBrains Mono',monospace">TESTED</span>`;
    return`<div style="background:${bg};border:1px solid ${brd};border-left:3px solid ${col};border-radius:8px;padding:9px 11px;margin-bottom:6px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
        <span style="font-size:11px;color:${col};font-weight:700;font-family:'JetBrains Mono',monospace">${isSup?'S':'D'}${i+1}</span>
        ${freshBadge}
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text);line-height:1.7;">
        <span style="color:var(--text3)">High: </span>${fmt(z.high)}<br>
        <span style="color:var(--text3)">Low:  </span>${fmt(z.low)}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;font-family:'JetBrains Mono',monospace;margin:5px 0 4px;">
        <span style="color:var(--text3)">${isSup?'Resistance above':'Support below'}</span>
        <span style="color:${col};font-weight:600">${isSup?'+':'−'}${dist}%</span>
      </div>
      <div style="height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;">
        <div style="height:100%;width:${strBar}%;background:${col};border-radius:2px;opacity:.75;"></div>
      </div>
      <div style="font-size:8px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:3px;">Zone Strength: ${strBar.toFixed(0)}%</div>
    </div>`;
  };
  let html=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
    <div>
      <div style="font-size:9px;color:#f87171;font-weight:700;letter-spacing:1.2px;font-family:'JetBrains Mono',monospace;margin-bottom:8px;">📉 SUPPLY ZONES</div>
      ${supply.map((z,i)=>zoneCard(z,i,true)).join('')}
    </div>
    <div>
      <div style="font-size:9px;color:#34d399;font-weight:700;letter-spacing:1.2px;font-family:'JetBrains Mono',monospace;margin-bottom:8px;">📈 DEMAND ZONES</div>
      ${demand.map((z,i)=>zoneCard(z,i,false)).join('')}
    </div>
  </div>
  <div style="margin-top:10px;padding:8px 14px;background:rgba(124,106,247,.06);border:1px solid rgba(124,106,247,.2);border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;">📍 Current Price</span>
    <span style="font-size:13px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--purple2);">${fmt(last)}</span>
    <span style="font-size:9px;font-family:'JetBrains Mono',monospace;color:${sig.isLong?'#34d399':'#f87171'}">${sig.isLong?'⬆ In Demand Area':'⬇ In Supply Area'}</span>
  </div>`;
  el.innerHTML=html;
}


function analyze(candles){
  const cl=closes(candles),hl=highs(candles),ll=lows(candles);
  const last=cl[cl.length-1];
  const rsi=calcRSI(cl);
  const {macd,signal:macdSig,hist:macdHist}=calcMACDFull(cl);
  const ma20=calcMA(cl,20),ma50=calcMA(cl,50),ma200=calcMA(cl,200);
  const bb=calcBB(cl),stoch=calcStoch(candles),atr=calcATR(candles);
  const high50=Math.max(...hl.slice(-50)),low50=Math.min(...ll.slice(-50));
  const vols=candles.slice(-30).map(c=>c.v);
  const avgVol=vols.reduce((a,b)=>a+b,0)/vols.length;
  const lastVol=candles[candles.length-1].v;

  // === MOMENTUM (core to avoid wrong signals on pumping pairs) ===
  const r3=cl.slice(-3),r5=cl.slice(-5),r10=cl.slice(-10),r20=cl.slice(-20);
  const slope3=r3.length>1?(r3[r3.length-1]-r3[0])/r3[0]*100:0;
  const slope5=r5.length>1?(r5[r5.length-1]-r5[0])/r5[0]*100:0;
  const slope10=r10.length>1?(r10[r10.length-1]-r10[0])/r10[0]*100:0;
  const slope20=r20.length>1?(r20[r20.length-1]-r20[0])/r20[0]*100:0;

  // Is this a strong trending market?
  const strongUptrend=slope5>1.5&&slope10>0.5&&slope20>0;
  const strongDowntrend=slope5<-1.5&&slope10<-0.5&&slope20<0;
  const momentumBullish=slope3>0&&slope5>0;
  const momentumBearish=slope3<0&&slope5<0;

  let score=0;

  // ── RSI (context-aware) ──
  // In strong uptrend, RSI 60–75 is HEALTHY — do NOT penalize
  if(strongUptrend){
    if(rsi<40)score+=3;
    else if(rsi<60)score+=2;
    else if(rsi<78)score+=1;   // riding uptrend — still bullish
    else score-=1;              // extreme overbought only slight penalty
  } else if(strongDowntrend){
    if(rsi>60)score-=3;
    else if(rsi>40)score-=2;
    else if(rsi>22)score-=1;
    else score+=1;              // extreme oversold slight relief
  } else {
    // Neutral market — standard RSI interpretation
    if(rsi<30)score+=3;
    else if(rsi<45)score+=1;
    else if(rsi>70)score-=2;
    else if(rsi>55)score-=1;
  }

  // ── MACD ──
  if(macdHist>0)score+=2;else score-=2;
  if(macd>0&&macdHist>0)score+=1;   // macd above zero AND positive hist = strong bull
  if(macd<0&&macdHist<0)score-=1;

  // ── Moving Averages ──
  if(ma20>ma50)score+=2;else score-=2;
  if(last>ma200)score+=1;else score-=1;
  if(last>ma20)score+=1;else score-=1;
  if(ma50>ma200)score+=1;else score-=1;  // long-term trend

  // ── Bollinger Bands (context-aware) ──
  if(strongUptrend){
    if(bb.pct>50)score+=1;    // upper half = trend continuation
    if(bb.pct<20)score+=2;    // pullback to lower = buy opportunity
  } else if(strongDowntrend){
    if(bb.pct<50)score-=1;
    if(bb.pct>80)score-=2;
  } else {
    if(bb.pct<20)score+=2;
    else if(bb.pct>80)score-=2;
  }

  // ── Stochastic (context-aware) ──
  if(strongUptrend){
    if(stoch<30)score+=2;
    else if(stoch>90)score-=1;
  } else if(strongDowntrend){
    if(stoch>70)score-=2;
    else if(stoch<10)score+=1;
  } else {
    if(stoch<25)score+=2;
    else if(stoch>75)score-=2;
  }

  // ── Momentum bonus/penalty ──
  if(slope3>1&&slope5>0.5&&slope10>0)score+=2;      // strong aligned bullish momentum
  if(slope3<-1&&slope5<-0.5&&slope10<0)score-=2;    // strong aligned bearish momentum
  if(slope3>0&&macdHist>0)score+=1;                 // short momentum confirms MACD
  if(slope3<0&&macdHist<0)score-=1;

  // ── Volume confirmation ──
  const volRatio=avgVol>0?lastVol/avgVol:1;
  if(volRatio>2)score+=(score>0?2:-2);
  else if(volRatio>1.5)score+=(score>0?1:-1);

  // === FINAL SIGNAL ===
  const isLong=score>0;
  const absScore=Math.abs(score);
  const conf=Math.min(95,Math.max(45,50+absScore*3));

  // ── Smart decimal precision based on price magnitude ──
  function priceDec(p){
    if(p>=10000)return 0;
    if(p>=1000)return 1;
    if(p>=100)return 2;
    if(p>=1)return 3;
    if(p>=0.1)return 4;
    if(p>=0.01)return 5;
    if(p>=0.001)return 6;
    if(p>=0.0001)return 7;
    return 8;
  }
  const dec=priceDec(last);

  // ATR-based targets — works for BTC ($80k) and PEPE ($0.000012) equally
  // Floor = 0.6% of price so targets are always meaningfully spread apart
  const rawATR=atr;
  const floorATR=last*0.006;
  const atrCalc=Math.max(rawATR, floorATR);

  const mult=isLong?1:-1;
  const entry=last;
  // TP1 = 1.8x ATR, TP2 = 3.5x ATR, SL = 1.0x ATR
  const tp1=+( entry + mult * atrCalc * 1.8 ).toFixed(dec);
  const tp2=+( entry + mult * atrCalc * 3.5 ).toFixed(dec);
  const sl =+( entry - mult * atrCalc * 1.0 ).toFixed(dec);
  const slDist=Math.abs(sl-entry);
  const rr=slDist===0?0:+(Math.abs(tp1-entry)/slDist).toFixed(2);

  // Action: requires trend + confidence alignment
  const trendOk=(isLong&&(slope5>-0.5||ma20>ma50))||(!isLong&&(slope5<0.5||ma20<ma50));
  const action=(conf>=70&&absScore>=5&&trendOk)?'ENTER':(conf>=58&&absScore>=3)?'CONFIRM':'WAIT';

  // Trend label
  let trend='SIDEWAYS';
  if(slope20>1.5&&slope5>0)trend='UPTREND';
  else if(slope20<-1.5&&slope5<0)trend='DOWNTREND';
  else if(slope20>0.5)trend='WEAK UPTREND';
  else if(slope20<-0.5)trend='WEAK DOWNTREND';

  // Patterns
  const pats=[];
  const rc=candles.slice(-5);
  const body=c=>Math.abs(c.c-c.o);
  const wick=c=>c.h-Math.max(c.c,c.o);
  const tail=c=>Math.min(c.c,c.o)-c.l;
  if(rc.length>=2){
    const[p2,p1]=rc.slice(-2);
    if(p1.c>p1.o&&p2.c<p2.o&&p1.o<p2.c&&p1.c>p2.o)pats.push({n:'Bullish Engulfing',t:'BULL',s:'Strong'});
    if(p1.c<p1.o&&p2.c>p2.o&&p1.o>p2.c&&p1.c<p2.o)pats.push({n:'Bearish Engulfing',t:'BEAR',s:'Strong'});
  }
  if(rc.length>=3){
    const[a,b,c2]=rc.slice(-3);
    if(a.c<a.o&&b.c>b.o&&b.o<a.c&&b.c<a.o&&c2.c>c2.o&&c2.c>b.c)pats.push({n:'Morning Star',t:'BULL',s:'Strong'});
    if(a.c>a.o&&b.c<b.o&&b.o>a.c&&b.c>a.o&&c2.c<c2.o&&c2.c<b.c)pats.push({n:'Evening Star',t:'BEAR',s:'Strong'});
  }
  const lc=rc[rc.length-1];
  if(lc){
    const bd=body(lc),rng=lc.h-lc.l;
    if(rng>0){
      if(tail(lc)>bd*2&&wick(lc)<bd*0.5)pats.push({n:'Hammer',t:'BULL',s:'Moderate'});
      if(wick(lc)>bd*2&&tail(lc)<bd*0.5)pats.push({n:'Shooting Star',t:'BEAR',s:'Moderate'});
      if(bd<rng*0.15)pats.push({n:'Doji',t:score>0?'BULL':'BEAR',s:'Weak'});
    }
  }

  const atrPct=last>0?(atr/last)*100:0;
  const volTag=atrPct>3?'EXTREME':atrPct>1.5?'HIGH':atrPct<0.5?'LOW':'NORMAL';

  // Support & Resistance
  const sr=calcSupportResistance(candles);
  // Chart Patterns
  const chartPats=detectChartPatterns(candles);

  return{
    dir:isLong?1:-1,score,conf,isLong,entry,tp1,tp2,sl,rr,
    rsi,macd,macdHist,ma20,ma50,ma200,bb,stoch,atr,
    high:high50,low:low50,last,
    pats,chartPats,trend,volTag,atrPct,avgVol,lastVol,volRatio,
    slope3,slope5,slope10,slope20,action,
    strongUptrend,strongDowntrend,
    srLevels:sr
  };
}

// ═══ UPDATE UI ═══
function updateUI(sig){
  if(!sig)return;
  const isLong=sig.isLong,conf=sig.conf;

  // Signal strip
  sI('ssDir',isLong?'⬆ LONG':'⬇ SHORT');
  sC('ssDir','sig-strip-dir '+(isLong?'long':'short'));
  sI('ssConf',`Conf: ${conf}% | Score: ${sig.score>0?'+':''}${sig.score}`);
  sI('ssScore','');
  const ssAct=document.getElementById('ssAction');
  if(ssAct){
    if(sig.action==='ENTER'){ssAct.className='sig-strip-action enter';ssAct.textContent='✅ ENTER';}
    else if(sig.action==='CONFIRM'){ssAct.className='sig-strip-action wait';ssAct.textContent='⏳ WAIT';}
    else{ssAct.className='sig-strip-action avoid';ssAct.textContent='🚫 AVOID';}
  }

  // Signal card
  sC('sigCard','sig-card '+(isLong?'long-s':'short-s'));
  sC('scHdr','sc-hdr '+(isLong?'long':'short'));
  sI('scDir',isLong?'⬆ LONG POSITION':'⬇ SHORT POSITION');
  sC('scDir','sc-dir '+(isLong?'long':'short'));
  const bLvl=conf>=78?'strong':conf>=62?'moderate':'weak';
  sI('scBadge',conf>=78?'STRONG':conf>=62?'MODERATE':'WEAK');
  sC('scBadge','sc-badge '+bLvl);
  sI('confPct',conf+'%');
  const cf=document.getElementById('confFill');
  if(cf){cf.style.width=conf+'%';cf.className='conf-fill '+(conf>=70?'hi':conf>=55?'md':'lo');}

  sI('entV',fmt(sig.entry));
  sI('tp1V',fmt(sig.tp1));sI('tp2V',fmt(sig.tp2));
  sI('slV',fmt(sig.sl));sI('rrV','1:'+sig.rr);
  sI('tfV',curTF+' → '+(TF_NEXT[curTF]||'W'));

  const ab=document.getElementById('actionBadge');
  if(ab){
    if(sig.action==='ENTER'){ab.className='action-badge enter';ab.textContent='✅ ENTER — Signal Confirm Hai';}
    else if(sig.action==='CONFIRM'){ab.className='action-badge wait';ab.textContent='⏳ CONFIRMATION WAIT KARO';}
    else{ab.className='action-badge avoid';ab.textContent='🚫 AVOID — Weak Signal';}
  }

  sI('pEntry',fmt(sig.entry));sI('pTP1',fmt(sig.tp1));sI('pTP2',fmt(sig.tp2));sI('pSL',fmt(sig.sl));
  const tp1p=sig.entry>0?((Math.abs(sig.tp1-sig.entry)/sig.entry)*100).toFixed(2):'0';
  const tp2p=sig.entry>0?((Math.abs(sig.tp2-sig.entry)/sig.entry)*100).toFixed(2):'0';
  const slp=sig.entry>0?((Math.abs(sig.sl-sig.entry)/sig.entry)*100).toFixed(2):'0';
  sI('pTP1p',(isLong?'+':'-')+tp1p+'%');sI('pTP2p',(isLong?'+':'-')+tp2p+'%');
  sI('pSLp',(isLong?'-':'+')+slp+'% risk');

  // Price (only if WS not live)
  if(!wsActive){
    sI('priceBig',fmt(sig.last));
    const pc=document.getElementById('priceChg');
    if(pc){
      const pct=sig.slope5;
      pc.textContent=(pct>=0?'▲ +':'▼ ')+Math.abs(pct).toFixed(2)+'%';
      pc.className='price-chg '+(pct>=0?'up':'dn');
    }
  }
  sI('priceH',fmt(sig.high));sI('priceL',fmt(sig.low));
  sI('atrDisp',fmt(sig.atr));
  sI('chartSymName',curSym);

  // Ticker 24h
  const ticker=tickerCache[curSym];
  if(ticker){
    const lp=parseFloat(ticker.lowPrice||0),hp=parseFloat(ticker.highPrice||0);
    if(lp>0&&hp>0){sI('mkt24h',((hp-lp)/lp*100).toFixed(2)+'%');sI('mkt24hSub','H:'+fmt(hp)+' L:'+fmt(lp));}
  }

  // MKT strip
  const mVol=document.getElementById('mktVol');
  if(mVol){
    mVol.textContent=sig.volTag;
    mVol.style.color=sig.volTag==='EXTREME'?'var(--red)':sig.volTag==='HIGH'?'var(--gold)':sig.volTag==='LOW'?'var(--blue)':'var(--green)';
  }
  sI('mktVolSub','ATR: '+sig.atrPct.toFixed(2)+'%');

  const h=new Date().getUTCHours();
  const sessions=[[0,8,'ASIAN','var(--blue)'],[8,12,'LONDON','var(--gold)'],[12,17,'NY','var(--purple2)'],[17,21,'OVERLAP','var(--green)'],[21,24,'AFTER HRS','var(--text3)']];
  let sess='--',sc='var(--text3)';
  sessions.forEach(([s,e,n,c])=>{if(h>=s&&h<e){sess=n;sc=c;}});
  const msEl=document.getElementById('mktSession');
  if(msEl){msEl.textContent=sess;msEl.style.color=sc;}
  sI('mktSessionSub',h.toString().padStart(2,'0')+':00 UTC');

  const bs=sig.score;
  const mbEl=document.getElementById('mktBias');
  if(mbEl){mbEl.textContent=bs>=4?'BULLISH':bs<=-4?'BEARISH':'NEUTRAL';mbEl.style.color=bs>=4?'var(--green)':bs<=-4?'var(--red)':'var(--gold)';}
  sI('mktBiasSub','Score: '+(bs>0?'+':'')+bs);

  const tt=document.getElementById('trendTag');
  if(tt){tt.textContent=(sig.trend.includes('UP')?'▲ ':'▼ ')+sig.trend;tt.className='trend-tag '+(sig.trend.includes('UP')?'up':sig.trend.includes('DOWN')?'dn':'side');}
  sI('trendDetail',`Slope 5c: ${sig.slope5.toFixed(2)}% | 20c: ${sig.slope20.toFixed(2)}% | Vol: ${sig.volRatio.toFixed(1)}x avg`);
  const vp=document.getElementById('volPill');
  if(vp){const vt=sig.volTag;vp.textContent=(vt==='EXTREME'?'🔴 ':vt==='HIGH'?'🟡 ':vt==='LOW'?'🟢 ':'◈ ')+vt+' VOL';vp.className='vol-pill '+(vt==='EXTREME'||vt==='HIGH'?'hi':vt==='LOW'?'lo':'md');}

  // Indicators
  const ind=(vi,vt,vc,si2,st)=>{
    const ve=document.getElementById(vi);if(ve){ve.textContent=vt;ve.className='ind-val '+vc;}
    const se=document.getElementById(si2);if(se){se.textContent=st;se.className='ind-sig '+vc;}
  };
  ind('iRSI',''+sig.rsi,sig.rsi>70?'bear':sig.rsi<30?'bull':'neut','iRSIs',sig.rsi>70?'▼ Overbought':sig.rsi<30?'▲ Oversold':'◆ Normal');
  ind('iMACD',(sig.macd>0?'+':'')+sig.macd.toFixed(4),sig.macdHist>0?'bull':'bear','iMACDs',sig.macdHist>0?'▲ Bullish Cross':'▼ Bearish Cross');
  ind('iMA',sig.ma20>sig.ma50?'Golden':'Death',sig.ma20>sig.ma50?'bull':'bear','iMAs',sig.ma20>sig.ma50?'▲ Golden Cross':'▼ Death Cross');
  ind('iBB',sig.bb.pct.toFixed(0)+'%',sig.bb.pct>80?'bear':sig.bb.pct<20?'bull':'neut','iBBs',sig.bb.pct>80?'▼ Upper Band':sig.bb.pct<20?'▲ Lower Band':'◆ Mid-Band');
  ind('iStoch',''+sig.stoch,sig.stoch>80?'bear':sig.stoch<20?'bull':'neut','iStochs',sig.stoch>80?'▼ Overbought':sig.stoch<20?'▲ Oversold':'◆ Normal');
  sI('iATR',fmt(sig.atr));
  sI('iATRs','◆ '+(sig.atrPct>3?'Extreme':sig.atrPct>1.5?'High':sig.atrPct<0.5?'Low':'Normal')+' Vol');
  const vTrend=sig.lastVol>sig.avgVol*1.5?'HIGH':sig.lastVol<sig.avgVol*0.5?'LOW':'NORMAL';
  ind('iVol',vTrend,vTrend==='HIGH'?'bull':'neut','iVols',vTrend==='HIGH'?'▲ Active':vTrend==='LOW'?'▼ Quiet':'◆ Normal');
  ind('iEMA',sig.last>sig.ma200?'Above':'Below',sig.last>sig.ma200?'bull':'bear','iEMAs',sig.last>sig.ma200?'▲ Long Bull':'▼ Long Bear');

  buildGauge(sig.score);
  const gv=document.getElementById('gaugeVal');
  if(gv){gv.textContent=sig.score>=4?'BULLISH':sig.score<=-4?'BEARISH':'NEUTRAL';gv.className='gauge-val '+(sig.score>=4?'bull':sig.score<=-4?'bear':'neut');}

  const pl=document.getElementById('patList');
  if(pl){
    pl.innerHTML=sig.pats.length
      ?sig.pats.map(p=>`<div class="pat-item"><span class="pat-name">${p.n}</span><span class="pat-type ${p.t==='BULL'?'bull':'bear'}">${p.t}</span><span class="pat-str">${p.s}</span></div>`).join('')
      :'<div class="pat-item"><span class="pat-name" style="color:var(--text3)">No strong pattern</span></div>';
  }

  // Chart Patterns with SVG shapes
  const cpl=document.getElementById('chartPatList');
  if(cpl){
    const patSVG={
      'Head & Shoulders':`<svg width="60" height="30" viewBox="0 0 60 30"><polyline points="2,28 10,18 18,22 28,5 38,22 46,18 58,28" fill="none" stroke="#f87171" stroke-width="1.5" stroke-linejoin="round"/><line x1="5" y1="22" x2="55" y2="22" stroke="#f87171" stroke-width="0.7" stroke-dasharray="2,2" opacity=".5"/></svg>`,
      'Inverse H&S':`<svg width="60" height="30" viewBox="0 0 60 30"><polyline points="2,2 10,12 18,8 28,25 38,8 46,12 58,2" fill="none" stroke="#34d399" stroke-width="1.5" stroke-linejoin="round"/><line x1="5" y1="8" x2="55" y2="8" stroke="#34d399" stroke-width="0.7" stroke-dasharray="2,2" opacity=".5"/></svg>`,
      'Double Top':`<svg width="60" height="30" viewBox="0 0 60 30"><polyline points="2,28 12,5 22,18 38,5 50,28" fill="none" stroke="#f87171" stroke-width="1.5" stroke-linejoin="round"/><line x1="5" y1="18" x2="55" y2="18" stroke="#f87171" stroke-width="0.7" stroke-dasharray="2,2" opacity=".5"/></svg>`,
      'Double Bottom':`<svg width="60" height="30" viewBox="0 0 60 30"><polyline points="2,2 12,25 22,12 38,25 50,2" fill="none" stroke="#34d399" stroke-width="1.5" stroke-linejoin="round"/><line x1="5" y1="12" x2="55" y2="12" stroke="#34d399" stroke-width="0.7" stroke-dasharray="2,2" opacity=".5"/></svg>`,
      'Ascending Triangle':`<svg width="60" height="30" viewBox="0 0 60 30"><line x1="2" y1="5" x2="55" y2="5" stroke="#34d399" stroke-width="1" stroke-dasharray="2,2"/><polyline points="2,28 15,20 28,14 42,8 55,5" fill="none" stroke="#34d399" stroke-width="1.5" stroke-linejoin="round"/><line x1="2" y1="28" x2="55" y2="5" stroke="#34d399" stroke-width="0.6" opacity=".4"/></svg>`,
      'Descending Triangle':`<svg width="60" height="30" viewBox="0 0 60 30"><line x1="2" y1="25" x2="55" y2="25" stroke="#f87171" stroke-width="1" stroke-dasharray="2,2"/><polyline points="2,2 15,10 28,16 42,22 55,25" fill="none" stroke="#f87171" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
      'Bull Flag':`<svg width="60" height="30" viewBox="0 0 60 30"><polyline points="2,28 12,10" fill="none" stroke="#34d399" stroke-width="2"/><polyline points="12,10 20,6 28,9 20,13 28,16 20,20 28,22" fill="none" stroke="#34d399" stroke-width="1" stroke-dasharray="2,1"/><line x1="28" y1="14" x2="55" y2="2" stroke="#34d399" stroke-width="1.5" stroke-dasharray="3,2" opacity=".7"/></svg>`,
      'Bear Flag':`<svg width="60" height="30" viewBox="0 0 60 30"><polyline points="2,2 12,20" fill="none" stroke="#f87171" stroke-width="2"/><polyline points="12,20 20,24 28,21 20,17 28,14 20,10 28,8" fill="none" stroke="#f87171" stroke-width="1" stroke-dasharray="2,1"/><line x1="28" y1="16" x2="55" y2="28" stroke="#f87171" stroke-width="1.5" stroke-dasharray="3,2" opacity=".7"/></svg>`,
      'Rising Wedge':`<svg width="60" height="30" viewBox="0 0 60 30"><polyline points="2,26 55,8" fill="none" stroke="#f87171" stroke-width="1" stroke-dasharray="2,2"/><polyline points="2,30 55,18" fill="none" stroke="#f87171" stroke-width="1" stroke-dasharray="2,2"/><polyline points="2,28 15,24 28,21 42,19 55,14" fill="none" stroke="#f87171" stroke-width="1.5"/></svg>`,
      'Falling Wedge':`<svg width="60" height="30" viewBox="0 0 60 30"><polyline points="2,4 55,22" fill="none" stroke="#34d399" stroke-width="1" stroke-dasharray="2,2"/><polyline points="2,0 55,12" fill="none" stroke="#34d399" stroke-width="1" stroke-dasharray="2,2"/><polyline points="2,2 15,6 28,9 42,11 55,16" fill="none" stroke="#34d399" stroke-width="1.5"/></svg>`,
    };
    cpl.innerHTML=(sig.chartPats&&sig.chartPats.length)
      ?sig.chartPats.map(p=>{
        const svg=patSVG[p.name]||'';
        const col=p.type==='BULL'?'var(--green)':'var(--red)';
        return`<div class="pat-item" style="flex-direction:column;align-items:flex-start;gap:5px;padding:9px 10px;">
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
            <span class="pat-name" style="font-weight:600;color:var(--text)">${p.name}</span>
            <span class="pat-type ${p.type==='BULL'?'bull':'bear'}">${p.type}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;width:100%;">
            <div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:6px;padding:3px 6px;flex-shrink:0;">${svg}</div>
            <div>
              <div style="font-size:9px;color:${col};font-family:'JetBrains Mono',monospace;font-weight:600;">${p.desc}</div>
              <div style="font-size:8px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:2px;">Strength: ${p.strength}</div>
            </div>
          </div>
        </div>`;
      }).join('')
      :'<div class="pat-item"><span class="pat-name" style="color:var(--text3)">کوئی chart pattern نہیں ملا</span></div>';
  }

  // Support & Resistance removed from side panel - used for S&D zones below chart
}

// ═══ CHARTS ═══
function dChart(key){if(charts[key]){try{charts[key].destroy();}catch(e){}charts[key]=null;}}

function initChartDefaults(){
  if(typeof Chart==='undefined')return;
  Chart.defaults.color='#64748b';
  Chart.defaults.font.family="'JetBrains Mono',monospace";
  Chart.defaults.font.size=11;
  Chart.defaults.font.weight='500';
}

// ═══ INTERACTIVE MAIN CHART ═══
let chartZoom={minIdx:0,maxIdx:100};  // visible candle window
let isDragging=false,dragStartX=0,dragStartMin=0,dragStartMax=0;
let crosshairX=null,crosshairY=null;
let liveLineY=null;   // current WS price y-pixel (drawn via plugin)

function buildMain(candles,sig){
  dChart('main');
  const el=document.getElementById('mainChart');if(!el)return;
  const ctx=el.getContext('2d');
  const col=sig.isLong?'#34d399':'#f87171';
  const slice=candles.slice(-120);
  // Reset zoom window to show last 80 candles on fresh load
  if(chartZoom.maxIdx===100||chartZoom.maxIdx>slice.length){
    chartZoom.maxIdx=slice.length;
    chartZoom.minIdx=Math.max(0,slice.length-80);
  }
  const isLight=document.body.classList.contains('light-mode');
  const gridCol=isLight?'rgba(180,190,210,.45)':'rgba(42,51,71,.45)';
  const tickCol=isLight?'#475569':'#64748b';

  // ── Signal lines + crosshair + live price plugin ──
  const overlayPlugin={
    id:'overlay',
    afterDraw(chart){
      const {ctx:c,chartArea:ca,scales:{y,x}}=chart;
      if(!ca||!y)return;
      const {left,right,top,bottom}=ca;

      // ── Signal level lines (Entry/TP1/TP2/SL) ──
      const lines=[
        {val:sig.entry,color:'#60a5fa',label:sig.isLong?'BUY':'SELL',dash:[],lw:1.8},
        {val:sig.tp1,  color:'#34d399',label:'TP1', dash:[7,4],lw:1.4},
        {val:sig.tp2,  color:'#6ee7b7',label:'TP2', dash:[4,4],lw:1.1},
        {val:sig.sl,   color:'#f87171',label:'SL',  dash:[7,4],lw:1.4},
      ];
      lines.forEach(({val,color,label,dash,lw})=>{
        if(!val||isNaN(val))return;
        const yp=y.getPixelForValue(val);
        if(yp<top-2||yp>bottom+2)return;
        c.save();
        c.strokeStyle=color;c.lineWidth=lw;c.setLineDash(dash);c.globalAlpha=0.82;
        c.beginPath();c.moveTo(left,yp);c.lineTo(right,yp);c.stroke();
        c.globalAlpha=1;c.setLineDash([]);
        // Pill label right side
        const lw2=64,lh=16,lx=right-lw2-5,ly=yp-lh/2;
        c.fillStyle=color+'28';c.strokeStyle=color;c.lineWidth=0.7;
        if(c.roundRect){c.beginPath();c.roundRect(lx,ly,lw2,lh,3);c.fill();c.stroke();}
        else{c.fillRect(lx,ly,lw2,lh);c.strokeRect(lx,ly,lw2,lh);}
        c.fillStyle=color;c.font="bold 8.5px 'JetBrains Mono',monospace";
        c.textAlign='center';c.textBaseline='middle';
        c.fillText(label+' '+fmt(val),lx+lw2/2,yp);
        c.restore();
      });

      // ── Live price line (from WS) ──
      if(lastWsPrice&&!isNaN(lastWsPrice)){
        const lyp=y.getPixelForValue(lastWsPrice);
        if(lyp>=top&&lyp<=bottom){
          const isUp=sig.isLong;
          c.save();
          c.strokeStyle=isUp?'#34d399':'#f87171';c.lineWidth=1;c.setLineDash([3,3]);c.globalAlpha=0.6;
          c.beginPath();c.moveTo(left,lyp);c.lineTo(right,lyp);c.stroke();
          c.globalAlpha=1;c.setLineDash([]);
          // Price badge left side
          const pw=70,ph=16,px2=left+4,py2=lyp-ph/2;
          c.fillStyle=isUp?'rgba(52,211,153,.2)':'rgba(248,113,113,.2)';
          c.strokeStyle=isUp?'#34d399':'#f87171';c.lineWidth=0.7;
          if(c.roundRect){c.beginPath();c.roundRect(px2,py2,pw,ph,3);c.fill();c.stroke();}
          else{c.fillRect(px2,py2,pw,ph);c.strokeRect(px2,py2,pw,ph);}
          c.fillStyle=isUp?'#34d399':'#f87171';
          c.font="bold 8.5px 'JetBrains Mono',monospace";
          c.textAlign='center';c.textBaseline='middle';
          c.fillText('▶ '+fmt(lastWsPrice),px2+pw/2,lyp);
          c.restore();
        }
      }

      // ── Crosshair ──
      if(crosshairX!==null&&crosshairY!==null){
        if(crosshairX>=left&&crosshairX<=right&&crosshairY>=top&&crosshairY<=bottom){
          c.save();
          c.strokeStyle=isLight?'rgba(100,116,139,0.55)':'rgba(148,163,184,0.45)';
          c.lineWidth=1;c.setLineDash([4,4]);
          c.beginPath();c.moveTo(crosshairX,top);c.lineTo(crosshairX,bottom);c.stroke();
          c.beginPath();c.moveTo(left,crosshairY);c.lineTo(right,crosshairY);c.stroke();
          c.setLineDash([]);
          // Y price label
          const priceAtY=y.getValueForPixel(crosshairY);
          if(priceAtY!==undefined){
            const txt=fmt(priceAtY);const tw=ctx.measureText(txt).width+14;
            const bx=right+2,by=crosshairY-8,bh=16;
            c.fillStyle=isLight?'#334155':'#1e293b';
            if(c.roundRect){c.beginPath();c.roundRect(bx,by,tw,bh,3);c.fill();}
            else c.fillRect(bx,by,tw,bh);
            c.fillStyle=isLight?'#f1f5f9':'#e2e8f0';
            c.font="bold 9px 'JetBrains Mono',monospace";c.textAlign='left';c.textBaseline='middle';
            c.fillText(txt,bx+7,crosshairY);
          }
          c.restore();
        }
      }
    }
  };

  const visSlice=slice.slice(chartZoom.minIdx,chartZoom.maxIdx);

  if(chartType==='candle'){
    const data=visSlice.map(c2=>({x:c2.t,o:c2.o,h:c2.h,l:c2.l,c:c2.c}));
    charts['main']=new Chart(ctx,{
      type:'candlestick',
      data:{datasets:[{label:curSym,data,
        color:{up:'#34d399',down:'#f87171',unchanged:'#94a3b8'},
        borderColor:{up:'#34d399',down:'#f87171',unchanged:'#94a3b8'}}]},
      plugins:[overlayPlugin],
      options:{responsive:true,maintainAspectRatio:false,animation:{duration:150},
        plugins:{legend:{display:false},
          tooltip:{mode:'index',intersect:false,
            callbacks:{
              title:items=>{if(!items.length)return'';const d=items[0].raw;return d?new Date(d.x).toLocaleString('en-PK',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'';},
              label:i=>{const d=i.raw;return d?[' O: '+fmt(d.o),' H: '+fmt(d.h),' L: '+fmt(d.l),' C: '+fmt(d.c)]:[];}
            }}},
        scales:{
          x:{type:'timeseries',time:{unit:curTF==='1D'?'day':(curTF==='4h'||curTF==='1h')?'hour':'minute',displayFormats:{minute:'HH:mm',hour:'MMM d HH:mm',day:'MMM d'}},
            grid:{color:gridCol},ticks:{maxTicksLimit:8,color:tickCol,font:{size:10,weight:'500'}}},
          y:{position:'right',grid:{color:gridCol},ticks:{callback:v=>fmt(v),color:tickCol,font:{size:10,weight:'500'}}}}}});
  } else {
    const labels=visSlice.map(c2=>new Date(c2.t));
    const cl2=visSlice.map(c2=>c2.c);
    const grad=ctx.createLinearGradient(0,0,0,460);
    grad.addColorStop(0,sig.isLong?'rgba(52,211,153,.16)':'rgba(248,113,113,.16)');
    grad.addColorStop(1,'rgba(0,0,0,0)');
    charts['main']=new Chart(ctx,{type:'line',
      data:{labels,datasets:[{label:curSym,data:cl2,borderColor:col,backgroundColor:grad,borderWidth:2,pointRadius:0,tension:.3,fill:true}]},
      plugins:[overlayPlugin],
      options:{responsive:true,maintainAspectRatio:false,animation:{duration:150},
        plugins:{legend:{display:false},
          tooltip:{callbacks:{
            title:items=>{if(!items.length)return'';return new Date(items[0].label).toLocaleString('en-PK',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});},
            label:i=>fmt(i.raw)}}},
        scales:{
          x:{type:'time',time:{unit:curTF==='1D'?'day':(curTF==='4h'||curTF==='1h')?'hour':'minute',displayFormats:{minute:'HH:mm',hour:'MMM d HH:mm',day:'MMM d'}},
            grid:{color:gridCol},ticks:{maxTicksLimit:8,color:tickCol,font:{size:10,weight:'500'}}},
          y:{position:'right',grid:{color:gridCol},ticks:{callback:v=>fmt(v),color:tickCol,font:{size:10,weight:'500'}}}}}});
  }

  attachChartInteraction(el,slice);
}

// ── Zoom & Pan & Crosshair ──
function attachChartInteraction(el,slice){
  el.onmousemove=function(e){
    const rect=el.getBoundingClientRect();
    crosshairX=e.clientX-rect.left;
    crosshairY=e.clientY-rect.top;
    if(charts['main'])charts['main'].update('none');
  };
  el.onmouseleave=function(){crosshairX=null;crosshairY=null;if(charts['main'])charts['main'].update('none');};

  el.onwheel=function(e){
    e.preventDefault();
    const total=slice.length;
    const win=chartZoom.maxIdx-chartZoom.minIdx;
    const delta=e.deltaY>0?Math.ceil(win*0.1):Math.ceil(win*0.1);
    if(e.deltaY>0){// zoom out
      chartZoom.minIdx=Math.max(0,chartZoom.minIdx-delta);
      chartZoom.maxIdx=Math.min(total,chartZoom.maxIdx+delta);
    } else {// zoom in
      if(win<=8)return;
      const mid=(chartZoom.minIdx+chartZoom.maxIdx)/2;
      chartZoom.minIdx=Math.max(0,Math.round(mid-win/2+delta));
      chartZoom.maxIdx=Math.min(total,Math.round(mid+win/2-delta));
    }
    if(chartZoom.maxIdx-chartZoom.minIdx<4){chartZoom.minIdx=Math.max(0,chartZoom.maxIdx-4);}
    if(lastCandles&&lastSignal)buildMain(lastCandles,lastSignal);
  },{passive:false};

  // Drag to pan
  el.onmousedown=function(e){isDragging=true;dragStartX=e.clientX;dragStartMin=chartZoom.minIdx;dragStartMax=chartZoom.maxIdx;el.style.cursor='grabbing';};
  window.addEventListener('mouseup',()=>{isDragging=false;const e=document.getElementById('mainChart');if(e)e.style.cursor='crosshair';});
  el.onmousemove=function(e){
    const rect=el.getBoundingClientRect();
    crosshairX=e.clientX-rect.left;crosshairY=e.clientY-rect.top;
    if(isDragging){
      const total=slice.length;
      const win=dragStartMax-dragStartMin;
      const chartW=rect.width-50;
      const pxPerCandle=chartW/Math.max(win,1);
      const dx=Math.round((dragStartX-e.clientX)/pxPerCandle);
      let ni=dragStartMin+dx,nx=dragStartMax+dx;
      if(ni<0){ni=0;nx=win;}
      if(nx>total){nx=total;ni=total-win;}
      chartZoom.minIdx=ni;chartZoom.maxIdx=nx;
      if(lastCandles&&lastSignal)buildMain(lastCandles,lastSignal);
    } else {
      if(charts['main'])charts['main'].update('none');
    }
  };

  // Touch pinch zoom
  let lastTouchDist=null;
  el.addEventListener('touchstart',e=>{if(e.touches.length===2){const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;lastTouchDist=Math.sqrt(dx*dx+dy*dy);}},{passive:true});
  el.addEventListener('touchmove',e=>{
    if(e.touches.length===2&&lastTouchDist){
      e.preventDefault();
      const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;
      const newDist=Math.sqrt(dx*dx+dy*dy);
      const ratio=newDist/lastTouchDist;
      const win=chartZoom.maxIdx-chartZoom.minIdx;
      const mid=(chartZoom.minIdx+chartZoom.maxIdx)/2;
      const newWin=Math.max(8,Math.min(slice.length,Math.round(win/ratio)));
      chartZoom.minIdx=Math.max(0,Math.round(mid-newWin/2));
      chartZoom.maxIdx=Math.min(slice.length,Math.round(mid+newWin/2));
      lastTouchDist=newDist;
      if(lastCandles&&lastSignal)buildMain(lastCandles,lastSignal);
    }
  },{passive:false});
  el.addEventListener('touchend',()=>{lastTouchDist=null;},{passive:true});

  // Set cursor
  el.style.cursor='crosshair';
}

function buildRSI(candles){
  dChart('rsi');
  const el=document.getElementById('rsiChart');if(!el)return;
  const cl=closes(candles);
  const arr=[];for(let i=15;i<cl.length;i++)arr.push(calcRSI(cl.slice(0,i+1)));
  const labels=candles.slice(-arr.length).map(c=>new Date(c.t));
  charts['rsi']=new Chart(el.getContext('2d'),{type:'line',
    data:{labels,datasets:[
      {data:arr,borderColor:'#60a5fa',borderWidth:1.5,pointRadius:0,tension:.3,fill:false},
      {data:Array(arr.length).fill(70),borderColor:'rgba(248,113,113,.4)',borderWidth:1,pointRadius:0,borderDash:[4,4],fill:false},
      {data:Array(arr.length).fill(30),borderColor:'rgba(52,211,153,.4)',borderWidth:1,pointRadius:0,borderDash:[4,4],fill:false},
    ]},
    options:{responsive:true,maintainAspectRatio:false,animation:{duration:0},
      plugins:{legend:{display:false}},
      scales:{x:{display:false},y:{min:0,max:100,position:'right',grid:{color:'rgba(42,51,71,.3)'},ticks:{maxTicksLimit:3}}}}});
}

function buildMACD(candles){
  dChart('macd');
  const el=document.getElementById('macdChart');if(!el)return;
  const cl=closes(candles);
  const hist=[],labels=[];
  for(let i=35;i<cl.length;i++){
    const {hist:h}=calcMACDFull(cl.slice(0,i+1));
    hist.push(h);labels.push(new Date(candles[i].t));
  }
  charts['macd']=new Chart(el.getContext('2d'),{type:'bar',
    data:{labels,datasets:[{data:hist,backgroundColor:hist.map(v=>v>=0?'rgba(52,211,153,.7)':'rgba(248,113,113,.7)'),borderWidth:0}]},
    options:{responsive:true,maintainAspectRatio:false,animation:{duration:0},
      plugins:{legend:{display:false}},
      scales:{x:{display:false},y:{position:'right',grid:{color:'rgba(42,51,71,.3)'},ticks:{maxTicksLimit:3}}}}});
}

function buildVol(candles){
  dChart('vol');
  const el=document.getElementById('volChart');if(!el)return;
  const slice=candles.slice(-80);
  const vols=slice.map(c=>c.v);
  const avg=vols.reduce((a,b)=>a+b,0)/vols.length;
  charts['vol']=new Chart(el.getContext('2d'),{type:'bar',
    data:{labels:slice.map(c=>new Date(c.t)),datasets:[{data:vols,
      backgroundColor:vols.map(v=>v>avg*1.5?'rgba(124,106,247,.7)':v>avg?'rgba(96,165,250,.6)':'rgba(42,51,71,.8)'),borderWidth:0}]},
    options:{responsive:true,maintainAspectRatio:false,animation:{duration:0},
      plugins:{legend:{display:false}},
      scales:{x:{display:false},y:{position:'right',grid:{color:'rgba(42,51,71,.3)'},ticks:{maxTicksLimit:3}}}}});
}

function buildGauge(score){
  dChart('gauge');
  const el=document.getElementById('gaugeCanvas');if(!el)return;
  const norm=Math.max(-1,Math.min(1,score/16));
  const col=norm>0.3?'#34d399':norm<-0.3?'#f87171':'#fbbf24';
  charts['gauge']=new Chart(el.getContext('2d'),{type:'doughnut',
    data:{datasets:[
      {data:[1],backgroundColor:['rgba(42,51,71,.5)'],borderWidth:0,circumference:180,rotation:270},
      {data:[norm<0?0:norm,norm<0?Math.abs(norm):0,1-Math.abs(norm)],
       backgroundColor:[col,'rgba(248,113,113,.6)','rgba(42,51,71,.2)'],borderWidth:0,circumference:180,rotation:270}
    ]},
    options:{responsive:true,maintainAspectRatio:false,animation:{duration:600},cutout:'70%',plugins:{legend:{display:false},tooltip:{enabled:false}}}});
}

function switchChartType(type,el){
  chartType=type;
  document.querySelectorAll('.chart-tab').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  if(lastCandles&&lastSignal)buildMain(lastCandles,lastSignal);
}
function resetChartZoom(){
  if(!lastCandles)return;
  const total=Math.min(120,lastCandles.length);
  chartZoom.minIdx=Math.max(0,total-80);
  chartZoom.maxIdx=total;
  if(lastCandles&&lastSignal)buildMain(lastCandles,lastSignal);
  showToast('🔍 Chart reset','info');
}


// ── Theme Toggle ──
function toggleTheme(){
  const isLight=document.body.classList.toggle('light-mode');
  const btn=document.getElementById('themeBtn');
  if(btn)btn.textContent=isLight?'🌙':'☀️';
  try{localStorage.setItem('btTheme',isLight?'light':'dark');}catch(e){}
  // Redraw charts and bubbles for new theme
  if(lastCandles&&lastSignal){
    buildMain(lastCandles,lastSignal);
    buildRSI(lastCandles);
    buildMACD(lastCandles);
    buildVol(lastCandles);
  }
  if(bubblesData.length){const c=document.getElementById('bubblesCanvas');if(c)c._bubbles=null;renderBubbles();}
}
function loadSavedTheme(){
  try{const t=localStorage.getItem('btTheme');
    if(t==='light'){document.body.classList.add('light-mode');const btn=document.getElementById('themeBtn');if(btn)btn.textContent='🌙';}
  }catch(e){}
}


// ═══ MULTI-PAIR SCANNER ═══
let scanInProgress=false;
const SCAN_PAIRS=['BTC/USDT','ETH/USDT','BNB/USDT','SOL/USDT','XRP/USDT','ADA/USDT','AVAX/USDT','DOGE/USDT','SUI/USDT','TRX/USDT','LINK/USDT','DOT/USDT','MATIC/USDT','INJ/USDT','NEAR/USDT','FTM/USDT','ATOM/USDT','ARB/USDT','OP/USDT','PEPE/USDT','WIF/USDT','JUP/USDT','BONK/USDT','FET/USDT','TIA/USDT','SEI/USDT','RUNE/USDT','LTC/USDT','BCH/USDT','UNI/USDT','SHIB/USDT','APT/USDT','STX/USDT','IMX/USDT','SAND/USDT','MANA/USDT','AXS/USDT','GALA/USDT','FLOKI/USDT','KAS/USDT','RENDER/USDT','ORDI/USDT','WLD/USDT','LDO/USDT','AAVE/USDT','GMX/USDT','CRV/USDT','ENS/USDT','BLUR/USDT','VIRTUAL/USDT','TRUMP/USDT','PIXEL/USDT','PORTAL/USDT','MYRO/USDT','MOVE/USDT','PENGU/USDT','NOT/USDT','PNUT/USDT','AI16Z/USDT','AIXBT/USDT','LAYER/USDT'];

// Render scan card for a pair result
function renderScanCard({sym,sig,pct}){
  const isEnter=sig.action==='ENTER',isConfirm=sig.action==='CONFIRM';
  const isLong=sig.isLong;
  const cardCls=isEnter?(isLong?'enter-signal':'short-signal'):'';
  const actCls=isEnter?'enter':isConfirm?'wait':'wait';
  const actTxt=isEnter?(isLong?'⬆ LONG':'⬇ SHORT'):isConfirm?'⏳ WAIT':'◆ HOLD';
  const pctStr=pct!==null?(pct>=0?'+':'')+pct.toFixed(2)+'%':'--';
  const pctCol=pct===null?'var(--text3)':pct>=0?'var(--green)':'var(--red)';
  const confCol=sig.conf>=70?'var(--green)':sig.conf>=55?'var(--gold)':'var(--red)';
  return`<div class="scan-card ${cardCls}" onclick="selectSym('${sym}')" title="Click to open ${sym} chart">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
      <span class="sc-pair">${sym.replace('/USDT','')}</span>
      <span style="font-size:10px;font-weight:700;font-family:'JetBrains Mono',monospace;color:${pctCol}">${pctStr}</span>
    </div>
    <div style="margin-bottom:4px;"><span class="sc-action ${actCls}">${actTxt}</span></div>
    <div class="sc-conf" style="color:${confCol}">Conf: ${sig.conf}%</div>
    <div class="sc-conf">Score: ${sig.score>0?'+':''}${sig.score}</div>
  </div>`;
}

async function runMultiScan(){
  if(scanInProgress)return;
  scanInProgress=true;
  const sp=document.getElementById('scannerSpinner'),txt=document.getElementById('scannerTxt');
  const grid=document.getElementById('scannerGrid');
  if(sp)sp.style.display='inline-block';
  if(txt)txt.textContent=`${SCAN_PAIRS.length} pairs scan ہو رہے ہیں...`;
  if(grid)grid.innerHTML='<div style="color:var(--text3);font-size:11px;font-family:\'JetBrains Mono\',monospace;padding:16px;grid-column:1/-1;text-align:center;"><span class="spin">⟳</span> تمام pairs scan ہو رہے ہیں...</div>';

  const results=[];
  // Scan in batches of 6
  for(let i=0;i<SCAN_PAIRS.length;i+=6){
    const batch=SCAN_PAIRS.slice(i,i+6);
    await Promise.all(batch.map(async sym=>{
      try{
        const info=SYMS[sym];if(!info)return;
        const candles=await fetchBinanceKlines(info.binance,curTF,120);
        if(!candles||candles.length<20)return;
        const sig=analyze(candles);
        const ticker=allTickerData.find(t=>t.symbol===sym);
        const pct=ticker?ticker.pctChange:null;
        results.push({sym,sig,pct});
        // Show float notif for strong ENTER signals
        if(sig.action==='ENTER'&&sym!==curSym)showFloatNotif(sig,sym);
        // Live update grid as results come in
        if(grid&&results.length>0){
          const sorted=[...results].sort((a,b)=>{
            const ao=a.sig.action==='ENTER'?3:a.sig.action==='CONFIRM'?2:1;
            const bo=b.sig.action==='ENTER'?3:b.sig.action==='CONFIRM'?2:1;
            return bo-ao||(b.sig.conf-a.sig.conf);
          });
          grid.innerHTML=sorted.map(r=>renderScanCard(r)).join('');
        }
      }catch(e){}
    }));
    if(txt)txt.textContent=`Scanning... ${Math.min(i+6,SCAN_PAIRS.length)}/${SCAN_PAIRS.length} pairs`;
    await new Promise(r=>setTimeout(r,250));
  }

  // Final sorted render - ALL pairs shown
  results.sort((a,b)=>{
    const ao=a.sig.action==='ENTER'?3:a.sig.action==='CONFIRM'?2:1;
    const bo=b.sig.action==='ENTER'?3:b.sig.action==='CONFIRM'?2:1;
    return bo-ao||(b.sig.conf-a.sig.conf);
  });

  if(grid){
    if(!results.length){
      grid.innerHTML='<div style="color:var(--text3);font-size:11px;padding:20px;grid-column:1/-1;text-align:center;">کوئی data نہیں ملا — network check کریں</div>';
    }else{
      grid.innerHTML=results.map(r=>renderScanCard(r)).join('');
    }
  }
  const enterCount=results.filter(r=>r.sig.action==='ENTER').length;
  const shortCount=results.filter(r=>r.sig.action==='ENTER'&&!r.sig.isLong).length;
  const longCount=enterCount-shortCount;
  if(txt)txt.textContent=`✅ ${results.length} pairs • ⬆ ${longCount} LONG • ⬇ ${shortCount} SHORT ENTER signals`;
  if(sp)sp.style.display='none';
  scanInProgress=false;
}


// ═══ NOTIFY + CHECK ═══
function checkAndNotify(sig){
  const prefs=loadAlerts();
  const isNew=!lastSignal||lastSignal.dir!==sig.dir||lastSignal.action!==sig.action;
  // Always show float notif for ENTER signals even if same direction
  const isNewEnter=sig.action==='ENTER'&&(!lastSignal||lastSignal.action!=='ENTER');
  if(isNew||isNewEnter){
    showFloatNotif(sig,curSym);
    if(prefs.signal)sendNotif(`🌸 ${curSym} — ${sig.isLong?'⬆ LONG':'⬇ SHORT'}`,`Conf: ${sig.conf}% | Entry: ${fmt(sig.entry)} | TP1: ${fmt(sig.tp1)} | SL: ${fmt(sig.sl)}`,'signal');
  }
  if(prefs.price&&lastPrice){
    const mv=lastPrice>0?Math.abs((sig.last-lastPrice)/lastPrice*100):0;
    if(mv>=2)sendNotif(`📈 ${curSym} Price Move!`,`${mv.toFixed(2)}% | ${fmt(sig.last)}`,'price');
  }
  lastPrice=sig.last;
  if(prefs.rsi){
    if(sig.rsi>74)sendNotif(`⚠️ ${curSym} RSI Overbought`,`RSI: ${sig.rsi}`,'rsi');
    else if(sig.rsi<26)sendNotif(`🔔 ${curSym} RSI Oversold`,`RSI: ${sig.rsi}`,'rsi');
  }
}

// ═══ MAIN SCAN ═══
async function runScan(silent=false){
  if(isScanning)return;
  isScanning=true;
  const btn=document.getElementById('scanBtn');
  if(!silent&&btn){btn.innerHTML='<span class="spin">⟳</span> SCANNING...';btn.disabled=true;}
  try{
    const candles=await getData(curSym,curTF);
    if(!candles||candles.length<20)throw new Error('Candles nahi mili');
    const sig=analyze(candles);
    checkAndNotify(sig);
    lastCandles=candles;lastSignal=sig;
    buildMain(candles,sig);
    buildRSI(candles);
    buildMACD(candles);
    buildVol(candles);
    updateUI(sig);
    renderSDZones(sig,curSym);
  }catch(e){
    console.error('Scan error:',e);
    setStatus('❌ '+e.message,'err');
    showToast('❌ '+e.message,'err');
  }
  if(btn){btn.innerHTML='🔍 SCAN';btn.disabled=false;}
  isScanning=false;
}

// ═══ AUTO SCAN ═══
function startAutoScan(){
  stopAutoScan();
  const delay=(curTF==='1m'||curTF==='5m')?30000:60000;
  autoTimer=setInterval(()=>runScan(true),delay);
}
function stopAutoScan(){if(autoTimer){clearInterval(autoTimer);autoTimer=null;}}

// ═══ SYM / TF SELECT ═══
function quickSym(el,sym){
  document.querySelectorAll('.sym-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  const si=document.getElementById('symSearch');if(si)si.value='';
  disconnectWebSocket();
  curSym=sym;lastSignal=null;lastPrice=null;lastWsPrice=null;
  runScan();startAutoScan();
}
function setTF(el,tf){
  document.querySelectorAll('.tf-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  curTF=tf;runScan();startAutoScan();
}

// ═══ DROPDOWN ═══
function filterSyms(){openDd();}
function openDd(){
  const q=(document.getElementById('symSearch')?.value||'').toUpperCase().replace(/[/\-]/g,'');
  const dd=document.getElementById('symDropdown');if(!dd)return;
  const matches=ALL_SYM_KEYS.filter(k=>{
    const c=k.replace(/[/\-]/g,'');
    return !q||c.includes(q);
  }).slice(0,60);
  dd.innerHTML='';
  if(!matches.length){
    const d=document.createElement('div');d.className='dd-item';d.style.color='var(--text3)';d.textContent='Koi pair nahi mila';dd.appendChild(d);
  } else {
    matches.forEach(sym=>{
      const d=document.createElement('div');d.className='dd-item';d.textContent=sym;
      d.onmousedown=e=>{e.preventDefault();selectSym(sym);};dd.appendChild(d);
    });
  }
  dd.style.display='block';
}
function closeDd(){const dd=document.getElementById('symDropdown');if(dd)dd.style.display='none';}
function selectSym(sym){
  const si=document.getElementById('symSearch');if(si)si.value=sym;
  closeDd();
  document.querySelectorAll('.sym-btn').forEach(b=>b.classList.remove('active'));
  disconnectWebSocket();
  curSym=sym;lastSignal=null;lastPrice=null;lastWsPrice=null;
  runScan();startAutoScan();
  showToast('📊 '+sym,'info');
}

// ═══ CLOCK ═══
function tick(){
  const d=new Date(),el=document.getElementById('clock');
  if(el)el.textContent=d.getUTCHours().toString().padStart(2,'0')+':'+d.getUTCMinutes().toString().padStart(2,'0')+':'+d.getUTCSeconds().toString().padStart(2,'0')+' UTC';
}
setInterval(tick,1000);tick();

// ═══ VISIBILITY RECONNECT ═══
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden){
    if(!wsActive&&SYMS[curSym]?.binance)connectWebSocket();
    // Re-scan when coming back to tab
    setTimeout(()=>runScan(true),500);
  }
});
// Keep WS alive - check every 15s
setInterval(()=>{
  if(!document.hidden&&!wsActive&&SYMS[curSym]?.binance){
    connectWebSocket();
  }
},15000);
// Re-scan every 30s if auto is off (safety net)
setInterval(()=>{
  if(!document.hidden&&lastCandles&&!isScanning){
    runScan(true);
  }
},30000);

// ═══ INIT ═══
window.onload=()=>{
  if(typeof Chart==='undefined'){setStatus('❌ Chart.js load nahi hua — Internet check karo','err');return;}
  loadSavedTheme();
  initChartDefaults();
  applyAlertPrefs();
  checkNotifStatus();
  loadStats();
  const prefs=loadAlerts();
  if(prefs.auto)startAutoScan();
  loadGainersLosers().catch(e=>console.warn('GL init:',e));
  // Update stats date
  const el=document.getElementById('statsDate');
  if(el){const d=new Date();el.textContent=d.toLocaleDateString('en-PK',{weekday:'short',day:'numeric',month:'short'});}
  runScan();
  // Auto-run multi scan after initial scan completes
  setTimeout(()=>runMultiScan(),3000);
};
</script>
</body>
</html>
