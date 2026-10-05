const KEY_USERS = "sut_rfid_users_v1";
const KEY_SESSION = "sut_rfid_session_v1";

const seedUsers = [
  {id:"admin-001",name:"ผู้ดูแลระบบ",username:"admin",role:"Admin",department:"ศูนย์เครื่องมือ มทส.",status:"active"},
  {id:"user-001",name:"ดิเรกฤทธิ์ แสงโชติ",username:"direkrit",role:"ผู้ใช้งาน",department:"ศูนย์เครื่องมือ มทส.",status:"active"}
];

function getUsers(){
  try{
    const data=JSON.parse(localStorage.getItem(KEY_USERS));
    if(Array.isArray(data) && data.length) return data;
  }catch(e){}
  localStorage.setItem(KEY_USERS,JSON.stringify(seedUsers));
  return seedUsers;
}
function saveUsers(users){localStorage.setItem(KEY_USERS,JSON.stringify(users))}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function uid(){return "u-"+Date.now()+"-"+Math.random().toString(16).slice(2)}
function isLogged(){return localStorage.getItem(KEY_SESSION)==="1"}

function render(){
  if(!isLogged()){renderLogin();return}
  renderApp();
}
function renderLogin(){
  document.getElementById("app").innerHTML=`
  <div class="login">
    <div class="login-card">
      <div class="logo login-logo">SUT</div>
      <h1>ระบบจัดการครุภัณฑ์ RFID</h1>
      <p>ศูนย์เครื่องมือ มหาวิทยาลัยเทคโนโลยีสุรนารี</p>
      <input id="loginUser" class="input" placeholder="ชื่อผู้ใช้งาน" autocomplete="username">
      <input id="loginPass" class="input" type="password" placeholder="รหัสผ่าน" autocomplete="current-password">
      <div id="loginError" class="login-error"></div>
      <button class="btn btn-primary" style="width:100%" onclick="login()">เข้าสู่ระบบ</button>
      <div style="font-size:12px;color:#9aa7b5;margin-top:14px">สำหรับต้นแบบ GitHub Pages • ข้อมูลเก็บในเบราว์เซอร์</div>
    </div>
  </div>`;
}
function login(){
  const u=document.getElementById("loginUser").value.trim();
  const p=document.getElementById("loginPass").value;
  // Demo credentials. Change before real deployment.
  if(u==="admin" && p==="1234"){
    localStorage.setItem(KEY_SESSION,"1"); render();
  }else document.getElementById("loginError").textContent="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
}
function logout(){localStorage.removeItem(KEY_SESSION);render()}

