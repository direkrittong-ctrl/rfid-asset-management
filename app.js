'use strict';

const SEED_ASSETS = [
  { epc:'3008B3A4F2C1E8D0', name:'เครื่องคอมพิวเตอร์ Acer Aspire 5', code:'7440-001-0001/2563', room:'ห้องปฏิบัติการคอมพิวเตอร์', model:'Acer Aspire 5', serial:'NXA5ET0034567890', status:'ใช้งานได้', purchase:'12/03/2563' },
  { epc:'3008B3A4F2C1E8D1', name:'เครื่องปั่นเหวี่ยง', code:'7440-001-0002/2563', room:'ห้องจุลชีววิทยา', model:'Centrifuge', serial:'CENT-2023-001', status:'ใช้งานได้', purchase:'15/03/2563' },
  { epc:'3008B3A4F2C1E8D2', name:'ตู้เย็น', code:'7440-001-0003/2563', room:'ห้องจุลชีววิทยา', model:'Laboratory Refrigerator', serial:'REF-2023-002', status:'ใช้งานได้', purchase:'20/03/2563' },
  { epc:'3008B3A4F2C1E8D3', name:'กล้องจุลทรรศน์', code:'7440-001-0004/2563', room:'ห้องจุลชีววิทยา', model:'Microscope', serial:'MIC-2023-003', status:'ใช้งานได้', purchase:'22/03/2563' },
  { epc:'3008B3A4F2C1E8D4', name:'เครื่องชั่งดิจิทัล', code:'7440-001-0005/2563', room:'ห้องเตรียมตัวอย่าง', model:'Digital Balance', serial:'BAL-2023-004', status:'รอซ่อม', purchase:'25/03/2563' },
  { epc:'3008B3A4F2C1E8D5', name:'ตู้ดูดควัน', code:'7440-001-0006/2563', room:'ห้องเคมี', model:'Fume Hood', serial:'FH-2023-005', status:'ใช้งานได้', purchase:'28/03/2563' },
  { epc:'3008B3A4F2C1E8D6', name:'เครื่องวัด pH', code:'7440-001-0007/2563', room:'ห้องวิเคราะห์', model:'pH Meter', serial:'PH-2023-006', status:'ใช้งานได้', purchase:'02/04/2563' },
  { epc:'3008B3A4F2C1E8D7', name:'เครื่องกวนสาร', code:'7440-001-0008/2563', room:'ห้องเตรียมสาร', model:'Magnetic Stirrer', serial:'MS-2023-007', status:'รอซ่อม', purchase:'05/04/2563' }
];

const DEFAULT_LOGS = [
  {time:'30 ก.ย. 2568 09:15', room:'อาคาร 1 ห้อง 101', found:198, total:200, status:'เสร็จสิ้น'},
  {time:'29 ก.ย. 2568 14:32', room:'อาคาร 1 ห้อง 102', found:195, total:200, status:'เสร็จสิ้น'},
  {time:'28 ก.ย. 2568 10:20', room:'อาคาร 2 ห้อง 201', found:200, total:200, status:'เสร็จสิ้น'},
  {time:'27 ก.ย. 2568 16:45', room:'อาคาร 3 ห้อง 301', found:197, total:200, status:'เสร็จสิ้น'}
];

let assets = loadJSON('rfidAssets', SEED_ASSETS);
let logs = loadJSON('rfidLogs', DEFAULT_LOGS);
let found = new Set(loadJSON('rfidFound', []));
let currentFilter = 'all';
let currentPage = 'home';
let scanTimer = null;
let scanStarted = 0;
let scanIndex = 0;
let toastTimer = null;

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : structuredCloneSafe(fallback);
  } catch (error) {
    console.warn('loadJSON:', error);
    return structuredCloneSafe(fallback);
  }
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function saveState() {
  localStorage.setItem('rfidAssets', JSON.stringify(assets));
  localStorage.setItem('rfidLogs', JSON.stringify(logs));
  localStorage.setItem('rfidFound', JSON.stringify([...found]));
}

function $(id) { return document.getElementById(id); }

function login() {
  const username = $('loginUser').value.trim() || 'ผู้ใช้งาน';
  $('currentUser').textContent = username;
  $('sideUser').textContent = username;
  $('loginPage').classList.add('hidden');
  $('mainApp').classList.remove('hidden');
  navigate('home');
}

function demoLogin() {
  $('loginUser').value = 'ผู้ใช้ใหม่';
  $('loginPass').value = '12345678';
  login();
}

function logout() {
  stopScan(false);
  $('mainApp').classList.add('hidden');
  $('loginPage').classList.remove('hidden');
  closeMenu();
}

function togglePass() {
  const input = $('loginPass');
  input.type = input.type === 'password' ? 'text' : 'password';
}

function toggleMenu() {
  $('sideMenu').classList.toggle('open');
  $('overlay').classList.toggle('hidden');
}

