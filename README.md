# Homestay website

A white-and-blue website for a 1BHK family homestay: hero, about the stay, photo gallery with full-screen viewer,
meet the owner, location with map and drive times, reviews, a **Check availability** enquiry form that emails the host, and contact (call, WhatsApp, email).

There is **no admin panel, no login and no password**. The project has two parts:

- `frontend/` is the website. To change anything you edit one file (`frontend/src/content/defaultContent.js`) and put photos in `frontend/public/photos/`.
- `backend/` (and `api/` for Vercel) is a small backend that receives the **Check availability** enquiry and emails it to the host. It stores nothing. See `backend/README.md`.

The homestay name is **Skanda Homestay**. Change it any time in `defaultContent.js` (`brand.name`). In enquiry emails the name comes from `SITE_NAME` in `backend/email-settings.txt` (or the Vercel environment variable of the same name), so change it there too.

---

## Run it on your computer

1. Install **Node.js (LTS)** from https://nodejs.org (one time). Without it nothing can run, and `start.bat` says so.
2. **Windows:** double-click `start.bat`. **Mac/Linux:** run `./start.sh` (first time: `chmod +x start.sh`).
3. It opens http://127.0.0.1:8000. The ready-built site is used as it is, so **no internet and no `npm install` is needed** just to run it.
   Press Ctrl+C in the window to stop. If you edit files in `frontend/`, run the start file again: it installs the tools (internet needed, first time only) and rebuilds.
4. To make enquiries arrive in your inbox, double-click **`setup-email.bat`** (Mac/Linux: `./setup-email.sh`). It asks for your Gmail app password, **sends a real test email to prove it works**, and saves the settings. If it fails it tells you why in plain words. Details in `backend/README.md`.

## Put it on the internet (Vercel), with the backend

1. Upload this whole project to GitHub (or use the Vercel CLI).
2. In Vercel: **Add New > Project**, pick the repository and **leave Root Directory empty** (the project root). Framework preset: *Other*.
   The `vercel.json` at the project root already sets the build and output folder and turns `api/enquiry.js` into the backend. Node 20 or newer.
3. In **Settings > Environment Variables** add `SMTP_USER` (your Gmail address), `SMTP_PASS` (the Gmail app password), `MAIL_TO` and `SITE_NAME`, then **Redeploy**. Steps for the app password are in `backend/README.md`.
4. Every time you change `defaultContent.js` or the photos, deploy again (a `git push` does it automatically).

If you already set Root Directory to `frontend`, the website still works (the page then uses the free FormSubmit backup route for enquiries), but the backend is not deployed. Clear the Root Directory setting to switch it on.
Other static hosts (Netlify, GitHub Pages) also work for the website alone: build with `npm run build` in `frontend` and publish `frontend/dist`; unknown paths such as `/privacy` must fall back to `index.html`.

---

## Logo and animations

- **Logo:** a house under a morning sun above a wave, on a blue disc (made for this site, not copied from anywhere). Files: `frontend/public/logo.svg` (any size), `frontend/public/logo-512.png` (for WhatsApp / social profile pictures) and `favicon.svg` (browser tab).
  To use your own logo instead, put the image in `frontend/public/photos/` and set `brand.logoImage: '/photos/logo.png'` in `defaultContent.js`.
- **Launch animation:** when the site opens, the logo draws itself (roof, walls, door, wave, sun), the name appears, then the page is revealed (about 3 seconds; click or press a key to skip).
- **Logo flash:** whenever a visitor taps a menu item or button that goes to another section or page, the logo shows over the page for 1 second and fades away. It does not flash while someone just scrolls.
- **Text animations:** headings, paragraphs and list items glide in once as they scroll into view; section titles rise word by word. The menu bar slides in after the launch screen.
- **Switch it all off:** set `settings.animations: false` in `defaultContent.js`. Visitors whose phone or computer is set to "reduce motion" never see animations either.

## Where to host (checked 1 Nov 2026)

