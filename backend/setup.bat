@echo off
echo ===================================
echo LDP Software Backend Setup
echo ===================================
echo.

echo Step 1: Checking XAMPP Installation...
if not exist "C:\xampp\mysql\bin\mysql.exe" (
    echo ERROR: XAMPP MySQL not found!
    echo Please install XAMPP first.
    pause
    exit /b 1
)

echo Step 2: Importing Database Schema...
echo Please enter your MySQL root password (press Enter if no password):
set /p MYSQL_PASSWORD=Password: 

if "%MYSQL_PASSWORD%"=="" (
    C:\xampp\mysql\bin\mysql.exe -u root < database\schema.sql
) else (
    C:\xampp\mysql\bin\mysql.exe -u root -p%MYSQL_PASSWORD% < database\schema.sql
)

if errorlevel 1 (
    echo ERROR: Database import failed!
    pause
    exit /b 1
)

echo.
echo ===================================
echo Setup Complete!
echo ===================================
echo.
echo Database 'ldp_software' has been created successfully.
echo.
echo Next Steps:
echo 1. Make sure Apache and MySQL are running in XAMPP
echo 2. Update the React frontend to use the API
echo 3. Test the API at: http://localhost/LDP%%20software/LDP-Software/backend/api/vendors.php
echo.
pause
