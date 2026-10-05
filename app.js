const K={users:"sut_rfid_users_v2",assets:"sut_rfid_assets_v2",history:"sut_rfid_history_v2",login:"sut_rfid_login_v2",settings:"sut_rfid_settings_v1",maintenance:"sut_rfid_maintenance_v1"};
const DEFAULT_USERS=[
 {id:"1",username:"admin",password:"1234",name:"ผู้ดูแลระบบ",role:"admin",status:"active"},
 {id:"2",username:"user",password:"1234",name:"ผู้ใช้งานตัวอย่าง",role:"user",status:"active"}
];
const SAMPLE_ASSETS=[
 {id:"a1",assetNo:"7440-001-0001/2563",name:"เครื่องคอมพิวเตอร์",epc:"300BB3A4F2C1E8D0",brand:"Acer",model:"Aspire 5",location:"ห้องปฏิบัติการคอมพิวเตอร์",responsible:"ดิเรกฤทธิ์ แสงโชติ",status:"ปกติ"},
 {id:"a2",assetNo:"7440-001-0002/2563",name:"เครื่องปั่นเหวี่ยง",epc:"300BB3A4F2C1E8D1",brand:"Hettich",model:"EBA 200",location:"ห้องปฏิบัติการ",responsible:"ดิเรกฤทธิ์ แสงโชติ",status:"ปกติ"},
 {id:"a3",assetNo:"4110-001-0003/2563",name:"ตู้เย็น",epc:"300BB3A4F2C1E8D2",brand:"Sanyo",model:"MPR",location:"ห้องปฏิบัติการ",responsible:"ดิเรกฤทธิ์ แสงโชติ",status:"ปกติ"},
 {id:"a4",assetNo:"6640-001-0004/2563",name:"กล้องจุลทรรศน์",epc:"300BB3A4F2C1E8D3",brand:"Olympus",model:"CX23",location:"ห้องจุลชีววิทยา",responsible:"ดิเรกฤทธิ์ แสงโชติ",status:"ปกติ"}
];

const read=(k,def)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??def}catch(e){return def}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const users=()=>{let x=read(K.users,null);if(!Array.isArray(x)||!x.length){x=DEFAULT_USERS;write(K.users,x)}return x};
const assets=()=>{let x=read(K.assets,null);if(!Array.isArray(x)){x=SAMPLE_ASSETS;write(K.assets,x)}return x};
const history=()=>read(K.history,[]);
const maintenance=()=>read(K.maintenance,[]);
const login=()=>read(K.login,null);
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const fmt=d=>new Date(d).toLocaleString("th-TH",{dateStyle:"short",timeStyle:"short"});

