# 🚀 Docker CI/CD Pipeline (Mini DevOps Project)

This project demonstrates a CI/CD workflow where a Flask application is containerized with Docker and automatically built and pushed to Docker Hub using GitHub Actions.  
Any push to the `main` branch triggers an automated build and push to Docker Hub.

---

## 🔗 Docker Hub
- Image: [rockingut/devops-flask:latest](https://hub.docker.com/r/rockingut/devops-flask)

---

## 🧰 Tech Stack
- Backend: Flask (Python)
- Containerization: Docker
- CI/CD: GitHub Actions
- Registry: Docker Hub
- Production Server: Gunicorn

---

## ✨ Features
- Dockerized Flask application with Gunicorn  
- Automated CI/CD on every push to `main`  
- Secure Docker Hub credentials using GitHub Secrets  
- Health check endpoint (`/health`)  
- Production-ready Docker image  
- Interactive 3D visualization of CI/CD pipeline  

---

## 🏗 Architecture (High Level)

Developer → GitHub (push)  
→ GitHub Actions (CI/CD)  
→ Docker Build & Test  
→ Docker Hub (image registry)  
→ Ready for deployment anywhere

---

## ⚙️ How CI/CD Works
1. Push code to `main`
2. GitHub Actions:
   - Checks out code  
   - Logs into Docker Hub  
   - Builds Docker image  
   - Pushes image to Docker Hub  
3. Docker image is available for deployment on any server

---

## 🐳 Local Setup

### Option 1: Run from Docker Hub
```bash
docker pull rockingut/devops-flask:latest
docker run -d -p 5000:5000 --name flask-app rockingut/devops-flask:latest
```

### Option 2: Build from Source
```bash
git clone https://github.com/utsavmehta24/mini-devops-project.git
cd mini-devops-project
docker build -t devops-flask:latest .
docker run -d -p 5000:5000 --name flask-app devops-flask:latest
```

Open: [http://localhost:5000](http://localhost:5000)

### Check Health
```bash
curl http://localhost:5000/health
```

Expected response: `OK`

---

## 🌐 Deploy to Any Server

### Deploy on a VPS/Cloud Server
```bash
# SSH into your server
ssh user@your-server-ip

# Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Pull and run the image
docker pull rockingut/devops-flask:latest
docker stop flask-app 2>/dev/null || true
docker rm flask-app 2>/dev/null || true
docker run -d --name flask-app -p 80:5000 --restart unless-stopped rockingut/devops-flask:latest

# Verify it's running
docker ps
curl http://localhost/health
```

### Deploy on Cloud Platforms

**AWS EC2 / DigitalOcean / Linode:**
```bash
docker pull rockingut/devops-flask:latest
docker run -d -p 80:5000 --name flask-app --restart unless-stopped rockingut/devops-flask:latest
```

**Render / Railway / Fly.io:**
- Connect your GitHub repository
- Set Docker deployment
- Deploy automatically from `main` branch

---

## 🔁 Version Management & Rollback

Use versioned tags for better control:

```bash
# Build with version tag
docker build -t rockingut/devops-flask:v1.0.0 .
docker push rockingut/devops-flask:v1.0.0

# Deploy specific version
docker run -d -p 5000:5000 rockingut/devops-flask:v1.0.0

# Rollback to previous version
docker stop flask-app && docker rm flask-app
docker run -d --name flask-app -p 5000:5000 rockingut/devops-flask:v1.0.0
```

---

## 🔐 GitHub Actions Secrets

Required secrets in your GitHub repository:

* `DOCKER_USERNAME` - Your Docker Hub username
* `DOCKER_PASSWORD` - Your Docker Hub password or access token

To set up:
1. Go to your repository → Settings → Secrets and variables → Actions
2. Add new repository secrets with the names above

---

## 📦 Docker Image Details

- Base Image: `python:3.10-slim`
- Web Server: Gunicorn with 2 workers
- Port: 5000
- Health Check: `/health` endpoint
- Auto-restart: Enabled with `--restart unless-stopped`

---

## 🧪 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main page with 3D CI/CD visualization |
| `/health` | GET | Health check endpoint (returns "OK") |
| `/api/info` | GET | CI/CD pipeline information (JSON) |

---

## 📌 Project Highlights

* ✅ Built automated CI/CD pipeline using GitHub Actions
* ✅ Containerized Flask application with Docker
* ✅ Published to Docker Hub for easy deployment
* ✅ Production-ready with Gunicorn web server
* ✅ Health check endpoint for monitoring
* ✅ Interactive 3D visualization of DevOps pipeline
* ✅ Can be deployed on any cloud platform or VPS

---

## 🛠️ Useful Commands

```bash
# View container logs
docker logs flask-app

# Follow logs in real-time
docker logs -f flask-app

# Stop container
docker stop flask-app

# Start container
docker start flask-app

# Remove container
docker rm flask-app

# View all containers
docker ps -a

# View images
docker images

# Remove old images
docker image prune -a
```

---

## 📝 Future Enhancements

- [ ] Add automated testing in CI/CD pipeline
- [ ] Implement semantic versioning for Docker tags
- [ ] Add database integration (PostgreSQL/MongoDB)
- [ ] Set up monitoring with Prometheus & Grafana
- [ ] Add Kubernetes deployment manifests
- [ ] Implement blue-green deployment strategy
- [ ] Add security scanning with Trivy or Snyk

---

## 📄 License

MIT License - Feel free to use this project for learning and development!
