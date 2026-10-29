<div align="center">
  <br />
    <a href="https://youtu.be/JiwTGGGIhDs" target="_blank">
      <img src="public/readme/readme-hero.webp" alt="Project Banner">
    </a>
  <br />

  <div>
<img src="https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=React&logoColor=black" />
<img src="https://img.shields.io/badge/-Typescript-3178C6?style=for-the-badge&logo=Typescript&logoColor=white" />
<img src="https://img.shields.io/badge/-Tailwind-06B6D4?style=for-the-badge&logo=Tailwind-CSS&logoColor=white" />
<img src="https://img.shields.io/badge/-Puter-A855F7?style=for-the-badge&logo=Puter&logoColor=white" /><br/>
<img src="https://img.shields.io/badge/-Claude-D97757?style=for-the-badge&logo=Anthropic&logoColor=white" />
<img src="https://img.shields.io/badge/-Gemini-4285F4?style=for-the-badge&logo=Google-Gemini&logoColor=white" />
<img src="https://img.shields.io/badge/-CodeRabbit-FF6600?style=for-the-badge&logo=CodeRabbit&logoColor=white" />

  </div>

  <h3 align="center">Roomify | AI-powered Architectural Visualization App</h3>

   <div align="center">
     Build this project step by step with our detailed tutorial on <a href="https://www.youtube.com/watch?v=XUkNR-JfHwo" target="_blank"><b>JavaScript Mastery</b></a> YouTube. Join the JSM family!
    </div>
</div>

## 📋 <a name="table">Table of Contents</a>