function render(){
 const app=document.getElementById("app"); if(!login()){loginView(app);return}
 app.innerHTML=`<div class="shell"><aside class="sidebar">
 <div class="brand"><div class="sut-logo">SUT</div><strong>SUT Asset RFID</strong></div>
 <nav class="nav">
  <button data-page="dashboard">📊 หน้าหลัก</button>
  <button data-page="scan">📡 ตรวจนับ RFID</button>
  <button data-page="results">📋 ผลการตรวจนับ</button>
  <button data-page="assets">📦 ครุภัณฑ์</button>
  <button data-page="history">🕘 ประวัติ</button>
  <button data-page="reports">📈 รายงาน</button>
  <button data-page="maintenance">🛠️ Maintenance</button>
  <button class="admin-item" data-page="users">👥 จัดการผู้ใช้งาน</button>
  <button data-page="settings">⚙️ ตั้งค่า</button>
 </nav></aside>
 <main class="main"><header class="topbar"><h2 id="title">Dashboard</h2><div class="user-chip">👤 ${esc(login().name||login().username)} <button id="logout" class="btn btn-light">ออกจากระบบ</button></div></header><div id="content" class="content"></div></main></div><div id="modalBg" class="modal-bg"></div>`;
 document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
 document.getElementById("logout").onclick=()=>{localStorage.removeItem(K.login);render()};
 showPage("dashboard");
}
function loginView(app){
 app.innerHTML=`<main class="login-page"><section class="login-card"><div class="sut-logo">SUT</div><h1>ระบบจัดการครุภัณฑ์ RFID</h1><p class="subtitle">ศูนย์เครื่องมือ มหาวิทยาลัยเทคโนโลยีสุรนารี</p><form id="lf"><input id="lu" class="field" placeholder="ชื่อผู้ใช้งาน"><input id="lp" class="field" type="password" placeholder="รหัสผ่าน"><div id="le" class="error"></div><button class="btn btn-primary login-btn">เข้าสู่ระบบ</button></form><div class="login-foot">ระบบต้นแบบ GitHub Pages • ข้อมูลเก็บในเบราว์เซอร์</div></section></main>`;
 document.getElementById("lf").onsubmit=e=>{e.preventDefault();const u=document.getElementById("lu").value.trim(),p=document.getElementById("lp").value;const x=users().find(a=>a.username===u&&a.password===p&&a.status==="active");if(!x){document.getElementById("le").textContent="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";return}write(K.login,{id:x.id,username:x.username,name:x.name,role:x.role});render()};
}
function showPage(page){
 document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
 const titles={dashboard:"หน้าหลัก",scan:"ตรวจนับ RFID",results:"ผลการตรวจนับ",assets:"จัดการครุภัณฑ์",history:"ประวัติการตรวจนับ",reports:"รายงาน",maintenance:"Maintenance / การใช้งานและซ่อมบำรุง",users:"จัดการผู้ใช้งาน",settings:"ตั้งค่า"};
 document.getElementById("title").textContent=titles[page]||page;
 const c=document.getElementById("content");
 if(page==="dashboard")c.innerHTML=dashboard();
 if(page==="scan")scanPage();
 if(page==="results")resultsPage();
 if(page==="assets")assetPage();
 if(page==="history")historyPage();
 if(page==="reports")reportPage();
 if(page==="maintenance")maintenancePage();
 if(page==="users")userPage();
 if(page==="settings")settingsPage();
}
function dashboard(){
 const A=assets(),H=history(),U=users(),last=H[0];
 const found=last?.found?.length||0,total=last?.total||A.length;
 return `<div class="cards">
 <div class="card"><div class="muted">ครุภัณฑ์ทั้งหมด</div><div class="stat">${A.length}</div></div>
 <div class="card"><div class="muted">พบจากการตรวจครั้งล่าสุด</div><div class="stat">${found}</div></div>
 <div class="card"><div class="muted">ไม่พบ</div><div class="stat">${Math.max(0,total-found)}</div></div>
 <div class="card"><div class="muted">ผู้ใช้งานระบบ</div><div class="stat">${U.length}</div></div>
 <div class="card"><div class="muted">เครื่องมือส่งซ่อม</div><div class="stat">${A.filter(a=>a.usageStatus==="ส่งซ่อม").length}</div></div></div>
 <div class="grid2 section"><div class="card"><h3>เริ่มงานตรวจนับ</h3><p class="muted">เชื่อมต่อเครื่องอ่าน UHF/ESP32 แล้วเริ่มตรวจนับ หรือทดลองด้วยโหมดจำลอง</p><button class="btn btn-primary" onclick="showPage('scan')">📡 เริ่มตรวจนับ</button></div>
 <div class="card"><h3>สถานะระบบ</h3><p>ข้อมูลครุภัณฑ์: <b>${A.length}</b> รายการ</p><p>ประวัติการตรวจนับ: <b>${H.length}</b> ครั้ง</p><p>บัญชี Admin: <b>${U.filter(x=>x.role==="admin").length}</b> บัญชี</p></div></div>
 <div class="card section"><h3>การใช้งาน</h3><p class="muted">นำเข้าครุภัณฑ์จาก CSV ได้ที่เมนู “ครุภัณฑ์” และจัดการผู้ใช้/Import CSV ผู้ใช้ได้ที่ “จัดการผู้ใช้งาน”</p></div>`;
}
function scanPage(){
 const c=document.getElementById("content");
 c.innerHTML=`<div class="grid2"><div class="card scan-box"><div class="scan-icon">📡</div><h2>กำลังพร้อมตรวจนับ</h2><p class="muted">ระบบจะจับคู่ EPC ที่อ่านได้กับรายการครุภัณฑ์</p><div class="scan-count" id="scanCount">0</div><div class="muted">รายการที่อ่านได้</div><div class="scan-actions"><button class="btn btn-primary" id="startScan">▶ เริ่ม/หยุดสแกน</button><button class="btn btn-orange" id="simScan">＋ จำลองอ่าน RFID</button></div><div style="width:min(500px,100%);margin-top:18px"><div class="progress"><div id="prog"></div></div></div></div>
 <div class="card"><h3>ผลการอ่านล่าสุด</h3><div id="liveList" class="result-box">ยังไม่มีข้อมูล</div><hr><h3>กรอก EPC เอง</h3><input id="manualEpc" class="field" placeholder="เช่น 300BB3A4F2C1E8D0"><button class="btn btn-light" id="addManual">เพิ่มรายการ</button><p class="mini muted">หมายเหตุ: หน้าเว็บนี้เตรียม Workflow สำหรับ ESP32 + UHF Reader แล้ว ส่วน Bluetooth/Serial จริงต้องเชื่อมอุปกรณ์ในขั้นต่อไป</p></div></div>`;
 window.scanSet=new Set(); window.scanning=false;
 document.getElementById("startScan").onclick=()=>{window.scanning=!window.scanning;document.getElementById("startScan").textContent=window.scanning?"■ หยุดสแกน":"▶ เริ่ม/หยุดสแกน"};
 document.getElementById("simScan").onclick=()=>{const A=assets();if(!A.length)return;const x=A[Math.floor(Math.random()*A.length)];addScan(x.epc)};
 document.getElementById("addManual").onclick=()=>{const e=document.getElementById("manualEpc").value.trim();if(e)addScan(e)};
}
function addScan(epc){
 if(!window.scanSet)window.scanSet=new Set();window.scanSet.add(epc);
 const A=assets(),found=[...window.scanSet].map(e=>A.find(a=>a.epc===e)).filter(Boolean);
 document.getElementById("scanCount").textContent=window.scanSet.size;
 document.getElementById("prog").style.width=Math.min(100,window.scanSet.size/Math.max(1,A.length)*100)+"%";
 document.getElementById("liveList").innerHTML=[...window.scanSet].slice(-10).reverse().map(e=>{const a=A.find(x=>x.epc===e);return `<div style="padding:9px;border-bottom:1px solid #e8edf1"><b>${esc(e)}</b><br><span class="mini ${a?"found":"missing"} status">${a?esc(a.name):"ไม่พบในฐานข้อมูล"}</span></div>`}).join("");
}
function resultsPage(){
 const A=assets(),last=history()[0],found=last?.found||[],foundSet=new Set(found),missing=A.filter(a=>!foundSet.has(a.epc));
 document.getElementById("content").innerHTML=`<div class="cards"><div class="card"><div class="muted">ทั้งหมด</div><div class="stat">${A.length}</div></div><div class="card"><div class="muted">พบ</div><div class="stat">${found.length}</div></div><div class="card"><div class="muted">ไม่พบ</div><div class="stat">${missing.length}</div></div><div class="card"><div class="muted">ความครบถ้วน</div><div class="stat">${A.length?Math.round(found.length/A.length*100):0}%</div></div></div>
 <div class="section card"><div class="section-head"><h3>ผลการตรวจนับ</h3><button class="btn btn-primary" onclick="saveScan()">💾 บันทึกผลการตรวจนับ</button></div><div class="table-wrap"><table><thead><tr><th>สถานะ</th><th>เลขครุภัณฑ์</th><th>รายการ</th><th>EPC</th><th>สถานที่</th></tr></thead><tbody>${A.map(a=>`<tr><td><span class="status ${foundSet.has(a.epc)?"on":"off"}">${foundSet.has(a.epc)?"พบ":"ไม่พบ"}</span></td><td>${esc(a.assetNo)}</td><td>${esc(a.name)}</td><td>${esc(a.epc)}</td><td>${esc(a.location)}</td></tr>`).join("")}</tbody></table></div></div>`;
}
function saveScan(){
 const set=[...(window.scanSet||new Set())];if(!set.length){alert("ยังไม่มีข้อมูลการอ่าน RFID");return}
 const H=history();H.unshift({id:Date.now().toString(),date:new Date().toISOString(),user:login().name||login().username,total:assets().length,found:set});write(K.history,H);alert("บันทึกผลการตรวจนับแล้ว");showPage("results");
}
function assetPage(){
 const A=assets();document.getElementById("content").innerHTML=`<div class="section-head"><div class="toolbar"><input id="assetQ" class="field" placeholder="ค้นหาเลขครุภัณฑ์ / ชื่อ / EPC"><label class="btn btn-orange file-label">📥 Import CSV<input id="assetCsv" type="file" accept=".csv,text/csv"></label><button class="btn btn-light" id="assetExport">📤 Export CSV</button><button class="btn btn-primary" id="addAsset">＋ เพิ่มครุภัณฑ์</button></div></div><div class="notice">รูปแบบ CSV แนะนำ: assetNo,name,epc,brand,model,location,responsible,status</div><div class="table-wrap section"><table><thead><tr><th>รูป</th><th>เลขครุภัณฑ์</th><th>รายการ</th><th>EPC</th><th>สถานที่</th><th>ผู้รับผิดชอบ</th><th>สถานะใช้งาน</th><th>จัดการ</th></tr></thead><tbody id="assetRows"></tbody></table></div>`;
 const draw=()=>{const q=document.getElementById("assetQ").value.toLowerCase();document.getElementById("assetRows").innerHTML=A.filter(a=>(a.assetNo+" "+a.name+" "+a.epc+" "+a.location).toLowerCase().includes(q)).map(a=>`<tr><td>${a.photo?`<img src="${a.photo}" class="asset-thumb" alt="รูปเครื่องมือ">`:`<span class="photo-empty">ไม่มีรูป</span>`}</td><td>${esc(a.assetNo)}</td><td>${esc(a.name)}</td><td>${esc(a.epc)}</td><td>${esc(a.location)}</td><td>${esc(a.responsible)}</td><td><span class="status ${a.usageStatus==="ส่งซ่อม"?"off":a.usageStatus==="ว่าง"?"orange":"on"}">${esc(a.usageStatus||"ว่าง")}</span></td><td><button class="btn btn-light" onclick="editAsset('${a.id}')">แก้ไข</button> <button class="btn btn-danger" onclick="deleteAsset('${a.id}')">ลบ</button></td></tr>`).join("")||`<tr><td colspan="8" class="empty">ไม่พบข้อมูล</td></tr>`};draw();
 document.getElementById("assetQ").oninput=draw;document.getElementById("assetCsv").onchange=e=>importAssets(e.target.files[0]);document.getElementById("assetExport").onclick=exportAssets;document.getElementById("addAsset").onclick=()=>editAsset("");
}
function editAsset(id){
 const A=assets(),a=A.find(x=>x.id===id)||{assetNo:"",name:"",epc:"",brand:"",model:"",location:"",responsible:"",status:"ปกติ",usageStatus:"ว่าง",assignedUser:"",usageCount:0,maintenanceIntervalDays:180,lastMaintenance:"",nextMaintenance:"",photo:""};
 const opts=users().filter(u=>u.status==="active").map(u=>`<option value="${esc(u.name)}" ${a.assignedUser===u.name?"selected":""}>${esc(u.name)}</option>`).join("");
 modal(`<h3>${id?"แก้ไข":"เพิ่ม"}ครุภัณฑ์</h3>
 <div class="asset-photo-editor">${a.photo?`<img id="assetPhotoPreview" src="${a.photo}" alt="รูปเครื่องมือ">`:`<div id="assetPhotoPreview" class="photo-placeholder">📷 ยังไม่มีรูปเครื่องมือ</div>`}<label class="btn btn-orange file-label">📷 อัปโหลดรูป<input id="a_photo" type="file" accept="image/*"></label></div>
 ${[["assetNo","เลขครุภัณฑ์"],["name","ชื่อเครื่องมือ"],["epc","EPC"],["brand","ยี่ห้อ"],["model","รุ่น"],["location","สถานที่"],["responsible","ผู้รับผิดชอบ"]].map(([k,l])=>`<label class="mini muted">${l}</label><input id="a_${k}" class="field" placeholder="${l}" value="${esc(a[k])}">`).join("")}
 <label class="mini muted">สถานะทั่วไป</label><select id="a_status" class="field"><option ${a.status==="ปกติ"?"selected":""}>ปกติ</option><option ${a.status==="ชำรุด"?"selected":""}>ชำรุด</option><option ${a.status==="รอจำหน่าย"?"selected":""}>รอจำหน่าย</option></select>
 <label class="mini muted">สถานะการใช้งาน</label><select id="a_usageStatus" class="field"><option ${a.usageStatus==="ว่าง"?"selected":""}>ว่าง</option><option ${a.usageStatus==="กำลังใช้งาน"?"selected":""}>กำลังใช้งาน</option><option ${a.usageStatus==="ส่งซ่อม"?"selected":""}>ส่งซ่อม</option><option ${a.usageStatus==="ระงับ"?"selected":""}>ระงับ</option><option ${a.usageStatus==="เลิกใช้งาน"?"selected":""}>เลิกใช้งาน</option></select>
 <label class="mini muted">ผู้ใช้งาน/ผู้รับผิดชอบปัจจุบัน</label><select id="a_assignedUser" class="field"><option value="">-- ยังไม่กำหนด --</option>${opts}</select>
 <label class="mini muted">จำนวนครั้งการใช้งาน</label><input id="a_usageCount" type="number" min="0" class="field" value="${Number(a.usageCount||0)}">
 <label class="mini muted">รอบบำรุงรักษา (วัน)</label><input id="a_maintenanceIntervalDays" type="number" min="1" class="field" value="${Number(a.maintenanceIntervalDays||180)}">
 <label class="mini muted">บำรุงรักษาครั้งล่าสุด</label><input id="a_lastMaintenance" type="date" class="field" value="${esc(a.lastMaintenance||"")}">
 <label class="mini muted">บำรุงรักษาครั้งถัดไป</label><input id="a_nextMaintenance" type="date" class="field" value="${esc(a.nextMaintenance||"")}">
 <div class="notice">รูปที่อัปโหลดจะผูกกับรายการครุภัณฑ์จากฐานข้อมูลตรวจนับ RFID โดยตรง</div>
 <div class="modal-actions"><button class="btn btn-light" onclick="closeModal()">ยกเลิก</button><button class="btn btn-primary" onclick="saveAsset('${id}')">บันทึก</button></div>`);
 const f=document.getElementById("a_photo");if(f)f.onchange=()=>{const file=f.files[0];if(!file)return;resizeImage(file,900,0.78,data=>{const p=document.getElementById("assetPhotoPreview");p.outerHTML=`<img id="assetPhotoPreview" src="${data}" alt="รูปเครื่องมือ">`;p.dataset= data})};
}
function resizeImage(file,maxSize,quality,cb){const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,maxSize/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext("2d").drawImage(img,0,0,c.width,c.height);cb(c.toDataURL("image/jpeg",quality))};img.src=r.result};r.readAsDataURL(file)}
const val=k=>document.getElementById("a_"+k)?.value.trim()||"";
function saveAsset(id){const A=assets(),old=A.find(x=>x.id===id)||{};const preview=document.getElementById("assetPhotoPreview");const photo=(preview&&preview.tagName==="IMG"?preview.src:old.photo||"");const o={assetNo:val("assetNo"),name:val("name"),epc:val("epc"),brand:val("brand"),model:val("model"),location:val("location"),responsible:val("responsible"),status:val("status")||"ปกติ",usageStatus:val("usageStatus")||"ว่าง",assignedUser:document.getElementById("a_assignedUser")?.value||"",usageCount:Number(document.getElementById("a_usageCount")?.value||0),maintenanceIntervalDays:Number(document.getElementById("a_maintenanceIntervalDays")?.value||180),lastMaintenance:document.getElementById("a_lastMaintenance")?.value||"",nextMaintenance:document.getElementById("a_nextMaintenance")?.value||"",photo};if(!o.name||!o.epc){alert("กรุณากรอกชื่อเครื่องมือและ EPC");return}if(id)Object.assign(A.find(x=>x.id===id),o);else A.push({id:Date.now().toString(),...o});write(K.assets,A);closeModal();assetPage()}
function deleteAsset(id){if(confirm("ยืนยันการลบครุภัณฑ์?")){write(K.assets,assets().filter(a=>a.id!==id));write(K.maintenance,maintenance().filter(m=>m.assetId!==id));assetPage()}}
function importAssets(file){if(!file)return;const r=new FileReader();r.onload=()=>{const rows=parseCSV(r.result),A=assets();let n=0;rows.forEach(x=>{const o={assetNo:x.assetNo||x["เลขครุภัณฑ์"]||"",name:x.name||x["ชื่อ"]||x["รายการ"]||"",epc:x.epc||x["EPC"]||"",brand:x.brand||x["ยี่ห้อ"]||"",model:x.model||x["รุ่น"]||"",location:x.location||x["สถานที่"]||"",responsible:x.responsible||x["ผู้รับผิดชอบ"]||"",status:x.status||x["สถานะ"]||"ปกติ",usageStatus:x.usageStatus||x["สถานะการใช้งาน"]||"ว่าง",assignedUser:x.assignedUser||x["ผู้ใช้งาน"]||"",usageCount:Number(x.usageCount||x["จำนวนครั้งใช้งาน"]||0),maintenanceIntervalDays:Number(x.maintenanceIntervalDays||x["รอบบำรุงรักษา"]||180),lastMaintenance:x.lastMaintenance||x["บำรุงรักษาล่าสุด"]||"",nextMaintenance:x.nextMaintenance||x["บำรุงรักษาครั้งถัดไป"]||"",photo:x.photo||""};if(o.name&&o.epc&&!A.some(a=>a.epc===o.epc)){A.push({id:Date.now().toString()+n++, ...o})}});write(K.assets,A);alert(`นำเข้าครุภัณฑ์ ${n} รายการ`);assetPage()};r.readAsText(file,"UTF-8")}
function exportAssets(){const A=assets();downloadCSV("assets.csv",["assetNo","name","epc","brand","model","location","responsible","status","usageStatus","assignedUser","usageCount","maintenanceIntervalDays","lastMaintenance","nextMaintenance"],A)}
function maintenancePage(){
 const A=assets(),M=maintenance(),today=new Date().toISOString().slice(0,10);
 const repair=A.filter(a=>a.usageStatus==="ส่งซ่อม").length;
 const due=A.filter(a=>a.nextMaintenance && a.nextMaintenance<=today && a.usageStatus!=="เลิกใช้งาน").length;
 const active=A.filter(a=>a.usageStatus==="กำลังใช้งาน").length;
 document.getElementById("content").innerHTML=`<div class="cards"><div class="card"><div class="muted">กำลังใช้งาน</div><div class="stat">${active}</div></div><div class="card"><div class="muted">ส่งซ่อม</div><div class="stat">${repair}</div></div><div class="card"><div class="muted">ถึงรอบบำรุงรักษา</div><div class="stat">${due}</div></div><div class="card"><div class="muted">ประวัติ Maintenance</div><div class="stat">${M.length}</div></div></div>
 <div class="card section"><div class="section-head"><h3>จัดการการใช้งานและซ่อมบำรุง</h3><div class="toolbar"><button class="btn btn-primary" onclick="maintenanceModal('usage')">▶ บันทึกการใช้งาน</button><button class="btn btn-orange" onclick="maintenanceModal('repair')">🔧 แจ้งซ่อม</button><button class="btn btn-green" onclick="maintenanceModal('maintenance')">🛠️ บันทึกบำรุงรักษา</button><button class="btn btn-light" onclick="exportMaintenance()">📤 Export CSV</button></div></div>
 <div class="notice">เลือกรายการครุภัณฑ์จากฐานข้อมูล RFID ได้โดยตรง รูปเครื่องมือที่อัปโหลดในเมนู “ครุภัณฑ์” จะแสดงที่นี่ด้วย</div>
 <div class="table-wrap section"><table><thead><tr><th>รูป</th><th>ครุภัณฑ์</th><th>ผู้ใช้งาน</th><th>สถานะการใช้งาน</th><th>การใช้งาน</th><th>รอบบำรุงรักษา</th><th>ซ่อมบำรุง</th><th>จัดการ</th></tr></thead><tbody>${A.map(a=>{const overdue=a.nextMaintenance&&a.nextMaintenance<=today;const latest=M.find(m=>m.assetId===a.id);return `<tr><td>${a.photo?`<img src="${a.photo}" class="asset-thumb">`:`<span class="photo-empty">ไม่มีรูป</span>`}</td><td><b>${esc(a.name)}</b><br><span class="mini muted">${esc(a.assetNo)} • ${esc(a.epc)}</span></td><td>${esc(a.assignedUser||"-")}</td><td><span class="status ${a.usageStatus==="ส่งซ่อม"?"off":a.usageStatus==="ว่าง"?"orange":"on"}">${esc(a.usageStatus||"ว่าง")}</span></td><td>${Number(a.usageCount||0)} ครั้ง</td><td>${a.nextMaintenance?`<span class="status ${overdue?"off":"on"}">${overdue?"เกินกำหนด":"กำหนด"} ${esc(a.nextMaintenance)}</span>`:`<span class="muted">ยังไม่กำหนด</span>`}</td><td>${latest?esc(latest.typeLabel||latest.type):"-"}</td><td><button class="btn btn-light" onclick="maintenanceAsset('${a.id}')">จัดการ</button></td></tr>`}).join("")||`<tr><td colspan="8" class="empty">ยังไม่มีข้อมูลครุภัณฑ์</td></tr>`}</tbody></table></div></div>
 <div class="card section"><h3>ประวัติการใช้งาน / แจ้งซ่อม / บำรุงรักษา</h3><div class="table-wrap"><table><thead><tr><th>วันที่</th><th>ประเภท</th><th>ครุภัณฑ์</th><th>ผู้ใช้/ผู้แจ้ง</th><th>รายละเอียด</th><th>สถานะ</th></tr></thead><tbody>${M.slice(0,100).map(m=>`<tr><td>${fmt(m.date)}</td><td>${esc(m.typeLabel||m.type)}</td><td>${esc(m.assetName||assetName(m.assetId))}</td><td>${esc(m.user)}</td><td>${esc(m.detail||"-")}</td><td>${esc(m.status||"-")}</td></tr>`).join("")||`<tr><td colspan="6" class="empty">ยังไม่มีประวัติ</td></tr>`}</tbody></table></div></div>`;
}
function assetName(id){return assets().find(a=>a.id===id)?.name||"ไม่พบครุภัณฑ์"}
function maintenanceAsset(id){const a=assets().find(x=>x.id===id);if(!a)return;modal(`<h3>${esc(a.name)}</h3><div class="asset-detail-head">${a.photo?`<img src="${a.photo}" class="asset-large">`:`<div class="photo-placeholder asset-large">📷</div>`}<div><p><b>เลขครุภัณฑ์:</b> ${esc(a.assetNo)}</p><p><b>EPC:</b> ${esc(a.epc)}</p><p><b>สถานะ:</b> ${esc(a.status)}</p><p><b>ผู้ใช้งาน:</b> ${esc(a.assignedUser||"-")}</p><p><b>ใช้ไปแล้ว:</b> ${Number(a.usageCount||0)} ครั้ง</p><p><b>รอบบำรุงรักษา:</b> ทุก ${Number(a.maintenanceIntervalDays||180)} วัน</p><p><b>ครั้งถัดไป:</b> ${esc(a.nextMaintenance||"ยังไม่กำหนด")}</p></div></div><div class="modal-actions"><button class="btn btn-primary" onclick="closeModal();maintenanceModal('usage','${id}')">▶ บันทึกใช้งาน</button><button class="btn btn-orange" onclick="closeModal();maintenanceModal('repair','${id}')">🔧 แจ้งซ่อม</button><button class="btn btn-green" onclick="closeModal();maintenanceModal('maintenance','${id}')">🛠️ บำรุงรักษา</button><button class="btn btn-light" onclick="closeModal()">ปิด</button></div>`)}
function maintenanceModal(type,assetId=""){
 const A=assets(),a=A.find(x=>x.id===assetId)||A[0];if(!a){alert("กรุณาเพิ่มครุภัณฑ์ก่อน");return}
 const userOpts=users().filter(u=>u.status==="active").map(u=>`<option value="${esc(u.name)}" ${u.id===login().id?"selected":""}>${esc(u.name)}</option>`).join("");
 const titles={usage:"บันทึกการใช้งานเครื่องมือ",repair:"แจ้งซ่อมเครื่องมือ",maintenance:"บันทึกการบำรุงรักษา"};
 modal(`<h3>${titles[type]}</h3><label class="mini muted">เครื่องมือ</label><select id="m_asset" class="field">${A.map(x=>`<option value="${x.id}" ${x.id===a.id?"selected":""}>${esc(x.assetNo)} - ${esc(x.name)}</option>`).join("")}</select><label class="mini muted">ผู้ใช้/ผู้แจ้ง</label><select id="m_user" class="field">${userOpts}</select><label class="mini muted">วันที่</label><input id="m_date" type="date" class="field" value="${new Date().toISOString().slice(0,10)}">${type==="usage"?`<label class="mini muted">ระยะเวลาการใช้งาน (ชั่วโมง)</label><input id="m_hours" type="number" min="0" step="0.5" class="field" value="1"><label class="mini muted">รายละเอียดการใช้งาน</label><input id="m_detail" class="field" placeholder="เช่น ใช้งานตรวจตัวอย่าง"><label class="mini muted">สถานะหลังใช้งาน</label><select id="m_status" class="field"><option>ว่าง</option><option>กำลังใช้งาน</option></select>`:type==="repair"?`<label class="mini muted">อาการ/รายละเอียดที่แจ้งซ่อม</label><textarea id="m_detail" class="field" rows="4" placeholder="ระบุอาการเสีย"></textarea><label class="mini muted">สถานะงานซ่อม</label><select id="m_status" class="field"><option>แจ้งซ่อม</option><option>กำลังซ่อม</option><option>รออะไหล่</option><option>ซ่อมเสร็จ</option></select>`:`<label class="mini muted">รายละเอียดการบำรุงรักษา</label><textarea id="m_detail" class="field" rows="4" placeholder="เช่น ทำความสะอาด / เปลี่ยนอะไหล่"></textarea><label class="mini muted">ค่าใช้จ่าย (บาท)</label><input id="m_cost" type="number" min="0" class="field" value="0"><label class="mini muted">รอบบำรุงรักษา (วัน)</label><input id="m_interval" type="number" min="1" class="field" value="${Number(a.maintenanceIntervalDays||180)}">`}<div class="modal-actions"><button class="btn btn-light" onclick="closeModal()">ยกเลิก</button><button class="btn btn-primary" onclick="saveMaintenance('${type}')">บันทึก</button></div>`)
}
function saveMaintenance(type){const assetId=document.getElementById("m_asset").value,A=assets(),a=A.find(x=>x.id===assetId),user=document.getElementById("m_user").value,date=document.getElementById("m_date").value,detail=document.getElementById("m_detail")?.value.trim()||"";if(!a)return;const M=maintenance();const rec={id:Date.now().toString(),assetId,assetName:a.name,user,date:new Date(date+"T12:00:00").toISOString(),type,typeLabel:type==="usage"?"การใช้งาน":type==="repair"?"แจ้งซ่อม":"บำรุงรักษา",detail,status:document.getElementById("m_status")?.value||"เสร็จสิ้น",hours:Number(document.getElementById("m_hours")?.value||0),cost:Number(document.getElementById("m_cost")?.value||0)};M.unshift(rec);if(type==="usage"){a.usageCount=Number(a.usageCount||0)+1;a.assignedUser=user;a.usageStatus=rec.status||"ว่าง"}if(type==="repair"){a.usageStatus=rec.status==="ซ่อมเสร็จ"?"ว่าง":"ส่งซ่อม";a.status=rec.status==="ซ่อมเสร็จ"?"ปกติ":"ชำรุด"}if(type==="maintenance"){const interval=Number(document.getElementById("m_interval")?.value||180);a.maintenanceIntervalDays=interval;a.lastMaintenance=date;const d=new Date(date+"T12:00:00");d.setDate(d.getDate()+interval);a.nextMaintenance=d.toISOString().slice(0,10);a.status="ปกติ";if(a.usageStatus==="ส่งซ่อม")a.usageStatus="ว่าง"}write(K.assets,A);write(K.maintenance,M);closeModal();maintenancePage()}
function exportMaintenance(){const rows=maintenance().map(m=>({date:m.date,type:m.typeLabel||m.type,asset:m.assetName||assetName(m.assetId),user:m.user,status:m.status,detail:m.detail,hours:m.hours,cost:m.cost}));downloadCSV("maintenance.csv",["date","type","asset","user","status","detail","hours","cost"],rows)}
function historyPage(){const H=history();document.getElementById("content").innerHTML=`<div class="card"><h3>ประวัติการตรวจนับ</h3><div class="table-wrap"><table><thead><tr><th>วันที่</th><th>ผู้ตรวจ</th><th>ทั้งหมด</th><th>พบ</th><th>ความครบถ้วน</th></tr></thead><tbody>${H.map(h=>`<tr><td>${fmt(h.date)}</td><td>${esc(h.user)}</td><td>${h.total}</td><td>${h.found.length}</td><td>${h.total?Math.round(h.found.length/h.total*100):0}%</td></tr>`).join("")||`<tr><td colspan="5" class="empty">ยังไม่มีประวัติ</td></tr>`}</tbody></table></div></div>`}
function reportPage(){const A=assets(),H=history(),last=H[0];document.getElementById("content").innerHTML=`<div class="cards"><div class="card"><div class="muted">ครุภัณฑ์ทั้งหมด</div><div class="stat">${A.length}</div></div><div class="card"><div class="muted">ตรวจนับทั้งหมด</div><div class="stat">${H.length}</div></div><div class="card"><div class="muted">ครั้งล่าสุดพบ</div><div class="stat">${last?.found.length||0}</div></div><div class="card"><div class="muted">ความครบถ้วนล่าสุด</div><div class="stat">${last?.total?Math.round(last.found.length/last.total*100):0}%</div></div></div><div class="card section"><h3>ส่งออกรายงาน</h3><button class="btn btn-primary" onclick="exportAssets()">📤 ส่งออกข้อมูลครุภัณฑ์ CSV</button> <button class="btn btn-light" onclick="exportHistory()">📤 ส่งออกประวัติ CSV</button></div>`}
function exportHistory(){downloadCSV("scan-history.csv",["date","user","total","found"],history().map(h=>({date:h.date,user:h.user,total:h.total,found:h.found.length})))}
function userPage(){
 if(login().role!=="admin"){document.getElementById("content").innerHTML=`<div class="card"><h2>ไม่มีสิทธิ์</h2><p class="muted">เฉพาะ Admin เท่านั้นที่จัดการผู้ใช้งานได้</p></div>`;return}
 document.getElementById("content").innerHTML=`<div class="section-head"><div class="toolbar"><input id="userQ" class="field" placeholder="ค้นหาชื่อหรือ Username"><button class="btn btn-primary" onclick="userModal('')">＋ เพิ่มผู้ใช้งาน</button><label class="btn btn-orange file-label">📥 Import CSV<input id="userCsv" type="file" accept=".csv,text/csv"></label><button class="btn btn-light" onclick="exportUsers()">📤 Export CSV</button></div></div><div class="table-wrap"><table><thead><tr><th>ชื่อ</th><th>Username</th><th>สิทธิ์</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody id="userRows"></tbody></table></div>`;
 const draw=()=>{const q=document.getElementById("userQ").value.toLowerCase();document.getElementById("userRows").innerHTML=users().filter(u=>(u.name+" "+u.username).toLowerCase().includes(q)).map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.username)}</td><td>${u.role==="admin"?"Admin":"User"}</td><td><span class="status ${u.status==="active"?"on":"off"}">${u.status==="active"?"ใช้งาน":"ปิดใช้งาน"}</span></td><td><button class="btn btn-light" onclick="userModal('${u.id}')">แก้ไข</button> <button class="btn btn-danger" onclick="deleteUser('${u.id}')">ลบ</button></td></tr>`).join("")||`<tr><td colspan="5" class="empty">ไม่พบข้อมูล</td></tr>`};draw();document.getElementById("userQ").oninput=draw;document.getElementById("userCsv").onchange=e=>importUsers(e.target.files[0]);
}
function userModal(id){
 const u=users().find(x=>x.id===id)||{name:"",username:"",password:"",role:"user",status:"active"};
 modal(`<h3>${id?"แก้ไข":"เพิ่ม"}ผู้ใช้งาน</h3>
 <label class="mini muted">ชื่อ-นามสกุล</label><input id="u_name" class="field" placeholder="ชื่อ-นามสกุล" value="${esc(u.name)}">
 <label class="mini muted">Username</label><input id="u_username" class="field" placeholder="Username" value="${esc(u.username)}">
 <label class="mini muted">รหัสผ่าน ${id?"(ตั้งใหม่ได้)":"(จำเป็น)"}</label>
 <input id="u_password" class="field" type="password" autocomplete="new-password" placeholder="${id?"เว้นว่าง = ใช้รหัสผ่านเดิม":"กำหนดรหัสผ่าน"}">
 <label class="mini muted">ยืนยันรหัสผ่าน</label>
 <input id="u_password2" class="field" type="password" autocomplete="new-password" placeholder="กรอกรหัสผ่านอีกครั้ง">
 <select id="u_role" class="field"><option value="user" ${u.role==="user"?"selected":""}>User</option><option value="admin" ${u.role==="admin"?"selected":""}>Admin</option></select>
 <select id="u_status" class="field"><option value="active" ${u.status==="active"?"selected":""}>ใช้งาน</option><option value="inactive" ${u.status==="inactive"?"selected":""}>ปิดใช้งาน</option></select>
 <div class="notice">🔐 Admin สามารถกำหนดหรือเปลี่ยนรหัสผ่านของผู้ใช้งานได้จากหน้านี้</div>
 <div class="modal-actions"><button class="btn btn-light" onclick="closeModal()">ยกเลิก</button><button class="btn btn-primary" onclick="saveUser('${id}')">บันทึก</button></div>`)
}
function saveUser(id){
 const name=document.getElementById("u_name").value.trim();
 const username=document.getElementById("u_username").value.trim();
 const password=document.getElementById("u_password").value;
 const password2=document.getElementById("u_password2").value;
 const role=document.getElementById("u_role").value;
 const status=document.getElementById("u_status").value;
 if(!name||!username||(!id&&!password)){alert("กรุณากรอกชื่อ Username และรหัสผ่านให้ครบ");return}
 if(password && password.length<4){alert("รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร");return}
 if(password!==password2 && (password||password2)){alert("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");return}
 const U=users();
 if(U.some(u=>u.username===username&&u.id!==id)){alert("Username นี้มีอยู่แล้ว");return}
 if(id){
   const u=U.find(x=>x.id===id);
   if(!u){alert("ไม่พบผู้ใช้งาน");return}
   Object.assign(u,{name,username,role,status});
   if(password)u.password=password;
   // หาก Admin แก้ไขบัญชีที่กำลังใช้งานอยู่ ให้อัปเดต session ด้วย
   if(login().id===id)write(K.login,{id:u.id,username:u.username,name:u.name,role:u.role});
 }else{
   U.push({id:Date.now().toString(),name,username,password,role,status});
 }
 write(K.users,U);closeModal();userPage()
}
function deleteUser(id){
 if(id==="1"){alert("ไม่สามารถลบ Admin หลักได้");return}
 if(login().id===id){alert("ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้");return}
 const target=users().find(u=>u.id===id);
 if(target?.role==="admin" && users().filter(u=>u.role==="admin"&&u.status==="active").length<=1){alert("ต้องมี Admin ที่ใช้งานได้อย่างน้อย 1 บัญชี");return}
 if(confirm("ยืนยันการลบผู้ใช้งาน?")){write(K.users,users().filter(u=>u.id!==id));userPage()}
}
function importUsers(file){if(!file)return;const r=new FileReader();r.onload=()=>{const rows=parseCSV(r.result),U=users();let n=0;rows.forEach(x=>{const name=x.name||x["ชื่อ"]||x["ชื่อ-นามสกุล"]||"",username=x.username||x["ชื่อผู้ใช้"]||"";if(name&&username&&!U.some(u=>u.username===username)){U.push({id:Date.now().toString()+n++,name,username,password:x.password||x["รหัสผ่าน"]||"1234",role:(x.role||"user").toLowerCase()==="admin"?"admin":"user",status:"active"})}});write(K.users,U);alert(`นำเข้าผู้ใช้ ${n} รายการ`);userPage()};r.readAsText(file,"UTF-8")}
function exportUsers(){downloadCSV("users.csv",["name","username","role","status"],users())}
function settingsPage(){
 document.getElementById("content").innerHTML=`<div class="grid2">
 <div class="card"><h3>ข้อมูลระบบ</h3><p>ชื่อระบบ: <b>SUT Asset RFID</b></p><p>หน่วยงาน: <b>ศูนย์เครื่องมือ มหาวิทยาลัยเทคโนโลยีสุรนารี</b></p><p class="muted">ข้อมูลเก็บในเบราว์เซอร์เครื่องนี้</p></div>
 <div class="card"><h3>นำเข้า / ส่งออกข้อมูล CSV</h3><p class="muted">ข้อมูลแต่ละประเภทใช้ไฟล์ CSV แยกกัน เพื่อให้ Import/Export ใช้งานได้จริงและไม่ปะปนกัน</p>
 <div class="toolbar"><label class="btn btn-orange file-label">📥 นำเข้าครุภัณฑ์ CSV<input id="setAssetImport" type="file" accept=".csv,text/csv"></label><button class="btn btn-light" onclick="exportAssets()">📤 ส่งออกครุภัณฑ์ CSV</button></div>
 <div class="toolbar" style="margin-top:8px"><label class="btn btn-orange file-label">📥 นำเข้าผู้ใช้ CSV<input id="setUserImport" type="file" accept=".csv,text/csv"></label><button class="btn btn-light" onclick="exportUsers()">📤 ส่งออกผู้ใช้ CSV</button></div>
 <div class="toolbar" style="margin-top:8px"><label class="btn btn-orange file-label">📥 นำเข้า Maintenance CSV<input id="setMaintImport" type="file" accept=".csv,text/csv"></label><button class="btn btn-light" onclick="exportMaintenance()">📤 ส่งออก Maintenance CSV</button></div>
 <div class="toolbar" style="margin-top:8px"><label class="btn btn-orange file-label">📥 นำเข้าประวัติ RFID CSV<input id="setHistoryImport" type="file" accept=".csv,text/csv"></label><button class="btn btn-light" onclick="exportHistory()">📤 ส่งออกประวัติ RFID CSV</button></div></div>
 <div class="card"><h3>รูปแบบไฟล์ CSV</h3><p><b>ครุภัณฑ์:</b> assetNo,name,epc,brand,model,location,responsible,status,usageStatus,assignedUser,usageCount,maintenanceIntervalDays,lastMaintenance,nextMaintenance</p><p><b>ผู้ใช้:</b> name,username,password,role,status</p><p><b>Maintenance:</b> date,type,asset,user,status,detail,hours,cost</p><p><b>ประวัติ RFID:</b> date,user,total,found</p><p class="mini muted">รองรับ UTF-8 CSV และมี BOM เพื่อให้ภาษาไทยเปิดใน Excel ได้</p></div>
 <div class="card"><h3>ข้อมูลเริ่มต้น</h3><button class="btn btn-danger" onclick="resetDemo()">รีเซ็ตข้อมูลตัวอย่าง</button><p class="mini muted">คืนข้อมูลตัวอย่างและล้างประวัติการตรวจนับ/Maintenance</p></div></div>`;
 document.getElementById("setAssetImport").onchange=e=>importAssets(e.target.files[0]);document.getElementById("setUserImport").onchange=e=>importUsers(e.target.files[0]);document.getElementById("setMaintImport").onchange=e=>importMaintenance(e.target.files[0]);document.getElementById("setHistoryImport").onchange=e=>importHistory(e.target.files[0]);
}
function resetDemo(){if(confirm("ยืนยันรีเซ็ตข้อมูลตัวอย่าง?")){write(K.assets,SAMPLE_ASSETS);write(K.users,DEFAULT_USERS);write(K.history,[]);write(K.maintenance,[]);alert("รีเซ็ตแล้ว");render()}}
function modal(html){const b=document.getElementById("modalBg");b.innerHTML=`<div class="modal">${html}</div>`;b.style.display="flex"}
function closeModal(){document.getElementById("modalBg").style.display="none"}
function parseCSV(text){const lines=text.replace(/^\uFEFF/,"").split(/\r?\n/).filter(x=>x.trim());if(!lines.length)return[];const split=s=>{let out=[],cur="",q=false;for(let i=0;i<s.length;i++){const ch=s[i];if(ch==='"'&&s[i+1]==='"'){cur+='"';i++;continue}if(ch==='"'){q=!q;continue}if(ch===","&&!q){out.push(cur.trim());cur="";continue}cur+=ch}out.push(cur.trim());return out};const h=split(lines[0]).map(x=>x.toLowerCase());return lines.slice(1).map(line=>{const a=split(line),o={};h.forEach((x,i)=>o[x]=a[i]||"");return o})}
function importMaintenance(file){if(!file)return;const r=new FileReader();r.onload=()=>{const rows=parseCSV(r.result),M=maintenance();let n=0;rows.forEach(x=>{const ref=x.assetId||x.asset||x["ครุภัณฑ์"]||"";const a=assets().find(z=>z.id===ref||z.assetNo===ref||z.epc===ref||z.name===ref);M.push({id:Date.now().toString()+n++,date:x.date||x["วันที่"]||new Date().toISOString(),type:x.type||x["ประเภท"]||"maintenance",typeLabel:x.typeLabel||x["รายการ"]||x["ประเภท"]||"บำรุงรักษา",assetId:a?.id||ref,assetName:a?.name||x.assetName||x["ชื่อครุภัณฑ์"]||ref,user:x.user||x["ผู้ใช้งาน"]||x["ผู้แจ้ง"]||"",status:x.status||x["สถานะ"]||"เสร็จสิ้น",detail:x.detail||x["รายละเอียด"]||"",hours:Number(x.hours||x["ชั่วโมง"]||0),cost:Number(x.cost||x["ค่าใช้จ่าย"]||0)});});write(K.maintenance,M);alert(`นำเข้า Maintenance ${n} รายการ`);showPage("maintenance")};r.readAsText(file,"UTF-8")}
function importHistory(file){if(!file)return;const r=new FileReader();r.onload=()=>{const rows=parseCSV(r.result),H=history();let n=0;rows.forEach(x=>{const found=String(x.found||x["พบ"]||"").split(/[;|]/).map(v=>v.trim()).filter(Boolean);H.unshift({id:Date.now().toString()+n++,date:x.date||x["วันที่"]||new Date().toISOString(),user:x.user||x["ผู้ตรวจ"]||"",total:Number(x.total||x["ทั้งหมด"]||assets().length),found});n++});write(K.history,H);alert(`นำเข้าประวัติ RFID ${n} รายการ`);showPage("history")};r.readAsText(file,"UTF-8")}
function downloadCSV(name,headers,rows){const lines=[headers.join(","),...rows.map(r=>headers.map(h=>`"${String(r[h]??"").replace(/"/g,'""')}"`).join(","))];const blob=new Blob(["\uFEFF"+lines.join("\n")],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
render();