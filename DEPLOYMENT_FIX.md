# CI/CD Deployment Fix - Diagnosis & Solution

## Problem Summary
Your GitHub Actions workflow stopped working after changes to templates and static files. The Docker build succeeds locally, but the EC2 deployment is failing.

## Root Causes Identified

### 1. **Port 80 Already Allocated** ⚠️ MAIN ISSUE
The EC2 instance has a container or service already using port 80. The workflow tries to stop the container named "flask" but if there's another container using port 80 (or the old container has a different name), it will fail.

### 2. **Health Check Timing Issue**
The original workflow runs `curl -f http://localhost/health` immediately after starting the container, which doesn't give the Flask app enough time to start up with gunicorn.

### 3. **Missing Error Handling**
If the health check fails, there's no logging or retry mechanism to diagnose the issue.

### 4. **No Container Restart Policy**
The container doesn't have a restart policy, so if it crashes, it won't automatically recover.

## Solution Applied

I've updated `.github/workflows/deploy.yml` with the following improvements:

### Changes Made:

1. **Force Clean Port 80**: Finds and removes ANY container using port 80
2. **Added Startup Wait Time**: 5-second delay before health checks
3. **Retry Logic**: 10 attempts with 3-second intervals
4. **Container Restart Policy**: `--restart unless-stopped`
5. **Better Error Logging**: Shows container logs if health check fails
6. **Container Status Check**: Verifies container is running before health check

## Testing Locally

Your app builds and runs successfully:
```bash
✅ Docker build: SUCCESS
✅ Health endpoint: Returns "OK" with status 200
✅ Static files: Loaded correctly
✅ Templates: Rendering properly
```

## Next Steps

### 1. Push Changes to GitHub
```bash
git add .github/workflows/deploy.yml
git commit -m "Fix: Improve EC2 deployment with retry logic and better error handling"
git push origin main
```

### 2. Monitor the Workflow
- Go to GitHub Actions tab
- Watch the deployment run
- Check the "Deploy on EC2 via SSH" step for detailed logs

### 3. If It Still Fails

Check these on your EC2 instance:

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Check if Docker is running
sudo systemctl status docker

# Check container logs
docker logs flask

# Check if port 80 is available
sudo netstat -tulpn | grep :80

# Manually test the deployment
docker pull rockingut/devops-flask:latest
docker stop flask || true
docker rm flask || true
docker run -d --name flask -p 80:5000 --restart unless-stopped rockingut/devops-flask:latest
sleep 5
curl http://localhost/health
```

### 4. Common Issues & Fixes

**Issue**: Port 80 already in use
```bash
# Find what's using port 80
sudo lsof -i :80
# Stop it or use a different port
```

**Issue**: Docker permission denied
```bash
# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu
# Logout and login again
```

**Issue**: Container starts but crashes
```bash
# Check logs
docker logs flask
# Common causes: missing dependencies, wrong port binding
```

## Verification

After deployment succeeds, verify:

1. **Health Check**: `curl http://your-ec2-ip/health` should return "OK"
2. **Main Page**: Visit `http://your-ec2-ip` in browser
3. **Static Files**: Check browser console for any 404 errors
4. **3D Visualization**: Ensure Three.js loads and renders correctly

## Files Modified

- `.github/workflows/deploy.yml` - Enhanced deployment script with retry logic

## No Changes Needed

Your application code is working correctly:
- ✅ `app.py` - Flask routes are correct
- ✅ `Dockerfile` - Build configuration is proper
- ✅ `requirements.txt` - Dependencies are correct
- ✅ `templates/index.html` - Template is valid
- ✅ `static/main.js` - JavaScript is functional
- ✅ `static/style.css` - CSS is valid
