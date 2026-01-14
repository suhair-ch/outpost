# 🚀 Deployment Guide: Investor-Grade Setup

We are following the **Gold Standard** for engineering:
*   **Single Database Engine**: Supabase PostgreSQL for both Dev & Prod.
*   **Safe Migrations**: Full history tracked via `prisma migrate`.
*   **Strict Build Process**: `npm run build` for type safety.

---

## Part 1: Database (Supabase)

We use **Supabase** as our single source of truth.

1.  **Configure Environment**:
    *   Ensure `.env` has your `DATABASE_URL`.
    *   Ensure `schema.prisma` has `provider = "postgresql"`.

2.  **Generate Migration (The "Safety" Step)**:
    Run this locally to create the SQL history files:
    ```bash
    npx prisma migrate dev --name init
    ```
    *Result*: A new folder `prisma/migrations` is created. **You must commit this to Git.**

    > **⚠️ Network Issue?**
    > If this command fails with "DNS" or "Connection" errors, your ISP is blocking Supabase.
    > **Solution**: Connect to a **Mobile Hotspot** or VPN temporarily to run this command. We NEED the migration files it generates.

---

## Part 2: Backend Deployment (Render)

1.  **Push to GitHub**:
    *   Ensure the `prisma/migrations` folder is included.

2.  **Create Web Service on Render**:
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `node dist/server.js`

3.  **Environment Variables (Render)**:
    *   `DATABASE_URL`: (Your Supabase URL)
    *   `JWT_SECRET`: (Your secret)
    *   `JWT_SECRET`: (Your secret)
    *   `NODE_ENV`: `production`

    > **💡 Pro Tip (Blueprint)**:
    > We have added a `render.yaml` file. On Render, you can select "New > Blueprint" and connect this repo. It will auto-read the config! You just need to provide the Environment Variables.

4.  **Auto-Migration (Production)**:
    *   Render will automatically run the build.
    *   **Add a "Build Command" override** if you want to auto-migrate, OR run this in the Render "Shell" after deploy:
        ```bash
        npx prisma migrate deploy
        ```
        *(This applies the safer `deploy` command, exactly as requested)*.

---

## Part 3: Frontend Deployment (Vercel)

1.  **Update Config**:
    *   Edit `frontend/src/api/client.ts` -> Set `baseURL` to your **Render URL**.

2.  **Deploy on Vercel**:
    *   Import Repo -> Select `frontend` folder as root.
    *   Build Command: `npm run build`
    *   Output Directory: `dist`

---

### Why this is better?
*   **Consistency**: No "it works locally but not in prod" bugs.
*   **Scalability**: Ready for a team of 10+ developers.
*   **Safety**: We can roll back database changes if needed.
