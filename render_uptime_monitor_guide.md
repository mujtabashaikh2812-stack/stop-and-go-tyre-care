# ⚡ How to Prevent Render Backend from Deactivating (Uptime Monitor Setup)

Render's free tier puts web services to sleep after 15 minutes of inactivity. By adding the health check route to a free Uptime Monitor, your backend will stay **awake 24/7 with zero lag or delay!**

---

## 🏥 Health Routes Created on Your Backend:

Your backend now responds with `HTTP 200 OK` on all of these health URLs:

1. **`https://<your-render-backend-url>.onrender.com/health`**
2. **`https://<your-render-backend-url>.onrender.com/api/health`**
3. **`https://<your-render-backend-url>.onrender.com/ping`**
4. **`https://<your-render-backend-url>.onrender.com/`**

### JSON Response Format:
```json
{
  "status": "healthy",
  "message": "STOP & GO Garage Management Backend Active & Healthy",
  "timestamp": "2026-08-25T10:39:20.000Z",
  "uptime": "1245s",
  "database": "connected"
}
```

---

## 🛠️ Step-by-Step Setup on UptimeRobot (100% Free - Takes 2 Minutes):

1. Create a free account at **[UptimeRobot.com](https://uptimerobot.com/)**.
2. Click **+ Add New Monitor**.
3. Fill in the monitor settings:
   * **Monitor Type**: `HTTP(s)`
   * **Friendly Name**: `STOP & GO Render Backend`
   * **URL (or IP)**: `https://<your-render-backend-name>.onrender.com/health`
   * **Monitoring Interval**: `Every 5 minutes`
4. Click **Create Monitor**.

🎉 **Done! UptimeRobot will ping your Render backend every 5 minutes, ensuring your backend NEVER deactivates or goes to sleep!**
