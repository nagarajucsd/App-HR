@echo off
echo ========================================
echo Cleaning Up Temporary Development Files
echo ========================================
echo.
echo This will remove all temporary fix documents and test files
echo The application code will NOT be affected
echo.
pause

cd ..

REM Remove all temporary fix documents
del /F /Q "ALL_FINAL_FIXES_DONE.md" 2>nul
del /F /Q "ALL_ISSUES_FIXED_FINAL.md" 2>nul
del /F /Q "ALL_THREE_FIXES_COMPLETE.md" 2>nul
del /F /Q "ATTENDANCE_FIX_APPLIED.md" 2>nul
del /F /Q "CALENDAR_COLOR_FIX.md" 2>nul
del /F /Q "COMPLETE_SYSTEM_STATUS.md" 2>nul
del /F /Q "DATABASE_CLEANUP_COMPLETE.md" 2>nul
del /F /Q "FINAL_FIXES_COMPLETE.md" 2>nul
del /F /Q "FINAL_POLISH_COMPLETE.md" 2>nul
del /F /Q "FINAL_TEST_SUMMARY.md" 2>nul
del /F /Q "FIX_ALL_ISSUES.md" 2>nul
del /F /Q "LEAVE_AND_PAYSLIP_FIX.md" 2>nul
del /F /Q "MANUAL_TEST_GUIDE.md" 2>nul
del /F /Q "NOTIFICATION_MESSAGES_IMPROVED.md" 2>nul
del /F /Q "OCTOBER_2025_DATA_COMPLETE.md" 2>nul
del /F /Q "OCTOBER_DATA_AND_CLEANUP_GUIDE.md" 2>nul
del /F /Q "PAYROLL_AND_NAVIGATION_FIX.md" 2>nul
del /F /Q "PROJECT_READY_FOR_HANDOVER.md" 2>nul
del /F /Q "QUICK_FIX_ACTIONS.md" 2>nul
del /F /Q "QUICK_REFERENCE.md" 2>nul
del /F /Q "ROLE_BASED_NOTIFICATION_FIX.md" 2>nul
del /F /Q "SINGLE_DATABASE_CONFIGURATION.md" 2>nul
del /F /Q "YEAR_2025_FIX_COMPLETE.md" 2>nul
del /F /Q "HANDOVER_SUMMARY.md" 2>nul
del /F /Q "DOCUMENTATION_INDEX.md" 2>nul
del /F /Q "DEMO_VIDEO_SCRIPT.md" 2>nul

REM Remove test files
del /F /Q "test-login-debug.js" 2>nul
del /F /Q "test-all-users-complete.js" 2>nul
del /F /Q "test-attendance-display.js" 2>nul
del /F /Q "comprehensive-user-test.js" 2>nul
del /F /Q "verify-october-data.js" 2>nul
del /F /Q "verify-payroll-issue.js" 2>nul

REM Remove cleanup scripts (keep only essential ones)
del /F /Q "CLEANUP_OLD_FILES.bat" 2>nul
del /F /Q "fix-all-database-connections.bat" 2>nul

REM Remove temporary server scripts
del /F /Q "server\scripts\clean-duplicate-notifications.js" 2>nul
del /F /Q "server\scripts\mark-notifications-read.js" 2>nul
del /F /Q "server\scripts\update-avatars-and-verify-payroll.js" 2>nul
del /F /Q "server\scripts\fix-payroll-and-avatars-2025.js" 2>nul
del /F /Q "server\scripts\drop-duplicate-databases.js" 2>nul
del /F /Q "server\scripts\cleanup-database.js" 2>nul
del /F /Q "server\scripts\create-october-data.js" 2>nul
del /F /Q "server\scripts\backfill-attendance.js" 2>nul
del /F /Q "server\scripts\create-october-attendance.js" 2>nul
del /F /Q "server\unlock-user.js" 2>nul
del /F /Q "server\test-login-debug.js" 2>nul

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Removed:
echo - All temporary fix documents
echo - All test files
echo - Temporary scripts
echo.
echo Kept:
echo - All application code
echo - Essential documentation (docs folder)
echo - README.md
echo - PROJECT_DELIVERY folder
echo.
echo Your application is clean and ready for client delivery!
echo.
pause
