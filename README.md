# Classroom Attendance Dashboard

A real-time dashboard for the RFID tap in/tap out attendance system.

## Pages
- **Live Status** — who's in the classroom right now, updates instantly
- **Attendance** — pick any date, see present/absent/not-yet-arrived for every
  student, filter to absentees only, click a student for their full absence
  history + total count (with tally marks)
- **Students** — add/edit/remove students, register their RFID card by tapping
  it on a reader plugged into whatever computer you're using, link a parent
  contact
- **Settings** — set the daily cutoff time used by the (separate) n8n
  "mark absent" workflow

## 1. Create your Firebase project
1. Go to https://console.firebase.google.com -> Add project
2. Once created, go to Build -> Firestore Database -> Create database
   (start in test mode for now -- we'll lock it down later)
3. Go to Project settings -> General -> Your apps -> Add app -> Web (</>)
4. Copy the firebaseConfig object it gives you

## 2. Connect this project to your Firebase project
```bash
cp .env.example .env
```
Open `.env` and paste in the matching values from your firebaseConfig object
(no quotes, just `VITE_FIREBASE_API_KEY=AIza...` etc). `.env` is git-ignored,
so your keys never get committed.

## 3. Run it locally
```bash
npm install
npm run dev
```
This opens the dashboard at http://localhost:5173. It'll show empty states
until you add students -- Firestore updates appear instantly, no refresh
needed.

## 4. Push to GitHub
```bash
git init
git add .
git commit -m "Initial attendance dashboard"
```
Create a new empty repo on https://github.com/new (don't add a README there),
then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## 5. Deploy on Vercel
1. Go to https://vercel.com -> Add New -> Project
2. Import the GitHub repo you just pushed
3. Vercel auto-detects Vite -- leave build settings as default
4. Before clicking Deploy, open **Environment Variables** and add the same
   six `VITE_FIREBASE_*` keys/values from your `.env` file
5. Click Deploy -- you'll get a permanent URL like
   `your-project.vercel.app`

`vercel.json` is already included so page refreshes on routes like
`/attendance` or `/students` work correctly instead of 404ing.

Any time you push a new commit to `main`, Vercel redeploys automatically.

## Data model (for reference when building the n8n workflows next)

students/{id}
```
name: string
section: string
rfidUid: string | null
currentStatus: "IN" | "OUT"
lastTapTime: Timestamp | null
parentChannel: "telegram" | "messenger" | null
parentChatId: string | null
```

attendance/{autoId} -- one doc per student per day
```
date: "YYYY-MM-DD"
studentId: string
status: "present" | "absent"
timeIn: Timestamp | null
timeOut: Timestamp | null
```

This dashboard only reads `students` live and reads `attendance` for
a chosen date, plus lets you add/edit/delete students directly. Writing
attendance records and flipping `currentStatus` on every tap is the n8n
workflow's job -- that's next.

## Before going live
`firestore.rules` is currently wide open for easy local development. Before
this holds real student data, add Firebase Authentication for teacher/admin
login and restrict these rules accordingly.
