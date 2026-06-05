# Namma Chennai – Public Grievance & GovTech Platform

Namma Chennai is a modern, transparent, and responsive GovTech platform built on the MERN stack. Designed specifically to enhance public accountability and municipal efficiency in Chennai, the platform ensures that every grievance submitted by citizens is geotagged, public, and tracked on an immutable timeline. 

Unlike traditional closed grievance portals, Namma Chennai leverages a community upvoting model, smart duplicate prevention, and background artificial intelligence routing to optimize city administration and municipal resource allocation.

---

## 🚀 Key Features

*   **Public Accountability Feed & Map**: All grievances are pinned onto an interactive map (with official Chennai zone and ward boundaries) and displayed in a public feed.
*   **"I Am Also Affected" Upvoting**: Citizens can upvote existing neighborhood complaints instead of creating duplicates. This aggregates priority, keeping municipal queues clean under a single consolidated ticket.
*   **Smart Duplicate Grievance Warning**: Front-end warning system alerts citizens if an unresolved complaint of the same category already exists within $\pm0.0015$ degrees (~150 meters) of their location.
*   **Bilingual Localization**: Built-in support for English and Tamil localization, ensuring access for all citizens.
*   **Background Gemini AI Analysis**: Submissions trigger local heuristic checks (returning a success response in ~10ms), pushing complex categorizations, priority scoring, and department routing to a Gemini AI background task.
*   **Dual Photo Sourcing**: Users can upload resolution proof and complaint evidence via direct file uploads (saved as optimized Base64 payloads up to 50MB) or external URLs.
*   **Auto-Calculated Chennai Zone Details**: Dynamic mapping automatically calculates and enforces the official Chennai Zone number and name (1 to 15) based on the entered Ward number (1 to 200).
*   **Custom Brand Integration**: Seamless integration of official "Namma Chennai" branding across all layouts and responsive viewport devices.
*   **Role-Based Dashboards**: Custom portals designed for:
    *   **Citizens**: File tickets, upvote, comment, and track timeline status.
    *   **Ward Councillors**: Manage localized grievance queues.
    *   **Zonal Officers**: Handle escalation, assignments, and resolution.
    *   **MLAs / Mayor / Commissioner**: High-level analytical overview of complaints, ward performance, and resolution metrics.
*   **Real-Time Live Updates**: Powered by Socket.IO for instant dashboard refreshes, notifications, and comment additions.

---

## 🛠️ Tech Stack

*   **Frontend**: React.js, Vite, Tailwind CSS, Redux Toolkit, React Router DOM, Socket.IO Client, Lucide React (Icons), Recharts (Analytics Dashboard).
*   **Backend**: Node.js, Express.js, Socket.IO, Mongoose, Gemini AI SDK.
*   **Database**: MongoDB Atlas.
*   **Environment & Tooling**: Dotenv, Bcrypt, JsonWebToken.

---

## 📁 Folder Structure

```text
NammaChennai/
├── backend/
│   ├── src/
│   │   ├── controllers/      # API Request handlers (auth, complaints, analytics)
│   │   ├── middlewares/      # Authentication (JWT) and authorization rules
│   │   ├── models/           # MongoDB Mongoose Schemas (User, Complaint, Comment, Notification)
│   │   ├── services/         # Background escalation worker and AI integration
│   │   ├── db.js             # Database connection setup
│   │   ├── seed.js           # Seed script for mock demo profiles and clean states
│   │   └── server.js         # Entry point, Socket.IO setup, and routes definition
│   ├── .env.example          # Sample environment configuration
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/           # Brand assets (logo, home murals, SVG symbols)
│   │   ├── components/       # Reusable components (AppHeader, PublicFeed, InteractiveMap)
│   │   ├── context/          # Context providers (LanguageContext)
│   │   ├── pages/            # View pages (Home, Login, Register, Dashboards)
│   │   ├── store/            # Redux store configurations (authSlice)
│   │   ├── App.css
│   │   ├── App.jsx           # App shell and routes mapping
│   │   ├── index.css         # Styling system configuration
│   │   └── main.jsx          # App bootstrap
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── README.md
```

---

## ⚙️ Environment Variables

### Backend Configuration
Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.qpo7ofa.mongodb.net/NammaChennai?retryWrites=true&w=majority
JWT_SECRET=your_jwt_super_secret_key_here
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | The port number the Express server runs on. | `5000` |
| `MONGODB_URI` | The MongoDB connection string (local or MongoDB Atlas). | - |
| `JWT_SECRET` | Secret key used for signing and verifying JSON Web Tokens. | - |
| `GEMINI_API_KEY` | Google Generative AI API Key for automated complaint categorization. | - |

---

## 🔌 API Endpoints

