# Troubleshooting Guide

## Common Issues and Solutions

---

## Installation Issues

### Issue: npm install fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and package-lock.json:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Use legacy peer deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Check Node.js version:**
   ```bash
   node --version
   # Should be v18 or higher
   ```

---

### Issue: MongoDB connection fails

**Symptoms:**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

1. **Check if MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl status mongod
   sudo systemctl start mongod
   ```

2. **Verify connection string in .env:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/hr-management
   ```

3. **Check MongoDB logs:**
   ```bash
   # Windows
   C:\Program Files\MongoDB\Server\6.0\log\mongod.log
   
   # Linux
   sudo tail -f /var/log/mongodb/mongod.log
   ```

4. **Test connection:**
   ```bash
   mongosh
   # or
   mongo
   ```

---

## Authentication Issues

### Issue: Login fails with correct credentials

**Symptoms:**
- "Invalid email or password" error
- User exists in database but cannot login

**Solutions:**

1. **Check if user exists:**
   ```bash
   mongosh hr-management
   db.users.findOne({ email: "user@company.com" })
   ```

2. **Reset password:**
   ```bash
   cd server
   node
   ```
   ```javascript
   const bcrypt = require('bcryptjs');
   const password = 'newPassword123';
   const hash = bcrypt.hashSync(password, 10);
   console.log(hash);
   // Copy hash and update in database
   ```

3. **Check account status:**
   ```javascript
   db.users.findOne({ email: "user@company.com" }, { isActive: 1, lockUntil: 1 })
   ```

4. **Unlock account:**
   ```javascript
   db.users.updateOne(
     { email: "user@company.com" },
     { $set: { loginAttempts: 0, lockUntil: null } }
   )
   ```

---

### Issue: MFA code not working

**Symptoms:**
- "Invalid MFA code" error
- Code from authenticator app rejected

**Solutions:**

1. **Check system time:**
   - TOTP codes are time-based
   - Ensure server and device clocks are synchronized
   - Use NTP to sync time

2. **Verify MFA is set up:**
   ```javascript
   db.users.findOne({ email: "user@company.com" }, { isMfaSetup: 1, mfaSecret: 1 })
   ```

3. **Reset MFA:**
   ```javascript
   db.users.updateOne(
     { email: "user@company.com" },
     { $set: { isMfaSetup: false, mfaSecret: null } }
   )
   ```

4. **Use recovery code:**
   - Request recovery code via email
   - Use recovery flow to reset MFA

---

### Issue: JWT token expired or invalid

**Symptoms:**
- "Not authorized, token required" error
- Automatic logout
- 401 Unauthorized responses

**Solutions:**

1. **Clear browser storage:**
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Check JWT_SECRET consistency:**
   - Ensure same secret in .env
   - Restart server after changing

3. **Verify token format:**
   ```javascript
   // In browser console
   const token = localStorage.getItem('token');
   console.log(token);
   // Should start with "eyJ"
   ```

4. **Check token expiration:**
   - Default expiration is 30 days
   - Login again to get new token

---

## Frontend Issues

### Issue: Frontend won't start

**Symptoms:**
```
Error: Cannot find module 'vite'
```

**Solutions:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Check port availability:**
   ```bash
   # Windows
   netstat -ano | findstr :5173
   
   # macOS/Linux
   lsof -i :5173
   ```

3. **Kill process using port:**
   ```bash
   # Windows
   taskkill /PID <PID> /F
   
   # macOS/Linux
   kill -9 <PID>
   ```

4. **Try different port:**
   ```bash
   npm run dev -- --port 3000
   ```

---

### Issue: API calls failing (CORS errors)

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**

1. **Check VITE_API_URL in .env:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Verify backend CORS configuration:**
   ```javascript
   // server/server.js
   app.use(cors({
     origin: ['http://localhost:5173', 'http://localhost:3000'],
     credentials: true
   }));
   ```

3. **Restart both frontend and backend:**
   ```bash
   # Stop both servers
   # Start backend first
   cd server && npm start
   # Then start frontend
   npm run dev
   ```

4. **Check browser console for exact error:**
   - Open DevTools (F12)
   - Check Console and Network tabs

---

### Issue: White screen / blank page

**Symptoms:**
- Application loads but shows blank page
- No errors in console

**Solutions:**

1. **Check browser console for errors:**
   - Press F12
   - Look for JavaScript errors

2. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear cache and cookies

3. **Check if API is accessible:**
   ```bash
   curl http://localhost:5000/api/health
   ```

4. **Rebuild application:**
   ```bash
   rm -rf dist node_modules
   npm install
   npm run build
   npm run preview
   ```

---

## Backend Issues

