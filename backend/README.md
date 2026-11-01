# Backend (enquiry emails)

This small backend receives the **Check availability** enquiry and emails it to the host. There is **no admin page, no login and no database**:
nothing about visitors is stored, the enquiry is only emailed.

| File | What it does |
|---|---|
| `server.mjs` | Serves the website and answers `POST /api/enquiry` when you run `start.bat` / `./start.sh` |
| `enquiry.mjs` | Checks the enquiry (dates, phone, email, spam trap, 5 per 10 minutes per visitor) and writes the email |
| `smtp.mjs` | Sends the email over SMTP (Gmail by default); needs no extra packages |
| `email-settings.example.txt` | The template. `setup-email.bat` makes your private `email-settings.txt` from it (never uploaded to GitHub or Vercel) |
| `../api/enquiry.js` | The same backend as a Vercel function, so it also works on Vercel |

## Connect your email (2 minutes, once)

**Easiest:** double-click `setup-email.bat` (Mac/Linux `./setup-email.sh`). It asks for the app password from step 2 below, sends a real test email, and saves the settings only if the test worked. Run `node backend/setup-email.mjs --check` any time to re-test.

The manual way:

1. Open https://myaccount.google.com/security and turn on **2-Step Verification** for `Samarthanaik55@gmail.com`.
2. Open https://myaccount.google.com/apppasswords, create an app password called `homestay website`, copy the 16 letters.
3. **On your computer:** copy `backend/email-settings.example.txt` to `backend/email-settings.txt`, open it in Notepad, paste the password after `SMTP_PASS=`, save, run `start.bat` again.
4. **On Vercel:** Project > Settings > Environment Variables, add `SMTP_USER` (the Gmail address), `SMTP_PASS` (the app password), `MAIL_TO` (where to deliver) and `SITE_NAME`, then Redeploy.

`email-settings.txt` holds a password: `.gitignore` and `.vercelignore` keep it out of GitHub and Vercel uploads. Never send it to anyone. Vercel has its own settings page for the same values.

## How the site sends an enquiry

1. The page sends it to this backend (`/api/enquiry`). The host gets an email; pressing Reply answers the guest.
2. If the backend is not reachable or its email is not connected yet, the page uses the free FormSubmit service instead (needs a one-time activation, see the main README).
3. If that also fails, the guest gets a ready-filled email and WhatsApp message to send in one tap. Nothing is lost.

Check that it works: open http://127.0.0.1:8000/api/health. It shows `"emailConfigured": true` once the app password is set.
