# Travel Packages Platform - Backend

API server للمنصة السياحية بـ Node.js + TypeORM + PostgreSQL

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- PostgreSQL 13+
- npm أو yarn

### التثبيت

1. **تثبيت Dependencies:**
```bash
npm install
```

2. **إعداد ملف .env:**
```bash
cp .env.example .env
```

ثم عدّل البيانات في `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_NAME=tour
PORT=5000
JWT_SECRET=your_secret_key_here
```

3. **إنشاء قاعدة البيانات:**
```bash
# من PostgreSQL client
createdb tour
```

4. **تشغيل Migrations:**
```bash
npm run migrate
```

5. **بدء الـ Server:**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 📁 هيكل المشروع

```
src/
├── config/           # Database وـ App configuration
├── entities/         # TypeORM entities
├── repositories/     # Data access layer
├── services/         # Business logic
├── controllers/      # API handlers
├── routes/          # API routes
├── middleware/      # Express middleware
├── utils/           # Helper functions
├── database/        # Migrations و seeds
├── websocket/       # Socket.IO integration
├── jobs/            # Background jobs
└── types/           # TypeScript types
```

## 🔑 الـ Features الرئيسية

### ✅ Authentication
- Registration و Login
- JWT Token Management
- Password Hashing (bcrypt)
- Refresh Tokens

### ✅ Packages
- Search و Filter
- Featured Packages
- Price Calculation
- Category Management

### ✅ Bookings (⭐ الأهم)
- **التحقق من قاعدة 15 يوم** - الحجز يجب أن يكون قبل البداية بـ 15 يوم
- Create، Update، Cancel Bookings
- Booking Status Management
- PDF Invoice Generation

### ✅ Notifications
- Real-time Notifications via Socket.IO
- Email/WhatsApp Integration
- Booking Reminders (7d, 3d, 24h)

### ✅ Admin Features
- Package Management (CRUD)
- Booking Management
- Sales Reports
- Customer Management

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register        - Register user
POST   /api/auth/login           - Login user
POST   /api/auth/refresh-token   - Refresh JWT
POST   /api/auth/change-password - Change password
```

### Packages
```
GET    /api/packages/search      - Search packages
GET    /api/packages/featured    - Get featured
GET    /api/packages/:id         - Get details
POST   /api/packages             - Create (admin)
PUT    /api/packages/:id         - Update (admin)
DELETE /api/packages/:id         - Delete (admin)
```

### Bookings
```
POST   /api/bookings             - Create booking ⭐ WITH 15-DAY VALIDATION
GET    /api/bookings/my-bookings - Get user bookings
GET    /api/bookings/:id         - Get booking
POST   /api/bookings/:id/cancel  - Cancel booking
PUT    /api/bookings/:id/status  - Update status (admin)
```

## 🔒 Security

- CORS enabled
- Helmet.js for headers
- Input validation و sanitization
- SQL injection protection (via TypeORM)
- XSS protection
- Rate limiting (TODO)

## 🧪 Testing

```bash
npm run test
```

## 📦 Dependencies

- **express** - Web framework
- **typeorm** - ORM
- **pg** - PostgreSQL driver
- **jsonwebtoken** - JWT auth
- **bcryptjs** - Password hashing
- **socket.io** - Real-time
- **bull** - Job queue
- **nodemailer** - Email
- **pdfkit** - PDF generation
- **winston** - Logging
- **helmet** - Security headers
- **cors** - CORS middleware

## 🚀 Deployment

### Heroku
```bash
git push heroku main
```

### DigitalOcean
```bash
# Deploy script in docs/deployment.md
```

## 📝 Environment Variables

انظر `.env.example` للقائمة الكاملة

### Required
- `DB_*` - Database credentials
- `JWT_SECRET` - JWT secret key
- `PORT` - Server port

### Optional
- `SENDGRID_API_KEY` - Email service
- `TWILIO_*` - WhatsApp integration
- `AWS_*` - S3 storage
- `REDIS_URL` - Cache/Queue

## 🐛 Troubleshooting

### Database connection failed
- تأكد من تشغيل PostgreSQL
- تحقق من credentials في `.env`
- تحقق من port 5432

### Migration errors
- احذف الـ database واعادة إنشاء
- تحقق من `.env` DB_NAME

### Port already in use
- غيّر PORT في `.env`

## 📚 Documentation

- API Documentation: `/docs/api.md`
- Database Schema: `/docs/schema.md`
- Architecture: `/docs/architecture.md`

## 👤 Author

Tour Platform Team

## 📄 License

ISC
