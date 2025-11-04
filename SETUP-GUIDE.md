# ZENCODZY Website - Database Setup Guide

## 🚀 What Was Added

This website now has **database functionality** using **Upstash Redis** to store form submissions from:

- **Get a Quote Form** (`get-a-quote.html`)
- **Join Our Team Form** (`join-our-team.html`)

### ✨ Features Implemented:

1. ✅ Form submissions stored in Upstash Redis
2. ✅ Serverless API endpoints for form handling
3. ✅ Currency converted from **USD ($)** to **INR (₹)**
4. ✅ Success/error message display
5. ✅ Admin endpoint to retrieve submissions

---

## 📋 Files Created

```
zencodzy-website-code/
├── api/
│   ├── submit-form.js         # Handles form submissions
│   └── get-submissions.js     # Retrieves stored submissions (admin)
├── large-lifecycle-826295.framer.app/
│   └── js/
│       └── form-handler.js    # Client-side form handling
├── package.json               # Dependencies
├── vercel.json                # Vercel deployment config
├── .env.example              # Environment variables template
└── SETUP-GUIDE.md            # This file
```

---

## 🔧 Setup Instructions

### Step 1: Create Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up or log in
3. Click **"Create Database"**
4. Choose:
   - **Type:** Regional or Global
   - **Region:** Choose closest to your users
   - **Name:** `zencodzy-forms`
5. Click **"Create"**

### Step 2: Get Your Credentials

1. In your database dashboard, find:
   - **REST API** section
   - Copy `UPSTASH_REDIS_REST_URL`
   - Copy `UPSTASH_REDIS_REST_TOKEN`

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file in the root:

```env
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### Step 5: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Add environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
5. Click **"Deploy"**

### Step 6: Update API Endpoint

After deployment, edit `large-lifecycle-826295.framer.app/js/form-handler.js`:

```javascript
const CONFIG = {
  API_ENDPOINT: "https://your-deployment-url.vercel.app/api/submit-form",
  // ...
};
```

---

## 💰 Budget Conversion

The budget field has been converted from USD to INR:

| Old (USD)         | New (INR)              |
| ----------------- | ---------------------- |
| $2,500 - $5,000   | ₹2,00,000 - ₹4,00,000  |
| $5,000 - $10,000  | ₹4,00,000 - ₹8,00,000  |
| $10,000 - $20,000 | ₹8,00,000 - ₹16,00,000 |
| $20,000+          | ₹16,00,000+            |

_Conversion rate: 1 USD = ₹80_

---

## 📊 Data Structure

### Form Submission in Redis

Each submission is stored as a **Redis Hash**:

```javascript
{
  submissionId: "form:1699060800000:abc123",
  formType: "get-a-quote",
  name: "John Doe",
  email: "john@example.com",
  phone: "+91 98765 43210",
  company: "ABC Company",
  servicesInterested: "Web Design, UX/UI Design, SEO Optimization",
  budget: "₹4,00,000 - ₹8,00,000",
  message: "We need a new website...",
  pageUrl: "http://localhost:8000/get-a-quote.html",
  submittedAt: "2025-11-04T10:30:00.000Z"
}
```

### Redis Keys Used

- `form:{timestamp}:{random}` - Individual submission hash
- `form:submissions` - Sorted set of all submissions (by timestamp)
- `form:get-a-quote` - List of quote form submissions
- `form:join-our-team` - List of team form submissions

---

## 🔍 Viewing Submissions

### Option 1: Using API Endpoint

```bash
# View all submissions
curl https://your-deployment-url.vercel.app/api/get-submissions

# View only quote forms
curl https://your-deployment-url.vercel.app/api/get-submissions?formType=get-a-quote

