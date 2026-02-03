# RTGS AI Assistant App

A comprehensive AI-powered digital assistant for government officers in Andhra Pradesh, featuring intelligent scheduling, task management, document analysis, and secure communication.

## Architecture

- **Frontend**: React Native (Expo)
- **Backend**: Node.js + Express + MongoDB
- **ML Service**: Python + Flask (OCR, NLP, Scheduling AI)

## Prerequisites

- Node.js (v18+)
- Python 3.8+
- MongoDB (Local or MongoDB Atlas)
- Expo CLI (`npm install -g expo-cli`)

## Setup Instructions

### 1. Frontend (React Native)

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start
# or
npx expo start
```

### 2. Backend (Node.js + MongoDB)

```bash
cd backend

# Install dependencies
npm install

# Configure MongoDB
# Edit backend/.env and set MONGODB_URI
# For local: mongodb://localhost:27017/rtgs_ai_app
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/rtgs_ai_app

# Start development server
npm run dev
```

**Backend runs on**: `http://localhost:5000`

### 3. ML Service (Python)

```bash
cd ml_service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install flask flask-cors python-dotenv

# Start Flask server
python app.py
```

**ML Service runs on**: `http://localhost:5001`

## Running the Complete Application

1. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

2. **Start Backend**:
   ```bash
   cd backend && npm run dev
   ```

3. **Start ML Service**:
   ```bash
   cd ml_service && source venv/bin/activate && python app.py
   ```

4. **Start Frontend**:
   ```bash
   npx expo start
   ```

5. **Access the App**:
   - Scan QR code with Expo Go (mobile)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## API Endpoints

### Backend (Port 5000)

- **Auth**
  - `POST /api/auth/login` - User login
  - `POST /api/auth/register` - User registration

- **Tasks**
  - `GET /api/tasks` - Get all tasks
  - `POST /api/tasks` - Create task
  - `PUT /api/tasks/:id` - Update task
  - `DELETE /api/tasks/:id` - Delete task

- **Documents**
  - `GET /api/documents` - Get all documents
  - `POST /api/documents` - Upload document
  - `GET /api/documents/:id` - Get document by ID

- **Calendar**
  - `GET /api/calendar` - Get all meetings
  - `POST /api/calendar` - Create meeting
  - `PUT /api/calendar/:id` - Update meeting

### ML Service (Port 5001)

- `POST /api/analyze-document` - Analyze document with OCR/NLP
- `POST /api/schedule-assistant` - Get AI scheduling suggestions
- `GET /health` - Health check

## Features

✅ Authentication & Profile Management  
✅ AI-Powered Dashboard  
✅ Smart Task Management  
✅ Intelligent Calendar & Scheduling  
✅ Document Intelligence (OCR + Entity Extraction)  
✅ Secure Communication (E2E Encrypted Chat)  
✅ Video Call Simulation  
✅ Citizen & Startup Workflows  
✅ Telugu Language Support  
✅ Demo Mode  

## Tech Stack

**Frontend:**
- React Native
- Expo Router
- TypeScript
- Lucide Icons

**Backend:**
- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication

**ML Service:**
- Python
- Flask
- Flask-CORS

## Project Structure

```
RTGS AI APP/
├── app/                    # React Native screens
├── components/             # Reusable UI components
├── services/              # API & Mock data services
├── constants/             # Theme & Colors
├── backend/               # Node.js API
│   ├── src/
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Business logic
│   │   └── index.ts       # Server entry point
│   └── package.json
└── ml_service/            # Python ML Service
    ├── app.py             # Flask app
    └── requirements.txt
```

## Development Notes

- Frontend currently uses **mock data** for rapid prototyping
- Backend connects to MongoDB for persistent storage
- ML Service provides mock AI responses (can integrate real models)
- For production: Update JWT secrets, enable HTTPS, configure production MongoDB

## License

Proprietary - Government of Andhra Pradesh
