<!DOCTYPE html>
<html lang="ur">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BloomTraders — Login</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
:root{
  --bg:#0f1117;--bg2:#161b26;--bg3:#1c2333;
  --border:#2a3347;--purple:#7c6af7;--purple2:#9b8df9;
  --green:#34d399;--red:#f87171;--gold:#fbbf24;
  --text:#e2e8f0;--text2:#94a3b8;--text3:#64748b;
}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;}
body::before{content:'';position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(124,106,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,106,247,0.03) 1px,transparent 1px);background-size:48px 48px;}

/* ── LOGO ── */
.logo-wrap{text-align:center;margin-bottom:32px;}
.logo-icon{width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,#7c6af7,#60a5fa);display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 12px;box-shadow:0 0 32px rgba(124,106,247,.4);animation:pulse 3s ease-in-out infinite;}
@keyframes pulse{0%,100%{box-shadow:0 0 24px rgba(124,106,247,.3)}50%{box-shadow:0 0 48px rgba(124,106,247,.6)}}
.logo-title{font-size:26px;font-weight:800;letter-spacing:-1px;}
.logo-title span{color:var(--purple2);}
.logo-sub{font-size:11px;color:var(--text3);margin-top:4px;font-family:'JetBrains Mono',monospace;}
.made-by{font-size:10px;color:var(--purple2);opacity:.6;margin-top:2px;font-family:'JetBrains Mono',monospace;}

/* ── CARD ── */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:32px;width:100%;max-width:420px;position:relative;z-index:1;}
.card-title{font-size:18px;font-weight:700;margin-bottom:6px;}
.card-sub{font-size:12px;color:var(--text3);margin-bottom:24px;}

/* ── TABS ── */
.tabs{display:flex;gap:4px;background:var(--bg3);border-radius:10px;padding:4px;margin-bottom:24px;}
.tab{flex:1;padding:8px;border-radius:7px;border:none;background:transparent;color:var(--text2);cursor:pointer;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;transition:all .2s;}
.tab.active{background:var(--bg2);color:var(--text);box-shadow:0 2px 8px rgba(0,0,0,.3);}

/* ── FORM ── */
.field{margin-bottom:16px;}
.field label{display:block;font-size:11px;color:var(--text2);margin-bottom:6px;font-weight:500;letter-spacing:.5px;}
.field input{width:100%;padding:11px 14px;border-radius:10px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-family:'Inter',sans-serif;font-size:14px;outline:none;transition:border .2s;}
.field input:focus{border-color:rgba(124,106,247,.5);}
.field input::placeholder{color:var(--text3);}

/* ── BUTTON ── */
.btn{width:100%;padding:13px;border-radius:10px;border:none;background:linear-gradient(135deg,var(--purple),#60a5fa);color:#fff;font-family:'Inter',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .25s;margin-top:4px;}
.btn:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(124,106,247,.4);}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.btn-outline{background:transparent;border:1px solid rgba(124,106,247,.4);color:var(--purple2);}
.btn-outline:hover{background:rgba(124,106,247,.1);}

/* ── ERROR / SUCCESS ── */
.alert{padding:10px 14px;border-radius:8px;font-size:12px;margin-bottom:16px;display:none;}
.alert.show{display:block;}
.alert.err{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.3);color:var(--red);}
.alert.ok{background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.3);color:var(--green);}

