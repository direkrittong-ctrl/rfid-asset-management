const DEFAULT_USERS = [
  {id:"1",username:"admin",name:"ผู้ดูแลระบบ",role:"admin",status:"active"},
  {id:"2",username:"user",name:"ผู้ใช้งานตัวอย่าง",role:"user",status:"active"}
];

const USER_KEY = "sut_rfid_users_v1";
const LOGIN_KEY = "sut_rfid_login_v1";

function getUsers(){
  try{
    const data = JSON.parse(localStorage.getItem(USER_KEY));
    if(Array.isArray(data) && data.length) return data;
  }catch(e){}
  localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USERS));
  return [...DEFAULT_USERS];
}
function saveUsers(users){ localStorage.setItem(USER_KEY, JSON.stringify(users)); }
function escapeHtml(v){
  return String(v ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function render(){
  const app=document.getElementById("app");
  const login=localStorage.getItem(LOGIN_KEY);
  if(!login){ renderLogin(app); return; }
  renderDashboard(app);
}
function renderLogin(app){
  app.innerHTML=`
  <main class="login-page">
    <section class="login-card">
      <div class="sut-logo">SUT</div>
      <h1>ระบบจัดการครุภัณฑ์ RFID</h1>
      <p class="subtitle">ศูนย์เครื่องมือ มหาวิทยาลัยเทคโนโลยีสุรนารี</p>
      <form id="loginForm">
        <input id="username" class="field" placeholder="ชื่อผู้ใช้งาน" autocomplete="username">
        <input id="password" class="field" type="password" placeholder="รหัสผ่าน" autocomplete="current-password">
        <div id="loginError" class="error"></div>
        <button class="btn btn-primary login-btn" type="submit">เข้าสู่ระบบ</button>
      </form>
      <div class="login-foot">ระบบต้นแบบ GitHub Pages • ข้อมูลเก็บในเบราว์เซอร์</div>
    </section>
  </main>`;
  document.getElementById("loginForm").addEventListener("submit", e=>{
    e.preventDefault();
    const u=document.getElementById("username").value.trim();
    const p=document.getElementById("password").value;
    const err=document.getElementById("loginError");
    if(!u || !p){ err.textContent="กรุณากรอกชื่อผู้ใช้และรหัสผ่าน"; return; }
    // Demo credentials for this static prototype.
    if(u==="admin" && p==="1234"){
      localStorage.setItem(LOGIN_KEY, JSON.stringify({username:"admin",role:"admin"}));
      render();
    }else if(u==="user" && p==="1234"){
      localStorage.setItem(LOGIN_KEY, JSON.stringify({username:"user",role:"user"}));
      render();
    }else{
      err.textContent="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
    }
  });
}
function renderDashboard(app){
  const login=JSON.parse(localStorage.getItem(LOGIN_KEY)||"{}");
  const users=getUsers();
  app.innerHTML=`
  <div class="shell">
    <aside class="sidebar">
      <div class="brand"><div class="sut-logo">SUT</div><strong>SUT Asset RFID</strong></div>
      <nav class="nav">
        <button class="active" data-page="dashboard">📊 Dashboard</button>
        <button data-page="users">👥 จัดการผู้ใช้งาน</button>
        <button data-page="assets">📦 ครุภัณฑ์</button>
        <button data-page="scan">📡 ตรวจนับ RFID</button>
      </nav>
    </aside>
    <main class="main">
      <div class="topbar"><h2 id="pageTitle">Dashboard</h2><div class="user-chip">👤 ${escapeHtml(login.username)} <button id="logout" class="btn btn-light">ออกจากระบบ</button></div></div>
      <div id="content"></div>
    </main>
  </div>
  <div id="modalBg" class="modal-bg"></div>`;
  document.querySelectorAll(".nav button").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
  document.getElementById("logout").onclick=()=>{localStorage.removeItem(LOGIN_KEY);render();};
  showPage("dashboard");
}
function showPage(page){
  document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  const title={dashboard:"Dashboard",users:"จัดการผู้ใช้งาน",assets:"จัดการครุภัณฑ์",scan:"ตรวจนับ RFID"}[page];
  document.getElementById("pageTitle").textContent=title;
  const content=document.getElementById("content");
  if(page==="dashboard") content.innerHTML=dashboardHtml();
  if(page==="users") usersHtml();
  if(page==="assets") content.innerHTML=placeholder("📦","จัดการครุภัณฑ์","ส่วนนี้เตรียมไว้สำหรับนำเข้ารายการครุภัณฑ์ CSV และเชื่อมต่อ RFID");
  if(page==="scan") content.innerHTML=placeholder("📡","ตรวจนับ RFID","ส่วนนี้จะเชื่อมต่อ ESP32 + UHF RFID Reader ในขั้นตอนถัดไป");
}
function dashboardHtml(){
  const users=getUsers();
  const active=users.filter(u=>u.status==="active").length;
  return `<div class="cards">
    <div class="card"><div class="muted">ผู้ใช้งานทั้งหมด</div><div class="stat">${users.length}</div></div>
    <div class="card"><div class="muted">ใช้งานอยู่</div><div class="stat">${active}</div></div>
    <div class="card"><div class="muted">ผู้ดูแลระบบ</div><div class="stat">${users.filter(u=>u.role==="admin").length}</div></div>
    <div class="card"><div class="muted">ครุภัณฑ์</div><div class="stat">0</div></div>
  </div>
  <div class="section"><div class="card"><h3>ระบบจัดการครุภัณฑ์ RFID</h3><p class="muted">เลือกเมนู “จัดการผู้ใช้งาน” เพื่อเพิ่ม แก้ไข ลบ หรือ Import CSV ผู้ใช้งาน</p></div></div>`;
}
function usersHtml(){
  const content=document.getElementById("content");
  content.innerHTML=`<div class="section-head">
    <div class="toolbar">
      <input id="searchUser" class="field" placeholder="ค้นหาชื่อหรือ Username">
      <button id="addUser" class="btn btn-primary">＋ เพิ่มผู้ใช้งาน</button>
      <label class="btn btn-orange file-label">📥 Import CSV<input id="csvFile" class="hidden" type="file" accept=".csv,text/csv"></label>
      <button id="exportCsv" class="btn btn-light">📤 Export CSV</button>
    </div>
  </div><div class="table-wrap"><table><thead><tr><th>ชื่อ</th><th>Username</th><th>สิทธิ์</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody id="userRows"></tbody></table></div>`;
  document.getElementById("addUser").onclick=()=>openUserModal();
  document.getElementById("searchUser").oninput=()=>drawUsers();
  document.getElementById("csvFile").onchange=e=>importCSV(e.target.files[0]);
  document.getElementById("exportCsv").onclick=exportCSV;
  drawUsers();
}
function drawUsers(){
  const q=(document.getElementById("searchUser")?.value||"").toLowerCase();
  const rows=getUsers().filter(u=>(u.name+" "+u.username).toLowerCase().includes(q));
  document.getElementById("userRows").innerHTML=rows.length?rows.map(u=>`<tr>
    <td>${escapeHtml(u.name)}</td><td>${escapeHtml(u.username)}</td><td>${u.role==="admin"?"Admin":"User"}</td>
    <td><span class="status ${u.status==="active"?"on":"off"}">${u.status==="active"?"ใช้งาน":"ปิดใช้งาน"}</span></td>
    <td><button class="btn btn-light" onclick="openUserModal('${u.id}')">แก้ไข</button> <button class="btn btn-danger" onclick="deleteUser('${u.id}')">ลบ</button></td>
  </tr>`).join(""):`<tr><td colspan="5" class="empty">ไม่พบข้อมูลผู้ใช้งาน</td></tr>`;
}
function openUserModal(id){
  const u=id?getUsers().find(x=>x.id===id):{name:"",username:"",role:"user",status:"active"};
  const bg=document.getElementById("modalBg");
  bg.style.display="flex";
  bg.innerHTML=`<div class="modal"><h3>${id?"แก้ไขผู้ใช้งาน":"เพิ่มผู้ใช้งาน"}</h3>
    <input id="mName" class="field" placeholder="ชื่อ-นามสกุล" value="${escapeHtml(u.name)}">
    <input id="mUsername" class="field" placeholder="Username" value="${escapeHtml(u.username)}">
    <input id="mPassword" class="field" type="password" placeholder="${id?"เว้นว่างหากไม่เปลี่ยนรหัสผ่าน":"รหัสผ่าน"}">
    <select id="mRole" class="field"><option value="user" ${u.role==="user"?"selected":""}>User</option><option value="admin" ${u.role==="admin"?"selected":""}>Admin</option></select>
    <select id="mStatus" class="field"><option value="active" ${u.status==="active"?"selected":""}>ใช้งาน</option><option value="inactive" ${u.status==="inactive"?"selected":""}>ปิดใช้งาน</option></select>
    <div class="modal-actions"><button class="btn btn-light" onclick="closeModal()">ยกเลิก</button><button class="btn btn-primary" onclick="saveUser('${id||""}')">บันทึก</button></div></div>`;
}
function closeModal(){document.getElementById("modalBg").style.display="none";}
function saveUser(id){
  const name=document.getElementById("mName").value.trim(), username=document.getElementById("mUsername").value.trim(), password=document.getElementById("mPassword").value;
  if(!name||!username||(!id&&!password)){alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบ");return;}
  const users=getUsers();
  if(users.some(u=>u.username===username&&u.id!==id)){alert("Username นี้มีอยู่แล้ว");return;}
  if(id){
    const u=users.find(x=>x.id===id); Object.assign(u,{name,username,role:document.getElementById("mRole").value,status:document.getElementById("mStatus").value});
    if(password) u.password=password;
  }else users.push({id:Date.now().toString(),name,username,password,role:document.getElementById("mRole").value,status:document.getElementById("mStatus").value});
  saveUsers(users);closeModal();usersHtml();
}
function deleteUser(id){
  if(id==="1"){alert("ไม่สามารถลบ Admin หลักได้");return;}
  if(!confirm("ยืนยันการลบผู้ใช้งานนี้?"))return;
  saveUsers(getUsers().filter(u=>u.id!==id));drawUsers();
}
function parseCSV(text){
  const lines=text.replace(/^\uFEFF/,"").split(/\r?\n/).filter(x=>x.trim());
  if(!lines.length)return [];
  const split=line=>line.split(",").map(x=>x.trim().replace(/^"|"$/g,""));
  const headers=split(lines[0]).map(x=>x.toLowerCase());
  return lines.slice(1).map(line=>{
    const a=split(line), o={};
    headers.forEach((h,i)=>o[h]=a[i]||"");
    return o;
  });
}
function importCSV(file){
  if(!file)return;
  const r=new FileReader();
  r.onload=()=>{
    const rows=parseCSV(r.result);
    const users=getUsers();
    let added=0;
    rows.forEach(row=>{
      const name=row.name||row["ชื่อ"]||row["ชื่อ-นามสกุล"]||"";
      const username=row.username||row["username"]||row["ชื่อผู้ใช้"]||"";
      if(!name||!username||users.some(u=>u.username===username))return;
      users.push({id:Date.now().toString()+added,name,username,password:row.password||row["รหัสผ่าน"]||"1234",role:(row.role||"user").toLowerCase()==="admin"?"admin":"user",status:"active"});added++;
    });
    saveUsers(users); alert(`นำเข้าเรียบร้อย ${added} รายการ`); usersHtml();
  };
  r.readAsText(file,"UTF-8");
}
function exportCSV(){
  const users=getUsers();
  const lines=["name,username,role,status",...users.map(u=>[u.name,u.username,u.role,u.status].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(","))];
  const blob=new Blob(["\uFEFF"+lines.join("\n")],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="users.csv";a.click();URL.revokeObjectURL(a.href);
}
function placeholder(icon,title,text){return `<div class="card" style="text-align:center;padding:60px 20px"><div style="font-size:52px">${icon}</div><h2>${title}</h2><p class="muted">${text}</p></div>`;}
render();
