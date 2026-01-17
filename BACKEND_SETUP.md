# LDP Software - Backend Integration Guide

## ✅ Backend Created Successfully!

Your backend is now ready with:
- ✅ MySQL Database Schema
- ✅ PHP REST API Endpoints
- ✅ Authentication System
- ✅ Complete CRUD Operations

---

## 🚀 Setup Instructions

### Step 1: Import Database

**Option A: Using phpMyAdmin**
1. Open http://localhost/phpmyadmin
2. Click "Import" tab
3. Choose file: `backend/database/schema.sql`
4. Click "Go"

**Option B: Using Command Line**
```bash
cd "c:\xampp\htdocs\LDP software\LDP-Software\backend"
setup.bat
```

### Step 2: Verify XAMPP is Running
- Start XAMPP Control Panel
- Start Apache ✅
- Start MySQL ✅

### Step 3: Test API
Open in browser:
- **http://localhost:8080/LDP%20software/LDP-Software/backend/index.html** (Test Dashboard)
- http://localhost:8080/LDP%20software/LDP-Software/backend/api/vendors.php

**Note:** Your Apache is running on **port 8080**, not the default port 80.

You should see JSON response with vendors data.

---

## 📋 Database Details

- **Database Name:** `ldp_software`
- **Host:** `localhost`
- **User:** `root`
- **Password:** (empty by default)

### Seed Users
| Username | Password | Role |
|----------|----------|------|
| lab | lab123 | lab-report |
| data | data123 | data-entry |
| transport | transport123 | transport |
| accounts | accounts123 | accounts |
| admin | admin123 | super-admin |

---

## 🔗 API Endpoints

### Authentication
```
POST /api/auth.php?action=login
POST /api/auth.php?action=logout
GET  /api/auth.php?action=me
```

### Vendors
```
GET    /api/vendors.php
POST   /api/vendors.php
PUT    /api/vendors.php
DELETE /api/vendors.php?id={id}
```

### Milk Types
```
GET    /api/milktypes.php
POST   /api/milktypes.php
PUT    /api/milktypes.php
DELETE /api/milktypes.php?id={id}
```

### Purchases
```
GET /api/purchases.php
POST /api/purchases.php
PUT /api/purchases.php
```

### Sales
```
GET /api/sales.php
POST /api/sales.php
PUT /api/sales.php
```

### Vehicles
```
GET /api/vehicles.php?type=vehicle-numbers
GET /api/vehicles.php?type=drivers
GET /api/vehicles.php?type=vehicle-capacities
GET /api/vehicles.php?type=transport-companies
GET /api/vehicles.php?type=vehicle-masters
```

---

## 📱 Next Steps for React Frontend

The API service is ready at: `web-app/src/services/api.ts`

You now need to update the DataContext to use the API instead of localStorage.

Key Changes Needed:
1. ✅ Replace localStorage with API calls
2. ✅ Use `authAPI.login()` for authentication
3. ✅ Use `vendorsAPI`, `salesAPI`, `purchasesAPI` etc.
4. ✅ Handle async data loading
5. ✅ Add loading states

---

## 🌐 Android App Ready

This backend is RESTful and ready for Android integration:
- ✅ JSON responses
- ✅ Standard HTTP methods (GET, POST, PUT, DELETE)
- ✅ Session-based authentication
- ✅ CORS enabled for cross-origin requests

For Android, you can use:
- Retrofit for API calls
- Gson for JSON parsing
- OkHttp for networking

---

## 🔒 Security Notes (For Production)

⚠️ Current setup is for development. For production:

1. **Change database password**
2. **Use password hashing** (bcrypt/argon2)
3. **Enable HTTPS**
4. **Add input validation**
5. **Implement rate limiting**
6. **Use JWT tokens** instead of sessions
7. **Add API key authentication**

---

## 🐛 Troubleshooting

### Error: "Database connection failed"
- Check if MySQL is running in XAMPP
- Verify database name is `ldp_software`
- Check credentials in `config/config.php`

### Error: "CORS policy"
- Check CORS headers in `config/config.php`
- Make sure `Access-Control-Allow-Origin` matches your frontend URL

### Error: "404 Not Found"
- Check Apache is running
- Verify file paths in URLs
- Check `.htaccess` if using clean URLs

---

## 📞 Support

If you need help integrating the frontend with the backend, let me know!

The data will now be stored centrally and accessible across all devices and users.