| Host | Free plan for a business site? | Works with this project |
|---|---|---|
| **Vercel** | **No.** Vercel's own Hobby plan page says "non-commercial, personal use only". A homestay taking enquiries is a business, so the free plan risks suspension. Pro is paid (about $20 per month). | Everything, including the Gmail backend (`api/enquiry.js`). |
| **Cloudflare Pages** | Yes, per a third-party comparison from April 2026 (check Cloudflare's terms yourself). Cloudflare's docs say requests to static files are free and unlimited. | The whole website. Enquiries go through the FormSubmit route (activate it once), with the Gmail / WhatsApp buttons as backup. The Gmail backend is not wired for Cloudflare. |
| **Netlify** | Yes, a reply on Netlify's support forum says the free plan can be used for commercial projects. Plans are now credit-based, so check the current limits. | The whole website with the FormSubmit route. The Gmail backend is not wired for Netlify. |

Cloudflare Pages / Netlify settings: base (root) directory `frontend`, build command `npm run build`, output directory `dist`, Node 20 or newer.
Nothing here was deployed to a real account from the test environment, so do one test deploy and send yourself a test enquiry.

## Changing things

| To change | Where in `frontend/src/content/defaultContent.js` |
|---|---|
| Homestay name, tagline, own logo image | `brand` |
| Main (hero) photo and its description | `hero` |
| Phone, WhatsApp, email (also where enquiries are sent), contact hours, social links | `contact` |
| Owner name, photo, hometown, languages, background, welcome message | `owner` |
| "Guests" text, bedrooms, living area, kitchen, bathroom, parking, Wi-Fi/network, house rules | `property` |
| Place name shown under "Location", drive times (each with an optional `emoji` and one-line `note` for the card at the top), map, directions | `location` |
| Gallery photos and categories | `gallery` |
| Photos in the "About the stay" section | `about` |
| Guest reviews (only real ones) | `reviews` |
| Price | `pricing` (nothing is shown until you set it) |

**Photos.** Copy the file into `frontend/public/photos/`, then point to it, for example `src: '/photos/living-room.jpg'`.
Use JPEG or WebP, about 1600 px wide at most, and give each a short `alt` description (it helps visitors who use screen readers).
Gallery categories: Bedroom, Kitchen, Bathroom, Exterior, Nearby. The "All" view shows everything except **Nearby**.

**Contact buttons.** "Call the Owner", "Chat on WhatsApp" and "Send an Email" switch on when `phone`, `whatsapp` and
`email` are filled in. The email buttons and links open the visitor's own mail app, addressed to you, with a subject and a short message already typed
(the wording is `defaultEmailMessage` in `frontend/src/components/Host.jsx`; the visitor can edit it before sending). A number typed without a country code gets `defaultCountryCode` (91). The WhatsApp buttons open the owner's chat
(`wa.me`) with a short greeting already typed; the visitor presses send.

**Map.** The map and **Get Directions** button currently point to the area ("Hegde, Kumta, Uttara Kannada"), not to the exact house.
For your exact spot: in Google Maps open your place and choose *Share > Embed a map*, paste the `src="..."` link into `location.mapEmbedUrl`, and
paste the normal share link into `location.directionsUrl`.

**Colours and fonts.** The palette is at the top of `frontend/src/styles/index.css` (`:root`). The font (Manrope) loads
from Google Fonts in `frontend/index.html`; visitors who block it see a clean system font.

**Sections that are switched off.** `Amenities.jsx` and `Story.jsx` exist in `frontend/src/components/` but are not shown.
To show them again, add `<Amenities />` / `<Story />` to `Home()` in `frontend/src/App.jsx` and their links to `NAV_ITEMS` in `Navbar.jsx`.

**Setup reminders.** In `defaultContent.js`, `settings.showPlaceholders: true` shows dashed "Add ..." reminders for anything
empty, which is handy while preparing. Keep it `false` for the public site.

## Check availability: how enquiries reach the owner's email

When a visitor presses **Send enquiry to the host**, the page tries three routes in order, so an enquiry is not lost:

1. **The backend** (`/api/enquiry`): checks the details and emails them to `MAIL_TO` (the host) from your Gmail. The guest's email is the reply-to address, so the host just presses Reply.
   Needs the one-time Gmail app password setup (`backend/README.md`).
2. **FormSubmit** (free service, no setup on your side except one activation): used when the backend is missing or email is not connected yet. Send yourself a test enquiry, then open the
   mail from FormSubmit in Gmail (check spam) and click **Activate Form**. To use another service, paste its https:// address into `contact.formEndpoint` in `defaultContent.js`.
3. **Ready-filled message**: shown if both fail. **Send with Gmail** opens Gmail in a new tab addressed to the host with the enquiry typed in (works with no mail app installed), **Open in mail app** uses the visitor's own mail program, and **Send on WhatsApp** opens the host's chat. A "Details for the host" line says what each route answered (for example "FormSubmit needs activation"), so the cause is never a mystery.

To turn the form off, remove `<Booking />` from `Home()` in `frontend/src/App.jsx`.

## What the website does not do

- It does not take bookings and does not store anything about visitors (no database; the backend only emails the enquiry). The **Check availability** form emails
  the enquiry to the owner; a stay is confirmed only when the owner replies. Guests can also call, WhatsApp or email the owner.
- There is no availability calendar and no online payment.
- `/privacy` and `/terms` are plain starting texts (`frontend/src/components/Legal.jsx`). Have them reviewed.
