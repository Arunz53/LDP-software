@echo off
echo ============================================
echo LDP Software - Hostinger Deployment Script
echo ============================================
echo.

REM Check if domain is set
if "%1"=="" (
    echo ERROR: Domain name required!
    echo Usage: deploy.bat yourdomain.com
    echo Example: deploy.bat ldpsoftware.com
    exit /b 1
)

set DOMAIN=%1
echo Domain: %DOMAIN%
echo.

REM Step 1: Update API URL in api.ts
echo [1/3] Updating API configuration...
echo const API_BASE_URL = 'https://%DOMAIN%/api'; > temp_api.txt

REM Backup original api.ts
copy "web-app\src\services\api.ts" "web-app\src\services\api.ts.backup" >nul

REM Update the API_BASE_URL in api.ts
powershell -Command "(Get-Content 'web-app\src\services\api.ts') -replace \"const API_BASE_URL = '.*';\", \"const API_BASE_URL = 'https://%DOMAIN%/api';\" | Set-Content 'web-app\src\services\api.ts'"

echo    - API URL updated to: https://%DOMAIN%/api
echo.

REM Step 2: Build React App
echo [2/3] Building React application...
cd web-app
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    cd ..
    REM Restore backup
    copy "web-app\src\services\api.ts.backup" "web-app\src\services\api.ts" >nul
    exit /b 1
)
cd ..
echo    - Build completed successfully
echo.

REM Step 3: Create deployment package
echo [3/3] Creating deployment package...

REM Create deployment directory
if exist "hostinger-deploy" rmdir /s /q "hostinger-deploy"
mkdir "hostinger-deploy"

REM Copy build files
xcopy "web-app\build\*" "hostinger-deploy\" /E /I /Y >nul

REM Copy backend files
mkdir "hostinger-deploy\api"
mkdir "hostinger-deploy\config"
xcopy "backend\api\*.php" "hostinger-deploy\api\" /Y >nul
xcopy "backend\config\config.production.php" "hostinger-deploy\config\config.php" /Y >nul

REM Copy .htaccess
copy ".htaccess" "hostinger-deploy\.htaccess" >nul

REM Create instructions file
echo HOSTINGER DEPLOYMENT INSTRUCTIONS > "hostinger-deploy\README.txt"
echo ===================================== >> "hostinger-deploy\README.txt"
echo. >> "hostinger-deploy\README.txt"
echo 1. Upload all files in this folder to your Hostinger public_html directory >> "hostinger-deploy\README.txt"
echo. >> "hostinger-deploy\README.txt"
echo 2. Edit config/config.php with your Hostinger database details: >> "hostinger-deploy\README.txt"
echo    - DB_HOST (usually 'localhost') >> "hostinger-deploy\README.txt"
echo    - DB_NAME (your database name) >> "hostinger-deploy\README.txt"
echo    - DB_USER (your database user) >> "hostinger-deploy\README.txt"
echo    - DB_PASS (your database password) >> "hostinger-deploy\README.txt"
echo    - Update domain in CORS settings >> "hostinger-deploy\README.txt"
echo. >> "hostinger-deploy\README.txt"
echo 3. Import database: >> "hostinger-deploy\README.txt"
echo    - Go to phpMyAdmin in Hostinger cPanel >> "hostinger-deploy\README.txt"
echo    - Import backend/database/schema.sql >> "hostinger-deploy\README.txt"
echo    - Import backend/database/migration_add_soft_delete.sql >> "hostinger-deploy\README.txt"
echo. >> "hostinger-deploy\README.txt"
echo 4. Set folder permissions: >> "hostinger-deploy\README.txt"
echo    - api/ folder: 755 >> "hostinger-deploy\README.txt"
echo    - All .php files: 644 >> "hostinger-deploy\README.txt"
echo. >> "hostinger-deploy\README.txt"
echo 5. Visit https://%DOMAIN% to test >> "hostinger-deploy\README.txt"

REM Restore original api.ts
copy "web-app\src\services\api.ts.backup" "web-app\src\services\api.ts" >nul
del "web-app\src\services\api.ts.backup" >nul

echo    - Deployment package created in 'hostinger-deploy' folder
echo.
echo ============================================
echo DEPLOYMENT PACKAGE READY!
echo ============================================
echo.
echo Next Steps:
echo 1. Open Hostinger File Manager or use FTP
echo 2. Upload all files from 'hostinger-deploy' folder to public_html
echo 3. Edit config/config.php with your database details
echo 4. Import database SQL files in phpMyAdmin
echo 5. Visit https://%DOMAIN% to test
echo.
echo See 'hostinger-deploy\README.txt' for detailed instructions
echo See 'HOSTINGER_DEPLOYMENT.md' for complete guide
echo.
pause
