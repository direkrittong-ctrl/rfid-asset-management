SUT Asset RFID Dashboard v3

อัปโหลดไฟล์ต่อไปนี้ทับไฟล์เดิมใน root ของ repository:
index.html
style.css
app.js
sut-logo.jpg

บัญชีเริ่มต้น: admin / admin123

รองรับ: Dashboard ภาษาไทย, ครุภัณฑ์, CSV import/export, Admin/user, password, Maintenance, repair/usage และหน้าเตรียมต่อ ESP32.

ข้อจำกัด: GitHub Pages เป็น static hosting ข้อมูลเวอร์ชันนี้เก็บ localStorage ของเบราว์เซอร์ จึงยังไม่ใช่ฐานข้อมูลกลางและไม่ควรใช้รหัสผ่านแบบนี้ใน production. หากต้องการหลายเครื่องใช้ข้อมูลร่วมกัน/ESP32 ส่ง EPC จริง ควรต่อ backend/database เช่น Supabase, Firebase หรือ Cloudflare Worker.
