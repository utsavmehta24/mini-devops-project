# 🚀 AWS EC2 + Docker Deployment with CI/CD (Mini DevOps Project)

This project demonstrates an end-to-end DevOps workflow where a Flask application is containerized with Docker and automatically deployed to an AWS EC2 instance using GitHub Actions CI/CD.  
Any push to the `main` branch triggers a build, pushes the image to Docker Hub, deploys to EC2, runs a health check, and updates the live app.

---

## 🔗 Live Demo
- Public URL: http://[<YOUR_EC2_PUBLIC_IP>](http://65.0.177.131)
- Health Check: http://[<YOUR_EC2_PUBLIC_IP>](http://65.0.177.131)/health


---

## 🧰 Tech Stack
- Backend: Flask (Python)
- Containerization: Docker
- Cloud: AWS EC2 (Free Tier)
- CI/CD: GitHub Actions
- Registry: Docker Hub
- OS: Ubuntu (EC2)

---

## ✨ Features
- Dockerized Flask application  
- Automated CI/CD on every push to `main`  
- Secure secrets using GitHub Actions  
- Health check endpoint (`/health`)  
- Zero-downtime redeploy (stop old container, run new)  
- Manual rollback using tagged images  

---

## 🏗 Architecture (High Level)

Developer → GitHub (push)  
→ GitHub Actions (CI/CD)  
→ Docker Hub (image)  
→ AWS EC2 (pull & run container)  
→ Public IP (Live App)

---

## ⚙️ How CI/CD Works
1. Push code to `main`
2. GitHub Actions:
   - Logs into Docker Hub  
   - Builds Docker image  
   - Pushes image to Docker Hub  
   - SSHs into EC2  
   - Pulls latest image  
   - Restarts container  
   - Runs health check (`/health`)  
3. App is live with latest changes

---

## 🐳 Local Setup (Optional)
```bash
git clone <your-repo-url>
cd mini-devops-project
docker build -t rockingut/devops-flask:latest .
docker run -d -p 5000:5000 rockingut/devops-flask:latest
````

Open: [http://localhost:5000](http://localhost:5000)

---

## ☁️ EC2 Deployment (Manual – for reference)

```bash
docker pull rockingut/devops-flask:latest
docker stop flask || true
docker rm flask || true
docker run -d --name flask -p 80:5000 rockingut/devops-flask:latest
```

---

## 🔁 Rollback Strategy

Use versioned tags instead of `latest`:

```bash
docker build -t rockingut/devops-flask:v1 .
docker push rockingut/devops-flask:v1

docker build -t rockingut/devops-flask:v2 .
docker push rockingut/devops-flask:v2
```

Rollback on EC2:

```bash
docker stop flask
docker rm flask
docker run -d --name flask -p 80:5000 rockingut/devops-flask:v1
```

---

## 🔐 GitHub Actions Secrets

* DOCKER_USERNAME
* DOCKER_PASSWORD
* EC2_HOST
* EC2_KEY

---

## 🧪 Health Check

```bash
curl http://<YOUR_EC2_PUBLIC_IP>/health
```

Expected response:

```
OK
```

---

## 📌 Resume-Ready Highlights

* Deployed Dockerized Flask app on AWS EC2 (Free Tier)
* Built CI/CD pipeline using GitHub Actions for automated build & deploy
* Implemented health checks and manual rollback using versioned images
* Secured credentials with GitHub Secrets and SSH-based deployment

---

## 📝 License

MIT