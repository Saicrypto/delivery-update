# Delivery Management System

A comprehensive delivery management application with secure authentication, role-based access control, and real-time order tracking.

## 🚀 Features

- **Multi-Role Authentication**: Developer, Store Owner, and Driver dashboards
- **Smart Data Import**: Paste customer data in any format - automatically detects names, phones, and locations
- **Real-time Order Tracking**: Live updates on delivery status
- **Secure API**: FastAPI backend with comprehensive security measures
- **Modern UI**: React frontend with Tailwind CSS and Framer Motion animations
- **Mobile Ready**: Responsive design with Capacitor for mobile deployment

## 🏗️ Architecture

- **Backend**: FastAPI with SQLAlchemy, PostgreSQL/SQLite support
- **Frontend**: React with TypeScript, Tailwind CSS
- **Database**: Supabase PostgreSQL (free tier compatible)
- **Security**: JWT authentication, rate limiting, input validation

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL (or SQLite for development)

## 🛠️ Installation

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend**:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm start
   ```

3. **Access Application**: http://localhost:3000

## 🗄️ Database Setup

### Supabase (Recommended)

1. Create a Supabase project
2. Get your connection string
3. Set environment variable:
   ```bash
   export DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
   ```
4. Run migration:
   ```bash
   cd backend
   python migrate_to_supabase.py
   ```

### SQLite (Development)

The app uses SQLite by default for easy development setup.

## 👥 Default Users

After running the migration, you can login with:

- **Developer**: `admin` / `admin123`
- **Store Owner**: `store1` / `store123`
- **Driver**: `driver1` / `driver123`

## 📱 Mobile Deployment

The app includes Capacitor configuration for mobile deployment:

```bash
cd frontend
npm run build
npx cap add android
npx cap run android
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SECRET_KEY=your-secret-key
ENVIRONMENT=production
DEBUG=False
```

## 📊 Supabase Free Plan Compatibility

This app is designed to work perfectly with Supabase's free plan:

- **Database Size**: 500MB (sufficient for small-medium operations)
- **Bandwidth**: 2GB/month (plenty for 2-10 users)
- **Connections**: 60 concurrent (more than enough)
- **API Requests**: 50,000/month (generous for small teams)

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation and sanitization
- CORS protection
- Security headers
- Account lockout protection

## 📝 API Documentation

When running in development mode, API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions, please create an issue in the GitHub repository.