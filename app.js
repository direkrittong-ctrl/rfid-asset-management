
const KEY = "sut_rfid_demo_v2";

const seed = [
  {id:"7440-001-0001/2563", name:"เครื่องคอมพิวเตอร์", type:"คอมพิวเตอร์ / อุปกรณ์ IT", model:"Acer Aspire 5", serial:"NXA5ET0034567890", epc:"3008B3A4F2C1E8D0", date:"12/03/2563", location:"ห้องปฏิบัติการคอมพิวเตอร์", owner:"ดิเรกฤทธิ์ แสงโชติ", status:"ปกติ"},
  {id:"7440-001-0002/2563", name:"เครื่องปั่นเหวี่ยง", type:"เครื่องมือวิทยาศาสตร์", model:"Centrifuge", serial:"CF-003456", epc:"3008B3A4F2C1E8D1", date:"12/03/2563", location:"ห้องปฏิบัติการจุลชีววิทยา", owner:"ดิเรกฤทธิ์ แสงโชติ", status:"ปกติ"},
  {id:"7440-001-0003/2563", name:"ตู้เย็น", type:"ครุภัณฑ์สำนักงาน", model:"Laboratory Refrigerator", serial:"REF-00987", epc:"3008B3A4F2C1E8D2", date:"12/03/2563", location:"ห้องปฏิบัติการจุลชีววิทยา", owner:"ดิเรกฤทธิ์ แสงโชติ", status:"ปกติ"},
  {id:"7440-001-0004/2563", name:"กล้องจุลทรรศน์", type:"เครื่องมือวิทยาศาสตร์", model:"Olympus", serial:"MIC-22001", epc:"3008B3A4F2C1E8D3", date:"12/03/2563", location:"ห้องปฏิบัติการจุลชีววิทยา", owner:"ดิเรกฤทธิ์ แสงโชติ", status:"ปกติ"},
  {id:"7440-001-0005/2563", name:"เครื่องชั่งดิจิทัล", type:"เครื่องมือวิทยาศาสตร์", model:"Digital Balance", serial:"BAL-10001", epc:"3008B3A4F2C1E8D4", date:"12/03/2563", location:"ห้องเตรียมตัวอย่าง", owner:"ดิเรกฤทธิ์ แสงโชติ", status:"ปกติ"}
];

let state = load();
let currentPage = state.loggedIn ? "home" : "login";
let scanTimer = null;
let scanCount = 0;

function load(){
  try{
    const x = JSON.parse(localStorage.getItem(KEY));
    return x || {loggedIn:false, user:"ดิเรกฤทธิ์ แสงโชติ", assets:seed, history:[]};
  }catch(e){ return {loggedIn:false,user:"ดิเรกฤทธิ์ แสงโชติ",assets:seed,history:[]};}
}
function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function icon(i){ return `<span>${i}</span>`; }

