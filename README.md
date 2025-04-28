# PET Stack Boilerplate

A modern full-stack starter template using the **PET Stack**:

- **PostgreSQL** – Database
- **Express (Node.js + TypeScript)** – Backend API
- **Traefik** – Reverse Proxy / Load Balancer
- **React + Vite** – Frontend SPA
- **Docker Compose** – Orchestration
- **Hetzner Cloud** – Hosting (via `hcloud` CLI)
- **Fabric** – Deployment Automation (`fabfile.py`)
- **Zero-downtime deployments** – Powered by `docker-rollout`

---

## ✨ Why PET Stack?

- **Simple yet powerful**: Clean separation of frontend, backend, and services.
- **Production-ready**: Out-of-the-box support for HTTPS, Load Balancing, Scaling.
- **Zero Downtime**: Thanks to Traefik and docker-rollout strategies.
- **Cloud-agnostic**: Designed for Hetzner but easy to port to any VPS or server.

---

## 🛠 Tech Overview

| Layer             | Tech                                                                 |
|-------------------|----------------------------------------------------------------------|
| Frontend          | React + Vite                                                         |
| Backend           | Express (Node.js) + TypeScript                                        |
| Database          | PostgreSQL                                                           |
| Proxy / Load Balancer | Traefik                                                          |
| Containerization  | Docker + Docker Compose                                              |
| Deployment        | Fabric + Hetzner CLI + docker-rollout                                |

---

## 🚀 Quick Start

```bash
# Clone the boilerplate
git clone https://github.com/yourname/pet-stack-boilerplate.git
cd pet-stack-boilerplate

# Spin up local environment
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# Traefik Dashboard: http://localhost:8081
```

---

## 📦 Features

- Full TypeScript support (backend)
- React 18 + Vite 5 blazing fast frontend
- Ready-to-use PostgreSQL setup
- Traefik with automatic SSL + Let's Encrypt integration
- Docker Compose orchestration for local and production
- Fabric scripts for easy server provisioning and deployments
- Hetzner optimized (cheap & fast cloud)

---

## 🧹 TODOs

- [ ] Add CI/CD templates (GitHub Actions)
- [ ] Add basic monitoring (Prometheus + Grafana)
- [ ] Add Redis support (optional cache layer)
- [ ] Add user authentication template (JWT/OAuth2)

---

Made with 🚀 by [AstroMVP](https://astromvp.com)
