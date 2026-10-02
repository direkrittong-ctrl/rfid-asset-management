# SUT RFID Asset Management MVP

ระบบต้นแบบตรวจนับครุภัณฑ์ด้วย RFID UHF สำหรับใช้งานบนมือถือ/เว็บ

## ไฟล์
- index.html — โครงหน้าเว็บ
- style.css — หน้าตาและ responsive/mobile UI
- app.js — ระบบ login, dashboard, รายการครุภัณฑ์, scan จำลอง, import/export Excel, localStorage
- manifest.json — PWA

## ใช้งาน
เปิด `index.html` หรือ Deploy ด้วย GitHub Pages

> ตอนนี้ส่วน RFID/ESP32 เป็น "โหมดจำลอง" ก่อน เพื่อทดสอบ Workflow บนมือถือจริง
> ขั้นถัดไปสามารถเชื่อม Bluetooth BLE/SPP กับ ESP32 + UHF reader ได้