function render(){
  const root=document.getElementById("app");
  root.innerHTML = currentPage==="login" ? loginView() : appView();
  bind();
}
function loginView(){
 return `<div class="login">
   <div class="login-box">
     <div class="logo-large">SUT</div>
     <h1>ระบบตรวจนับครุภัณฑ์</h1>
     <p class="muted">ด้วย RFID (UHF)</p>
     <p class="muted">มหาวิทยาลัยเทคโนโลยีสุรนารี</p>
     <div class="form-group" style="text-align:left;margin-top:20px"><label>ชื่อผู้ใช้</label><input id="loginUser" class="input" value="ดิเรกฤทธิ์ แสงโชติ"></div>
     <div class="form-group" style="text-align:left;margin-top:12px"><label>รหัสผ่าน</label><input id="loginPass" type="password" class="input" value="12345678"></div>
     <button id="loginBtn" class="btn btn-primary" style="width:100%;margin-top:16px;padding:13px">เข้าสู่ระบบ</button>
     <p class="muted" style="font-size:11px;margin-top:14px">ระบบต้นแบบสำหรับทดสอบ Workflow</p>
   </div>
 </div>`;
}
function appView(){
 return `<div class="topbar">
   <div class="brand"><button id="menuBtn" class="icon-btn">☰</button><div class="brand-mark">S</div><div>SUT Asset RFID<small>ระบบตรวจนับครุภัณฑ์</small></div></div>
   <div class="toolbar"><span style="font-size:12px">● ESP32-01</span><button id="logoutBtn" class="icon-btn" title="ออกจากระบบ">⇥</button></div>
 </div>
 <div class="layout">
  <aside id="sidebar" class="sidebar">
    <div class="nav-title">เมนูหลัก</div>
    ${nav("home","⌂","หน้าหลัก")}
    ${nav("scan","⌁","เริ่มตรวจนับ")}
    ${nav("assets","☷","รายการครุภัณฑ์")}
    ${nav("history","◷","ประวัติการตรวจนับ")}
    ${nav("reports","▥","รายงาน")}
    ${nav("import","⇧","นำเข้า Excel")}
    <div class="nav-title">ระบบ</div>
    ${nav("settings","⚙","ตั้งค่า")}
  </aside>
  <main id="main" class="main">${pageContent()}</main>
 </div>`;
}
function nav(id,ic,label){
 return `<button class="nav-btn ${currentPage===id?'active':''}" data-page="${id}">${ic}<span>${label}</span></button>`;
}
function pageContent(){
 switch(currentPage){
  case "home": return homePage();
  case "scan": return scanPage();
  case "assets": return assetsPage();
  case "history": return historyPage();
  case "reports": return reportsPage();
  case "import": return importPage();
  case "settings": return settingsPage();
  default:return homePage();
 }
}

function homePage(){
 const total=state.assets.length, found=Math.min(total, state.history.length ? total-2 : 0), missing=total-found;
 return `<div class="page">
   <div class="hero"><h1>ระบบตรวจนับครุภัณฑ์ด้วย RFID (UHF)</h1><p>รวดเร็ว • แม่นยำ • ลดภาระงาน • ใช้งานได้จริง</p></div>
   <div class="grid grid-4">
    <div class="stat"><div class="label">ครุภัณฑ์ทั้งหมด</div><div class="value">${total}</div></div>
    <div class="stat green"><div class="label">ตรวจพบ</div><div class="value">${found}</div></div>
    <div class="stat orange"><div class="label">ยังไม่ได้ตรวจ</div><div class="value">${missing}</div></div>
    <div class="stat red"><div class="label">ชำรุด</div><div class="value">${state.assets.filter(a=>a.status!=="ปกติ").length}</div></div>
   </div>
   <div class="grid grid-2" style="margin-top:18px">
    <div class="card"><h2 class="section-title">เมนูด่วน</h2><div class="actions">
      <button class="action-btn primary" data-page="scan"><strong>▣ เริ่มตรวจนับ</strong><span>สแกนครุภัณฑ์ภายในห้อง/พื้นที่</span></button>
      <button class="action-btn" data-page="assets"><strong>☷ รายการครุภัณฑ์</strong><span>ดู ค้นหา และแก้ไขข้อมูล</span></button>
      <button class="action-btn" data-page="import"><strong>⇧ นำเข้า Excel</strong><span>นำฐานข้อมูลเดิมเข้าระบบ</span></button>
      <button class="action-btn" data-page="reports"><strong>▥ รายงาน</strong><span>สรุปผลและส่งออก Excel</span></button>
    </div></div>
    <div class="card"><h2 class="section-title">สถานะระบบ</h2>
      <div class="list-item"><span>การเชื่อมต่อ RFID</span><span class="badge badge-green">พร้อมใช้งาน</span></div>
      <div class="list-item"><span>ผู้ใช้งาน</span><strong>${esc(state.user)}</strong></div>
      <div class="list-item"><span>ข้อมูล</span><span class="badge badge-green">LocalStorage</span></div>
      <div class="list-item"><span>เวอร์ชัน</span><span>1.0.0 MVP</span></div>
    </div>
   </div>
 </div>`;
}

