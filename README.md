# FinSight – Personal Finance Insight Dashboard

FinSight is a modern, insight-driven personal finance dashboard built to help users seamlessly track their expenses, understand their spending habits, and make data-driven financial decisions. 

Unlike a simple expense tracker, FinSight employs a client-side logic engine to generate a real-time Financial Health Score, categorize spending personalities, offer smart savings recommendations, and provide an interactive chat assistant based purely on the user's recorded data.

## 🚀 Features

*   **Financial Health Score Engine**: Dynamically calculates a health grade (A-F) based on the user's savings ratio (40% weight) and spending distribution balance (60% weight).
*   **Spending Personality Tags**: Analyzes category spread to classify user habits into recognizable tags like "Foodie Enthusiast," "Impulsive Spender," or "Balanced Saver."
*   **Smart Recommendations**: Surfaces customized, prioritized tips (High/Medium/Low) based on recent expense concentrations (e.g., suggesting the 50/30/20 rule if savings sit below 10%).
*   **Interactive Chatbot (FinSight AI)**: A custom-built, client-side NLP interface that parses user queries (e.g., "Where do I spend the most?") and answers using internal dashboard data metrics.
*   **Dynamic Visualizations**: Utilizes Recharts to render beautiful Pie Charts (category distribution) and Bar Charts (monthly trends).
*   **Quick Filtering System**: Sort transactions instantly by category, start date, and end date constraints.
*   **Local Storage Authentication**: Lightweight mock login feature that persists user sessions without requiring a database.
*   **Dark/Light Mode**: Smooth UI theme toggling support.

## 💻 Tech Stack

**Frontend:**
*   React 19
*   Vite (Development & Build Tool)
*   React Router DOM (Navigation)
*   Recharts (Data Visualization)
*   Vanilla CSS (Theming and Animations)

**Backend:**
*   Node.js
*   Express 5
*   CORS
*   Direct File System (`fs/promises`) Data Storage

## 📂 Folder Structure

```text
/
├── package.json          # Monorepo/Root dependencies and scripts
├── vite.config.js        # Vite configurations and API proxy settings
├── server/
│   ├── index.js          # Express server with REST API routes
│   └── expenses.json     # JSON datastore containing user expenses 
├── src/
│   ├── main.jsx          # React initialization
│   ├── App.jsx           # Main application logic, layouts, dashboard, and chatbot components
│   ├── index.css         # Global styles, variables, theme tokens, and animations
│   └── Login.jsx         # Initial authentication screen
```

## ⚙️ Installation & Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Start the application:**
   Because the project uses `concurrently`, you can start both the client and the server with a single script:
   ```bash
   npm run dev
   ```
   *The Express server will initialize on `http://localhost:5000` and the Vite development server will simultaneously open on `http://localhost:5173` (or the next available port).*

## 🔌 API Endpoints

The backend Express application supports the following RESTful endpoints pointing to `/api`:

*   **`GET /api/expenses`**: Retrieves the list of all saved expenses from `expenses.json` (served via in-memory cache).
*   **`POST /api/expenses`**: Validates and saves a new expense dictionary (`{ amount, category, date, note }`), automatically generating an ID.
*   **`DELETE /api/expenses/:id`**: Removes a specific transaction by its unique ID.

## 🖥️ Screens & Main Components

*   **Login Screen (`Login.jsx`)**: An animated gateway that collects the user's name and saves it to local storage to simulate authentication and personalize the dashboard.
*   **Dashboard (`App.jsx`)**: The core layout composing the sidebar, navigation, stat grids, insights panel, financial health scoring graphics, recommendation alerts, filtering tools, and transaction lists.
*   **FinSight Chatbot**: A floating action button (FAB) that opens an interactive chat drawer analyzing variables from the Dashboard locally.
*   **Expense Modal**: An overlay form to capture new transaction inputs with rigorous frontend validations.

## 🔄 Data Flow

1. The frontend initiates `React` layouts within Vite.
2. The user inputs expense data, which the `ExpenseModal` validates.
3. Upon positive authentication, the frontend performs an asynchronous `POST` request to `http://localhost:5173/api/expenses` (proxied securely to port `5000` via Vite settings).
4. `server/index.js` receives the data, updates the in-memory array cache, writes the new JSON string to `expenses.json`, and returns an HTTP 201 response.
5. The frontend `Dashboard` state updates to reflect the new API array, immediately recalculating health scores, personality metrics, Recharts SVGs, and intelligent Chatbot datasets globally.

## ⚠️ Limitations

*   **No Centralized Database**: Due to the local nature of the project, data is continuously stored in a flat `server/expenses.json` file. It will not persist securely across multi-user environments.
*   **Client-Side "AI"**: The Chatbot currently runs on conditional matching logic (`App.jsx`) without standard large-language models (LLMs); it cannot hold context beyond explicit hard-coded questions.
*   **Shallow Authentication**: The app relies heavily on browser `localStorage` to dictate logged-in context without any verification tokens (JWTs) or encrypted storage. 

## 🔮 Future Improvements

*   **Postgres/MongoDB Integration**: Move away from a `.json` database file and connect an Object-Relational Mapper (ORM) for safer storage limits.
*   **Secure Authentication flow**: Introduce a modern login method utilizing platforms like Firebase Auth, NextAuth, or customized JWT procedures.
*   **Integrate OpenAI/Gemini**: Replace the hard-coded ChatBot matching with an external LLM function call interface for unconstrained, conversational financial analysis.
*   **Edit & Delete UI**: Hook up the existing `DELETE` route endpoints inside the Transactions List UI to improve user-control. 

---
*Built to make monitoring money engaging, reactive, and insightful.*
