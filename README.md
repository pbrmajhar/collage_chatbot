# 愛和システムエンジニア専門学校 AIチャットボット

Next.js 15 App Router、TypeScript、Tailwind CSS、最新の `@google/genai` パッケージを使った、日本語・英語対応の学校情報AIチャットボットです。

チャット画面では回答言語を `日本語` と `English` から選択できます。選択した言語は Gemini API へのリクエストにも送信され、AIの回答言語も切り替わります。

## インストール

```bash
npm install
```

ローカルの npm キャッシュで権限エラーが出る場合は、プロジェクト内のキャッシュを使ってください。

```bash
npm install --cache ./.npm-cache
```

## Gemini APIキー

1. [Google AI Studio](https://aistudio.google.com) にアクセスします。
2. Google アカウントでログインします。
3. APIキーの画面を開き、新しい Gemini APIキーを作成します。
4. `.env.local` にAPIキーを設定します。

```bash
GEMINI_API_KEY=your_api_key_here
```

PostgreSQL を使う場合は、`.env.local` に `DATABASE_URL` も追加してください。

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public&sslmode=verify-full
```

Prisma CLI は通常 `.env.local` を自動読み込みしないため、マイグレーション時は同じ `DATABASE_URL` を `.env` にも入れるか、コマンド実行時に環境変数として渡してください。

## ローカル実行

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

## 管理者ログイン

管理画面は `/admin` です。Auth.js でログイン保護されています。

`.env.local` に次の値を追加してください。

```bash
AUTH_SECRET=generate_a_long_random_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_password
```

`AUTH_SECRET` は次のように作成できます。

```bash
openssl rand -base64 32
```

`AUTH_SECRET` を変更したあとに `no matching decryption secret` が表示された場合は、開発サーバーを再起動して、ブラウザの `localhost` / `127.0.0.1` の Auth.js Cookie を削除してから再ログインしてください。

## 予約機能におすすめのデータベース

予約と空き枠管理には PostgreSQL がおすすめです。

理由:
- 空き枠、予約、学生情報、ステータスをリレーショナルに管理しやすい
- 同じ時間帯の二重予約を防ぐ制約を作れる
- 将来、管理画面・チャットボット・分析画面から同じデータを安全に使える

おすすめ構成:
- Database: PostgreSQL
- Hosting: Neon、Supabase、または Vercel Postgres
- ORM: Prisma または Drizzle
- Current ORM: Prisma

基本テーブル:

```text
admins
- id
- email
- password_hash
- role

available_slots
- id
- starts_at
- ends_at
- topic
- status
- created_by

bookings
- id
- slot_id
- student_name
- student_email
- student_phone
- language
- status
- created_at
```

Prisma セットアップ:

```bash
npm run prisma:generate
npm run prisma:migrate
```

既存の `data/college-info.txt` をデータベースに取り込む場合:

```bash
npm run prisma:seed-college-info
```

このプロジェクトは Prisma 7 の `prisma.config.ts` 方式を使います。`DATABASE_URL` は `prisma/schema.prisma` ではなく、`prisma.config.ts` で読み込みます。

Prisma Studio:

```bash
npm run prisma:studio
```

## ビルド

```bash
npm run build
npm run start
```

## ファイル構成

```text
app/
  api/
    chat/
      route.ts        # Gemini を呼び出す POST API ルート
  globals.css         # Tailwind の基本スタイルとテーマ
  layout.tsx          # ルートレイアウトとメタデータ
  page.tsx            # メインのチャットボット画面

components/
  ChatInput.tsx       # メッセージ入力と Enter 送信
  ChatMessage.tsx     # ユーザーとAIのチャット吹き出し
  ChatWindow.tsx      # 履歴、読み込み状態、自動スクロール、API呼び出し
  AdminSlotManager.tsx # 予約枠を作成する管理UI
  LoginForm.tsx       # Auth.js ログインフォーム
  SignOutButton.tsx   # ログアウトボタン

data/
  college-info.txt    # 日本語・英語の学校情報データ

prisma/
  schema.prisma       # PostgreSQL / Prisma の予約データモデル
prisma.config.ts      # Prisma 7 の DATABASE_URL 設定

.env.local            # ローカル用 Gemini APIキー
.env.local.example    # 環境変数のサンプル
```

## 学校情報データ

学校情報は `data/college-info.txt` に保存されています。

- `[ja]` セクション: 日本語回答用の学校情報
- `[en]` セクション: 英語回答用の学校情報

内容を実際の学校情報に変更すると、チャットボットの回答にも反映されます。

管理画面 `/admin/college-info` から、日本語・英語を分けて学校情報を追加、編集、削除できます。データベースに有効な情報がある場合、チャットボットは `data/college-info.txt` ではなくデータベースの内容を優先します。

## チャットボットと予約枠

チャットAPIは PostgreSQL の `available_slots` から、未来の `OPEN` 予約枠を最大5件読み込み、Gemini に渡します。ユーザーが予約について質問すると、ボットはその空き枠をもとに候補を提案できます。

管理画面 `/admin/time-slots` では、予約枠を `Date`、`From`、`To`、`Topic` で作成できます。作成した `OPEN` の時間枠だけがチャットボットの候補として使われます。

管理画面 `/admin/settings` では、管理パネル全体のタイトルとサブタイトルを変更できます。

チャット画面には予約モーダルも表示されます。学生は管理画面で作成された空き時間を選び、名前・メール・電話番号を入力して予約できます。予約が完了しても対象スロットは他の学生にも表示されます。

予約完了後、予約モーダルは自動で閉じます。同じ時間枠に複数人が予約できます。ただし、電話番号は予約ごとに一意である必要があります。

## APIルート

`app/api/chat/route.ts` は次の `POST` リクエストを受け取ります。

```json
{
  "message": "入学方法について教えてください",
  "language": "ja"
}
```

レスポンス例:

```json
{
  "reply": "AIの回答テキスト"
}
```
