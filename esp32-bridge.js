/* SUT RFID ESP32 bridge
 * Browser transport:
 *  - PC: USB Serial (Chrome/Edge) or BLE
 *  - Android: Web Bluetooth BLE
 * ESP32 BLE profile:
 *  Nordic UART Service (NUS)
 *  TX Notify      6e400003-b5a3-f393-e0a9-e50e24dcca9e
 *  RX Command     6e400002-b5a3-f393-e0a9-e50e24dcca9e
 */
const SUT_BLE_SERVICE='6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const SUT_BLE_EPC='6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const SUT_BLE_CMD='6e400002-b5a3-f393-e0a9-e50e24dcca9e';
let bridgeBleDevice=null,bridgeBleServer=null,bridgeBleEpc=null,bridgeBleCmd=null;
let bridgeSerialPort=null,bridgeSerialReader=null,bridgeSerialRunning=false;
let bridgeTransport='';

function bridgeStatus(text,ok=false){
 const el=document.getElementById('espStatus');
 if(el){el.innerHTML=(ok?'🟢 ':'⚪ ')+text;el.className='notice '+(ok?'success':'');}
}
function bridgeSupported(){return {ble:!!(navigator.bluetooth&&window.isSecureContext),serial:!!navigator.serial};}

async function connectESP32BLE(){
 const s=bridgeSupported();
 if(!s.ble)return alert('อุปกรณ์/เบราว์เซอร์นี้ไม่รองรับ Web Bluetooth หรือหน้าเว็บไม่ได้เปิดผ่าน HTTPS\nแนะนำ Android + Chrome หรือ PC + Chrome/Edge');
 try{
  bridgeBleDevice=await navigator.bluetooth.requestDevice({filters:[{namePrefix:'SUT-RFID'}],optionalServices:[SUT_BLE_SERVICE]});
  bridgeBleDevice.addEventListener('gattserverdisconnected',()=>{bridgeStatus('ESP32 BLE หลุดการเชื่อมต่อ');bridgeTransport='';});
  bridgeBleServer=await bridgeBleDevice.gatt.connect();
  const service=await bridgeBleServer.getPrimaryService(SUT_BLE_SERVICE);
  bridgeBleEpc=await service.getCharacteristic(SUT_BLE_EPC);
  try{bridgeBleCmd=await service.getCharacteristic(SUT_BLE_CMD)}catch(e){bridgeBleCmd=null}
  await bridgeBleEpc.startNotifications();
  bridgeBleEpc.addEventListener('characteristicvaluechanged',e=>{
   const text=new TextDecoder().decode(e.target.value).trim();
   text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach(x=>{if(typeof recordEPC==='function')recordEPC(x)});
  });
  bridgeTransport='BLE';
  bridgeStatus('เชื่อมต่อ '+(bridgeBleDevice.name||'SUT-RFID')+' ผ่าน Bluetooth แล้ว',true);
  if(bridgeBleCmd)await bridgeSendCommand('SCAN');
  if(typeof render==='function')render();
 }catch(e){alert('เชื่อมต่อ Bluetooth ไม่สำเร็จ: '+e.message)}
}
async async function bridgeSendCommand(cmd){
 if(!bridgeBleCmd)return;
 try{await bridgeBleCmd.writeValue(new TextEncoder().encode(cmd+'\n'))}catch(e){}
}
async function disconnectESP32BLE(){
 try{if(bridgeBleCmd)await bridgeSendCommand('STOP');if(bridgeBleDevice?.gatt?.connected)bridgeBleDevice.gatt.disconnect()}catch(e){}
 bridgeBleDevice=null;bridgeBleServer=null;bridgeBleEpc=null;bridgeBleCmd=null;bridgeTransport='';bridgeStatus('ตัดการเชื่อมต่อแล้ว');
 if(typeof render==='function')render();
}