/* ── PRICING SECTION ── */
#pricingSection{display:none;width:100%;max-width:420px;}
.pricing-title{text-align:center;font-size:22px;font-weight:800;margin-bottom:6px;}
.pricing-sub{text-align:center;font-size:12px;color:var(--text3);margin-bottom:28px;font-family:'JetBrains Mono',monospace;}
.plan-card{background:var(--bg2);border:1px solid rgba(124,106,247,.5);border-radius:20px;padding:28px;position:relative;box-shadow:0 0 40px rgba(124,106,247,.12);}
.plan-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--purple),#60a5fa);color:#fff;font-size:10px;font-weight:700;padding:4px 16px;border-radius:20px;white-space:nowrap;letter-spacing:.5px;}
.plan-name{font-size:12px;font-weight:600;color:var(--text2);margin-bottom:10px;font-family:'JetBrains Mono',monospace;text-align:center;}
.plan-price{font-size:52px;font-weight:800;letter-spacing:-2px;margin-bottom:4px;text-align:center;}
.plan-price span{font-size:16px;font-weight:400;color:var(--text3);}
.plan-features{list-style:none;margin:20px 0;display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.plan-features li{font-size:12px;color:var(--text2);padding:5px 8px;display:flex;align-items:center;gap:7px;background:rgba(255,255,255,.02);border-radius:7px;}
.plan-features li::before{content:'✓';color:var(--green);font-weight:700;font-size:11px;flex-shrink:0;}
.plan-btn{width:100%;padding:14px;border-radius:11px;border:none;font-family:'Inter',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;background:linear-gradient(135deg,var(--purple),#60a5fa);color:#fff;margin-top:4px;}
.plan-btn:hover{box-shadow:0 8px 28px rgba(124,106,247,.45);transform:translateY(-2px);}
.plan-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.plan-trial{text-align:center;font-size:11px;color:var(--text3);margin-top:12px;}
.back-link{text-align:center;margin-top:16px;font-size:12px;color:var(--text3);cursor:pointer;}
.back-link:hover{color:var(--purple2);}

/* ── DASHBOARD REDIRECT ── */
#dashSection{display:none;text-align:center;}
.dash-icon{font-size:48px;margin-bottom:16px;}
.spin{animation:spin .8s linear infinite;display:inline-block;}
@keyframes spin{to{transform:rotate(360deg)}}

@media(max-width:600px){.plans{grid-template-columns:1fr;}.card{padding:24px;}}
</style>
</head>
<body>

<!-- LOGO -->
<div class="logo-wrap">
  <div class="logo-icon">🌸</div>
  <div class="logo-title">Bloom<span>Traders</span></div>
  <div class="logo-sub">AI-Powered Signal Engine • Real-Time Analysis</div>
  <div class="made-by">Made by Hassan Raza</div>
</div>

<!-- LOGIN / REGISTER CARD -->
<div class="card" id="authCard">
  <div class="tabs">
    <button class="tab active" id="loginTab" onclick="switchTab('login')">Login</button>
    <button class="tab" id="registerTab" onclick="switchTab('register')">Register</button>
  </div>

  <div id="alertBox" class="alert"></div>

  <!-- LOGIN FORM -->
  <div id="loginForm">
    <div class="field">
      <label>EMAIL ADDRESS</label>
      <input type="email" id="loginEmail" placeholder="aapka@email.com" autocomplete="email">
    </div>
    <div class="field">
      <label>PASSWORD</label>
      <input type="password" id="loginPassword" placeholder="••••••••" autocomplete="current-password">
    </div>
    <button class="btn" id="loginBtn" onclick="handleLogin()">Login کریں</button>
  </div>

  <!-- REGISTER FORM -->
  <div id="registerForm" style="display:none;">
    <div class="field">
      <label>FULL NAME</label>
      <input type="text" id="regName" placeholder="Hassan Raza">
    </div>
    <div class="field">
      <label>EMAIL ADDRESS</label>
      <input type="email" id="regEmail" placeholder="aapka@email.com">
    </div>
    <div class="field">
      <label>PASSWORD (min 8 characters)</label>
      <input type="password" id="regPassword" placeholder="••••••••">
    </div>
    <button class="btn" id="registerBtn" onclick="handleRegister()">Account Banائیں</button>
  </div>
</div>

<!-- PRICING SECTION -->
<div id="pricingSection">
  <div class="pricing-title">🌸 BloomTraders Access</div>
  <div class="pricing-sub">Account ban gaya! Ab subscribe karein aur trading shuru karein</div>

  <div id="pricingAlert" class="alert"></div>

  <div class="plan-card">
    <div class="plan-badge">⚡ Full Access</div>
    <div class="plan-name">MONTHLY SUBSCRIPTION</div>
    <div class="plan-price">$9.99<span>/month</span></div>

    <ul class="plan-features">
      <li>تمام AI Signals</li>
      <li>200+ Crypto Pairs</li>
      <li>Real-Time WebSocket</li>
      <li>Supply & Demand Zones</li>
      <li>Chart Patterns + SVG</li>
      <li>Multi-Pair Scanner</li>
      <li>30m Timeframe</li>
      <li>TP / SL Targets</li>
    </ul>

    <button class="plan-btn" onclick="buyPlan()" id="monthlyBtn">
      ⚡ ابھی Subscribe کریں — $9.99/month
    </button>
    <div class="plan-trial">🔒 Secure payment by Lemon Squeezy &nbsp;•&nbsp; کسی بھی وقت cancel کریں</div>
  </div>
  <div class="back-link" onclick="logout()">← Logout</div>
</div>

<!-- DASHBOARD LOADING -->
<div class="card" id="dashSection">
  <div class="dash-icon">🌸</div>
  <h2 style="margin-bottom:8px;">خوش آمدید!</h2>
  <p style="color:var(--text3);font-size:13px;margin-bottom:20px;" id="dashMsg">BloomTraders کھل رہی ہے...</p>
  <div style="font-size:24px;margin-bottom:16px;"><span class="spin">⟳</span></div>
  <button class="btn btn-outline" onclick="openDashboard()">BloomTraders کھولیں →</button>
</div>

<script>
// ══════════════════════════════
// CONFIG — apna backend URL yahan likhen
// ══════════════════════════════
const API_BASE = 'https://your-backend.railway.app/api';
// Local testing k liye: const API_BASE = 'http://localhost:3000/api';

// ── State ──
let currentToken = localStorage.getItem('bt_token');
let currentUser = null;

// ── Init ──
window.onload = async () => {
  if (currentToken) {
    await checkExistingSession();
  }
};

async function checkExistingSession() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    if (!res.ok) { logout(); return; }
    const data = await res.json();
    currentUser = data.user;
    if (currentUser.subscription_active) {
      showDashboard();
    } else {
      showPricing();
    }
  } catch (e) {
    logout();
  }
}

// ── Tab Switch ──
function switchTab(tab) {
  document.getElementById('loginTab').className = 'tab' + (tab==='login'?' active':'');
  document.getElementById('registerTab').className = 'tab' + (tab==='register'?' active':'');
  document.getElementById('loginForm').style.display = tab==='login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab==='register' ? 'block' : 'none';
  clearAlert();
}

// ── Alerts ──
function showAlert(msg, type='err') {
  const el = document.getElementById('alertBox');
  el.textContent = msg;
  el.className = `alert show ${type}`;
}
function clearAlert() {
  document.getElementById('alertBox').className = 'alert';
}
function showPricingAlert(msg, type='err') {
  const el = document.getElementById('pricingAlert');
  el.textContent = msg;
  el.className = `alert show ${type}`;
}

// ── LOGIN ──
async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) return showAlert('Email aur password dono likhen.');

  const btn = document.getElementById('loginBtn');
  btn.disabled = true; btn.textContent = '⟳ Wait...';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return showAlert(data.error || 'Login fail hua.');

    currentToken = data.token;
    currentUser = data.user;
    localStorage.setItem('bt_token', currentToken);

    if (data.user.subscription_active) {
      showDashboard();
    } else {
      showPricing();
    }
  } catch (e) {
    showAlert('Network error. Internet check karein.');
  } finally {
    btn.disabled = false; btn.textContent = 'Login کریں';
  }
}

