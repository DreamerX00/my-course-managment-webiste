# Weekly Rank Update Cron Job

This cron job runs every **Sunday at 11:59 PM** to evaluate all users and update their ranks based on weekly performance.

## 📋 How It Works

### Evaluation Zones

Users are divided into 3 zones based on their leaderboard position:

1. **PROMOTION Zone (Top 10)**

   - Users earn ≥500 weekly points → Promoted to next rank
   - Users earn <500 weekly points → Maintained

2. **SAFE Zone (Position 11-50)**

   - Users earn ≥200 weekly points → Maintained
   - Users earn <200 weekly points → Maintained (warning)

3. **DEMOTION Zone (Position 51+)**
   - Users earn <200 weekly points → Demoted to previous rank
   - Users earn ≥200 weekly points → Maintained

### Special Rules

- **New User Immunity**: First 2 weeks protected from demotion
- **Rank Freeze**: Premium feature to freeze rank for a period
- **Lowest Rank**: Users at Rank 1 cannot be demoted further
- **Highest Rank**: Users at Rank 14 cannot be promoted further
- **Weekly Reset**: All users' weekly points reset to 0 after evaluation

## 🚀 Deployment Options

### Option 1: Vercel Cron (Recommended)

The cron job is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-rank-update",
      "schedule": "59 23 * * 0"
    }
  ]
}
```

**Schedule**: `59 23 * * 0` = Every Sunday at 11:59 PM

**Note**: Vercel Cron requires a Pro plan or higher.

### Option 2: External Cron Service

Use services like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. Create a cron job with URL: `https://yourdomain.com/api/cron/weekly-rank-update`
2. Set schedule: Every Sunday at 23:59
3. Add header: `Authorization: Bearer YOUR_CRON_SECRET`
4. Set `CRON_SECRET` in your environment variables

### Option 3: Manual Trigger (Admin Only)

Admins can manually trigger the cron job via API:

```bash
POST /api/admin/cron
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "action": "run"
}
```

Or reset weekly points:

```bash
POST /api/admin/cron
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "action": "reset-weekly-points"
}
```

## 🔐 Security

The cron endpoint is protected by:

1. **Vercel Cron User-Agent**: Automatically detected
2. **CRON_SECRET**: Required for external services
3. **Admin Authentication**: Required for manual triggers

### Environment Variables

Add to `.env`:

```env
CRON_SECRET=your-secure-random-secret-here
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

## 📊 Monitoring

### View Execution Logs

```bash
GET /api/admin/cron
Authorization: Bearer <admin-token>
```

Returns recent execution logs with:

- Week number and year
- Users evaluated, promoted, demoted, maintained
- Execution time
- Error logs (if any)

### Database Logs

All executions are logged in the `WeeklyEvaluationLog` table:

```sql
SELECT * FROM "WeeklyEvaluationLog" ORDER BY "createdAt" DESC LIMIT 10;
```

## 🧪 Testing

### Test Locally

```bash
# Run the cron job manually
npm run dev

# In another terminal, trigger the cron
curl -X POST http://localhost:3000/api/cron/weekly-rank-update \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Test on Staging

Deploy to Vercel preview environment and test:

```bash
curl -X POST https://your-preview-url.vercel.app/api/cron/weekly-rank-update \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 📈 Expected Results

After each execution:

1. ✅ `WeeklyLeaderboard` entries created for all users
2. ✅ `UserRank` records updated with new ranks
3. ✅ `RankHistory` entries created for promotions/demotions
4. ✅ Weekly points reset to 0
5. ✅ Immunity weeks decremented
6. ✅ Execution log created with stats

## 🐛 Troubleshooting

### Cron Not Running

1. Check Vercel deployment logs
2. Verify `vercel.json` is in project root
3. Ensure Pro plan for Vercel Cron
4. Check environment variables are set

### Partial Failures

- Individual user errors are logged but don't stop execution
- Check `WeeklyEvaluationLog.errorLog` for details
- Failed users will be evaluated next week

### Manual Recovery

If a week is missed:

1. Trigger manually via admin endpoint
2. Check logs for errors
3. Verify all users were evaluated
4. Review `RankHistory` for correctness

## 📝 Notes

- Cron runs at 11:59 PM to capture full day's activity
- Processing time depends on user count (~1-5 seconds for 1000 users)
- Transaction ensures atomic updates
- Retries are not automatic (trigger manually if needed)