async function connectESP32USB(){
 if(!navigator.serial)return alert('เบราว์เซอร์นี้ไม่รองรับ Web Serial\nใช้ Chrome/Edge บน PC แล้วต่อ ESP32 ผ่าน USB');
 try{
  bridgeSerialPort=await navigator.serial.requestPort();
  await bridgeSerialPort.open({baudRate:115200});
  bridgeSerialRunning=true;bridgeTransport='USB';
  bridgeStatus('เชื่อมต่อ ESP32 ผ่าน USB แล้ว',true);
  if(typeof render==='function')render();
  const decoder=new TextDecoderStream();
  bridgeSerialPort.readable.pipeTo(decoder.writable).catch(()=>{});
  bridgeSerialReader=decoder.readable.getReader();
  while(bridgeSerialRunning&&bridgeSerialReader){
   const {value,done}=await bridgeSerialReader.read();
   if(done)break;
   if(value)value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach(x=>{if(typeof recordEPC==='function')recordEPC(x)});
  }
 }catch(e){alert('เชื่อมต่อ USB ไม่สำเร็จ: '+e.message)}
}
async function disconnectESP32USB(){
 bridgeSerialRunning=false;
 try{await bridgeSerialReader?.cancel()}catch(e){}
 try{await bridgeSerialPort?.close()}catch(e){}
 bridgeSerialReader=null;bridgeSerialPort=null;bridgeTransport='';bridgeStatus('ตัดการเชื่อมต่อแล้ว');
 if(typeof render==='function')render();
}

function scan(){
 const supported=bridgeSupported();
 const found=[...(typeof scanSeen!=='undefined'?scanSeen:new Set())].map(epc=>db.assets.find(a=>String(a.epc).toUpperCase()===String(epc).toUpperCase())).filter(Boolean);
 const conn=bridgeTransport==='BLE'?'Bluetooth (BLE)':bridgeTransport==='USB'?'USB Serial':'ยังไม่ได้เชื่อมต่อ';
 return `<div class="grid"><div class="card"><h3>ตรวจนับ RFID / ESP32</h3>
 <p>เชื่อมต่อเครื่องอ่าน RFID ผ่าน ESP32 แล้วส่ง EPC เข้าระบบโดยตรง</p>
 <div class="toolbar">
  ${supported.ble?'<button class="btn" onclick="connectESP32BLE()">📱/💻 เชื่อมต่อ Bluetooth</button>':''}
  ${supported.serial?'<button class="btn" onclick="connectESP32USB()">🔌 เชื่อมต่อ USB</button>':''}
  <button class="btn orange" onclick="startDemoScan()">เริ่มสแกนจำลอง</button>
  <button class="btn gray" onclick="clearScan()">ล้างผล</button>
 </div>
 <div id="espStatus" class="notice ${bridgeTransport?'success':''}">${bridgeTransport?'🟢 เชื่อมต่อผ่าน '+conn+' แล้ว':'⚪ ยังไม่ได้เชื่อมต่อ ESP32'}</div>
 <p>การเชื่อมต่อ: <b>${conn}</b></p>
 <p>พบ EPC <b>${typeof scanSeen!=='undefined'?scanSeen.size:0}</b> | ตรงกับฐานข้อมูล <b>${found.length}</b> / ${db.assets.length}</p>
 <small style="color:#718096">มือถือ: ใช้ Bluetooth BLE • PC: ใช้ USB หรือ Bluetooth</small>
 </div><div class="card"><h3>ผลการตรวจนับ</h3>${found.length?tableAssets(found):'<div class="empty">ยังไม่พบ EPC ที่ตรงกับฐานข้อมูล</div>'}</div></div>`;
}

// Keep the existing demo/record functions and only replace the connection UI/transport.
window.connectESP32=connectESP32USB;
window.connectESP32BLE=connectESP32BLE;
window.connectESP32USB=connectESP32USB;
window.disconnectESP32BLE=disconnectESP32BLE;
window.disconnectESP32USB=disconnectESP32USB;
window.scan=scan;
