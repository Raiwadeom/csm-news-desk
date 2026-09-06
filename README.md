# News Desk — Chhatrapati Shivajiraje Mahavidyalaya, Udgir

A Pinterest-style archive of the college's newspaper cuttings. Administrators
sign in, upload clippings, sort them into collections (Shivjayanti, Sports,
Events…) and download any cutting to a phone or computer in one tap.

---

## Running it

```bash
npm install
npm run dev
```

Open **http://localhost:3000** (the terminal prints the exact port if 3000 is
busy). To open it on your phone, use the **Network** URL the terminal prints —
the phone must be on the same Wi-Fi.

### Demo mode

With no keys configured the app runs entirely in the browser (IndexedDB), so
every screen is usable immediately.

| | |
|---|---|
| Email | `admin@csmudgir.edu.in` |
| Password | `admin123` |

"Load sample cuttings" on the empty feed fills the archive with placeholder
clippings and five collections. "Reset demo data" on the profile page clears
everything again. Demo data lives in one browser only — it is not shared
between devices.

---

## Going live

Copy `.env.example` to `.env.local`, fill it in, and restart `npm run dev`.
The app switches backends automatically — no code changes.

### 1. Firebase (sign-in + database)

1. Create a project at <https://console.firebase.google.com>.
2. **Build → Authentication → Sign-in method → Email/Password → Enable.**
3. **Authentication → Users → Add user.** Create one account per administrator.
   There is deliberately no sign-up screen: accounts are made here by hand.
4. **Build → Firestore Database → Create database** (production mode).
5. **Project settings → Your apps → Web app** and copy the config values into
   `.env.local`:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   ```

6. Paste the contents of `firestore.rules` into **Firestore → Rules → Publish**.
   Without this step the database is open to the internet.

### 2. Cloudinary (image storage)

1. Sign up at <https://cloudinary.com> and open the Dashboard.
2. Copy the three values into `.env.local`:

   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

`CLOUDINARY_API_SECRET` has no `NEXT_PUBLIC_` prefix on purpose — it stays on
the server. Uploads are signed by `/api/cloudinary/sign` and then sent from the
browser straight to Cloudinary, so large scans never pass through the
serverless function.

**Free-tier capacity:** 25 monthly credits, where one credit is 1 GB of storage
*or* 1 GB of delivery *or* 1,000 transformations. In practice that is roughly
10–15 GB of stored cuttings — around 20,000–30,000 scans at 500 KB each.

### 3. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. <https://vercel.com/new> → import the repository (Next.js is detected).
3. **Settings → Environment Variables**: add all nine keys from `.env.local`.
4. Deploy. Add the Vercel domain under **Firebase → Authentication → Settings →
   Authorised domains**, otherwise sign-in is blocked on the live site.

---

## How it is put together

```
src/
  app/
    login/                  admin sign-in + password reset
    (app)/                  everything behind the sign-in wall
      feed/                 the masonry feed, with collection filters
      collections/          boards grid, and one page per board
      profile/              name, designation, photo, account
    api/cloudinary/         sign uploads · delete images
  components/               grid, pin card, lightbox, modals, shell
  lib/
    config.js               decides demo mode vs live mode
    store.js                one data API over Firestore *or* IndexedDB
    auth.js                 session, profile, password reset
    upload.js               signed browser → Cloudinary upload
    images.js               thumbnails, downloads, compression
    newsprint.js            draws the placeholder clippings
```

### Data model (Firestore)

| Collection | Fields |
|---|---|
| `posts/{id}` | `title`, `note`, `source`, `imageUrl`, `publicId`, `width`, `height`, `boardIds[]`, `ownerUid`, `createdAt` |
| `boards/{id}` | `name`, `description`, `ownerUid`, `createdAt` |
| `admins/{uid}` | `name`, `role`, `email`, `photoUrl`, `photoPublicId` |

A cutting is tagged with `boardIds`, it is not moved into a board. That is why
a pin uploaded straight into a collection still appears in the main feed, and
why deleting a collection never deletes the cuttings inside it.

---

## Notes

* **Downloads** use Cloudinary's `fl_attachment`, which is the most reliable
  way to save a file on iOS and Android; other images fall back to a blob
  download.
* **Adding another administrator:** Firebase console → Authentication → Add
  user. They set their own name, designation and photo on first sign-in.
* **Forgotten password:** the login screen emails a reset link (needs Firebase;
  in demo mode the password is fixed).
