# Money Buddy

Money Buddy คือเว็บแอปรายรับรายจ่ายส่วนตัวแบบใช้งานจริง มี Supabase Auth/PostgreSQL/Storage, Express API และ DeepSeek AI ผู้ช่วยการเงินภาษาไทย

## โครงสร้างโปรเจกต์

- `frontend`: React + TypeScript + Vite deploy บน Vercel
- `backend`: Express API deploy บน Render, Railway หรือ Vercel serverless
- `supabase`: SQL migration สำหรับตาราง, RLS, trigger สมัครสมาชิก, default categories และ storage policies

## เริ่มใช้งานบนเครื่อง

1. ติดตั้ง dependencies:

```bash
npm install
```

2. สร้าง Supabase project แล้วรัน:

```bash
supabase/migrations/001_initial_schema.sql
```

ถ้าไม่ได้ใช้ Supabase CLI ให้เปิด Supabase SQL Editor แล้ววาง SQL ทั้งไฟล์ลงไปรัน

3. Copy env files:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

4. ใส่ค่า env:

Frontend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:4000
```

Backend:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DEEPSEEK_API_KEY=
DEEPSEEK_API_URL=https://api.deepseek.com
FRONTEND_URL=http://localhost:5173
PORT=4000
```

5. รันในเครื่อง:

```bash
npm run dev:backend
npm run dev:frontend
```

## ตั้งค่า Supabase

1. เปิด Supabase SQL Editor
2. รัน `supabase/migrations/001_initial_schema.sql`
3. ตรวจว่ามีตาราง `profiles`, `transactions`, `categories`, `budgets`, `recurring_transactions`, `receipts`, `ai_chat_history`, `user_settings`
4. ตรวจว่า RLS เปิดอยู่ทุก user table
5. ตรวจว่ามี private bucket ชื่อ `receipts`
6. ไปที่ Authentication > URL Configuration แล้วเพิ่ม:

```text
http://localhost:5173
https://YOUR_FRONTEND_DOMAIN.vercel.app
```

Money Buddy ใช้ email/password authentication เท่านั้น

## ตั้งค่า DeepSeek

1. สร้าง DeepSeek API key
2. ใส่ key เฉพาะใน `backend/.env` หรือ environment variables ของ backend hosting
3. ห้ามใส่ DeepSeek key ใน frontend
4. Frontend เรียก `POST /api/ai/chat` พร้อม Supabase access token
5. Backend ตรวจ token, ดึงสรุปข้อมูลการเงินจริง, เรียก DeepSeek แล้วบันทึกประวัติลง `ai_chat_history`
6. AI endpoint มี rate limit 12 ครั้งต่อผู้ใช้ต่อ 10 นาที

## Deploy

อ่านคู่มือภาษาไทยแบบละเอียดได้ที่ `DEPLOYMENT_TH.md`

### Frontend to Vercel

### Frontend to Vercel

1. Import the repository into Vercel.
2. Set project root to `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=https://YOUR_BACKEND_DOMAIN
```

6. Deploy and add the Vercel domain to Supabase Auth redirect URLs.

### Backend to Render or Railway

1. Create a Node service with root `backend`.
2. Build command: `npm install && npm run build`.
3. Start command: `npm start`.
4. Add environment variables from `backend/.env.example`.
5. Set `FRONTEND_URL` to the deployed frontend URL.
6. Confirm `GET /health` returns `{ "ok": true }`.

### Backend to Vercel Serverless

1. Create a separate Vercel project with root `backend`.
2. Keep `backend/vercel.json`.
3. Add backend environment variables.
4. Deploy and use the deployment URL as `VITE_API_URL`.

## รายการประจำใน production

Backend มี endpoint:

```text
POST /api/recurring/run-due
```

สำหรับผู้ใช้ทั่วไป frontend จะเรียก endpoint นี้ด้วย session token ของผู้ใช้ ถ้าต้องการรันอัตโนมัติใน production ให้ตั้ง scheduled job รายวันบน Render/Railway/Vercel Cron หรือ Supabase Edge Function โดยใช้ logic ใน `backend/src/services/recurring.ts`

แนะนำให้รันวันละครั้งช่วงตีหนึ่งตาม timezone ที่ใช้งาน

## Checklist ก่อนใช้งานจริง

- สมัครและ login ด้วย email/password ได้
- refresh หน้าแล้ว session ยังอยู่
- เพิ่มรายรับ/รายจ่ายแล้วข้อมูลอยู่ใน Supabase
- logout แล้ว login ใหม่ ข้อมูลยังอยู่
- user คนอื่นมองไม่เห็นข้อมูลของเรา
- อัปโหลดใบเสร็จได้
- Dashboard/Reports ใช้ข้อมูลจริง
- AI Money Buddy ตอบจากข้อมูลจริงและบันทึก chat history
- mobile navigation เข้าถึงทุกหน้าได้

## หมายเหตุด้านความปลอดภัย

- Frontend ใช้เฉพาะ Supabase anon/publishable key
- Backend ตรวจตัวตนจาก Supabase access token
- Service role key และ DeepSeek key อยู่เฉพาะ backend env
- เปิด RLS ทุกตารางของผู้ใช้
- Receipt storage แยกไฟล์ตาม user id folder