// ── REGISTER ──
async function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  if (!name || !email || !password) return showAlert('Tamam fields bharen.');

  const btn = document.getElementById('registerBtn');
  btn.disabled = true; btn.textContent = '⟳ Wait...';

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) return showAlert(data.error || 'Register fail hua.');

    currentToken = data.token;
    currentUser = data.user;
    localStorage.setItem('bt_token', currentToken);
    showPricing();
  } catch (e) {
    showAlert('Network error. Internet check karein.');
  } finally {
    btn.disabled = false; btn.textContent = 'Account Banائیں';
  }
}

// ── BUY PLAN ──
async function buyPlan() {
  const btn = document.getElementById('monthlyBtn');
  btn.disabled = true; btn.textContent = '⟳ Checkout بن رہا ہے...';

  try {
    const res = await fetch(`${API_BASE}/subscription/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ plan: 'monthly' })
    });
    const data = await res.json();
    if (!res.ok) {
      showPricingAlert(data.error || 'Checkout fail hua. Dobara koshish karein.');
      return;
    }
    window.location.href = data.checkout_url;
  } catch (e) {
    showPricingAlert('Network error. Internet check karein.');
  } finally {
    btn.disabled = false;
    btn.textContent = '⚡ ابھی Subscribe کریں — $9.99/month';
  }
}

// ── Show Pricing ──
function showPricing() {
  document.getElementById('authCard').style.display = 'none';
  document.getElementById('dashSection').style.display = 'none';
  document.getElementById('pricingSection').style.display = 'block';

  // Check if payment just completed
  const params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success') {
    showPricingAlert('Payment successful! Subscription active ho rahi hai... (1-2 min wait karein)', 'ok');
    setTimeout(checkExistingSession, 3000);
  }
}

// ── Show Dashboard ──
function showDashboard() {
  document.getElementById('authCard').style.display = 'none';
  document.getElementById('pricingSection').style.display = 'none';
  document.getElementById('dashSection').style.display = 'block';

  const name = currentUser?.name || 'Trader';
  const days = currentUser?.days_remaining || 0;
  const plan = currentUser?.plan || '';
  document.getElementById('dashMsg').textContent =
    `خوش آمدید ${name}! آپ کا ${plan} plan ${days} دن باقی ہے۔`;

  // Auto-redirect after 2 seconds
  setTimeout(openDashboard, 2000);
}

function openDashboard() {
  // Store token for BloomTraders app to use
  localStorage.setItem('bt_token', currentToken);
  localStorage.setItem('bt_user', JSON.stringify(currentUser));
  window.location.href = 'app.html';
}

function logout() {
  localStorage.removeItem('bt_token');
  localStorage.removeItem('bt_user');
  currentToken = null;
  currentUser = null;
  document.getElementById('authCard').style.display = 'block';
  document.getElementById('pricingSection').style.display = 'none';
  document.getElementById('dashSection').style.display = 'none';
}

// Enter key support
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const loginVisible = document.getElementById('loginForm').style.display !== 'none';
    const authVisible = document.getElementById('authCard').style.display !== 'none';
    if (authVisible && loginVisible) handleLogin();
    else if (authVisible) handleRegister();
  }
});
</script>
</body>
</html>
