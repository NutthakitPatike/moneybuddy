# คู่มือ Deploy Money Buddy

เอกสารนี้ใช้สำหรับ deploy โปรเจกต์จาก GitHub ไปใช้งานจริง

## 1. เตรียม Supabase

1. เข้า Supabase Dashboard
2. เปิด SQL Editor
3. รันไฟล์ `supabase/migrations/001_initial_schema.sql`
4. ไปที่ Authentication > URL Configuration
5. ตั้งค่า:

```text
Site URL: https://YOUR_FRONTEND_DOMAIN.vercel.app
Redirect URLs:
https://YOUR_FRONTEND_DOMAIN.vercel.app/**
http://localhost:5173/**
```

6. ตรวจว่ามี Storage bucket ชื่อ `receipts`
7. ตรวจว่า RLS เปิดอยู่ทุกตารางใน schema public

## 2. Rotate Keys ก่อนใช้งานจริง

ก่อน deploy production ให้สร้าง key ใหม่ เพราะ key เคยถูกใช้ในเครื่อง local แล้ว:

- Supabase service role key
- Supabase secret key ถ้าใช้
- DeepSeek API key

อย่าใส่ `SUPABASE_SERVICE_ROLE_KEY` หรือ `DEEPSEEK_API_KEY` ใน frontend เด็ดขาด

## 3. Deploy Backend

แนะนำ Render หรือ Railway สำหรับเริ่มต้น

### Render

1. New Web Service
2. เลือก GitHub repo `moneybuddy`
3. Root directory: `backend`
4. Build command:

```bash
npm install && npm run build
```

5. Start command:

```bash
npm start
```

6. Environment variables:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DEEPSEEK_API_KEY=
DEEPSEEK_API_URL=https://api.deepseek.com
JWT_SECRET=
FRONTEND_URL=https://YOUR_FRONTEND_DOMAIN.vercel.app
PORT=4000
```

7. เปิด `https://YOUR_BACKEND_DOMAIN/health` ต้องเห็น:

```json
{ "ok": true, "name": "Money Buddy API" }
```

## 4. Deploy Frontend บน Vercel

1. Import GitHub repo ใน Vercel
2. Root directory: `frontend`
3. Build command:

```bash
npm run build
```

4. Output directory:

```text
dist
```

5. Environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=https://YOUR_BACKEND_DOMAIN
```

6. Deploy
7. เอา Vercel URL กลับไปเพิ่มใน Supabase Auth URL Configuration

## 5. Rate Limit ของ AI

Backend จำกัด `/api/ai/chat` ไว้ที่ 12 ครั้งต่อผู้ใช้ต่อ 10 นาที เพื่อกันค่า API บานและกัน spam

ถ้า deploy หลาย instance หรือ scale หลายเครื่อง แนะนำเปลี่ยนจาก in-memory rate limit เป็น Redis/Upstash

## 6. ทดสอบหลัง Deploy

- สมัครด้วย email/password
- login แล้ว refresh session ต้องยังอยู่
- เพิ่มรายรับ/รายจ่าย
- logout แล้ว login ใหม่ รายการต้องยังอยู่
- อัปโหลดใบเสร็จได้
- user คนอื่นต้องไม่เห็นข้อมูลของเรา
- หน้า Dashboard/Reports ต้องใช้ข้อมูลจริง
- หน้า AI Money Buddy ต้องตอบจากข้อมูลจริงของผู้ใช้
