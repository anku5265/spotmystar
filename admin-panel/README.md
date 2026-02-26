# SpotMyStar Admin Panel

Separate admin panel for managing SpotMyStar platform.

## Features

- ✅ Admin Login (separate from main site)
- ✅ Dashboard with Statistics
- ✅ Artist Management (Approve/Reject)
- ✅ Bookings Management
- ✅ Users List
- ✅ Toast Notifications
- ✅ Responsive Design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
VITE_API_URL=https://spotmystar-backend.vercel.app
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Deployment on Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set Root Directory to `admin-panel`
4. Add environment variable: `VITE_API_URL`
5. Deploy!

## Default Credentials

- Email: admin@spotmystar.com
- Password: admin123

## Tech Stack

- React 18
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide Icons
