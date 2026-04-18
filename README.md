## 🍹 HumTum POS System (V2.1 - Production Ready)

A premium, production-grade Restaurant POS & Management System built for **HumTum Bar & Restaurant**. V2.1 features a strict architecture separation for food and inventory, high-security authentication, and professional visual asset management.

---

## 🏗️ New Architectural Separation
Unlike basic POS systems, V2.1 implements a strict **Separation of Concerns** to keep management clean:
- **🍽️ Kitchen Menu (Food Only)**: Managed via the Menu collection. Optimized for food items like Tandoori Prawns, Biryanis, and Starters.
- **🍸 Bar Inventory (Drinks Only)**: Managed via the Inventory collection. Tracks stock for Alcohol, Cold Drinks, and Energy Drinks.
- **🔄 Unified Billing**: The Billing interface dynamically merges both collections into a single high-performance catalog, allowing staff to bill food and drinks seamlessly in one order.

---

## 💎 Key Production Features (IMS Integration)
- **Visual Asset Management**: Integrated `imageUrl` support for both menu and inventory items, ensuring a high-end visual billing experience.
*   **Atomic Stock Deduction**: Intelligent `bulkWrite` logic in the backend ensures that bar items have their stock decremented instantly upon order placement, while food items remain as menu-only entries.
- **Fixed-Aspect UX**: All product images are normalized to a professional fixed-height grid (130px) with hover-zoom effects for a premium "Apple-Store" style feel.
- **Glassmorphism Settlement**: Re-engineered payment interfaces with high-contrast banners and mobile-optimized bottom-drawer layouts.

---

## 🔐 Security & Role Hierarchy (RBAC)
- **Admin (L3)**: Full overriding control, database configuration, and password resets for all roles.
- **Manager (L2)**: Daily operational control. Can manage Staff and place orders but restricted from sensitive system settings.
- **Staff (L1)**: Optimized billing-only interface. Restricted from workers, analytics, and stock settings.
- **Quick-Access Demo Mode**: Professional, role-coded login buttons for rapid switching during technical demonstrations.

---

## 🚀 Deployment (Render)
This project is configured as a monorepo and is ready for one-click deployment on **Render**.

### **Service Configuration**
1.  **Build Command**: `npm run build` (This installs root deps, then frontend deps, then builds the UI).
2.  **Start Command**: `npm start` (Serves the backend API and the compiled frontend static files).
3.  **Environment Variables**:
    *   `CLOUD_MONGO_URI`: Your MongoDB Atlas connection string.
    *   `UPSTASH_REDIS_REST_URL`: For atomic bill numbering and caching.
    *   `UPSTASH_REDIS_REST_TOKEN`: Redis authentication token.
    *   `JWT_SECRET`: A secure string for session encryption.
    *   `ADMIN_EMAIL`: Your production admin email for OTP recovery.
    *   `VITE_API_URL`: (Optional) Set to your public Render URL, or leave empty for auto-detection.

---

## 🛠️ Local Development
```bash
# 1. Install all dependencies (Root + Frontend)
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start Development Mode
npm run dev
```

---

## 📦 Production Builds
To test the production build locally:
```bash
npm run build
npm start
```
The server will start on port 3000 and serve the **entire application** (Frontend + Backend) from a single process.

---

## 🏆 Final System Status
The HumTum POS is now an **interview-ready, ERP-grade restaurant solution**. It features atomic data integrity, role-based security, and a stunning modern UI designed for high-performance hospitality environments.
