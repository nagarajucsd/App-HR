# Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the HR Management System to production environments. The deployment process covers both frontend and backend components.

## Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] SSL certificates obtained
- [ ] Domain names configured
- [ ] Email service configured
- [ ] Monitoring tools set up

---

## Environment Setup

### 1. Frontend Environment Variables

Create `.env` file in the root directory:

```env
# Production API URL
VITE_API_URL=https://api.yourdomain.com/api
```

### 2. Backend Environment Variables

Create `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Database - Use MongoDB Atlas or managed service
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hr-management?retryWrites=true&w=majority

# JWT Secret - Generate a strong random string
JWT_SECRET=your-super-secure-jwt-secret-min-32-characters-long

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=HR System <your-email@gmail.com>

# MFA Configuration
MFA_ISSUER=HR Management System

# Optional: Logging
LOG_LEVEL=info
```

**Security Notes:**
- Never commit `.env` files to version control
- Use strong, randomly generated JWT secrets (minimum 32 characters)
- Use app-specific passwords for email services
- Rotate secrets regularly

---

## Database Deployment

### Option 1: MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**
   - Visit https://www.mongodb.com/cloud/atlas
   - Sign up for free tier or paid plan

2. **Create Cluster**
   - Choose cloud provider (AWS, Google Cloud, Azure)
   - Select region closest to your application server
   - Choose cluster tier based on requirements

3. **Configure Network Access**
   - Add IP addresses that need access
   - For production servers, add specific IPs
   - Avoid using 0.0.0.0/0 (allow all) in production

4. **Create Database User**
   - Create user with read/write permissions
   - Use strong password
   - Note credentials for connection string

5. **Get Connection String**
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/hr-management?retryWrites=true&w=majority
   ```

6. **Update Backend .env**
   ```env
   MONGODB_URI=<your-connection-string>
   ```

### Option 2: Self-Hosted MongoDB

1. **Install MongoDB on Server**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb-org
   
   # Start MongoDB
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

2. **Configure MongoDB**
   - Edit `/etc/mongod.conf`
   - Enable authentication
   - Configure network bindings
   - Set up replica set (recommended)

3. **Create Database and User**
   ```javascript
   use hr-management
   db.createUser({
     user: "hrapp",
     pwd: "strong-password",
     roles: [{ role: "readWrite", db: "hr-management" }]
   })
   ```

4. **Backup Strategy**
   - Set up automated daily backups
   - Test restore procedures
   - Store backups in separate location

---

## Backend Deployment

### Option 1: VPS/Cloud Server (AWS EC2, DigitalOcean, etc.)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 or higher)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Reverse Proxy)
sudo apt install nginx -y
```

#### Step 2: Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone <your-repo-url> hr-backend
cd hr-backend/server

# Install dependencies
npm install --production

# Create .env file
sudo nano .env
# Paste production environment variables

# Test application
npm start
# Verify it runs without errors, then stop (Ctrl+C)
```

#### Step 3: Configure PM2

```bash
# Start application with PM2
pm2 start server.js --name hr-api

# Configure PM2 to start on system boot
pm2 startup
pm2 save

# Monitor application
pm2 status
pm2 logs hr-api
pm2 monit
```

#### Step 4: Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/hr-api
```

Add configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/hr-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

#### Step 6: Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### Option 2: Docker Deployment

#### Dockerfile (Backend)

Create `server/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - EMAIL_HOST=${EMAIL_HOST}
      - EMAIL_PORT=${EMAIL_PORT}
      - EMAIL_USER=${EMAIL_USER}
      - EMAIL_PASSWORD=${EMAIL_PASSWORD}
    restart: unless-stopped
    depends_on:
      - mongodb

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secure-password
    restart: unless-stopped

volumes:
  mongodb_data:
```

Deploy with Docker:

```bash
docker-compose up -d
docker-compose logs -f
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended for React)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add `VITE_API_URL`

5. **Configure Domain**
   - Add custom domain in Vercel dashboard
   - Update DNS records as instructed

### Option 2: Netlify

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Or Deploy via Git**
   - Connect repository to Netlify
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables in Netlify dashboard

### Option 3: AWS S3 + CloudFront

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://hr-app-frontend
   aws s3 website s3://hr-app-frontend --index-document index.html
   ```

