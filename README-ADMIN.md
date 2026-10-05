# SUT Asset RFID - Admin User Management

ไฟล์สำหรับ GitHub Pages แบบ Static

## ฟังก์ชัน
- Dashboard
- เพิ่มผู้ใช้งาน
- แก้ไขผู้ใช้งาน
- ลบผู้ใช้งาน
- นำเข้าผู้ใช้งาน CSV
- ค้นหาผู้ใช้งาน
- แสดงจำนวน Admin / ผู้ใช้งาน / สถานะ
- Responsive สำหรับมือถือ

## Demo Login
Username: admin
Password: 1234

## CSV
หัวตาราง:
name,username,role,department,status

ตัวอย่าง:
ดิเรกฤทธิ์ แสงโชติ,direkrit,ผู้ใช้งาน,ศูนย์เครื่องมือ มทส.,active

## สำคัญ
GitHub Pages เป็น Static Hosting ดังนั้นระบบ Login และข้อมูลผู้ใช้ในชุดนี้เป็นเพียงต้นแบบ โดยเก็บข้อมูลใน LocalStorage ของเบราว์เซอร์ ไม่ควรใช้เป็นระบบยืนยันตัวตนจริงสำหรับข้อมูลสำคัญ

สำหรับระบบจริงหลายเครื่อง ควรเปลี่ยน Backend เป็น Supabase/Firebase และทำ Authentication/Database จริง
