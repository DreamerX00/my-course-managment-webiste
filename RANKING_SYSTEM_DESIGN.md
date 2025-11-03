# 🏆 Dreamer Academy Ranking System Design

## Overview

A comprehensive, gamified ranking system that rewards consistent learning across all subjects with 14 progressive ranks, weekly leaderboard updates, and strict progression requirements.

---

## 🎯 Ranking Tiers (14 Ranks)

### Tier 1: Novice (0-5,000 points)

**1. Knowledge Seeker** 🌱

- Points Required: 0 - 1,000
- Color: #78909C (Gray)
- Description: "Every master was once a beginner"
- Est. Time: 1-2 weeks of active learning

**2. Curious Learner** 📚

- Points Required: 1,001 - 2,500
- Color: #90A4AE (Light Gray)
- Description: "Curiosity is the spark of discovery"
- Est. Time: 3-4 weeks

**3. Dedicated Student** ✏️

- Points Required: 2,501 - 5,000
- Color: #A1887F (Brown)
- Description: "Dedication transforms potential into achievement"
- Est. Time: 6-8 weeks

---

### Tier 2: Intermediate (5,001-25,000 points)

**4. Knowledge Enthusiast** 🎓

- Points Required: 5,001 - 10,000
- Color: #4FC3F7 (Light Blue)
- Description: "Enthusiasm fuels the journey of learning"
- Est. Time: 10-12 weeks

**5. Diligent Scholar** 📖

- Points Required: 10,001 - 15,000
- Color: #64B5F6 (Blue)
- Description: "Diligence is the mother of good fortune"
- Est. Time: 14-18 weeks

**6. Academic Achiever** 🏅

- Points Required: 15,001 - 25,000
- Color: #42A5F5 (Medium Blue)
- Description: "Achievement is the result of persistent effort"
- Est. Time: 20-25 weeks

---

### Tier 3: Advanced (25,001-75,000 points)

**7. Wisdom Seeker** 🔮

- Points Required: 25,001 - 40,000
- Color: #9C27B0 (Purple)
- Description: "Wisdom is knowledge applied with understanding"
- Est. Time: 30-35 weeks

**8. Master Student** 🎖️

- Points Required: 40,001 - 55,000
- Color: #7B1FA2 (Dark Purple)
- Description: "Mastery begins where learning never ends"
- Est. Time: 40-45 weeks

**9. Knowledge Guardian** 🛡️

- Points Required: 55,001 - 75,000
- Color: #6A1B9A (Deep Purple)
- Description: "Guardians preserve and share their wisdom"
- Est. Time: 48-52 weeks (1 year)

---

### Tier 4: Expert (75,001-200,000 points)

**10. Enlightened Mind** 💡

- Points Required: 75,001 - 100,000
- Color: #FF9800 (Orange)
- Description: "Enlightenment illuminates the path for others"
- Est. Time: 14-16 months

**11. Academic Luminary** ⭐

- Points Required: 100,001 - 150,000
- Color: #FF6F00 (Dark Orange)
- Description: "Luminaries light the way through knowledge"
- Est. Time: 18-22 months

**12. Wisdom Sage** 🧙

- Points Required: 150,001 - 200,000
- Color: #E65100 (Deep Orange)
- Description: "Sages possess deep understanding and insight"
- Est. Time: 24-30 months (2-2.5 years)

---

### Tier 5: Legendary (200,001-500,000 points)

**13. Grand Maestro** 👑

- Points Required: 200,001 - 350,000
- Color: #FFD700 (Gold)
- Description: "Maestros orchestrate knowledge with precision"
- Est. Time: 36-42 months (3-3.5 years)

**14. Omniscient Scholar** 🌟

- Points Required: 350,001 - 500,000+
- Color: #FF1744 (Crimson Red with Gold Accent)
- Description: "The pinnacle of academic excellence"
- Est. Time: 48+ months (4+ years)
- Special: Animated badge, exclusive profile border

---

## 📊 Weekly Ranking System

### Evaluation Criteria

**Every Sunday at 11:59 PM** - Automated rank evaluation

### Ranking Zones:

#### 🟢 **Promotion Zone (Top 10)**

- **Requirement**: Be in Top 10 AND meet minimum threshold
- **Threshold**: Must have earned at least 500 points in the past week
- **Action**: Promoted to next rank (if eligible)
- **Bonus**: +100 bonus points for promotion

#### 🟡 **Safe Zone (Rank 11-50)**

- **Action**: Maintain current rank
- **Requirement**: At least 200 points in past week
- **Protection**: No demotion, no promotion
- **Bonus**: +50 bonus points for consistency

#### 🔴 **Demotion Zone (Rank 51+)**

- **Requirement**: Less than 200 points in past week
- **Action**: Demoted by 1 rank (if rank > 1)
- **Grace Period**: 2 consecutive weeks of inactivity before demotion
- **Recovery**: Can regain rank by re-entering Top 50