# With pagination
curl https://your-deployment-url.vercel.app/api/get-submissions?limit=10&offset=0
```

### Option 2: Using Upstash Console

1. Go to [Upstash Console](https://console.upstash.com/)
2. Select your database
3. Go to **Data Browser**
4. Search for keys starting with `form:`

### Option 3: Create Admin Dashboard

You can create a simple admin page:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Form Submissions</title>
  </head>
  <body>
    <h1>Form Submissions</h1>
    <div id="submissions"></div>

    <script>
      fetch("/api/get-submissions")
        .then((res) => res.json())
        .then((data) => {
          const html = data.submissions
            .map(
              (s) => `
          <div style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
            <h3>${s.name} - ${s.email}</h3>
            <p><strong>Company:</strong> ${s.company}</p>
            <p><strong>Budget:</strong> ${s.budget}</p>
            <p><strong>Services:</strong> ${s.servicesInterested}</p>
            <p><strong>Message:</strong> ${s.message}</p>
            <p><small>Submitted: ${s.submittedAt}</small></p>
          </div>
        `
            )
            .join("");
          document.getElementById("submissions").innerHTML = html;
        });
    </script>
  </body>
</html>
```

---

## 🧪 Testing Locally

1. Start local server:

```bash
npm run dev
# or
python -m http.server 8000
```

2. Open `http://localhost:8000/large-lifecycle-826295.framer.app/get-a-quote.html`

3. Fill out and submit the form

4. Check Upstash Console to see the data

---

## 📧 Email Notifications (Optional)

To receive email notifications when forms are submitted, you can:

### Option 1: Use Upstash QStash + Resend

Modify `api/submit-form.js`:

```javascript
// Add after successful Redis storage
const { Client } = require("@upstash/qstash");
const qstash = new Client({ token: process.env.QSTASH_TOKEN });

await qstash.publishJSON({
  url: "https://api.resend.com/emails",
  body: {
    from: "noreply@zencodzy.com",
    to: "hello.zencodzy@gmail.com",
    subject: "New Form Submission",
    html: `<h1>New submission from ${formData.name}</h1>`,
  },
});
```

### Option 2: Use SendGrid/Mailgun

Add email service in `api/submit-form.js`

---

## 🔒 Security Considerations

1. **Protect Admin Endpoint**: Add authentication to `get-submissions.js`

   ```javascript
   const authToken = req.headers.authorization;
   if (authToken !== `Bearer ${process.env.ADMIN_TOKEN}`) {
     return res.status(401).json({ error: "Unauthorized" });
   }
   ```

2. **Rate Limiting**: Use Upstash Ratelimit

   ```javascript
   const { Ratelimit } = require("@upstash/ratelimit");
   const ratelimit = new Ratelimit({
     redis: redis,
     limiter: Ratelimit.slidingWindow(5, "60 s"),
   });

   const { success } = await ratelimit.limit(req.ip);
   if (!success) {
     return res.status(429).json({ error: "Too many requests" });
   }
   ```

3. **Input Validation**: Add data validation
   ```javascript
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(formData.email)) {
     return res.status(400).json({ error: "Invalid email" });
   }
   ```

---

## 💡 Next Steps

1. ✅ Set up Upstash Redis database
2. ✅ Install dependencies (`npm install`)
3. ✅ Add environment variables
4. ✅ Deploy to Vercel
5. ✅ Update API endpoint in `form-handler.js`
6. ✅ Test form submission
7. 🔄 (Optional) Add email notifications
8. 🔄 (Optional) Create admin dashboard
9. 🔄 (Optional) Add analytics tracking

---

## 🆘 Troubleshooting

### Form not submitting?

- Check browser console for errors
- Verify API endpoint URL is correct
- Check Vercel logs for errors

### Redis connection failed?

- Verify environment variables are set
- Check Redis URL and token are correct
- Ensure database is not paused (free tier)

### CORS errors?

- Check CORS headers in serverless function
- Verify domain is allowed

---

## 📞 Support

For issues or questions:

- Email: hello.zencodzy@gmail.com
- Check Upstash docs: https://upstash.com/docs/redis
- Check Vercel docs: https://vercel.com/docs

---

## 🎉 Success!

Your ZENCODZY website now has a fully functional database system for storing form submissions!

**What you achieved:**

- ✅ Serverless form storage with Upstash Redis
- ✅ Converted pricing from USD to INR
- ✅ No server maintenance required
- ✅ Scalable and cost-effective solution
- ✅ Free tier includes 10,000 commands/day

**Ready to deploy! 🚀**