### Issue: Server won't start

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

1. **Kill process using port:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -i :5000
   kill -9 <PID>
   ```

2. **Use different port:**
   ```env
   # server/.env
   PORT=5001
   ```

3. **Check for syntax errors:**
   ```bash
   cd server
   node --check server.js
   ```

---

### Issue: Database queries slow

**Symptoms:**
- API responses taking too long
- Timeout errors

**Solutions:**

1. **Check database indexes:**
   ```javascript
   db.attendances.getIndexes()
   db.employees.getIndexes()
   ```

2. **Create missing indexes:**
   ```javascript
   db.attendances.createIndex({ employeeId: 1, date: 1 })
   db.notifications.createIndex({ userId: 1, read: 1 })
   ```

3. **Monitor slow queries:**
   ```javascript
   db.setProfilingLevel(1, { slowms: 100 })
   db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()
   ```

4. **Optimize queries:**
   - Use projection to limit fields
   - Add pagination
   - Use lean() for read-only queries

---

### Issue: Email notifications not sending

**Symptoms:**
- No emails received
- Email errors in logs

**Solutions:**

1. **Check email configuration:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

2. **For Gmail, use App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification
   - App passwords → Generate new password
   - Use generated password in .env

3. **Test email service:**
   ```javascript
   // Create test script
   import nodemailer from 'nodemailer';
   
   const transporter = nodemailer.createTransport({
     host: process.env.EMAIL_HOST,
     port: process.env.EMAIL_PORT,
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASSWORD
     }
   });
   
   transporter.sendMail({
     from: process.env.EMAIL_FROM,
     to: 'test@example.com',
     subject: 'Test',
     text: 'Test email'
   });
   ```

4. **Check firewall/network:**
   - Ensure port 587 is not blocked
   - Check if SMTP is allowed

---

## Attendance Issues

### Issue: Clock in/out not working

**Symptoms:**
- Button doesn't respond
- Duplicate clock-in errors
- Time not recording

**Solutions:**

1. **Check if already clocked in:**
   ```javascript
   db.attendances.findOne({
     employeeId: ObjectId("..."),
     date: "2024-11-02"
   })
   ```

2. **Clear duplicate records:**
   ```javascript
   // Find duplicates
   db.attendances.aggregate([
     { $group: { _id: { employeeId: "$employeeId", date: "$date" }, count: { $sum: 1 } } },
     { $match: { count: { $gt: 1 } } }
   ])
   
   // Remove duplicates (keep first)
   // Manual cleanup required
   ```

3. **Check date format:**
   - Should be YYYY-MM-DD string
   - Verify timezone handling

4. **Verify employee ID:**
   ```javascript
   db.employees.findOne({ _id: ObjectId("...") })
   ```

---

### Issue: Daily attendance not auto-creating

**Symptoms:**
- No attendance records for new day
- Background job not running

**Solutions:**

1. **Check if job is scheduled:**
   ```bash
   # Check server logs
   pm2 logs hr-api | grep "Daily attendance"
   ```

2. **Manually trigger job:**
   ```javascript
   // In server console
   import { createDailyAttendance } from './jobs/dailyAttendanceJob.js';
   await createDailyAttendance();
   ```

3. **Verify cron schedule:**
   ```javascript
   // server/jobs/dailyAttendanceJob.js
   // Should run at midnight: '0 0 * * *'
   ```

4. **Check server timezone:**
   ```bash
   date
   timedatectl  # Linux
   ```

---

## Leave Management Issues

### Issue: Leave balance not updating

**Symptoms:**
- Approved leaves don't reduce balance
- Balance shows incorrect values

**Solutions:**

1. **Check leave balance records:**
   ```javascript
   db.leavebalances.find({ employeeId: ObjectId("...") })
   ```

2. **Recalculate balance:**
   ```javascript
   const approved = await db.leaverequests.aggregate([
     { $match: { employeeId: ObjectId("..."), status: "Approved" } },
     { $group: { _id: "$leaveType", total: { $sum: "$days" } } }
   ])
   ```

3. **Initialize leave balance:**
   ```javascript
   db.leavebalances.insertOne({
     employeeId: ObjectId("..."),
     year: 2024,
     leaveType: "Annual",
     total: 20,
     used: 0,
     remaining: 20
   })
   ```

---

## Payroll Issues

### Issue: Payroll calculations incorrect

**Symptoms:**
- Wrong net pay amount
- Deductions not applied
- Allowances missing

**Solutions:**

1. **Verify calculation logic:**
   ```
   Gross Pay = Basic + HRA + Special Allowance
   Net Pay = Gross Pay - (Tax + PF + Absence Deduction)
   ```

2. **Check employee salary:**
   ```javascript
   db.employees.findOne({ _id: ObjectId("...") }, { salary: 1 })
   ```

3. **Recalculate payroll:**
   ```javascript
   const basic = employee.salary;
   const hra = basic * 0.4;  // 40% of basic
   const special = basic * 0.2;  // 20% of basic
   const grossPay = basic + hra + special;
   const tax = grossPay * 0.1;  // 10% tax
   const pf = basic * 0.12;  // 12% PF
   const netPay = grossPay - tax - pf;
   ```

---

## Performance Issues

### Issue: Application running slow

**Symptoms:**
- Pages take long to load
- API responses delayed
- High CPU/memory usage

**Solutions:**

1. **Check server resources:**
   ```bash
   # CPU and memory
   top
   htop
   
   # Disk space
   df -h
   ```

2. **Monitor Node.js process:**
   ```bash
   pm2 monit
   pm2 status
   ```

3. **Check database performance:**
   ```javascript
   db.currentOp()
   db.serverStatus()
   ```

4. **Optimize queries:**
   - Add indexes
   - Use pagination
   - Limit populated fields

5. **Clear old data:**
   ```javascript
   // Archive old attendance (> 2 years)
   db.attendances.deleteMany({
     date: { $lt: "2022-01-01" }
   })
   ```

---

## Production Issues

### Issue: Application crashes in production

**Symptoms:**
- Server stops responding
- PM2 shows "errored" status
- 502 Bad Gateway errors

**Solutions:**

1. **Check PM2 logs:**
   ```bash
   pm2 logs hr-api --lines 100
   ```

2. **Check system logs:**
   ```bash
   sudo journalctl -u nginx -n 50
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Restart application:**
   ```bash
   pm2 restart hr-api
   ```

