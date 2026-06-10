# FreshTrack Pro 🥬
A Smart-Expiry Inventory Management System with Dynamic Pricing and Role-Based Access Control.

---

## 🌟 Introduction
**FreshTrack Pro** is a modern, full-stack grocery and inventory management system designed to track product freshness, optimize retail pricing, and reduce organic food waste. Utilizing dynamic pricing algorithms based on shelf life, it bridges the gap between store administrators and customers.

---

## 🚀 Key Features

### 1. Role-Based Access Control (RBAC)
Tailored workspaces and permissions for two separate roles:
- **Admin Workspace:** Access to inventory dashboards, stock analytics, product status monitoring (Fresh, Expiring Soon, Expired), and full CRUD operations.
- **Customer Workspace:** A modern, visual marketplace layout to browse fresh organic produce, view smart discounts, and manage a shopping cart.

### 2. Smart Expiry & Dynamic Pricing
- Automated price calculations based on the proximity of a product's expiry date.
- Real-time price updates (smart discounts) to incentivize customers to purchase items nearing shelf life, actively reducing waste.

### 3. Interactive Shopping Cart
- Dynamic cart counts updated across the application header in real-time.
- Localized quantity controls, smart savings indicators, tax calculations, and a simulated checkout flow.

### 4. Admin Image Upload (Supabase Integration)
- Built-in drag-and-drop upload zone in the admin form.
- Direct secure uploads to a **Supabase Storage Bucket (`product-images`)** with dynamic public URL mapping, displaying image previews instantly before form submission.

### 5. Smart Status Indicators
- Automatic color-coded badges indicating product status:
  - **Fresh** (Green)
  - **Expiring Soon** (Orange)
  - **Expired** (Red)
  - **Out of Stock** (Gray)

---

## 🛠️ Technology Stack

- **Frontend:**
  - React.js (Vite)
  - Tailwind CSS (For MNC-grade premium UI styling)
  - Axios (API integration)
  - Supabase client (Storage uploads)
  - Lucide React (Icon set)

- **Backend:**
  - Java 17
  - Javalin (Lightweight web framework)
  - JDBC (PostgreSQL driver)
  - HikariCP (High-performance connection pooling)
  - Jackson (JSON serialization/deserialization)

- **Database, Storage & Deployment:**
  - Supabase (Hosted PostgreSQL)
  - Supabase Storage (S3-compatible bucket storage for images)
  - Docker (Containerization for secure and seamless cloud deployment)

---

## ⚙️ Configuration & Run Instructions

### 1. Database Setup
Create the required tables in your Supabase database:
```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    base_price NUMERIC NOT NULL,
    discounted_price NUMERIC NOT NULL,
    expiry_date DATE NOT NULL,
    stock_quantity INT NOT NULL,
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES inventory(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Backend Environment Variables (`backend-java/.env`)
Create a `.env` file in the Java directory:
```env
DB_URL=jdbc:postgresql://db.dmitkbbyslvodlynxiyy.supabase.co:5432/postgres
DB_USER=postgres
DB_PASSWORD=YOUR_DATABASE_PASSWORD
```

### 3. Frontend Environment Variables (`frontend-react/.env`)
Create a `.env` file in the React directory:
```env
VITE_SUPABASE_URL=https://dmitkbbyslvodlynxiyy.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
```

---

## 💻 Running the Project

### Start the Java Backend (Locally):
Navigate to the `backend-java` folder:
```bash
mvn compile exec:java -Dexec.mainClass="com.freshtrack.main.Main"
```

### Start the Java Backend (With Docker):
Navigate to the `backend-java` folder:
```bash
# Build the Docker Image (runs Maven build inside container)
docker build -t backend-java .

# Run the Container passing your local .env configuration
docker run --env-file .env -p 8000:8000 backend-java
```

### Start the React Frontend:
Navigate to the `frontend-react` folder:
```bash
npm install
npm run dev
```

---

## 🛠️ Built & Developed By
**Vivek Kumar** 💻