### 🔑 Authentication Routes
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/auth/register` | ❌ | Any | Register a new user profile. |
| `POST` | `/api/auth/login` | ❌ | Any | Login user and retrieve JWT token. |
| `GET` | `/api/auth/verify-email/:token` | ❌ | Any | Verify citizen registration token. |
| `POST` | `/api/auth/forgot-password` | ❌ | Any | Send password reset link. |
| `POST` | `/api/auth/reset-password/:token` | ❌ | Any | Reset password using token. |
| `GET` | `/api/auth/me` | JWT | Any | Retrieve active user session metadata. |

### 📋 Complaint Management Routes
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/complaints` | JWT | `Citizen` | File a new complaint (with duplicate checks). |
| `GET` | `/api/complaints` | Opt. | Any | Retrieve list of public complaints. |
| `GET` | `/api/complaints/:id` | Opt. | Any | Retrieve a single complaint by its ID. |
| `PATCH` | `/api/complaints/:id/status` | JWT | Staff | Update ticket status (resolving, adding proof). |
| `POST` | `/api/complaints/:id/affected` | JWT | `Citizen` | Increment the upvote/affected count. |
| `POST` | `/api/complaints/:id/comments` | JWT | Any | Post a comment on a ticket timeline. |

### 📊 Analytics & Dashboards
| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/analytics/citizen` | JWT | `Citizen` | Retrieve citizen upvotes and submission stats. |
| `GET` | `/api/analytics/councillor` | JWT | `Ward Councillor` | Get councillor's ward grievance summary. |
| `GET` | `/api/analytics/zonal` | JWT | `Zonal Officer` | Get zonal overview analytics. |
| `GET` | `/api/analytics/mla` | JWT | `MLA` | Get constituency-wide analytical summaries. |
| `GET` | `/api/analytics/mayor` | JWT | `Mayor` | Get city-wide analytical indicators. |
| `GET` | `/api/analytics/commissioner` | JWT | `Commissioner` | Administrative search and query dashboard. |
| `GET` | `/api/analytics/scorecards` | ❌ | Any | Retrieve city-wide unresolved/resolved stats. |

---

## 🛠️ Installation & Setup

### Prerequisites
*   Node.js (v18 or higher)
*   npm (v9 or higher)
*   MongoDB Instance (Local or MongoDB Atlas)
*   Gemini Generative AI API Key

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/NammaChennai.git
cd NammaChennai
```

### Step 2: Configure Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file based on the environment variables guide above.
4. (Optional) Seed the database with 2026 test stakeholders:
   ```bash
   npm run seed
   ```
5. Launch the backend development server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

### Step 3: Configure Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will launch on `http://localhost:5173`.

---

## 🔑 Demo Stakeholder Credentials

For testing the role-based dashboards and workflow execution, the database can be seeded with the following preconfigured 2026 mock profiles (Password for all accounts: **`password123`**):

| Role | Name | Email | Jurisdiction / Assignment |
| :--- | :--- | :--- | :--- |
| **Corporation Commissioner** | Dr. G. S. Sameeran, IAS | `commissioner@chennai.gov.in` | City-Wide Administrative Power |
| **Mayor** | Tmt. R. Priya | `mayor@chennai.gov.in` | City-Wide Political Leadership |
| **MLA** | R. Sabarinathan | `mla.virugambakkam@tn.gov.in` | Virugambakkam Constituency |
| **Zonal Officer** | R. Kumar | `zonal10@chennai.gov.in` | Zone 10 (Adyar / K.K. Nagar area) |
| **Ward Councillor** | K. Kannan | `councillor138@chennai.gov.in` | Ward 138 (Zone 10) |
| **Citizen (K.K. Nagar)** | Manikumar J | `manikumar@gmail.com` | Ward 138, Zone 10 |
| **Citizen (T. Nagar)** | Priya Narayanan | `priya.n@gmail.com` | Ward 130, Zone 10 |
| **Citizen (Adyar)** | Suresh Kumar | `suresh@gmail.com` | Ward 175, Zone 13 |

To seed these accounts automatically, run `npm run seed` in the `backend/` directory.

---

## 🔮 Future Improvements

1.  **AI Predictive Maintenance Routing**: Train custom classifiers to automatically identify municipal problem clusters (e.g. predicting sewage leakages before pipe bursts based on temporal trend reports).
2.  **Municipal GIS Integration**: Directly feed geotagged grievances into the Chennai Smart City GIS layer to coordinate mechanical sweepers, road repaving, and garbage trucks.
3.  **Blockchain-Based Grievance Logging**: Archive grievance timeline states on a private, permissioned ledger to completely prevent administrative modification of municipal resolution times.
4.  **Bilingual Voice Submissions**: Support voice uploads in Tamil or English, converting them automatically to text tickets for older or visually-impaired citizens.
5.  **WhatsApp / SMS Integration**: Allow citizens to submit tickets, receive alerts, and upvote issues directly through WhatsApp.
