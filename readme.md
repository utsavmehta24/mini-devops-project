# Mini DevOps Project — Docker CI/CD Pipeline

**Author:** [Utsav Mehta](https://utsavmehta24.github.io/utsavmehta/)  
**Role:** DevOps / AI & Data Science Developer  
**GitHub:** [@utsavmehta24](https://github.com/utsavmehta24)  
**Docker Hub:** [rockingut](https://hub.docker.com/u/rockingut)  
**Live Image:** [rockingut/devops-flask:latest](https://hub.docker.com/r/rockingut/devops-flask)  
**Repository:** [github.com/utsavmehta24/mini-devops-project](https://github.com/utsavmehta24/mini-devops-project)

---

## What is this project? (In simple words)

Imagine you write code on your laptop and want it to run on the internet for anyone to see. Normally you would:

1. Copy files manually to a server  
2. Install Python and libraries  
3. Start the app  
4. Repeat all of this every time you change something  

That is slow, error-prone, and hard to repeat.

**This project solves that problem.**

It is a small **Flask web app** (a portfolio site with a 3D CI/CD visualization) packaged inside **Docker** (a box that contains everything the app needs). Whenever code is pushed to GitHub, a robot called **GitHub Actions** automatically:

1. Builds the Docker box  
2. Publishes it to **Docker Hub** (a public library of Docker images)  

After that, anyone — including you — can run the app with one command:

```bash
docker pull rockingut/devops-flask:latest
docker run -d -p 5000:5000 --name flask-app rockingut/devops-flask:latest
```

Open [http://localhost:5000](http://localhost:5000) and the app is live.

---

## Why is this important?

| Problem (without DevOps) | Solution (this project) |
|--------------------------|---------------------------|
| "It works on my machine" but breaks on the server | Docker runs the same environment everywhere |
| Manual copy-paste deployments | Push to GitHub → image builds automatically |
| No one knows if the app is healthy | `/health` endpoint returns `OK` for monitoring |
| Hard to share your work | Public Docker image anyone can pull and run |
| Portfolio only on GitHub | Live demo app you can deploy in minutes |

This project demonstrates real **DevOps skills** that companies look for:

- **Containerization** (Docker)  
- **Continuous Integration** (automated build on every push)  
- **Image registry** (Docker Hub as artifact storage)  
- **Production web server** (Gunicorn instead of Flask dev server)  
- **Health checks** (for load balancers and monitoring)

---

## What does the app do when you run it?

When the Docker container starts, you get a **portfolio website** that explains CI/CD visually.

| What you open | What you see |
|---------------|--------------|
| `http://localhost:5000/` | Main page — "The Code Factory" with interactive 3D pipeline (Code → Build → Test → Deploy) |
| `http://localhost:5000/health` | Plain text `OK` — proves the server is alive |
| `http://localhost:5000/api/info` | JSON data feeding the 3D UI (pipeline steps, why/how explanations) |

**Think of it like this:**

- **`/`** = the showroom (what visitors see)  
- **`/health`** = the heartbeat monitor (is the app running?)  
- **`/api/info`** = the data behind the 3D animation  

---

## How everything fits together

```
You write code on your laptop
        ↓
Push to GitHub (main branch)
        ↓
GitHub Actions wakes up automatically
        ↓
  1. Downloads your code
  2. Logs into Docker Hub (using secret passwords)
  3. Builds a Docker image
  4. Pushes image to Docker Hub
        ↓
Image is ready: rockingut/devops-flask:latest
        ↓
Anyone pulls and runs it on any server
```

**Current scope:** The pipeline builds and publishes the image. Deploying to a cloud server is a **manual one-liner** (documented below). An earlier version tried auto-deploy to AWS EC2 via SSH, but that step was removed because the server was unreachable from GitHub Actions.

---

## How we built it — file by file

Every file in this repo has a specific job. Here is what each one does and why it exists.

### 1. `app.py` — The brain (Flask backend)

**What it does:** Defines three web routes.

```python
/          → Shows the HTML portfolio page
/health    → Returns "OK" (for health checks)
/api/info  → Returns JSON about the CI/CD pipeline
```

**Why we made it:** Flask is lightweight and perfect for a demo app. The `/health` route lets monitoring tools (or future CI steps) verify the app is running. The `/api/info` route powers the interactive 3D UI without hard-coding text in JavaScript.

**How we use it:** Gunicorn loads `app:app` (the `app` variable inside `app.py`) and serves it on port 5000.

---

### 2. `templates/index.html` — The face (web page)

**What it does:** The HTML page visitors see — header with your name, 3D canvas area, info panel, tech stack pills, and footer.

**Why we made it:** This is your **DevOps portfolio piece**. It shows recruiters and teammates not just code, but a live visual explanation of how CI/CD works.

**Links included:**
- [GitHub — utsavmehta24](https://github.com/utsavmehta24)
- [Portfolio — utsavmehta24.github.io/utsavmehta](https://utsavmehta24.github.io/utsavmehta/)

---

### 3. `static/main.js` — The 3D animation (Three.js)

**What it does:**
- Fetches data from `/api/info`
- Renders an interactive 3D "Code Factory" scene with stations: Code, Build, Test, Deploy
- Populates the side panel with "What I Built", "Why It Matters", "How It Works", "Future Vision"

**Why we made it:** Makes the project memorable. Instead of a plain README, visitors **experience** the pipeline.

**What it lists as built:**
- Flask-based portfolio app (this site)
- Interactive 3D CI/CD pipeline using Three.js
- GitHub Actions CI workflow + Dockerfile

---

### 4. `static/style.css` — The design (look and feel)

**What it does:** Colors, fonts, 3D card effects, responsive layout, dark theme styling.

**Why we made it:** Professional presentation matters for portfolio projects.

---

### 5. `requirements.txt` — Python dependencies

```
Flask>=2.0
gunicorn
```

**What it does:** Tells pip which Python packages to install inside Docker.

**Why two packages only:**
- **Flask** — web framework  
- **Gunicorn** — production-grade server (Flask's built-in server is not safe for production)

---

### 6. `Dockerfile` — The recipe (how to build the container)

**What it does step by step:**

| Step | Command | Meaning |
|------|---------|---------|
| 1 | `FROM python:3.10-slim` | Start from a small Linux + Python base image |
| 2 | `WORKDIR /app` | All commands run inside `/app` folder |
| 3 | `COPY requirements.txt .` | Copy dependency list first (Docker caching trick) |
| 4 | `RUN pip install ...` | Install Flask and Gunicorn |
| 5 | `COPY . .` | Copy all project files into the image |
| 6 | `ENV FLASK_APP=app.py` | Tell Flask which file is the app |
| 7 | `CMD ["gunicorn", ...]` | When container starts, run Gunicorn on port 5000 |

**Why we made it:** Without Docker, every server would need Python, pip, and manual setup. With Docker, the image **is** the entire environment.

**Known improvement:** Add a `.dockerignore` file to exclude `.git` and dev files from the image (they currently get copied in).

---

### 7. `.github/workflows/deploy.yml` — The automation robot (CI pipeline)

**What it does:** Runs automatically on every push to the `main` branch.

| Step | What happens |
|------|--------------|
| Checkout code | GitHub downloads your repo onto a fresh Ubuntu machine |
| Login to Docker Hub | Uses secret credentials (`DOCKER_USERNAME`, `DOCKER_PASSWORD`) |
| Build & Push | Runs `docker build` and `docker push rockingut/devops-flask:latest` |
| Success message | Prints pull/run instructions in the Actions log |

**Why we made it:** This is the core DevOps value — **zero manual steps** to build and publish after you push code.

**Secrets required (stored in GitHub, never in code):**

| Secret name | Value |
|-------------|-------|
| `DOCKER_USERNAME` | `rockingut` |
| `DOCKER_PASSWORD` | Docker Hub access token (not your login password in plain text) |

**How to add secrets:**  
Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

---

### 8. `start-docker.bat` — Windows helper script

**What it does:** A batch file for Windows users to start a local container quickly.

**Why we made it:** Makes local testing easier on Windows without typing long Docker commands every time.

---

## How we verified this project works

We did not just assume it works — we tested it end to end:

1. **Pulled the live image from Docker Hub**
   ```bash
   docker pull rockingut/devops-flask:latest
   ```

2. **Ran the container**
   ```bash
   docker run -d -p 5001:5000 --name devops-flask-test rockingut/devops-flask:latest
   ```

3. **Checked all endpoints**
   - `GET /` → HTTP 200, portfolio HTML loaded  
   - `GET /health` → returned `OK`  
   - `GET /api/info` → returned JSON with pipeline steps  

4. **Inspected the image contents**
   - Python 3.10, Flask 3.1.3, Gunicorn 26.0.0  
   - Gunicorn starts with 2 workers on port 5000  
   - All app files present inside `/app`

5. **Checked GitHub Actions history**
   - Earlier runs failed on EC2 SSH deploy (`dial tcp :22: i/o timeout`)  
   - After removing EC2 deploy and keeping Docker-only CI, the pipeline turned green  
   - Latest successful push matches the Docker Hub "last pushed ~23 hours ago" timestamp

**Conclusion:** The CI pipeline works. The image on Docker Hub is real, runnable, and matches this repository.

---

## Project journey — what we learned

| Phase | What we tried | Result |
|-------|---------------|--------|
| **Phase 1** | Full CI/CD with auto-deploy to AWS EC2 via SSH | Failed — GitHub Actions could not reach EC2 on port 22 |
| **Phase 2** | Added diagnostics, health checks, troubleshooting | Still failed at SSH connection step |
| **Phase 3** | Simplified to Docker build + push only | **Success** — reliable green pipeline |
| **Phase 4** | Verified image on Docker Hub by pulling and running locally | Confirmed app works end to end |

**Lesson:** A working partial pipeline beats a broken full pipeline. Build and publish first; automate server deploy once networking and secrets are solid.

---

## Tech stack

| Layer | Technology | Why we chose it |
|-------|------------|-----------------|
| Backend | Flask (Python) | Simple, fast to build, great for demos |
| Frontend | HTML + CSS + Three.js | Interactive 3D without a heavy framework |
| Container | Docker | Same app runs everywhere |
| CI/CD | GitHub Actions | Free, built into GitHub, industry standard |
| Registry | Docker Hub (`rockingut`) | Public image sharing, easy `docker pull` |
| Production server | Gunicorn | Handles multiple requests, production-ready |
| Base image | `python:3.10-slim` | Small, secure, widely used |

---

## Quick start

### Option A — Run the published image (fastest)

```bash
docker pull rockingut/devops-flask:latest
docker run -d -p 5000:5000 --name flask-app rockingut/devops-flask:latest
```

Open [http://localhost:5000](http://localhost:5000)

### Option B — Build from source

```bash
git clone https://github.com/utsavmehta24/mini-devops-project.git
cd mini-devops-project
docker build -t devops-flask:latest .
docker run -d -p 5000:5000 --name flask-app devops-flask:latest
```

### Check health

```bash
curl http://localhost:5000/health
```

Expected: `OK`

---

## Deploy to any server (manual)

After CI pushes the image, deploy anywhere with Docker installed:

```bash
# On your server (AWS EC2, DigitalOcean, Linode, etc.)
docker pull rockingut/devops-flask:latest
docker stop flask-app 2>/dev/null || true
docker rm flask-app 2>/dev/null || true
docker run -d --name flask-app -p 80:5000 --restart unless-stopped rockingut/devops-flask:latest

# Verify
docker ps
curl http://localhost/health
```

**Cloud platforms (Render, Railway, Fly.io):** Connect this GitHub repo and choose Docker deployment — they build or pull and run automatically.

---

## API reference

| Endpoint | Method | Response | Use case |
|----------|--------|----------|----------|
| `/` | GET | HTML page | Portfolio + 3D visualization |
| `/health` | GET | `OK` (text) | Monitoring, load balancer checks |
| `/api/info` | GET | JSON | Powers the 3D UI panels |

---

## Useful Docker commands

```bash
# View logs
docker logs flask-app

# Follow logs live
docker logs -f flask-app

# Stop / start / remove
docker stop flask-app
docker start flask-app
docker rm flask-app

# List running containers
docker ps

# List all images
docker images
```

---

## About the author

**Utsav Mehta** — B.E. Artificial Intelligence & Data Science student at Dr. D. Y. Patil Institute of Technology, Pune. Passionate about AI, web development, cloud (AWS), and DevOps.

| Platform | Link |
|----------|------|
| Portfolio | [utsavmehta24.github.io/utsavmehta](https://utsavmehta24.github.io/utsavmehta/) |
| GitHub | [github.com/utsavmehta24](https://github.com/utsavmehta24) |
| Docker Hub | [hub.docker.com/u/rockingut](https://hub.docker.com/u/rockingut) |
| Email | utsavmehta24072003@gmail.com |

**Certifications:** AWS Cloud Practitioner Essentials, TensorFlow for Deep Learning, AWS Educate Cloud 101, AWS Introduction to Generative AI, and more.

**Experience:** Network Executive Intern at Vardhman Info Services (Dec 2024 – May 2025) — networking, troubleshooting, and AWS cloud infrastructure.

---

## Future enhancements

- [ ] Add automated tests in CI (pytest + health check after `docker build`)
- [ ] Add `.dockerignore` to keep images lean (exclude `.git`, dev files)
- [ ] Tag images with commit SHA or version (not only `latest`)
- [ ] Re-add automated deploy once EC2/networking is configured correctly
- [ ] Add security scanning (Trivy / Docker Scout)
- [ ] Kubernetes deployment manifests
- [ ] Update website copy to match current Docker-only pipeline

---

## License

MIT License — free to use for learning and development.

---

**Built with Flask + Three.js + Docker + GitHub Actions by [Utsav Mehta](https://github.com/utsavmehta24)**
