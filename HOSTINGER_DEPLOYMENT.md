# Hostinger-ல் Deploy செய்வது எப்படி?

## முதலில் செய்ய வேண்டியவை:

### 1. React App-ஐ Build செய்யுங்கள்

Local-ல் இந்த command-ஐ run செய்யுங்கள்:

```bash
cd "c:\xampp\htdocs\LDP software\LDP-Software\web-app"
npm run build
```

இது `build` folder-ஐ உருவாக்கும். அதில் உங்கள் production files இருக்கும்.

---

## 2. Hostinger-ல் Database Setup

### Hostinger cPanel-ல் போய்:

1. **MySQL Databases** section-க்கு போங்கள்
2. புதிய database உருவாக்குங்கள் (எ.கா: `u123456_ldp_software`)
3. Database user உருவாக்கி password set செய்யுங்கள்
4. User-ஐ database-க்கு add செய்து "All Privileges" கொடுங்கள்
5. **phpMyAdmin** open செய்யுங்கள்
6. உங்கள் database select செய்து **Import** tab-க்கு போங்கள்
7. இந்த files-ஐ import செய்யுங்கள் (order முக்கியம்):
   - முதலில்: `backend/database/schema.sql`
   - பிறகு: `backend/database/migration_add_soft_delete.sql`

**Note:** Hostinger database name format: `u123456_dbname` (உங்கள் username prefix-உடன் வரும்)

---

## 3. Files Upload செய்யுங்கள்

### Hostinger File Manager அல்லது FTP:

#### Option A: File Manager (cPanel-ல்)
1. **File Manager** open செய்யுங்கள்
2. `public_html` folder-க்கு போங்கள்
3. அதை empty செய்யுங்கள் (default files-ஐ delete செய்யுங்கள்)

#### Option B: FTP (FileZilla பயன்படுத்தி)
- Host: உங்கள் domain (ftp.yourdomain.com)
- Username: Hostinger FTP username
- Password: FTP password
- Port: 21

### Upload Structure:

```
public_html/
├── index.html (build folder-ல் இருந்து)
├── static/ (build folder-ல் இருந்து)
├── asset-manifest.json (build folder-ல் இருந்து)
├── api/ (backend/api folder-ல் இருந்து)
│   ├── auth.php
│   ├── milktypes.php
│   ├── purchases.php
│   ├── sales.php
│   ├── vehicles.php
│   ├── vendors.php
│   └── recyclebin.php
└── config/ (backend/config folder-ல் இருந்து)
    └── config.php
```

**Upload செய்ய வேண்டியவை:**
1. `web-app/build` folder-ல் உள்ள **எல்லா files-ம்** → `public_html/`
2. `backend/api` folder → `public_html/api/`
3. `backend/config` folder → `public_html/config/`

---

## 4. Config Files Update செய்யுங்கள்

### A) Backend Config Update (public_html/config/config.php):

Hostinger database details-உடன் update செய்யுங்கள்:

```php
<?php
// Database configuration - HOSTINGER DETAILS
define('DB_HOST', 'localhost'); // பொதுவாக localhost-ஆ இருக்கும்
define('DB_NAME', 'u123456_ldp_software'); // உங்கள் database name
define('DB_USER', 'u123456_ldpuser'); // உங்கள் database user
define('DB_PASS', 'your_secure_password'); // உங்கள் password

// CORS Configuration - உங்கள் domain
header('Access-Control-Allow-Origin: https://yourdomain.com');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

// Rest of the file remains same...
```

### B) React App API URL Update:

**Deploy செய்யும் முன்** local-ல் `web-app/src/services/api.ts` file-ஐ மாற்றுங்கள்:

```typescript
// API Configuration - PRODUCTION URL
const API_BASE_URL = 'https://yourdomain.com/api';
```

பிறகு மீண்டும் build செய்யுங்கள்:
```bash
npm run build
```

---

## 5. .htaccess File Setup (React Router-க்காக)

`public_html/.htaccess` file உருவாக்குங்கள்:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # API calls-ஐ skip செய்யுங்கள்
  RewriteCond %{REQUEST_URI} ^/api/
  RewriteRule ^ - [L]
  
  # Static files-ஐ skip செய்யுங்கள்
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # React Router-க்கு எல்லா requests-ம் index.html-க்கு
  RewriteRule ^ index.html [L]
</IfModule>

# PHP Settings
php_value upload_max_filesize 64M
php_value post_max_size 64M
php_value max_execution_time 300
php_value max_input_time 300
```

---

## 6. Permissions Set செய்யுங்கள்

Hostinger File Manager-ல்:
- `api` folder: **755**
- All `.php` files: **644**

---

## 7. Test செய்யுங்கள்

1. Browser-ல் உங்கள் domain open செய்யுங்கள்: `https://yourdomain.com`
2. Login செய்து பாருங்கள்
3. API endpoints test செய்யுங்கள்: `https://yourdomain.com/api/vendors.php`

---

## Common Issues & Solutions:

### Issue 1: "Database connection failed"
- **Solution:** `config.php`-ல் database details சரியாக உள்ளதா பாருங்கள்
- Hostinger cPanel → MySQL Databases-ல் user permissions check செய்யுங்கள்

### Issue 2: "404 Not Found" for routes
- **Solution:** `.htaccess` file சரியாக upload ஆகியிருக்கிறதா பாருங்கள்
- Hostinger cPanel → MultiPHP INI Editor → `mod_rewrite` enabled-ஆ இருக்கிறதா பாருங்கள்

### Issue 3: CORS Errors
- **Solution:** `config.php`-ல் `Access-Control-Allow-Origin` உங்கள் domain-க்கு மாற்றியிருக்கிறீர்களா?

### Issue 4: White Screen
- **Solution:** Browser console-ல் error பாருங்கள்
- `api.ts` file-ல் API_BASE_URL சரியாக இருக்கிறதா?

---

## Quick Checklist:

- [ ] React app build செய்தீர்களா?
- [ ] Hostinger-ல் database உருவாக்கினீர்களா?
- [ ] SQL files import செய்தீர்களா?
- [ ] Files upload செய்தீர்களா?
- [ ] `config.php` database details update செய்தீர்களா?
- [ ] `api.ts` API URL update செய்து rebuild செய்தீர்களா?
- [ ] `.htaccess` file உருவாக்கினீர்களா?
- [ ] CORS headers domain update செய்தீர்களா?

---

## Support:

Problems இருந்தால், Hostinger cPanel-ல் **Error Log** பாருங்கள்:
- Path: `public_html/error_log`

இது உங்களுக்கு exact error-ஐ காட்டும்.