function scanPage(){
 const total=state.assets.length;
 return `<div class="page">
   <div class="page-head"><div><h1 class="page-title">กำลังตรวจนับ</h1><div class="page-sub">โปรดให้เสาอากาศอยู่ใกล้ครุภัณฑ์ประมาณ 1–3 เมตร</div></div><button id="resetScan" class="btn btn-light">เริ่มใหม่</button></div>
   <div class="card">
    <div class="scan-box">
      <div>
       <div class="rfid-ring"><div class="rfid-icon">)))</div></div>
       <h2 id="scanStatus">พร้อมเริ่มสแกน</h2>
       <div class="scan-number"><span id="scanCount">${scanCount}</span> <small style="font-size:14px;color:#60758a">รายการ</small></div>
       <p class="muted">ทั้งหมด (โดยประมาณ) ${total} รายการ</p>
       <div class="progress" style="width:min(520px,80vw);margin:14px auto"><div id="scanProgress" style="width:${total?scanCount/total*100:0}%"></div></div>
       <button id="scanBtn" class="btn ${scanTimer?'btn-danger':'btn-primary'}" style="min-width:190px">${scanTimer?'■ หยุดการสแกน':'⌁ เริ่มสแกน RFID'}</button>
      </div>
    </div>
   </div>
   <div class="grid grid-3" style="margin-top:16px">
    <div class="stat green"><div class="label">อ่านได้แล้ว</div><div class="value">${scanCount}</div></div>
    <div class="stat"><div class="label">ทั้งหมด</div><div class="value">${total}</div></div>
    <div class="stat orange"><div class="label">ยังไม่พบ</div><div class="value">${Math.max(total-scanCount,0)}</div></div>
   </div>
 </div>`;
}

function assetsPage(){
 return `<div class="page">
   <div class="page-head"><div><h1 class="page-title">รายการครุภัณฑ์</h1><div class="page-sub">ค้นหา / เพิ่ม / แก้ไข / ดูรายละเอียด</div></div>
   <div class="toolbar"><button class="btn btn-primary" id="addAsset">＋ เพิ่มครุภัณฑ์</button><button class="btn btn-light" data-page="import">⇧ นำเข้า Excel</button></div></div>
   <div class="card">
    <div class="toolbar" style="margin-bottom:14px"><input id="assetSearch" class="input" style="max-width:430px" placeholder="ค้นหาชื่อ / เลขครุภัณฑ์ / EPC / หมายเลขเครื่อง"><span class="kpi">${state.assets.length} รายการ</span></div>
    <div class="table-wrap"><table><thead><tr><th>ครุภัณฑ์</th><th>เลขครุภัณฑ์</th><th>EPC</th><th>สถานที่</th><th>สถานะ</th><th></th></tr></thead><tbody id="assetRows">${assetRows(state.assets)}</tbody></table></div>
   </div>
 </div>`;
}
function assetRows(arr){
 if(!arr.length) return `<tr><td colspan="6" class="empty">ไม่พบข้อมูล</td></tr>`;
 return arr.map((a,i)=>`<tr>
  <td><strong>${esc(a.name)}</strong><br><span class="muted">${esc(a.model)}</span></td>
  <td>${esc(a.id)}</td><td>${esc(a.epc)}</td><td>${esc(a.location)}</td>
  <td><span class="badge ${a.status==="ปกติ"?'badge-green':'badge-red'}">${esc(a.status)}</span></td>
  <td><button class="btn btn-light viewAsset" data-i="${state.assets.indexOf(a)}">ดู</button></td>
 </tr>`).join("");
}

function historyPage(){
 return `<div class="page"><div class="page-head"><div><h1 class="page-title">ประวัติการตรวจนับ</h1><div class="page-sub">ติดตามการตรวจนับย้อนหลัง</div></div></div>
 <div class="card">${state.history.length?state.history.slice().reverse().map(h=>`<div class="list-item"><div><strong>${esc(h.date)}</strong><div class="muted">${esc(h.location||"พื้นที่ตรวจนับ")}</div></div><div><span class="badge badge-green">เสร็จสิ้น</span><div style="text-align:right;font-size:12px;margin-top:4px">พบ ${h.found}/${h.total} รายการ</div></div></div>`).join(""):`<div class="empty">ยังไม่มีประวัติการตรวจนับ<br><button class="btn btn-primary" data-page="scan" style="margin-top:12px">เริ่มตรวจนับ</button></div>`}</div></div>`;
}