function renderApp(){
  const users=getUsers();
  const active=users.filter(x=>x.status==="active").length;
  const admins=users.filter(x=>x.role==="Admin").length;
  document.getElementById("app").innerHTML=`
  <header class="topbar">
    <div class="brand"><div class="logo">SUT</div><div><strong>SUT Asset RFID</strong><small>ระบบจัดการครุภัณฑ์ • ศูนย์เครื่องมือ มทส.</small></div></div>
    <div class="top-user"><div class="avatar">A</div><span style="font-size:13px">ผู้ดูแลระบบ</span><button class="btn btn-light" onclick="logout()">ออกจากระบบ</button></div>
  </header>
  <div class="layout">
    <aside class="sidebar">
      <div class="nav-title">เมนูหลัก</div>
      <button class="nav active" onclick="showSection('dashboard')">📊 Dashboard</button>
      <button class="nav" onclick="showSection('users')">👥 จัดการผู้ใช้งาน</button>
      <button class="nav" onclick="showSection('assets')">📦 ครุภัณฑ์</button>
      <button class="nav" onclick="showSection('scan')">📡 ตรวจนับ RFID</button>
      <div class="nav-title" style="margin-top:18px">ระบบ</div>
      <button class="nav" onclick="showSection('settings')">⚙️ ตั้งค่า</button>
    </aside>
    <main class="main" id="content"></main>
  </div>
  <nav class="mobile-nav">
    <button class="active" onclick="showSection('dashboard')">📊<br>หน้าหลัก</button>
    <button onclick="showSection('users')">👥<br>ผู้ใช้</button>
    <button onclick="showSection('assets')">📦<br>ครุภัณฑ์</button>
    <button onclick="showSection('scan')">📡<br>สแกน</button>
  </nav>`;
  showSection("dashboard");
}
function showSection(section){
  document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));
  const map={dashboard:"Dashboard",users:"จัดการผู้ใช้งาน",assets:"ครุภัณฑ์",scan:"ตรวจนับ RFID",settings:"ตั้งค่า"};
  document.getElementById("content").innerHTML = section==="users" ? usersPage() : genericPage(section,map[section]);
}
function genericPage(section,title){
  if(section==="dashboard"){
    const users=getUsers(), active=users.filter(x=>x.status==="active").length;
    return `<div class="page-head"><div><h1>Dashboard</h1><p>ภาพรวมระบบตรวจนับครุภัณฑ์ RFID</p></div><div class="actions"><button class="btn btn-orange" onclick="showSection('users')">+ จัดการผู้ใช้งาน</button></div></div>
    <div class="cards">
      <div class="card stat"><div class="stat-icon">👥</div><div><small>ผู้ใช้งานทั้งหมด</small><b>${users.length}</b></div></div>
      <div class="card stat green"><div class="stat-icon">✓</div><div><small>ใช้งานอยู่</small><b>${active}</b></div></div>
      <div class="card stat orange"><div class="stat-icon">👑</div><div><small>ผู้ดูแลระบบ</small><b>${users.filter(x=>x.role==="Admin").length}</b></div></div>
      <div class="card stat red"><div class="stat-icon">📦</div><div><small>ครุภัณฑ์</small><b>0</b></div></div>
    </div>
    <div class="card panel"><div class="panel-title"><h2>พร้อมใช้งาน</h2><span class="badge green">ระบบออนไลน์</span></div>
    <p style="color:var(--muted)">เริ่มจากเมนู <b>จัดการผู้ใช้งาน</b> เพื่อเพิ่มผู้ใช้รายบุคคล หรือนำเข้าผู้ใช้จำนวนมากด้วยไฟล์ CSV</p></div>`;
  }
  return `<div class="page-head"><div><h1>${title}</h1><p>โมดูลนี้เตรียมไว้สำหรับเชื่อมต่อระบบหลัก</p></div></div><div class="card panel"><div class="empty">ยังไม่มีข้อมูลในส่วนนี้</div></div>`;
}
function usersPage(){
  const users=getUsers();
  return `<div class="page-head"><div><h1>จัดการผู้ใช้งาน</h1><p>เพิ่ม แก้ไข ลบ และนำเข้าผู้ใช้งานด้วย CSV</p></div>
  <div class="actions"><button class="btn btn-light" onclick="openImport()">⬆ นำเข้า CSV</button><button class="btn btn-primary" onclick="openUser()">+ เพิ่มผู้ใช้งาน</button></div></div>
  <div class="notice">หมายเหตุ: เวอร์ชัน GitHub Pages นี้เป็นต้นแบบแบบ Static ข้อมูลผู้ใช้จะถูกเก็บใน <b>LocalStorage</b> ของเครื่องที่ใช้งาน จึงยังไม่ใช่ระบบบัญชีผู้ใช้แบบปลอดภัยสำหรับใช้งานจริงหลายเครื่อง</div>
  <div class="cards">
   <div class="card stat"><div class="stat-icon">👥</div><div><small>ทั้งหมด</small><b>${users.length}</b></div></div>
   <div class="card stat green"><div class="stat-icon">✓</div><div><small>ใช้งาน</small><b>${users.filter(x=>x.status==="active").length}</b></div></div>
   <div class="card stat red"><div class="stat-icon">×</div><div><small>ปิดใช้งาน</small><b>${users.filter(x=>x.status!=="active").length}</b></div></div>
   <div class="card stat orange"><div class="stat-icon">👑</div><div><small>Admin</small><b>${users.filter(x=>x.role==="Admin").length}</b></div></div>
  </div>
  <div class="card panel">
   <div class="searchrow"><input id="userSearch" class="input search" placeholder="🔎 ค้นหาชื่อ / Username / หน่วยงาน" oninput="filterUsers()"></div>
   <div class="table-wrap"><table><thead><tr><th>ชื่อผู้ใช้งาน</th><th>Username</th><th>สิทธิ์</th><th>หน่วยงาน</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody id="userRows">${userRows(users)}</tbody></table></div>
  </div>`;
}
function userRows(users){
  if(!users.length)return `<tr><td colspan="6" class="empty">ไม่พบข้อมูลผู้ใช้งาน</td></tr>`;
  return users.map(u=>`<tr>
    <td><b>${esc(u.name)}</b></td><td>${esc(u.username)}</td>
    <td><span class="badge ${u.role==="Admin"?"orange":"blue"}">${esc(u.role)}</span></td>
    <td>${esc(u.department)}</td>
    <td><span class="badge ${u.status==="active"?"green":"red"}">${u.status==="active"?"ใช้งาน":"ปิดใช้งาน"}</span></td>
    <td><div class="row-actions"><button class="iconbtn" onclick='openUser(${JSON.stringify(u).replace(/'/g,"&#39;")})'>แก้ไข</button><button class="iconbtn delete" onclick="deleteUser('${u.id}')">ลบ</button></div></td>
  </tr>`).join("");
}
function filterUsers(){
  const q=document.getElementById("userSearch").value.toLowerCase();
  const users=getUsers().filter(u=>[u.name,u.username,u.department,u.role].join(" ").toLowerCase().includes(q));
  document.getElementById("userRows").innerHTML=userRows(users);
}
function openUser(user=null){
  const u=user||{id:"",name:"",username:"",role:"ผู้ใช้งาน",department:"ศูนย์เครื่องมือ มทส.",status:"active"};
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-back show" id="modal"><div class="modal">
    <div class="modal-head"><h3>${u.id?"แก้ไขผู้ใช้งาน":"เพิ่มผู้ใช้งาน"}</h3><button class="iconbtn" onclick="closeModal()">✕</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="field full"><label>ชื่อ-นามสกุล</label><input id="fName" class="input" value="${esc(u.name)}"></div>
      <div class="field"><label>Username</label><input id="fUsername" class="input" value="${esc(u.username)}"></div>
      <div class="field"><label>สิทธิ์</label><select id="fRole" class="input"><option ${u.role==="ผู้ใช้งาน"?"selected":""}>ผู้ใช้งาน</option><option ${u.role==="Admin"?"selected":""}>Admin</option></select></div>
      <div class="field full"><label>หน่วยงาน</label><input id="fDepartment" class="input" value="${esc(u.department)}"></div>
      <div class="field"><label>สถานะ</label><select id="fStatus" class="input"><option value="active" ${u.status==="active"?"selected":""}>ใช้งาน</option><option value="inactive" ${u.status!=="active"?"selected":""}>ปิดใช้งาน</option></select></div>
    </div></div>
    <div class="modal-foot"><button class="btn btn-light" onclick="closeModal()">ยกเลิก</button><button class="btn btn-primary" onclick='saveUser("${u.id}")'>บันทึก</button></div>
  </div></div>`);
}
function saveUser(id){
  const name=document.getElementById("fName").value.trim(), username=document.getElementById("fUsername").value.trim();
  if(!name||!username){alert("กรุณากรอกชื่อและ Username");return}
  let users=getUsers();
  if(users.some(u=>u.username.toLowerCase()===username.toLowerCase() && u.id!==id)){alert("Username นี้มีอยู่แล้ว");return}
  const data={id:id||uid(),name,username,role:document.getElementById("fRole").value,department:document.getElementById("fDepartment").value.trim(),status:document.getElementById("fStatus").value};
  if(id) users=users.map(u=>u.id===id?data:u); else users.push(data);
  saveUsers(users);closeModal();showSection("users");
}
function deleteUser(id){
  const users=getUsers(), target=users.find(u=>u.id===id);
  if(!target)return;
  if(target.username==="admin"){alert("ไม่อนุญาตให้ลบ Admin หลัก");return}
  if(!confirm(`ต้องการลบผู้ใช้งาน "${target.name}" ใช่หรือไม่?`))return;
  saveUsers(users.filter(u=>u.id!==id));showSection("users");
}
function openImport(){
 document.body.insertAdjacentHTML("beforeend",`<div class="modal-back show" id="modal"><div class="modal">
  <div class="modal-head"><h3>นำเข้าผู้ใช้งานจาก CSV</h3><button class="iconbtn" onclick="closeModal()">✕</button></div>
  <div class="modal-body">
   <div class="notice">หัวตารางที่แนะนำ: <b>name,username,role,department,status</b><br>ตัวอย่าง: ดิเรกฤทธิ์ แสงโชติ,direkrit,ผู้ใช้งาน,ศูนย์เครื่องมือ มทส.,active</div>
   <div class="drop"><b>เลือกไฟล์ CSV</b><br><input id="csvFile" type="file" accept=".csv,text/csv"></div>
  </div>
  <div class="modal-foot"><button class="btn btn-light" onclick="closeModal()">ยกเลิก</button><button class="btn btn-primary" onclick="importCSV()">นำเข้า</button></div>
 </div></div>`);
}
function parseCSV(text){
  const lines=text.replace(/^\uFEFF/,"").split(/\r?\n/).filter(x=>x.trim());
  if(!lines.length)return [];
  const parseLine=line=>{
    const out=[];let cur="",quote=false;
    for(let i=0;i<line.length;i++){const c=line[i],n=line[i+1];if(c==='"'&&n==='"'){cur+='"';i++;continue}if(c==='"'){quote=!quote;continue}if(c===','&&!quote){out.push(cur.trim());cur="";continue}cur+=c}out.push(cur.trim());return out};
  const headers=parseLine(lines[0]).map(x=>x.toLowerCase());
  return lines.slice(1).map(line=>{const vals=parseLine(line),o={};headers.forEach((h,i)=>o[h]=vals[i]??"");return o});
}
function importCSV(){
 const file=document.getElementById("csvFile").files[0]; if(!file){alert("กรุณาเลือกไฟล์ CSV");return}
 const reader=new FileReader();
 reader.onload=e=>{
   const rows=parseCSV(e.target.result), users=getUsers(); let added=0,updated=0;
   rows.forEach(r=>{
     const name=r.name||r["ชื่อ"]||r["ชื่อ-นามสกุล"]; const username=r.username||r["user"]||r["รหัสผู้ใช้"];
     if(!name||!username)return;
     const obj={id:uid(),name,username,role:r.role||r["สิทธิ์"]||"ผู้ใช้งาน",department:r.department||r["หน่วยงาน"]||"ศูนย์เครื่องมือ มทส.",status:(r.status||"active").toLowerCase()==="inactive"?"inactive":"active"};
     const idx=users.findIndex(u=>u.username.toLowerCase()===username.toLowerCase());
     if(idx>=0){obj.id=users[idx].id;users[idx]=obj;updated++}else{users.push(obj);added++}
   });
   saveUsers(users);closeModal();showSection("users");alert(`นำเข้าเสร็จแล้ว\\nเพิ่มใหม่ ${added} รายการ\\nอัปเดต ${updated} รายการ`);
 };
 reader.readAsText(file,"UTF-8");
}
function closeModal(){document.getElementById("modal")?.remove()}
window.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
render();