1. ✨ [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)
5. 🔗 [Assets](#links)
6. 🚀 [More](#more)

## 🚨 Tutorial

This repository contains the code corresponding to an in-depth tutorial available on our YouTube channel, <a href="https://www.youtube.com/@javascriptmastery/videos" target="_blank"><b>JavaScript Mastery</b></a>.

If you prefer visual learning, this is the perfect resource for you. Follow our tutorial to learn how to build projects like these step-by-step in a beginner-friendly manner!

<a href="https://youtu.be/JiwTGGGIhDs" target="_blank"><img src="https://github.com/sujatagunale/EasyRead/assets/151519281/1736fca5-a031-4854-8c09-bc110e3bc16d" /></a>

## <a name="introduction">✨ Introduction</a>

AI-powered architectural visualization SaaS built with React, TypeScript, and Puter. Use AI models from Claude to Gemini to transform 2D floor plans into photorealistic 3D renders with permanent hosting and persistent metadata. This project features 2D-to-3D photorealistic rendering, serverless workers, high-performance KV storage, and a global community feed.

If you're getting started and need assistance or face any bugs, join our active Discord community with over **50k+** members. It's a place where people help each other out.

<a href="https://discord.com/invite/n6EdbFJ" target="_blank"><img src="https://github.com/sujatagunale/EasyRead/assets/151519281/618f4872-1e10-42da-8213-1d69e486d02e" /></a>

## <a name="tech-stack">⚙️ Tech Stack</a>
- **[React](https://react.dev/)** is a popular JavaScript library for building user interfaces, specifically for creating single-page applications with a component-based architecture.

- **[Vite](https://vitejs.dev/)** is a next-generation frontend tool that provides an extremely fast development environment and optimized build process for modern web projects.

- **[TypeScript](https://www.typescriptlang.org/)** is a strongly typed superset of JavaScript that adds static types, helping developers catch errors early and write more maintainable code.

- **[TailwindCSS](https://tailwindcss.com/)** is a utility-first CSS framework that allows for rapid UI development by applying pre-defined classes directly in your markup.

- **[Puter](https://jsm.dev/roomify-puter)** is the underlying cloud computing platform and "Internet OS" that provides the infrastructure; including serverless Workers, permanent file storage, key-value (KV) databases, and hosted AI models.

- **[Puter.js](https://jsm.dev/roomify-puterjs)** is the official JavaScript SDK that allows developers to interact with those cloud services directly from the frontend.

- **[CodeRabbit](https://jsm.dev/roomify-coderabbit)** is an AI-powered code review platform that provides deep insights and automated suggestions to improve code quality and security.

- **[Junie by JetBRains](https://jsm.dev/roomify-junie)** is an AI-driven coding assistant integrated into the development environment to help automate complex logic, refactoring, and prompt engineering.

- **[Claude](https://www.anthropic.com/claude)** and **[Gemini](https://deepmind.google/technologies/gemini/)** are state-of-the-art large language models used to power the architectural transformation and image generation logic within the application.


## <a name="features">🔋 Features</a>
👉 **2D-to-3D Visualization**: Instant architectural rendering that transforms flat floor plans into photorealistic 3D models using state-of-the-art AI.

👉 **Persistent Media Hosting**: Permanent file storage that generates public URLs for every upload and output, ensuring your renders are always accessible.

👉 **Dynamic Project Gallery**: A personalized workspace that tracks your history of visualizations with instant loading and metadata persistence.

👉 **Side-by-Side Comparison**: Interactive tools designed to visualize the direct transformation from a source architectural sketch to its AI-rendered counterpart.

👉 **Global Community Feed**: A public discovery engine where users share their architectural projects with the world in a single click.

👉 **Privacy Controls**: Granular public and private toggles that give users full authority over the visibility and security of their architectural data.

👉 **Ownership Mapping**: A clean metadata system that tracks project details and user IDs across the entire platform for seamless account management.

👉 **Modern Export Functionality**: High-performance tools to download and move AI-generated renders into real-world presentations and workflows.


And many more, including code architecture and reusability.

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)

**Cloning the Repository**

```bash
git clone https://github.com/adrianhajdin/roomify
cd roomify
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Copy `.env.example` to `.env` and fill in at least:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_google_ai_studio_key
SESSION_SECRET=a_long_random_string
```

Get a Gemini key at [Google AI Studio](https://aistudio.google.com/apikey). To use OpenAI instead, set `AI_PROVIDER=openai` and `OPENAI_API_KEY`.

**Running the Project**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser, create an account and upload a floor plan.

## 🖥️ Self-hosting

The app runs entirely on your own server: no Puter or other third-party backend.

- **Accounts**: email + password, stored in a local SQLite database, with signed session cookies.
- **Storage**: uploaded floor plans and renders are saved on disk (`DATA_DIR`, `/data` in Docker). Projects are private by default.
- **AI**: rendering runs on the server with your own API key (Gemini `gemini-3.1-flash-lite-image` by default, or OpenAI `gpt-image-1`). The key never reaches the browser.

Run it with Docker:

```bash
cp .env.example .env   # then fill in GEMINI_API_KEY and SESSION_SECRET
docker compose up -d --build
```

The app listens on port 3000; put it behind a reverse proxy with HTTPS (e.g. Caddy or nginx). Login cookies are HTTPS-only in production. All data lives in the `roomify-data` volume, so back it up. After creating your own account you can set `ALLOW_REGISTRATION=false` to close sign-ups.

### Coolify

`docker-compose.coolify.yml` is the same stack without a published port (Coolify's proxy handles the domain and HTTPS).

1. New Resource → Public Repository `https://github.com/MichaelChlubna/roomify`, branch `main`, Build Pack **Docker Compose**, Docker Compose Location `/docker-compose.coolify.yml`.
2. Set the `web` service domain with the container port, e.g. `https://fotky.bytynadlani.cz:3000`.
3. Environment variables: `GEMINI_API_KEY` (required; `SESSION_SECRET` is generated by Coolify), optionally `AI_PROVIDER`, `OPENAI_API_KEY`, `ALLOW_REGISTRATION`.
4. Data stays in the `roomify-data` volume across redeploys.

Requires Node.js 22.13+ when running without Docker (uses the built-in `node:sqlite`).

## <a name="links">🔗 Assets</a>

Assets and snippets used in the project can be found in the **[video kit](https://jsmastery.com/video-kit/ee3ef6c2-95f4-4992-a3ea-5edd4ac3ca7c)**.

<a href="https://jsmastery.com/video-kit/ee3ef6c2-95f4-4992-a3ea-5edd4ac3ca7c" target="_blank">
  <img src="public/readme/readme-videokit.webp" alt="Video Kit Banner">
</a>

## <a name="more">🚀 More</a>

**Advance your skills with Next.js Pro Course**

Enjoyed creating this project? Dive deeper into our PRO courses for a richer learning adventure. They're packed with
detailed explanations, cool features, and exercises to boost your skills. Give it a go!

<a href="https://jsm.dev/roomify-jsm" target="_blank">
  <img src="public/readme/readme-jsmpro.webp" alt="Project Banner">
</a>