3. **Upload Build Files**
   ```bash
   aws s3 sync dist/ s3://hr-app-frontend
   ```

4. **Configure CloudFront**
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure SSL certificate
   - Set up custom domain

5. **Configure Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::hr-app-frontend/*"
       }
     ]
   }
   ```

### Option 4: Same Server as Backend

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Copy to Server**
   ```bash
   scp -r dist/* user@server:/var/www/hr-frontend/
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/hr-frontend;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # API proxy
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable SSL**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Post-Deployment Steps

### 1. Seed Initial Data

```bash
# SSH into backend server
cd /var/www/hr-backend/server
npm run seed
```

### 2. Verify Deployment

- [ ] Frontend loads correctly
- [ ] API health check: `https://api.yourdomain.com/api/health`
- [ ] Login functionality works
- [ ] MFA setup works
- [ ] Database connections stable
- [ ] Email notifications sending

### 3. Change Default Credentials

**Critical Security Step:**

1. Login with default admin credentials
2. Change admin password immediately
3. Update admin email
4. Set up MFA for admin account
5. Delete or disable demo accounts

### 4. Configure Monitoring

#### Application Monitoring

```bash
# PM2 Monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### Server Monitoring

- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure error alerting
- Monitor disk space
- Monitor memory usage
- Monitor CPU usage

#### Database Monitoring

- Enable MongoDB monitoring
- Set up backup alerts
- Monitor query performance
- Track connection pool

### 5. Backup Configuration

```bash
# Create backup script
sudo nano /usr/local/bin/backup-mongodb.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
mkdir -p $BACKUP_DIR

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-mongodb.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-mongodb.sh
```

### 6. Security Hardening

- [ ] Enable firewall (UFW)
- [ ] Disable root SSH login
- [ ] Use SSH keys instead of passwords
- [ ] Keep system updated
- [ ] Configure fail2ban
- [ ] Regular security audits
- [ ] Monitor access logs

```bash
# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/hr-backend
            git pull origin main
            cd server
            npm install --production
            pm2 restart hr-api

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build
        run: |
          npm install
          npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Rollback Procedure

If deployment fails:

### Backend Rollback

```bash
# SSH into server
cd /var/www/hr-backend
git log --oneline -n 5
git checkout <previous-commit-hash>
cd server
npm install --production
pm2 restart hr-api
```

### Frontend Rollback

**Vercel:**
```bash
vercel rollback
```

**Manual:**
```bash
# Redeploy previous build
cd /var/www/hr-frontend
git checkout <previous-commit-hash>
npm run build
# Copy dist files to web root
```

---

## Performance Optimization

### Backend Optimization

1. **Enable Compression**
   ```javascript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Database Indexing**
   - Ensure all indexes are created
   - Monitor slow queries

3. **Caching**
   - Implement Redis for session storage
   - Cache frequently accessed data

### Frontend Optimization

1. **Code Splitting**
   - Already configured with Vite
   - Lazy load routes

2. **CDN Configuration**
   - Use CloudFront or similar
   - Cache static assets

3. **Image Optimization**
   - Compress images
   - Use appropriate formats (WebP)

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor application logs
- Check error rates
- Verify backups completed

**Weekly:**
- Review system resources
- Check disk space
- Update dependencies (dev environment first)

**Monthly:**
- Security updates
- Performance review
- Backup restoration test
- SSL certificate check

### Update Procedure

1. Test updates in staging environment
2. Create database backup
3. Deploy during low-traffic period
4. Monitor for errors
5. Have rollback plan ready

---

## Support Contacts

- **Hosting Provider:** [Contact Info]
- **Domain Registrar:** [Contact Info]
- **Email Service:** [Contact Info]
- **Database Service:** [Contact Info]
- **SSL Certificate:** [Contact Info]

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database deployed and accessible
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] SSL certificates installed
- [ ] DNS configured correctly
- [ ] Default credentials changed
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] Firewall configured
- [ ] Email service tested
- [ ] All features tested in production
- [ ] Documentation updated
- [ ] Team notified of deployment