### Special Rules:

1. **Rank 1-3** cannot be demoted below Rank 3
2. **New users** get 2-week immunity from demotion
3. **Rank 14 (Omniscient Scholar)** requires Top 3 position for 4 consecutive weeks
4. **Rank Protection**: Users can "freeze" rank for 1 week/month (premium feature)

---

## 🎯 Points Allocation System

### Course Points Assignment (Admin)

Admins can assign total points per course based on:

- **Beginner Courses**: 1,000 - 3,000 points
- **Intermediate Courses**: 3,001 - 8,000 points
- **Advanced Courses**: 8,001 - 15,000 points
- **Expert Courses**: 15,001 - 30,000 points

### Chapter Point Distribution

Points are **equally distributed** across all chapters:

```
Points per Chapter = Total Course Points ÷ Number of Chapters
```

**Example:**

- Course: "Advanced Mathematics" = 10,000 points
- Chapters: 20
- Points per Chapter: 10,000 ÷ 20 = 500 points/chapter

### Bonus Points System:

#### 📝 **Completion Bonuses**

- **First Time Completion**: +20% of chapter points
- **Perfect Score (100%)**: +15% of chapter points
- **Speed Bonus** (< 50% of avg time): +10% of chapter points
- **Streak Bonus** (7 days continuous): +5% of total points earned

#### 🔄 **Re-completion**

- Can re-take courses but earn only **30% of original points**
- Encourages breadth over repetition

#### 🌟 **Achievement Multipliers**

- **Week Streak** (7 days): 1.1x multiplier
- **Month Streak** (30 days): 1.25x multiplier
- **Quarter Streak** (90 days): 1.5x multiplier
- **Yearly Champion**: 2x multiplier (for 1 week)

---

## 📈 Score Calculation Examples

### Example 1: Regular Chapter Completion

```
Base Points: 500
First Time Bonus: 500 × 0.20 = 100
Perfect Score Bonus: 500 × 0.15 = 75
Week Streak Multiplier: (500 + 100 + 75) × 1.1 = 742.5
TOTAL: 743 points
```

### Example 2: Speed Completion with Streaks

```
Base Points: 800
First Time Bonus: 800 × 0.20 = 160
Speed Bonus: 800 × 0.10 = 80
Month Streak: (800 + 160 + 80) × 1.25 = 1,300
TOTAL: 1,300 points
```

### Example 3: Path to Top Rank

```
To reach Omniscient Scholar (500,000 points):
- Average 500 points/day
- Requires ~1,000 days (2.7 years) of consistent learning
- Alternatively: 1,000 points/day for 500 days (1.4 years)
- With bonuses and streaks: ~12-18 months possible
```

---

## 🏅 Achievement Badges

### Milestone Badges:

- 🔥 **Streak Master**: 30-day streak
- 💯 **Perfectionist**: 10 perfect scores
- ⚡ **Speed Demon**: 20 speed bonuses
- 🎯 **Course Conqueror**: Complete 10 courses
- 📚 **Library Keeper**: Complete 50 courses
- 🌍 **Universal Scholar**: Complete courses in 5+ categories
- 👑 **Weekly Champion**: Top 1 for 4 consecutive weeks
- 🏆 **Podium Regular**: Top 3 for 12 weeks total
- 🌟 **Living Legend**: Maintain Rank 14 for 3 months

---

## 🔔 Notification System

### Rank Change Notifications:

```
🎉 Congratulations! You've been promoted!
You are now a [Rank Name]!
+100 bonus points awarded
Keep up the great work!
```

```
📉 Rank Update
You've moved to [Rank Name]
Stay active to climb back up!
TIP: Complete 3 chapters this week to enter Safe Zone
```

### Weekly Leaderboard Notifications:

```
📊 Weekly Leaderboard Update
Your Position: #15 (↑5)
Points This Week: 1,250
You're in the Safe Zone! 🟡
```

---

## 🎨 UI/UX Elements

### Rank Badge Design:

- **Shape**: Hexagonal shield with rank icon
- **Animation**: Glow effect on hover
- **Colors**: Gradient based on tier
- **Border**: Animated for Legendary tier

### Profile Display:

```
┌─────────────────────────────────┐
│  🧙 Wisdom Sage                 │
│  Level 12 • 165,234 points      │
│  ████████████░░░ 82% to next    │
│  Weekly Rank: #8 (↑3)           │
│  Current Streak: 45 days 🔥     │
└─────────────────────────────────┘
```

### Leaderboard Display:

```
┌──────────────────────────────────────┐
│  🏆 Weekly Leaderboard              │
├──────────────────────────────────────┤
│  1. 👑 User A • Grand Maestro • 2.1K│
│  2. ⭐ User B • Academic Luminary   │
│  3. 💡 User C • Enlightened Mind    │
│  ...                                 │
│  50. ✏️ User Z • Dedicated Student  │
├──────────────────────────────────────┤
│  Your Rank: #15 🟡 Safe Zone        │
└──────────────────────────────────────┘
```

