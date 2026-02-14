HOSTINGER DEPLOYMENT INSTRUCTIONS 
===================================== 
 
1. Upload all files in this folder to your Hostinger public_html directory 
 
2. Edit config/config.php with your Hostinger database details: 
   - DB_HOST (usually 'localhost') 
   - DB_NAME (your database name) 
   - DB_USER (your database user) 
   - DB_PASS (your database password) 
   - Update domain in CORS settings 
 
3. Import database: 
   - Go to phpMyAdmin in Hostinger cPanel 
   - Import backend/database/schema.sql 
   - Import backend/database/migration_add_soft_delete.sql 
 
4. Set folder permissions: 
   - api/ folder: 755 
   - All .php files: 644 
 
5. Visit https://lakshmidairy.site to test 