function reportsPage(){
 const total=state.assets.length, found=Math.min(total, state.history.length?total-2:0), pct=total?Math.round(found/total*100):0;
 return `<div class="page"><div class="page-head"><div><h1 class="page-title">รายงาน</h1><div class="page-sub">สรุปผลการตรวจนับและส่งออกข้อมูล</div></div><button id="exportExcel" class="btn btn-primary">⇩ ส่งออก Excel</button></div>
 <div class="grid grid-3"><div class="stat green"><div class="label">พบ</div><div class="value">${found}</div></div><div class="stat red"><div class="label">ไม่พบ</div><div class="value">${total-found}</div></div><div class="stat"><div class="label">ความครบถ้วน</div><div class="value">${pct}%</div></div></div>
 <div class="card" style="margin-top:16px"><h2 class="section-title">สรุปผลการตรวจนับ</h2><div class="progress"><div style="width:${pct}%"></div></div><p class="muted">ข้อมูลทั้งหมด ${total} รายการ • ตรวจพบ ${found} รายการ</p>
 <button id="exportCsv" class="btn btn-light">ส่งออก CSV</button></div></div>`;
}

function importPage(){
 return `<div class="page"><div class="page-head"><div><h1 class="page-title">นำเข้าข้อมูล / เพิ่มครุภัณฑ์</h1><div class="page-sub">เพิ่มข้อมูลครุภัณฑ์ → สแกน RFID/บาร์โค้ด → บันทึกเข้าสู่ระบบ</div></div></div>
 <div class="grid grid-2">
  <div class="card"><h2 class="section-title">นำเข้าจากไฟล์ Excel</h2><p class="muted">รองรับ .xlsx / .xls / .csv</p><button id="chooseExcel" class="btn btn-primary">⇧ เลือกไฟล์ Excel</button><div class="notice" style="margin-top:15px">คอลัมน์ที่แนะนำ: ชื่อครุภัณฑ์, ประเภท, ยี่ห้อ/รุ่น, หมายเลขเครื่อง, EPC Tag, วันที่จัดซื้อ, สถานที่ใช้งาน, ผู้รับผิดชอบ, สถานะ</div></div>
  <div class="card"><h2 class="section-title">เพิ่มข้อมูลด้วยตนเอง</h2>${assetForm()}</div>
 </div></div>`;
}
function assetForm(a={}){
 return `<div class="form-grid">
 ${field("ชื่อครุภัณฑ์","fName",a.name||"")}
 ${field("ประเภท","fType",a.type||"")}
 ${field("ยี่ห้อ / รุ่น","fModel",a.model||"")}
 ${field("หมายเลขเครื่อง","fSerial",a.serial||"")}
 ${field("EPC Tag","fEpc",a.epc||"")}
 ${field("วันที่จัดซื้อ","fDate",a.date||"")}
 ${field("สถานที่ใช้งาน","fLocation",a.location||"")}
 ${field("ผู้รับผิดชอบ","fOwner",a.owner||state.user)}
 </div>
 <div class="toolbar" style="margin-top:13px"><button id="saveAsset" class="btn btn-success">▣ บันทึกข้อมูล</button></div>`;
}
function field(label,id,val){return `<div class="form-group"><label>${label}</label><input id="${id}" class="input" value="${esc(val)}"></div>`}

