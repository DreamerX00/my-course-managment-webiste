<div align="center">
  
# 🎓 Course Management Platform

### _A Modern, Free Learning Management System_

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.10.1-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

[![CI/CD Pipeline](https://github.com/DreamerX00/my-course-managment-webiste/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/DreamerX00/my-course-managment-webiste/actions)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

[Live Demo](https://your-demo-url.vercel.app) • [Documentation](./documents) • [Report Bug](https://github.com/DreamerX00/my-course-managment-webiste/issues) • [Request Feature](https://github.com/DreamerX00/my-course-managment-webiste/issues)

</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🎯 Philosophy](#-philosophy)
- [🚀 Quick Start](#-quick-start)
- [🏗️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [🚢 Deployment](#-deployment)
- [📊 API Reference](#-api-reference)
- [🎨 Screenshots](#-screenshots)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      
### 🎓 **Learning Experience**
- 🔓 **Free Auto-Enrollment** - One-click course access
- 📊 **Real-time Progress Tracking** - Visual completion indicators
- 🎯 **Interactive Quizzes** - Instant feedback with detailed results
- 🏆 **Leaderboard System** - Competitive learning environment
- 📱 **Fully Responsive** - Seamless mobile experience

    </td>
    <td width="50%">


### 🛠️ **Technical Excellence**

- ⚡ **Blazing Fast** - Built with Next.js 15 App Router
- 🔐 **Secure Authentication** - Google OAuth with NextAuth
- 🗄️ **Robust Database** - PostgreSQL with Prisma ORM
- 🎨 **Modern UI** - Tailwind CSS + shadcn/ui components
- 🔄 **CI/CD Pipeline** - Automated testing and deployment

      </td>

    </tr>
  </table>

### 🎯 Core Capabilities

```mermaid
graph LR
    A[👤 User] --> B[🔐 OAuth Login]
    B --> C[📚 Browse Courses]
    C --> D[🎓 Enroll Free]
    D --> E[📺 Watch Videos]
    E --> F[✅ Track Progress]
    F --> G[🎯 Take Quizzes]
    G --> H[🏆 View Results]
    H --> I[📊 Check Leaderboard]

    style A fill:#4CAF50
    style D fill:#2196F3
    style G fill:#FF9800
    style I fill:#9C27B0
```

---

## 🎯 Philosophy

Inspired by successful platforms like **Code with Harry**, this project embraces the **KISS principle** (Keep It Simple, Stupid):

> **Mission:** Provide free, accessible, quality education without barriers.

### Core Values

- 🆓 **Free Forever** - No payment gateways, no subscriptions
- 🚀 **Simple & Fast** - Minimal friction, maximum learning
- 🎨 **Clean UI/UX** - Intuitive interface for all skill levels
- 🔒 **Privacy First** - Secure authentication, no data selling
- 📈 **Progress-Driven** - Clear tracking and achievements

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm** package manager
- **PostgreSQL** database ([Supabase](https://supabase.com/) recommended)
- **Google OAuth** credentials ([Setup Guide](https://console.cloud.google.com/))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/DreamerX00/my-course-managment-webiste.git
cd my-course-managment-webiste

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Set up database
npx prisma generate
npx prisma migrate deploy

# 5. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### Environment Setup

Create a `.env.local` file with these variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

📚 **Detailed Setup:** See [VERCEL_DEPLOYMENT.md](./documents/VERCEL_DEPLOYMENT.md)

---

## 🏗️ Tech Stack

<div align="center">

### Frontend

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend & Database

![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=next.js&logoColor=white)

### DevOps & Tools

![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

</div>

### Architecture Highlights

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  Next.js 15 App Router • React 19 • TailwindCSS • shadcn/ui │
└──────────────────────────┬──────────────────────────────────┘
                           │ API Routes
┌──────────────────────────┴──────────────────────────────────┐
│                    SERVER (Next.js API)                      │
│  Authentication • Business Logic • Data Validation           │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma ORM
┌──────────────────────────┴──────────────────────────────────┐
│                   DATABASE (PostgreSQL)                      │
│  Users • Courses • Progress • Quizzes • Leaderboard          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
my-course-management-website/
├── 📂 src/
│   ├── 📂 app/                      # Next.js 15 App Router
│   │   ├── 📂 api/                  # API Routes
│   │   │   ├── 📂 courses/          # Course endpoints
│   │   │   │   └── [courseId]/
│   │   │   │       ├── enroll/      # ✅ Auto-enrollment
│   │   │   │       ├── progress/    # 📊 Progress tracking
│   │   │   │       └── quiz/        # 🎯 Quiz system
│   │   ├── 📂 courses/              # Course pages
│   │   ├── 📂 dashboard/            # Admin dashboard
│   │   └── 📂 auth/                 # Authentication pages
│   ├── 📂 components/               # Reusable components
│   │   ├── 📂 ui/                   # shadcn/ui components
│   │   └── 📂 admin/                # Admin components
│   ├── 📂 lib/                      # Utilities & config
│   └── 📂 types/                    # TypeScript types
├── 📂 prisma/
│   ├── schema.prisma                # Database schema
│   └── 📂 migrations/               # Database migrations
├── 📂 public/                       # Static assets
├── 📂 documents/                    # 📚 Documentation
│   ├── VERCEL_DEPLOYMENT.md         # Deployment guide
│   ├── API_REFERENCE.md             # API documentation
│   ├── DEPLOYMENT_CHECKLIST.md      # Pre-launch checklist
│   └── QUICK_DEPLOY.md              # Quick reference
├── 📂 .github/
│   └── 📂 workflows/                # CI/CD pipelines
├── vercel.json                      # Vercel configuration
├── package.json                     # Dependencies
└── tsconfig.json                    # TypeScript config
```

---

## 🔧 Configuration

### Database Schema

Our Prisma schema includes:

- **User** - Authentication and profile
- **Course** - Course information and metadata
- **Chapter** - Course content structure
- **Quiz** - Assessment system
- **Progress** - User learning progress
- **QuizAttempt** - Quiz results and scoring
- **Leaderboard** - Competitive rankings (via QuizAttempt)

### NPM Scripts

```bash
npm run dev              # Start development server with Turbopack
npm run build            # Build for production (includes Prisma)
npm start                # Start production server
npm run lint             # Run ESLint
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Apply database migrations
npm run prisma:studio    # Open Prisma Studio (Database GUI)
```

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/DreamerX00/my-course-managment-webiste)

**One-Click Deployment:**

1. Click the button above
2. Import your GitHub repository
3. Add environment variables
4. Click **Deploy**

**Manual Deployment:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Automated CI/CD Pipeline

Our GitHub Actions workflow automatically:

✅ Runs TypeScript type checks  
✅ Executes ESLint validation  
✅ Tests production build  
✅ Validates Prisma schema  
✅ Runs security audits  
✅ Deploys to Vercel (on main branch)

**Workflow Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

📚 **Full Guide:** [GITHUB_ACTIONS_SETUP.md](./.github/GITHUB_ACTIONS_SETUP.md)

---

## 📊 API Reference

### Core Endpoints

#### 🎓 Enrollment API

```http
POST   /api/courses/[courseId]/enroll    # Enroll in course
GET    /api/courses/[courseId]/enroll    # Check enrollment status
```

#### 📊 Progress Tracking API

```http
GET    /api/courses/[courseId]/progress  # Get user progress
POST   /api/courses/[courseId]/progress  # Update progress
```

#### 🎯 Quiz API

```http
GET    /api/courses/[courseId]/quiz/[quizId]  # Get quiz questions
POST   /api/courses/[courseId]/quiz/[quizId]  # Submit quiz answers
```

### Security Features

- 🔐 **Authentication Required** - All endpoints validate user session
- 🛡️ **Enrollment Verification** - Operations require course enrollment
- 🔒 **Quiz Security** - Correct answers never exposed to frontend
- ✅ **Server-side Validation** - All data validated on server
- 🚫 **SQL Injection Protected** - Prisma ORM prevents SQL injection

📚 **Complete API Docs:** [API_REFERENCE.md](./documents/API_REFERENCE.md)

---

## 🎨 Screenshots

<div align="center">

### 🏠 Homepage

![Homepage](./public/screenshots/homepage.png)
_Modern, responsive landing page with course carousel_

### 📚 Course Detail

![Course Detail](./public/screenshots/course-detail.png)
_One-click enrollment with course overview_

### 🎓 Learning Page

![Learning Page](./public/screenshots/learning-page.png)
_Video player with real-time progress tracking_

### 🎯 Quiz Interface

![Quiz Interface](./public/screenshots/quiz-interface.png)
_Interactive quiz with instant feedback_

### 🏆 Leaderboard

![Leaderboard](./public/screenshots/leaderboard.png)
_Competitive rankings and achievements_

</div>

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs** - [Open an issue](https://github.com/DreamerX00/my-course-managment-webiste/issues)
- 💡 **Suggest Features** - [Request a feature](https://github.com/DreamerX00/my-course-managment-webiste/issues)
- 📝 **Improve Documentation** - Submit a PR
- 🎨 **Enhance UI/UX** - Design improvements welcome
- ⚡ **Optimize Performance** - Speed and efficiency PRs appreciated

### Development Workflow

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Make your changes
# 4. Commit with conventional commits
git commit -m "feat: add amazing feature"

# 5. Push to your fork
git push origin feature/amazing-feature

# 6. Open a Pull Request
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## 📊 Project Stats

<div align="center">

![GitHub repo size](https://img.shields.io/github/repo-size/DreamerX00/my-course-managment-webiste?style=flat-square)
![GitHub stars](https://img.shields.io/github/stars/DreamerX00/my-course-managment-webiste?style=flat-square)
![GitHub forks](https://img.shields.io/github/forks/DreamerX00/my-course-managment-webiste?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/DreamerX00/my-course-managment-webiste?style=flat-square)
![GitHub pull requests](https://img.shields.io/github/issues-pr/DreamerX00/my-course-managment-webiste?style=flat-square)

</div>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Free to use, modify, and distribute
Copyright (c) 2025 DreamerX00
```

---

## 🙏 Acknowledgments

Special thanks to:

- **[Code with Harry](https://www.codewithharry.com/)** - Inspiration for the platform
- **[Next.js Team](https://nextjs.org/)** - Amazing framework
- **[Vercel](https://vercel.com/)** - Hosting and deployment
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Prisma](https://www.prisma.io/)** - Excellent ORM
- **Open Source Community** - For making this possible

---

## 📞 Support

Need help? We're here for you!

- 📧 **Email:** support@yourplatform.com
- 💬 **Discord:** [Join our community](https://discord.gg/your-server)
- 📖 **Documentation:** [Full Docs](./documents)
- 🐛 **Issues:** [GitHub Issues](https://github.com/DreamerX00/my-course-managment-webiste/issues)

---

## 🗺️ Roadmap

### ✅ Phase 1 - Core Features (Completed)

- [x] User authentication (Google OAuth)
- [x] Course enrollment system
- [x] Progress tracking
- [x] Quiz system with results
- [x] Leaderboard
- [x] Admin dashboard

### 🚀 Phase 2 - Enhancements (In Progress)

- [ ] Video upload and streaming
- [ ] Certificate generation
- [ ] Discussion forums
- [ ] Course ratings and reviews
- [ ] Mobile app (React Native)

### 🎯 Phase 3 - Advanced Features (Planned)

- [ ] AI-powered recommendations
- [ ] Live classes integration
- [ ] Payment gateway (optional)
- [ ] Multi-language support
- [ ] Advanced analytics

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

Made with ❤️ by [DreamerX00](https://github.com/DreamerX00)

**[⬆ Back to Top](#-course-management-platform)**

---

_Last Updated: October 27, 2025_

</div>
