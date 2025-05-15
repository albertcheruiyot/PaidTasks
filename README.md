# 💸 PaidTasks – Earn by Doing Simple Tasks!

**PaidTasks** is a **Progressive Web Application (PWA)** that enables users to earn real money by completing simple online tasks like watching videos, filling out surveys, and referring friends. Designed with usability, scalability, and security in mind, PaidTasks offers a smooth experience across devices with built-in payment integration and gamified features.

---

## 🚀 Project Overview

PaidTasks provides a seamless way for users to monetize their time while delivering value to advertisers and partners. With an intuitive interface and secure infrastructure, it’s built to engage, retain, and reward users through simple task-based workflows.

---

## 🛠️ Technologies Used

### Core Stack
- **React** – UI library
- **Firebase** – Backend-as-a-Service
  - Authentication
  - Firestore (NoSQL DB)
  - Cloud Functions
  - Hosting
- **Progressive Web App (PWA)** – Offline support, installable
- **React Router** – SPA navigation
- **Styled Components** – Scoped styling
- **Framer Motion** – Smooth animations

### Additional Libraries & Tools
- Redux / Context API – State management
- Firebase Storage – Media asset storage
- Workbox – PWA service worker support
- Axios – HTTP client
- React Testing Library – Unit and integration testing
- ESLint & Prettier – Code quality
- GitHub Actions – CI/CD pipeline

---

## 🧾 Project Structure

```
paidtasks/
├── public/          # PWA setup files
├── src/
│   ├── assets/      # Images, icons
│   ├── components/  # Reusable UI components
│   ├── config/      # Firebase configs
│   ├── context/     # Global app contexts
│   ├── hooks/       # Custom React hooks
│   ├── pages/       # Route-level pages
│   ├── services/    # Auth, tasks, payments
│   ├── styles/      # Global styling and theming
│   ├── utils/       # Formatters and validators
│   ├── App.js
│   └── index.js
├── .env             # Environment variables
├── firebase.json    # Firebase configuration
└── README.md        # This file!
```

---

## 🔄 Application Flow

### 👥 User Journey

**New Users:**
1. Visit landing page
2. Sign up (Email+full-name/Google)
3. Data initialized in firestore(most with default values)
4. Access dashboard
5. Start earning by completing tasks

**Returning Users:**
1. Log in
2. See personalized dashboard
3. Complete new tasks
4. Withdraw earnings via preferred method

---

### 🔐 Authentication Flow

```
[User] → [Auth Page] → [Firebase Auth] → [Dashboard]
```
- Firebase handles secure login, signup, and session management.

---

### 🎥📝 Tasks Flow

**Video Tasks:**
- Watch videos → Verified by system → Earn reward

**Survey Tasks:**
- Complete surveys → Submit answers → Get rewarded

**Referral Program:**
- Share referral link → Friend joins → Referrer is rewarded 200  

---

### 💵 Payment Flow

1. Visit Wallet page
2. See available
3. Request withdrawal by submittig Mpesa details(Amount, Mpesa Number and Name in Mpesa)
4. Verified and the request is submitted to withdrawals sub collection so that we query withdrawals separately.
5. User gets confirmation + withdrawals history update

---

## 🗃️ Database Schema

### 👤 Users Collection
Stores user data, earnings, referrals, etc.(Rememeber to separate history data from the rest so that reads are not to large so as to reduce firebase costs)

### 🎬 tasks/
- `/videos/{videoId}`: Video metadata + reward

---

## 📅 Development Phases

### Phase 1: Setup & Authentication ✅
- Project scaffold, Firebase integration
- Auth workflows + basic UI components

### Phase 2: Task Systems
- Video & survey task engines
- Task tracking, reward logic

### Phase 3: Wallet & Referrals
- Payment gateway integration
- Referral tracking & commissions

### Phase 4: UI/UX Polish
- Responsive design
- Animations, loading states, gamification

### Phase 5: PWA & Testing
- Service worker, offline mode
- Unit & user testing

### Phase 6: Deployment & Monitoring
- Firebase hosting
- CI/CD via GitHub Actions
- Monitoring, error logging, admin dashboard

---

## 🔐 Security Considerations

- **Auth**: Secure login, token handling, email verification
- **Data**: Firestore rules, validation, backups
- **Payments**: SSL, fraud detection, third-party integrations

---

## 💰 Monetization Strategy

- **Ad Revenue**: From video views and survey fills
- **Premium Features**: Paid add-ons or boosts
- **Affiliate Programs**: Sponsored campaigns and B2B deals

---

## 🌍 Scalability & Maintenance

- Firebase auto-scaling
- Internationalization-ready
- Multi-task type support
- Daily backups, monitoring, quarterly audits

---

## 🔮 Future Enhancements

- 📲 Native mobile apps (iOS/Android)
- 🎮 Gamification upgrades (badges, levels)
- 🧠 ML-based task recommendations
- 📊 Advanced analytics dashboard
- 🔌 Public API + Employer dashboard

---

## ✅ Conclusion

**PaidTasks** combines ease-of-use, robust tech, and engaging UX to create a powerful micro-earning platform. With a strong foundation, clear roadmap, and monetization plan, it’s built to scale and succeed. 💼🌍

---

🧑‍💻 *Made with ❤️ by [Your Team Name or GitHub Handle]*

```