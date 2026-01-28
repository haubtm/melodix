# Melodix - Music Streaming Platform

Melodix is a comprehensive music streaming application built with modern web technologies, designed to provide a seamless high-quality audio experience.

## 🚀 Project Overview

This repository contains the source code for the Melodix platform.

### 📂 Structure

- **[backend](./backend)**: The RESTful API server built with **NestJS**. Handles user authentication, music management, artist portals, and streaming logic.
- **docs**: Documentation for design, database, and deployment.

### 🛠 Tech Stack

- **Backend**: NestJS, TypeScript, Prisma ORM.
- **Database**: MariaDB 10.11.
- **Cache**: Redis.
- **Storage**: AWS S3 (for audio and image assets).
- **Infrastructure**: Docker, AWS EC2, Nginx, GitHub Actions (CI/CD).

## 📄 Documentation

- [Backend API Documentation (Swagger)](https://api.melodix.lebahau.site/docs)
- [Deployment Guide](./docs/deployment_guide_ec2_docker.md)
- [Database Design](./docs/database-design.md)

## 🌐 Live Demo

- **API Endpoint**: [https://api.melodix.lebahau.site](https://api.melodix.lebahau.site)
