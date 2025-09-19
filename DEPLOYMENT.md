# Deployment Guide

This guide covers deploying the Delivery Management System to various platforms.

## 🚀 Quick Deploy Options

### 1. Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Set environment variables:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `SECRET_KEY`: A secure random string
   - `ENVIRONMENT`: `production`
   - `DEBUG`: `False`
3. Deploy automatically

### 2. Render
1. Connect your GitHub repository to Render
2. Choose "Web Service"
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Set environment variables (same as Railway)

### 3. Heroku
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Set environment variables: `heroku config:set DATABASE_URL=your-url`
4. Deploy: `git push heroku main`

### 4. Vercel (Frontend) + Railway (Backend)
1. Deploy backend to Railway (see above)
2. Deploy frontend to Vercel:
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `build`
   - Set environment variable: `REACT_APP_API_URL=https://your-backend-url.railway.app`

## 🗄️ Database Setup

### Supabase (Free Tier)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy connection string
5. Set as `DATABASE_URL` environment variable
6. Run migration: `python migrate_to_supabase.py`

### Environment Variables Required
```env
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SECRET_KEY=your-secure-secret-key-here
ENVIRONMENT=production
DEBUG=False
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

## 🔧 Platform-Specific Notes

### Railway
- Automatically detects Python apps
- Uses `Procfile` for start command
- Supports PostgreSQL add-ons

### Render
- Free tier available
- Automatic deployments from Git
- Built-in PostgreSQL database option

### Heroku
- Requires credit card for PostgreSQL
- Uses `Procfile` for process definition
- Supports multiple dyno types

### Vercel
- Excellent for React frontends
- Automatic deployments
- Edge functions support

## 🚨 Common Issues

### "No FastAPI entrypoint found"
- Ensure `app.py` exists in root directory
- Check that `Procfile` points to correct location
- Verify `main.py` contains `app = FastAPI(...)`

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check if database is accessible from deployment platform
- Ensure PostgreSQL driver (`psycopg2-binary`) is installed

### CORS Issues
- Update `ALLOWED_ORIGINS` with your frontend domain
- Include both `http://` and `https://` versions if needed

## 📊 Monitoring

### Health Check
- Endpoint: `/health`
- Returns system status and version info

### Security Info
- Endpoint: `/security`
- Returns security configuration details

### Logs
- Check platform-specific logging
- Sentry integration for error tracking (set `SENTRY_DSN`)

## 🔒 Security Checklist

- [ ] Set strong `SECRET_KEY`
- [ ] Use HTTPS in production
- [ ] Configure `ALLOWED_ORIGINS` correctly
- [ ] Enable rate limiting
- [ ] Set up monitoring/alerts
- [ ] Regular security updates
- [ ] Database backups enabled

## 📱 Mobile Deployment

After web deployment:
1. Update `capacitor.config.ts` with production URLs
2. Build frontend: `npm run build`
3. Sync with Capacitor: `npx cap sync`
4. Build Android: `npx cap build android`
5. Upload to Google Play Store

## 🆘 Troubleshooting

### Backend won't start
- Check Python version compatibility
- Verify all dependencies installed
- Check environment variables
- Review logs for specific errors

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` is correct
- Check CORS configuration
- Ensure backend is running and accessible

### Database errors
- Verify connection string format
- Check database permissions
- Ensure tables are created (run migration)
- Check for network connectivity issues