function closeMenu() {
  $('sideMenu').classList.remove('open');
  $('overlay').classList.add('hidden');
}

function navigate(page) {
  closeMenu();
  showPage(page);
}

function showPage(page) {
  const target = $(page);
  if (!target) return;
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active-page'));
  target.classList.add('active-page');
  currentPage = page;

  const titles = {
    home:'หน้าหลัก', scan:'กำลังตรวจนับ', assets:'ผลการตรวจนับ', detail:'รายละเอียดครุภัณฑ์',
    history:'ประวัติการตรวจนับ', settings:'ตั้งค่า', reports:'รายงาน'
  };
  $('pageTitle').textContent = titles[page] || 'SUT Asset RFID';
  document.querySelectorAll('.bottom-nav button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  if (page === 'scan') startScan();
  else if (scanTimer) stopScan(false);

  renderAll();
  window.scrollTo({top:0, behavior:'smooth'});
}

function startScan() {
  if (scanTimer) return;
  if (!assets.length) {
    showToast('ยังไม่มีข้อมูลครุภัณฑ์สำหรับตรวจนับ');
    return;
  }
  scanStarted = Date.now();
  scanIndex = 0;
  $('scanHeading').textContent = 'กำลังสแกน...';
  $('scanHint').textContent = 'โหมดจำลอง R200 + ESP32';
  $('scanButton').textContent = '■ หยุดการสแกน';
  scanTimer = setInterval(scanTick, 900);
  scanTick();
}

function scanTick() {
  const missing = assets.filter(a => !found.has(a.epc));
  if (missing.length) {
    const item = missing[scanIndex % missing.length];
    found.add(item.epc);
    scanIndex += 1;
    saveState();
  }
  updateScanUI();
  if (found.size >= assets.length) {
    clearInterval(scanTimer);
    scanTimer = null;
    $('scanHeading').textContent = 'ตรวจนับครบแล้ว';
    $('scanHint').textContent = 'พบครุภัณฑ์ครบตามข้อมูลที่มีในระบบ';
    $('scanButton').textContent = '✓ ดูผลการตรวจนับ';
  }
  renderAll();
}

function stopScan(goToAssets = true) {
  const wasRunning = Boolean(scanTimer);
  if (scanTimer) {
    clearInterval(scanTimer);
    scanTimer = null;
  }
  if (wasRunning && found.size) {
    logs.unshift({
      time: new Date().toLocaleString('th-TH'),
      room: 'อาคาร 1 ห้อง 101',
      found: found.size,
      total: assets.length,
      status: 'เสร็จสิ้น'
    });
    logs = logs.slice(0, 30);
    saveState();
  }
  if (goToAssets) showPage('assets');
}

function toggleScan() {
  if (scanTimer) stopScan(true);
  else if (found.size >= assets.length) showPage('assets');
  else startScan();
}

function updateScanUI() {
  const total = assets.length;
  const count = found.size;
  $('scanCount').textContent = count;
  $('scanTotal').textContent = total;
  $('scanTime').textContent = formatDuration(Date.now() - scanStarted);
  $('scanProgress').style.width = total ? `${Math.round((count / total) * 100)}%` : '0%';
}

function formatDuration(ms) {
  let seconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(seconds / 3600)).padStart(2,'0');
  seconds %= 3600;
  const m = String(Math.floor(seconds / 60)).padStart(2,'0');
  seconds %= 60;
  return `${h}:${m}:${String(seconds).padStart(2,'0')}`;
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.filter === filter));
  renderAssets();
}

