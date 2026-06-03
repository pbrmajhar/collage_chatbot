# 愛和システムエンジニア専門学校 AIチャットボット

This is a full-stack AI chatbot web app for college information.

It uses:
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Gemini API with `@google/genai`
- Auth.js for admin login
- PostgreSQL with Prisma

The chatbot supports Japanese and English. The app display is mainly Japanese, but the chat can answer in Japanese or English.

## Install

```bash
npm install
```

If npm has a cache permission problem, use this command:

```bash
npm install --cache ./.npm-cache
```

## Environment Variables

Create `.env.local` and add these values:

```bash
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_postgres_database_url
AUTH_SECRET=your_long_random_secret
```

You can create `AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

For Prisma commands, also add the same `DATABASE_URL` to `.env`, or pass it when running the command.

This project uses Prisma 7. The database URL is loaded from `prisma.config.ts`, not from `prisma/schema.prisma`.

## Gemini API Key

1. Open [Google AI Studio](https://aistudio.google.com).
2. Login with your Google account.
3. Go to the API key page.
4. Create a new Gemini API key.
5. Put the key in `.env.local` as `GEMINI_API_KEY`.

You can also save the Gemini key in the admin settings page. The app will use `.env.local` first. If there is no `GEMINI_API_KEY` in `.env.local`, it will use the saved key from the database.

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Setup

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

For deployment database migrations:

```bash
npx prisma migrate deploy
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

## Admin Login

The admin page is:

```text
/admin
```

Admin login uses users from the database. Environment variables like `ADMIN_EMAIL` and `ADMIN_PASSWORD` are not used.

You can manage admin users here:

```text
/admin/users
```

Admin users have:
- name
- email
- password
- active or inactive status

Passwords are not saved as plain text. They are saved as secure PBKDF2 hashes.

If you change `AUTH_SECRET` and see `no matching decryption secret`, restart the dev server and clear the Auth.js cookies for `localhost` or `127.0.0.1`.

## Admin Pages

```text
/admin
```

Main admin dashboard.

```text
/admin/college-info
```

Add, edit, and delete college information for Japanese and English.

```text
/admin/time-slots
```

Create and manage available booking slots.

```text
/admin/bookings
```

View, edit, mark read or unread, comment, and delete bookings.

```text
/admin/settings
```

Change admin title, subtitle, chat colors, widget icon, booking keywords, API key, and database reference values.

```text
/admin/users
```

Create, edit, activate, deactivate, and delete admin users.

## College Information Data

The fallback file is:

```text
data/college-info.txt
```

It has two sections:
- `[ja]` for Japanese
- `[en]` for English

If the database has active college information, the chatbot uses the database first. If not, it uses `data/college-info.txt`.

You can seed the text file into the database:

```bash
npm run prisma:seed-college-info
```

## Chat And Booking

The chatbot can suggest open booking slots.

The bot reads future `OPEN` slots from PostgreSQL and sends them to Gemini. The bot can suggest available times, but the booking modal opens only when the student asks to book or uses your booking keywords.

Booking keywords can be changed in:

```text
/admin/settings
```

After the student confirms, the booking modal opens. The student enters name, email, and phone number.

One time slot can have many bookings. Phone numbers must be unique.

## Embed Chat On Another Website

Use this iframe if you want to show only the chat:

```html
<iframe
  src="https://your-domain.com/embed/chat?lang=ja"
  width="100%"
  height="650"
  style="border:0;border-radius:16px;"
></iframe>
```

Use this script if you want a bottom-right chat bubble:

```html
<script
  src="https://your-domain.com/embed/widget?v=2"
  data-lang="ja"
  async
></script>
```

Use English chat:

```html
<script
  src="https://your-domain.com/embed/widget?v=2"
  data-lang="en"
  async
></script>
```

Use a custom bubble icon:

```html
<script
  src="https://your-domain.com/embed/widget?v=2"
  data-lang="ja"
  data-icon-url="https://example.com/chat-icon.png"
  async
></script>
```

You can also set the default widget icon in `/admin/settings`.

## API Route

The chat API route is:

```text
app/api/chat/route.ts
```

It accepts `POST` requests:

```json
{
  "message": "入学方法について教えてください",
  "language": "ja"
}
```

Example response:

```json
{
  "reply": "AI response text"
}
```

## Main Files

```text
app/
  api/
    chat/
      route.ts
  admin/
  embed/
  globals.css
  layout.tsx
  page.tsx

components/
  ChatInput.tsx
  ChatMessage.tsx
  ChatWindow.tsx
  BookingPanel.tsx
  AdminShell.tsx
  AdminSettingsForm.tsx
  AdminUserManager.tsx
  AdminBookingManager.tsx
  AdminSlotManager.tsx
  CollegeInfoManager.tsx
  LoginForm.tsx

data/
  college-info.txt

lib/
  admin-users.ts
  admin-settings.ts
  passwords.ts
  prisma.ts

prisma/
  schema.prisma
  migrations/

prisma.config.ts
```

## Build

```bash
npm run build
npm run start
```