function settingsPage(){
 return `<div class="page"><div class="page-head"><div><h1 class="page-title">ตั้งค่า</h1><div class="page-sub">อุปกรณ์ / การแสดงผล / ข้อมูลผู้ใช้</div></div></div>
 <div class="grid grid-2">
  <div class="card"><h2 class="section-title">อุปกรณ์</h2><div class="list-item"><span>เชื่อมต่อ Bluetooth</span><span class="badge badge-green">ESP32-01 (จำลอง)</span></div><div class="list-item"><span>ทดสอบการอ่าน RFID</span><button class="btn btn-light" id="testRfid">ทดสอบ</button></div><div class="list-item"><span>เสียงแจ้งเตือน</span><input type="checkbox" checked></div></div>
  <div class="card"><h2 class="section-title">ข้อมูลผู้ใช้</h2><div class="list-item"><span>ผู้ใช้งาน</span><strong>${esc(state.user)}</strong></div><button class="btn btn-danger" id="clearData">ล้างข้อมูลตัวอย่าง</button></div>
 </div></div>`;
}

function bind(){
 document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>{currentPage=b.dataset.page; closeMenu(); render();});
 const menu=document.getElementById("menuBtn"); if(menu) menu.onclick=()=>document.getElementById("sidebar").classList.toggle("open");
 const logout=document.getElementById("logoutBtn"); if(logout) logout.onclick=()=>{state.loggedIn=false;save();currentPage="login";render();}
 const login=document.getElementById("loginBtn"); if(login) login.onclick=()=>{state.loggedIn=true;state.user=document.getElementById("loginUser").value||"ผู้ใช้งาน";save();currentPage="home";render();}
 const scan=document.getElementById("scanBtn"); if(scan) scan.onclick=toggleScan;
 const reset=document.getElementById("resetScan"); if(reset) reset.onclick=()=>{stopScan();scanCount=0;render();}
 const search=document.getElementById("assetSearch"); if(search) search.oninput=()=>{document.getElementById("assetRows").innerHTML=assetRows(state.assets.filter(a=>JSON.stringify(a).toLowerCase().includes(search.value.toLowerCase())));bindAssetButtons();}
 bindAssetButtons();
 const add=document.getElementById("addAsset"); if(add) add.onclick=()=>openModal("เพิ่มครุภัณฑ์",assetForm());
 const choose=document.getElementById("chooseExcel"); if(choose) choose.onclick=()=>document.getElementById("excelInput").click();
 const excel=document.getElementById("excelInput"); if(excel) excel.onchange=handleExcel;
 const saveA=document.getElementById("saveAsset"); if(saveA) saveA.onclick=saveForm;
 const exportX=document.getElementById("exportExcel"); if(exportX) exportX.onclick=exportExcel;
 const exportC=document.getElementById("exportCsv"); if(exportC) exportCsv();
 const test=document.getElementById("testRfid"); if(test) test.onclick=()=>alert("ทดสอบ RFID สำเร็จ (โหมดจำลอง)");
 const clear=document.getElementById("clearData"); if(clear) clear.onclick=()=>{if(confirm("ล้างข้อมูลตัวอย่างทั้งหมด?")){state.assets=[];save();render();}};
}
function closeMenu(){const s=document.getElementById("sidebar");if(s)s.classList.remove("open")}
function bindAssetButtons(){document.querySelectorAll(".viewAsset").forEach(b=>b.onclick=()=>showAsset(+b.dataset.i));}
function showAsset(i){
 const a=state.assets[i];
 openModal("รายละเอียดครุภัณฑ์",`<div class="mobile-card"><h2 style="margin-top:0">${esc(a.name)}</h2><div class="kpi-row"><span class="badge badge-green">${esc(a.status)}</span><span class="kpi">EPC: ${esc(a.epc)}</span></div><div style="margin-top:12px">${Object.entries(a).map(([k,v])=>`<div class="list-item"><span class="muted">${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("")}</div></div>`);
}
function openModal(title,body){
 const d=document.createElement("div");d.className="modal";d.id="modal";
 d.innerHTML=`<div class="modal-card"><div class="page-head"><h2 class="section-title" style="margin:0">${title}</h2><button class="btn btn-light" id="closeModal">✕</button></div>${body}</div>`;
 document.body.appendChild(d);document.getElementById("closeModal").onclick=()=>d.remove();
 const saveBtn=document.getElementById("saveAsset"); if(saveBtn) saveBtn.onclick=()=>{saveForm(true);d.remove();}
}
function getForm(){
 return {id:`AUTO-${Date.now()}`,name:val("fName"),type:val("fType"),model:val("fModel"),serial:val("fSerial"),epc:val("fEpc"),date:val("fDate"),location:val("fLocation"),owner:val("fOwner"),status:"ปกติ"};
}
function val(id){return document.getElementById(id)?.value.trim()||""}
function saveForm(inModal=false){
 const a=getForm(); if(!a.name){alert("กรุณากรอกชื่อครุภัณฑ์");return;}
 state.assets.push(a);save();alert("บันทึกข้อมูลแล้ว"); if(inModal){currentPage="assets";render();}else render();
}
function toggleScan(){
 if(scanTimer){stopScan();render();return}
 document.getElementById("scanStatus").textContent="กำลังสแกน...";
 scanTimer=setInterval(()=>{
   if(scanCount>=state.assets.length){stopScan();finishScan();return}
   scanCount++;
   const c=document.getElementById("scanCount"),p=document.getElementById("scanProgress");
   if(c)c.textContent=scanCount;
   if(p)p.style.width=(scanCount/state.assets.length*100)+"%";
 },350);
 render();
}
function stopScan(){if(scanTimer){clearInterval(scanTimer);scanTimer=null}}
function finishScan(){
 state.history.push({date:new Date().toLocaleString("th-TH"),found:scanCount,total:state.assets.length,location:"ห้องปฏิบัติการ"});
 save();alert(`ตรวจนับเสร็จสิ้น พบ ${scanCount}/${state.assets.length} รายการ`);render();
}
function handleExcel(e){
 const file=e.target.files[0]; if(!file)return;
 if(typeof XLSX==="undefined"){alert("ยังโหลดตัวอ่าน Excel ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ต");return;}
 const reader=new FileReader();
 reader.onload=ev=>{
  try{
   const wb=XLSX.read(new Uint8Array(ev.target.result),{type:"array"});
   const ws=wb.Sheets[wb.SheetNames[0]];
   const rows=XLSX.utils.sheet_to_json(ws,{defval:""});
   const mapped=rows.map((r,i)=>({
    id:r["เลขครุภัณฑ์"]||r["รหัสครุภัณฑ์"]||r.id||`EXCEL-${Date.now()}-${i}`,
    name:r["ชื่อครุภัณฑ์"]||r["ครุภัณฑ์"]||r.name||"",
    type:r["ประเภท"]||r.type||"",
    model:r["ยี่ห้อ / รุ่น"]||r["ยี่ห้อ/รุ่น"]||r.model||"",
    serial:r["หมายเลขเครื่อง"]||r.serial||"",
    epc:r["EPC Tag"]||r["EPC"]||r.epc||"",
    date:r["วันที่จัดซื้อ"]||r.date||"",
    location:r["สถานที่ใช้งาน"]||r["สถานที่"]||r.location||"",
    owner:r["ผู้รับผิดชอบ"]||r.owner||state.user,
    status:r["สถานะ"]||r.status||"ปกติ"
   })).filter(x=>x.name||x.id);
   state.assets=state.assets.concat(mapped);save();alert(`นำเข้าสำเร็จ ${mapped.length} รายการ`);currentPage="assets";render();
  }catch(err){alert("อ่านไฟล์ไม่สำเร็จ: "+err.message)}
 };
 reader.readAsArrayBuffer(file);
 e.target.value="";
}
function exportExcel(){
 if(typeof XLSX==="undefined"){alert("ตัวส่งออก Excel ยังโหลดไม่สำเร็จ");return}
 const ws=XLSX.utils.json_to_sheet(state.assets);
 const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"ครุภัณฑ์");
 XLSX.writeFile(wb,"SUT_RFID_Asset.xlsx");
}
function exportCsv(){
 const headers=["id","name","type","model","serial","epc","date","location","owner","status"];
 const lines=[headers.join(","),...state.assets.map(a=>headers.map(h=>`"${String(a[h]??"").replaceAll('"','""')}"`).join(","))];
 const blob=new Blob(["\ufeff"+lines.join("\n")],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="SUT_RFID_Asset.csv";a.click();URL.revokeObjectURL(url);
}
render();