---

## 🗄️ Database Schema Requirements

### Tables Needed:

#### 1. **UserRank**

```prisma
- userId: String (FK to User)
- currentRank: Int (1-14)
- totalPoints: Int
- weeklyPoints: Int
- lastWeekRank: Int
- streakDays: Int
- highestRank: Int
- achievements: String[] (badge IDs)
- lastActive: DateTime
- promotionCount: Int
- demotionCount: Int
```

#### 2. **CoursePoints**

```prisma
- courseId: String (FK to Course)
- totalPoints: Int
- pointsPerChapter: Int
- difficulty: String (beginner/intermediate/advanced/expert)
- assignedBy: String (admin user ID)
- assignedAt: DateTime
```

#### 3. **ChapterCompletion**

```prisma
- userId: String
- chapterId: String
- courseId: String
- pointsEarned: Int
- bonusPoints: Int
- completionTime: Int (seconds)
- isFirstTime: Boolean
- isPerfectScore: Boolean
- completedAt: DateTime
```

#### 4. **WeeklyLeaderboard**

```prisma
- weekNumber: Int
- year: Int
- userId: String
- rank: Int
- weeklyPoints: Int
- totalPoints: Int
- rankChange: Int (positive/negative)
```

#### 5. **RankHistory**

```prisma
- userId: String
- previousRank: Int
- newRank: Int
- changeType: String (PROMOTION/DEMOTION/MAINTAIN)
- reason: String
- weekNumber: Int
- createdAt: DateTime
```

---

## 🔧 Admin Panel Features

### Course Points Management:

1. **Assign Points to Course**

   - Select course from dropdown
   - Set total points (1,000 - 30,000)
   - Auto-calculate per-chapter points
   - Preview point distribution
   - Save and apply

2. **Bulk Point Assignment**

   - CSV upload for multiple courses
   - Category-based point templates
   - Mass update existing courses

3. **Points Analytics**
   - Most valuable courses
   - Average points per category
   - User earning trends
   - Completion rates vs points

### Rank Management:

1. **Manual Rank Adjustment** (emergency only)
2. **View Rank History** for any user
3. **Weekly Evaluation Preview** (before Sunday)
4. **Rank Distribution Chart**

---

## 🚀 Implementation Priority

### Phase 1 (Week 1): Foundation

- [ ] Database schema
- [ ] Prisma models
- [ ] Migration scripts

### Phase 2 (Week 2): Core Logic

- [ ] Points calculation API
- [ ] Chapter completion tracking
- [ ] Bonus points system

### Phase 3 (Week 3): Weekly System

- [ ] Cron job for weekly evaluation
- [ ] Rank promotion/demotion logic
- [ ] Leaderboard generation

### Phase 4 (Week 4): Admin Panel

- [ ] Course points assignment UI
- [ ] Analytics dashboard
- [ ] Manual override tools

### Phase 5 (Week 5): User Interface

- [ ] Leaderboard page
- [ ] Profile rank display
- [ ] Rank progress bars
- [ ] Achievement badges

### Phase 6 (Week 6): Notifications & Polish

- [ ] Email notifications
- [ ] In-app notifications
- [ ] Rank change animations
- [ ] Mobile optimization

---

## 📱 Mobile Considerations

- Compact rank badges
- Swipe-friendly leaderboard
- Push notifications for rank changes
- Lightweight animations
- Offline point tracking (sync later)

---

## 🔐 Security & Fair Play

### Anti-Cheating Measures:

1. **Rate Limiting**: Max 50 chapters/day
2. **Time Tracking**: Minimum time per chapter
3. **IP Monitoring**: Multiple accounts detection
4. **Manual Review**: Flag suspicious point gains
5. **Cooldown Period**: 5 minutes between chapter completions

### Data Integrity:

- Transaction-based point updates
- Immutable rank history
- Audit logs for admin actions
- Automated anomaly detection

---

## 🎯 Success Metrics

### User Engagement:

- Daily Active Users (DAU)
- Weekly course completions
- Average points per user
- Streak maintenance rate

### System Health:

- Weekly evaluation completion time
- Point calculation accuracy
- API response times
- Database query performance

### Gamification Impact:

- Rank progression rate
- Competition participation
- Achievement unlock rate
- User retention by rank tier

---

## 🌟 Future Enhancements

### Year 2 Features:

- **Seasonal Leaderboards** (quarterly resets)
- **Team Competitions** (study groups)
- **Rank Tournaments** (special events)
- **NFT Badges** (blockchain achievements)
- **Mentor System** (high ranks help beginners)
- **Rank Decay** (after 6 months inactivity)
- **Custom Rank Titles** (for premium users)
- **Rank Predictions** (ML-based forecasting)

---

**End of Design Document**