function iconFor(name) {
  if (/คอมพิวเตอร์|Acer/i.test(name)) return '▣';
  if (/จุลทรรศน์|Microscope/i.test(name)) return '⌬';
  if (/ตู้เย็น|Refrigerator/i.test(name)) return '▤';
  if (/ชั่ง|Balance/i.test(name)) return '⚖';
  if (/ตู้ดูดควัน|Fume/i.test(name)) return '▥';
  return '▦';
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function renderAll() {
  renderSummary();
  renderAssets();
  renderHistory();
  renderReport();
  updateScanUI();
}

function renderSummary() {
  const total = assets.length;
  const usable = assets.filter(a => a.status === 'ใช้งานได้').length;
  const broken = assets.filter(a => /ซ่อม/.test(a.status)).length;
  $('total').textContent = total;
  $('found').textContent = found.size;
  $('usable').textContent = usable;
  $('broken').textContent = broken;
  $('allCount').textContent = total;
  $('foundCount').textContent = found.size;
  $('missingCount').textContent = Math.max(0, total - found.size);
}

function renderAssets() {
  const query = ($('search')?.value || '').trim().toLowerCase();
  let list = assets.filter(asset => JSON.stringify(asset).toLowerCase().includes(query));
  if (currentFilter === 'found') list = list.filter(a => found.has(a.epc));
  if (currentFilter === 'missing') list = list.filter(a => !found.has(a.epc));

  const html = list.map(asset => {
    const isFound = found.has(asset.epc);
    const isBroken = /ซ่อม/.test(asset.status);
    return `<button class="asset-item" type="button" onclick="openDetail('${escapeHTML(asset.epc)}')">
      <span class="asset-icon">${iconFor(asset.name)}</span>
      <span class="asset-main"><b>${escapeHTML(asset.name)}</b><small>EPC: ${escapeHTML(asset.epc)}</small><small>${escapeHTML(asset.code)} • ${escapeHTML(asset.room)}</small></span>
      <span class="badge ${isFound ? '' : 'bad'}">${isFound ? 'พบ' : 'ไม่พบ'}</span>
      <span aria-hidden="true">›</span>
    </button>`;
  }).join('');

  $('assetList').innerHTML = html || '<div class="detail-card">ไม่พบข้อมูลที่ค้นหา</div>';
}

function openDetail(epc) {
  const asset = assets.find(a => a.epc === epc);
  if (!asset) return;
  const isFound = found.has(asset.epc);
  const isBroken = /ซ่อม/.test(asset.status);
  $('detailBody').innerHTML = `<div class="detail-card">
    <div class="detail-hero"><div class="asset-icon">${iconFor(asset.name)}</div><div><h2>${escapeHTML(asset.name)}</h2><span class="badge ${isFound ? '' : 'bad'}">${isFound ? 'พบ' : 'ไม่พบ'}</span></div></div>
    <div class="detail-grid">
      <div><small>เลขครุภัณฑ์</small>${escapeHTML(asset.code)}</div>
      <div><small>EPC Tag</small>${escapeHTML(asset.epc)}</div>
      <div><small>ยี่ห้อ / รุ่น</small>${escapeHTML(asset.model)}</div>
      <div><small>หมายเลขเครื่อง</small>${escapeHTML(asset.serial)}</div>
      <div><small>วันที่จัดซื้อ</small>${escapeHTML(asset.purchase)}</div>
      <div><small>สถานที่ใช้งาน</small>${escapeHTML(asset.room)}</div>
      <div><small>ผู้รับผิดชอบ</small>${escapeHTML($('currentUser').textContent)}</div>
      <div><small>สถานะ</small><span class="badge ${isBroken ? 'bad' : ''}">${escapeHTML(asset.status)}</span></div>
    </div>
    <button class="btn primary full" style="margin-top:15px" type="button" onclick="showToast('ประวัติของ ${escapeHTML(asset.name)} จะเชื่อมฐานข้อมูลจริงในขั้นถัดไป')">◷ ดูประวัติการตรวจนับ</button>
  </div>`;
  showPage('detail');
}

function renderHistory() {
  $('historyList').innerHTML = logs.slice(0,20).map(log => `<div class="history-item"><div>▣</div><div><b>${escapeHTML(log.time)}</b><small>${escapeHTML(log.room)}</small><small>พบ ${log.found} / ${log.total} รายการ • <span class="badge">${escapeHTML(log.status)}</span></small></div></div>`).join('') || '<div class="detail-card">ยังไม่มีประวัติการตรวจนับ</div>';
}

function renderReport() {
  const total = assets.length;
  const missing = Math.max(0, total - found.size);
  const percent = total ? Math.round((found.size / total) * 100) : 0;
  $('reportFound').textContent = found.size;
  $('reportMissing').textContent = missing;
  $('completion').textContent = `${percent}%`;
  $('foundBar').style.height = `${Math.max(10, percent)}%`;
  $('missingBar').style.height = `${Math.max(10, 100 - percent)}%`;
}

function toggleBT(input) {
  const connected = Boolean(input.checked);
  $('btStatus').textContent = connected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ';
  $('btText').textContent = connected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ';
  $('statusDot').classList.toggle('off', !connected);
  showToast(connected ? 'เชื่อมต่อ ESP32-01 แล้ว' : 'ตัดการเชื่อมต่อ ESP32-01 แล้ว');
}

function testRFID() {
  showToast('ทดสอบ RFID สำเร็จ • ESP32-01 พร้อมรับข้อมูลจาก R200');
}

function exportReport() {
  const rows = [['เลขครุภัณฑ์','ชื่อครุภัณฑ์','EPC Tag','สถานที่','สถานะระบบ','ผลตรวจนับ']];
  assets.forEach(a => rows.push([a.code,a.name,a.epc,a.room,a.status,found.has(a.epc) ? 'พบ' : 'ไม่พบ']));
  const csv = '\ufeff' + rows.map(row => row.map(csvCell).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SUT_RFID_Report_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast('ส่งออกรายงาน CSV แล้ว');
}

function csvCell(value) {
  return `"${String(value).replace(/"/g,'""')}"`;
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

window.addEventListener('beforeunload', () => {
  if (scanTimer) clearInterval(scanTimer);
});

// เริ่มต้นระบบ
renderAll();
