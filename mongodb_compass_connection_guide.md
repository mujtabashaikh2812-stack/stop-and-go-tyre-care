# 🍃 How to Connect STOP & GO App to MongoDB Atlas & MongoDB Compass

This guide explains how to connect your live app to **MongoDB Atlas Cloud** and view all live garage records in **MongoDB Compass** (Desktop GUI).

---

## 🔑 Step 1: Get Your MongoDB Atlas Connection URI

1. Log into your **[MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)**.
2. Under **Database Deployments**, click the **Connect** button next to your cluster.
3. Choose **Drivers** (or "Connect your application").
4. Copy your connection string. It will look like this:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/stop_and_go_tyre_care?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your database user credentials).*

---

## ⚡ Step 2: Add Connection URI to Vercel (Cloud Deployment)

To enable live cloud sync on your deployed website:

1. Open your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Select your project **`stop-and-go-tyre-care`**.
3. Navigate to **Settings** ➔ **Environment Variables**.
4. Add a new variable:
   * **Key**: `MONGODB_URI`
   * **Value**: *(Paste your MongoDB Atlas connection string from Step 1)*
5. Click **Save**.
6. Go to **Deployments** ➔ Click the 3 dots on the latest deployment ➔ Select **Redeploy**.

🎉 **Now, every bill generated in your app auto-syncs to MongoDB Atlas Cloud!**

---

## 🖥️ Step 3: View Live Collections in MongoDB Compass (Desktop GUI)

MongoDB Compass is a free desktop software that lets you visually browse your live database:

1. Download **[MongoDB Compass](https://www.mongodb.com/try/download/compass)** (Free for Windows).
2. Install and launch **MongoDB Compass**.
3. In the "New Connection" screen, paste your connection URI string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/stop_and_go_tyre_care?retryWrites=true&w=majority
   ```
4. Click **Connect**.

---

## 📂 Live Database Collections You Will See in Compass:

Inside the **`stop_and_go_tyre_care`** database, you will see 6 live collections:

* **`jobcards`**: Customer billing slips, vehicle registration numbers, services performed, and total amounts.
* **`inventories`**: Stock levels for sticker weights, brass weights, and valves.
* **`bookings`**: Advance service appointments.
* **`expenses`**: Daily shop expenses (tea/snacks/maintenance).
* **`salaries`**: Staff monthly base pay, advances, and net payouts.
* **`scrapsales`**: Bulk scrap rubber sales and used tyre resales.
