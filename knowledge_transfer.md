# RTGS AI App - Knowledge Transfer (KT) Document

## 1. Project Overview
The **RTGS AI App** is a comprehensive dashboard and AI assistant for government officers in Andhra Pradesh. It integrates real-time governance data, task management, and an intelligent AI assistant to help officers make data-driven decisions and manage their schedules.

### Tech Stack
- **Frontend:** React Native (Expo), TypeScript, Expo Router.
- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose).
- **ML Service:** Python (Flask) / External LLM (Cohere) for NLP.
- **Database:** MongoDB (Local or Atlas).

---

## 2. System Architecture
```mermaid
graph TD
    User[Mobile App (Expo)] <-->|API Requests| Backend[Node.js Backend]
    Backend <-->|Data Persistence| DB[(MongoDB)]
    Backend <-->|NLP & Intent Analysis| Cohere[Cohere AI API]
    Backend <-->|Legacy ML| MLService[Python ML Service (Flask)]
```

---

## 3. Project Structure & File Descriptions

### 📱 Frontend (Root Directory)
The mobile application built with Expo and React Native.

| File / Directory | Description |
| :--- | :--- |
| **`app/`** | **Expo Router Pages**. Each file corresponds to a screen. |
| ├── `_layout.tsx` | **Root Layout**. Sets up Providers (Auth, Theme) and Navigation stack. |
| ├── `login.tsx` | **Login Screen**. Handles user authentication. |
| ├── `(tabs)/` | **Tab Navigation Group**. |
| │   ├── `index.tsx` | **Dashboard**. Main screen with widgets and Quick Actions. |
| │   ├── `calendar.tsx` | **Calendar**. Displays meetings and schedule. |
| │   ├── `tasks.tsx` | **Task Manager**. List of pending/completed tasks. |
| │   └── `profile.tsx` | **User Profile**. Settings and logout. |
| **`components/`** | **Reusable UI Components**. |
| ├── `AIAssistant.tsx` | **AI Widget**. The core chat interface. Handles voice, text, and API calls. |
| ├── `QuickActions.tsx` | **Dashboard Buttons**. Grid of actions like "Add Task", "Schedule". |
| ├── `TaskCard.tsx` | **Task Item**. Displays individual task details. |
| **`services/`** | **API Integrations**. |
| ├── `api.ts` | **Axios Client**. Configures base URL and defines API methods (`aiAPI`, `authAPI`). |
| **`context/`** | **Global State**. |
| ├── `AuthContext.tsx` | **Authentication**. Stores `user` object and login/logout methods. |

### ⚙️ Backend (`/backend`)
The Node.js server handling business logic and database connections.

| File / Directory | Description |
| :--- | :--- |
| **`src/`** | **Source Code**. |
| ├── `index.ts` | **Entry Point**. Starts Express server, connects to MongoDB. |
| **`src/controllers/`** | **Logic Layer**. Handles API requests. |
| ├── `aiController.ts` | **AI Brain**. Analyzes intent, queries DB, and generates responses. |
| ├── `authController.ts` | **Auth Logic**. Handles login and token generation. |
| ├── `taskController.ts` | **Task Logic**. CRUD operations for tasks. |
| **`src/models/`** | **Database Schemas (Mongoose)**. |
| ├── `User.ts` | **User Schema**. Name, designation, role. |
| ├── `Task.ts` | **Task Schema**. Title, priority, status, assignee. |
| ├── `Meeting.ts` | **Meeting Schema**. Time, participants, location. |
| ├── `Document.ts` | **Document Schema**. Metadata and AI summaries. |
| **`src/services/`** | **External Services**. |
| ├── `cohereService.ts` | **Cohere Integration**. Sends prompts to LLM for intent extraction. |
| **`src/routes/`** | **API Routes**. |
| ├── `aiRoutes.ts` | Defines endpoints like `POST /api/assistant`. |

### 🧠 ML Service (`/ml_service`)
Python Flask service for specific ML tasks (Legacy/Specialized).

| File / Directory | Description |
| :--- | :--- |
| `app.py` | **Flask App**. Exposes endpoints for specific ML models (e.g., `predict-duration`). |
| `requirements.txt` | **Dependencies**. List of Python libraries (`flask`, `transformers`). |

---

## 4. Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on port 27017)
- Python 3.9+ (Optional, for legacy ML)
- Expo Go app on mobile or Android Emulator

### Installation & Running
1.  **Database**: Start MongoDB (`mongod`).
2.  **Backend**:
    ```bash
    cd backend
    npm install
    # Create .env with PORT=5002, MONGODB_URI, COHERE_API_KEY
    npm run dev
    ```
3.  **Frontend**:
    ```bash
    cd ..
    npm install
    npx expo start
    ```

---

## 5. Codebase Walkthrough (Key Flows)

### AI Chat Flow
1.  **Frontend**: User types "Schedule meeting with Lakshman" in `AIAssistant.tsx`.
2.  **API**: `aiAPI.chat()` sends POST request to Backend.
3.  **Backend**: `aiController.ts` receives request.
4.  **NLP**: Calls `cohereService.analyzeIntent()`.
    - Returns: `{ intent: "schedule_meeting", entities: { person: "Lakshman" } }`
5.  **Logic**: `aiController` queries `User` model for "Lakshman".
6.  **DB**: Checks `Meeting` model for conflicts.
7.  **Response**: Sends back "I found Lakshman. You are both free at 10 AM."

---

## 6. Common Issues & Fixes
- **"Officer1" Error**: Ensure you are logged in so `AuthContext` has a valid User ID.
- **500 Error**: Check Backend logs. Usually missing API Key or DB connection issue.
- **Expo Connection**: Ensure phone and laptop are on the same Wi-Fi.
