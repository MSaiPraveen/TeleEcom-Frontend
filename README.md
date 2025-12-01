# TeleEcom Frontend

A modern e-commerce frontend built with React, Vite, and Tailwind CSS.

## 🚀 Features

- Modern UI with Tailwind CSS
- Dark mode support
- Responsive design
- Product browsing and search
- Shopping cart
- User authentication
- Admin product management
- Order management

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional, for containerized deployment)

## 🛠️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/MSaiPraveen/TeleEcom-Frontend.git
cd TeleEcom-Frontend
```

### 2. Configure environment variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# VITE_BASE_URL - Your backend API URL
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🐳 Docker Deployment

### Build the Docker image

```bash
docker build -t teleecom-frontend .
```

### Run with Docker

```bash
docker run -d -p 80:80 teleecom-frontend
```

### Run with Docker Compose (Full Stack)

This frontend is designed to work with the [TeleEcom Backend](https://github.com/MSaiPraveen/SpringTeleEcom). See the backend repository for the full docker-compose setup.

## 📁 Project Structure

```
├── public/              # Static assets
├── src/
│   ├── assets/          # Images and media
│   ├── components/
│   │   ├── auth/        # Login, Register pages
│   │   ├── layout/      # Navbar, Footer
│   │   ├── pages/       # Main pages (Home, Cart, Product, etc.)
│   │   └── ui/          # Reusable UI components
│   ├── Context/         # React Context for state management
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── Dockerfile           # Docker build configuration
├── nginx.conf           # Nginx configuration for production
└── .env.example         # Example environment variables
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BASE_URL` | Backend API URL | `http://localhost:8080` |

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
