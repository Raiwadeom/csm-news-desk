# News Desk — Chhatrapati Shivajiraje Mahavidyalaya, Udgir

A Pinterest-style archive of the college's newspaper cuttings.

- **Anyone** who visits the site can browse the full archive, open a cutting
  full-screen and download it — no sign-in needed.
- **Administrators** sign in separately to upload clippings, sort them into
  collections (Shivjayanti, Sports, Events…), set the publication date on a
  cutting, and delete anything that shouldn't be there.

Live: <https://csm-news-desk.vercel.app>

---

## Running it

```bash
npm install
npm run dev
```

Open **http://localhost:3001** (the terminal prints the exact port if it's
busy — see `package.json`). To open it on your phone, use the **Network**
URL the terminal prints — the phone must be on the same Wi-Fi.

The app needs Firebase and Cloudinary keys to run at all (see **Going live**
below) — copy `.env.example` to `.env.local` and fill it in first.

---

## Going live

Copy `.env.example` to `.env.local`, fill it in, and restart `npm run dev`.

### 1. Firebase (public read + admin sign-in + database)

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
   Without this step the database is closed to everyone, including the
   public feed.

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
   Authorised domains**, otherwise admin sign-in is blocked on the live site
   (the public feed works either way — it needs no auth).

---

## How it is put together

```
src/
  app/
    page.js                  the PUBLIC feed - no sign-in required
    login/                   admin sign-in + password reset
    (app)/                   everything behind the sign-in wall
      feed/                  the admin masonry feed, with collection + date filters
      collections/           boards grid, and one page per board
      profile/               name, designation, photo, account
    api/cloudinary/          sign uploads · delete images
  components/
    PublicHeader.js           header for the public feed (search + admin link)
    AppShell.js                header + nav for the admin area
    PinCard.js / Lightbox.js   shared by both; a `readOnly` prop hides
                                Save/Delete so the same UI serves the public
    MasonryGrid.js / PinBrowser.js   grid + full-screen view, also `readOnly`-aware
  lib/
    config.js                required Firebase/Cloudinary keys, demo-mode has been retired
    store.js                 the data API over Firestore
    auth.js                  session, profile, password reset
    upload.js                signed browser → Cloudinary upload
    images.js                thumbnails, downloads, compression
    dates.js                 formatting/parsing for a cutting's publication date
```

### Data model (Firestore)

| Collection | Fields |
|---|---|
| `posts/{id}` | `title`, `note`, `source`, `newsDate`, `imageUrl`, `publicId`, `width`, `height`, `boardIds[]`, `ownerUid`, `ownerName`, `createdAt` |
| `boards/{id}` | `name`, `description`, `ownerUid`, `createdAt` |
| `admins/{uid}` | `name`, `role`, `email`, `photoUrl`, `photoPublicId` |

- `newsDate` is the date the story ran in the paper (`"YYYY-MM-DD"`, set by
  the admin at upload time and editable afterwards from the full-screen
  view) — different from `createdAt`, which is when it was uploaded.
- A cutting is tagged with `boardIds`, it is not moved into a board. That is
  why a pin uploaded straight into a collection still appears in the main
  feed, and why deleting a collection never deletes the cuttings inside it.
- `posts` is publicly readable (see `firestore.rules`); `boards` and
  `admins` are readable only by signed-in administrators. All writes to
  every collection require sign-in.

---

## Notes

* **Downloads** use Cloudinary's `fl_attachment`, which is the most reliable
  way to save a file on iOS and Android; other images fall back to a blob
  download.
* **Adding another administrator:** Firebase console → Authentication → Add
  user. They set their own name, designation and photo on first sign-in.
* **Forgotten password:** the login screen emails a reset link.