4. **Check memory usage:**
   ```bash
   free -h
   pm2 status
   ```

5. **Increase memory limit:**
   ```bash
   pm2 delete hr-api
   pm2 start server.js --name hr-api --max-memory-restart 500M
   ```

---

### Issue: SSL certificate errors

**Symptoms:**
- "Your connection is not private" warning
- Certificate expired errors

**Solutions:**

1. **Check certificate status:**
   ```bash
   sudo certbot certificates
   ```

2. **Renew certificate:**
   ```bash
   sudo certbot renew
   sudo systemctl reload nginx
   ```

3. **Test auto-renewal:**
   ```bash
   sudo certbot renew --dry-run
   ```

---

## Database Issues

### Issue: Database connection pool exhausted

**Symptoms:**
```
MongoServerError: connection pool exhausted
```

**Solutions:**

1. **Increase pool size:**
   ```javascript
   mongoose.connect(uri, {
     maxPoolSize: 50,
     minPoolSize: 10
   });
   ```

2. **Check for connection leaks:**
   - Ensure all queries complete
   - Close unused connections

3. **Monitor connections:**
   ```javascript
   db.serverStatus().connections
   ```

---

### Issue: Database disk space full

**Symptoms:**
- Write operations fail
- Database becomes read-only

**Solutions:**

1. **Check disk usage:**
   ```bash
   df -h
   du -sh /var/lib/mongodb
   ```

2. **Compact database:**
   ```javascript
   db.runCommand({ compact: 'attendances' })
   ```

3. **Archive old data:**
   - Export old records
   - Delete from database
   - Store in cold storage

4. **Increase disk space:**
   - Resize volume
   - Add new volume
   - Move to larger instance

---

## Getting Help

If you can't resolve an issue:

1. **Check logs:**
   - Browser console (F12)
   - Backend logs (`pm2 logs`)
   - Database logs
   - Nginx logs

2. **Gather information:**
   - Error messages
   - Steps to reproduce
   - Environment details
   - Recent changes

3. **Search documentation:**
   - This troubleshooting guide
   - API reference
   - Architecture documentation

4. **Contact support:**
   - Provide detailed error information
   - Include relevant logs
   - Describe what you've tried

---

## Preventive Measures

### Regular Maintenance

1. **Keep dependencies updated:**
   ```bash
   npm outdated
   npm update
   ```

2. **Monitor disk space:**
   ```bash
   df -h
   ```

3. **Review logs regularly:**
   ```bash
   pm2 logs --lines 100
   ```

4. **Test backups:**
   - Restore to test environment
   - Verify data integrity

5. **Monitor performance:**
   - Set up alerts
   - Track response times
   - Monitor error rates

### Best Practices

- Always test in development first
- Keep backups before major changes
- Document configuration changes
- Monitor application health
- Review security regularly
- Keep system updated
- Use version control
- Implement proper logging
- Set up monitoring and alerts
