# Render Deployment Cheat Sheet

## 🛑 The Blocker
You **cannot** deploy to Render yet because the `prisma/migrations` folder is missing.
(This failed earlier because of the ISP Block on Supabase).

## ✅ The Fix (When Online)
Once you have a good network connection (Hotspot/VPN), do this **ONCE**:

1.  **Generate Migration**:
    ```bash
    npx prisma migrate dev --name init
    ```
    *Success Check*: A folder `prisma/migrations` will appear.

2.  **Push to GitHub**:
    ```bash
    git add .
    git commit -m "Add migrations"
    git push
    ```

3.  **Deploy**:
    *   Go to Render Dashboard.
    *   It will auto-deploy (or click "Internal Deploy").

## ℹ️ Configuration (Already Done)
*   **Build Command**: `npm install && npm run build` (Verified)
*   **Start Command**: `node dist/server.js` (Verified)
*   **Env Variables Needed on Render**:
    *   `DATABASE_URL` (From Supabase)
    *   `JWT_SECRET`
    *   `NODE_ENV` = `production`
