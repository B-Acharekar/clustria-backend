# 🚀 Clustria Core Backend (Express.js)

The **Clustria Core Backend** is the central API layer that powers the Clustria productivity platform. It serves as the main gateway, handling user authentication, routing, file upload management, and microservice orchestration.

---

## 📌 Features

- ✅ User authentication (JWT-based)
- ✅ File and folder management
- ✅ Microservice routing (AI auto-organizer, file encryption, etc.)
- ✅ Scalable and modular Express architecture
- ✅ Environment-based config support
- ✅ Future support for Docker & CI/CD

---

## 📁 Project Structure

```

clustria-backend/
├── app.js                # Main entry point
├── routes/               # All route handlers
├── controllers/          # Business logic layer
├── services/             # External integrations or reusable logic
├── models/               # (Optional) DB schemas if used
├── config/               # App configuration, env setup
├── utils/                # Helper functions, middleware, constants
├── .env                  # Environment variables
├── .gitignore
└── README.md

````

---

## 🧑‍💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/clustria-backend.git
cd clustria-backend
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
cp .env.example .env
# Then edit the values inside .env
```

### 4. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:3000/` (by default)

---

## 🌐 Connected Microservices

This backend communicates with multiple microservices, each hosted as a separate repository:

| Microservice        | Tech Stack | Description                         |
| ------------------- | ---------- | ----------------------------------- |
| AI Organizer        | Flask (Py) | Auto-categorizes files using AI/NLP |
| File Encryptor      | Node/Go    | Secure file encryption via ZKE      |
| Notification Engine | Node.js    | Email & in-app notifications        |

---

## 🔐 Environment Variables

Create a `.env` file and include variables such as:

```env
PORT=3000
JWT_SECRET=your_jwt_secret
AI_SERVICE_URL=http://localhost:5000
```

---

## ✅ Scripts

| Command       | Description                |
| ------------- | -------------------------- |
| `npm start`   | Starts server (prod)       |
| `npm run dev` | Starts with nodemon (dev)  |
| `npm test`    | Runs tests (if configured) |

---

## 📌 Todo / Roadmap

* [ ] Connect with AI organizer microservice
* [ ] Add Redis for caching (optional)
* [ ] Rate limiting & security enhancements
* [ ] Add Swagger API docs
* [ ] Dockerize the backend
* [ ] CI/CD via GitHub Actions

---

## 🤝 Contributing

1. Fork this repo
2. Create a new branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push: `git push origin feature-name`
5. Create Pull Request

