# Checklist: what is built and what was tested

Last tested 1 Nov 2026 in headless Chromium at 320, 390 and 1280 px wide (also 1440, 1120, 1000, 860, 700 during layout work).
Unit tests: 23 frontend and 9 backend passed. No page errors in the browser and no sideways scrolling at any width.

## The website

| Area | Status |
|---|---|
| White and blue palette from the brief | Done (colour variables at the top of `index.css`) |
| Sticky menu, smooth scroll, phone menu, **Check Availability** button (scrolls to Contact) | Done, tested |
| Hero: owner's house photo, headline, drive-times card beside the photo, strip with Stay / **1 Family** / bedrooms / **Hegde, Kumta (U.K)** | Done, tested |
| About the stay: "The stay at a glance" (bedrooms, living area, kitchen, bathroom, guests, parking, Wi-Fi/network, location; no check-in/check-out), photos, house rules (families only, no pets / smoking / alcohol / parties, kitchen rule, no power backup) | Done |
| Gallery: Bedroom, Kitchen, Bathroom, Exterior, Nearby; "All" shows only the 5 house photos; full-screen viewer with arrows, swipe and Esc | Done, tested |
| Owner profile at top right (photo, name, number) and a pop-up with larger photo, tap-to-call number and **Chat on WhatsApp** | Done, tested |
| Meet Your Host: photo, name, From, Speaks, Background, phone and WhatsApp links | Done, tested |
| Location: general place and drive times (Honnavar 15, Gokarna 30, Murdeshwar 40 minutes). Map appears once you add a map link | Done |
| Reviews: no invented reviews; shows a welcome note until you add real ones | Done |
| Contact: owner card, phone, WhatsApp, email, location, contact hours (24/7 Available), buttons to call / WhatsApp / email. Every email link (Meet Your Host, Contact, footer) opens the visitor's mail app addressed to the owner with a subject and a ready-typed message they can edit | Done, tested |
| Privacy and terms pages | Done (templates; have them reviewed) |
| Accessibility and SEO: skip link, labelled controls, focus handling in pop-ups, page titles | Done |

## Enquiry failure screen and email setup (31 Oct 2026)

The failure screen now offers **Send with Gmail** (opens Gmail in a new tab addressed to the host with subject and message filled in, no mail app needed), **Open in mail app**, **Send on WhatsApp**, and a "Details for the host" line naming what each route answered. `setup-email.bat` sends a real test email and saves settings only if it worked.
Tested: unit tests (26 frontend, 11 backend); the setup tool run as a real process with typed answers against a mock mail server (login, recipient, saved file); a browser run with the backend not connected and FormSubmit refusing (buttons, Gmail link opens a new tab to `mail.google.com` with `to=Samarthanaik55@gmail.com`, details readable); the success path through the backend.
**Not tested (cannot be from the test environment):** a real Gmail login, real FormSubmit delivery. `setup-email.bat` is how the owner proves the first on his own PC.

## Drive-times card (31 Oct 2026)

Redesigned: blue header with a car badge and a dashed-road edge, one row per place with an emoji tile (🌴 Honnavar, 🏖️ Gokarna, 🛕 Murdeshwar), a short note, a time pill, and a small road where a 🚗 drives to a point in proportion to the time (the longest trip fills the road; it is a visual scale, not a distance). The car sets off when the card appears. Emoji and notes are editable in `location.driveTimes`.
The same card is also used beside the map in the Location section (one shared component, so they always match). Tested at 1280, 390 and 320 px: no sideways scroll, no page errors.

## Logo and animations (31 Oct 2026)

New logo (house, sun, wave on a blue disc) in the menu, footer, tab icon and `public/logo.svg` / `logo-512.png`. Launch animation (about 3 s, skippable), 1-second logo flash on menu/button navigation and page changes, animated text everywhere (headings, paragraphs, lists, footer; titles word by word), menu bar entrance.
Tested in headless Chromium: launch frames (logo draws in order, name and tagline appear, screen fades), flash opacity sampled over time (fades in by 0.2 s, holds, gone at 1.0 s), real clicks on menu and footer links, page change to Privacy, scrolling the whole page leaves no hidden text, no page errors, no sideways scroll on a 390 px phone, reduced-motion mode (no launch screen, no hidden text), setting `animations: false`. Safari and Firefox not tested.

## Removed on request

- **Admin panel / owner login / database / Python backend**: removed from the project. Nothing asks for a username or password. (A small email-only backend was added back on 30 Oct 2026, see below.)
- Amenities and My Story sections are not shown.

## Photo retouching

`frontend/public/photos/bathroom-1.jpg`: the paint bucket was digitally removed from the floor and the photo was lightly brightened and sharpened. Nothing else in the room was changed. Replace it with a fresh photo (taken without the bucket) whenever you like.

## Check availability enquiry form and backend (30 Oct 2026)

Dates, guests, name, phone, email, special requirements and the family / house-rules tick box, with friendly validation. **Send enquiry to the host** goes to the new **backend** (`backend/`, `api/enquiry.js`),
which emails it to the host through Gmail SMTP (guest's email = reply-to). No admin, no login, nothing stored. If the backend is missing or email is not connected, the page uses FormSubmit, then a ready-filled email / WhatsApp message.

Tested: 9 backend tests against a mock SMTP server (login, UTF-8 email, wrong password, unknown recipient, server down, header injection, spam trap, 5-per-10-minutes limit, oversize and bad input, path traversal);
a fresh-unzip start with no `node_modules` and no internet; a browser run that filled the real form and checked the email the mock mail server received (to, reply-to, subject, body); the "email not connected" fallback chain
(backend, then FormSubmit, then email/WhatsApp buttons); a start with source files newer than the build (still serves, no install).
**Not tested:** a real Gmail login (the test environment cannot reach Google), real FormSubmit delivery, and a real Vercel deployment of `api/enquiry.js`. Do the app-password step and send yourself a test enquiry on the live site.

## Location map

Map and Get Directions are back, pointing to "Hegde, Kumta, Uttara Kannada" (the area, not the house). Frame and links checked; the Google map tiles could not load in the test environment.
The map pin now sits on the owner's exact spot (coordinates from the owner's Google Maps embed) and Get Directions opens the owner's Google Maps link.

## Facts used (all supplied by the owner, nothing invented)

Name Samartha G. Naik; phone and WhatsApp 99457 37385; email Samarthanaik55@gmail.com; contact hours "24/7 Available"; from Hegde, Kumta (U.K); speaks Kannada, English, Hindi; background text; location "Hegde, Kumta (U.K)";
guests "1 Family"; drive times and house rules from the brief; all photos supplied by the owner.

## Not done or not verifiable here

- The ten **Nearby** photos look like images from travel sites or other people's work (one shows another site's name, one carries a photographer's credit "© Pallavi Bhat"): confirm you may use them. They are small (335 to 500 px wide) and look soft full screen.
- The **number plate and camera watermark** are visible in the house photo.
- Fonts, the Google map tiles, FormSubmit and the real WhatsApp page could not be reached from the test environment; check them once on the live site.
- Deployment to Vercel was simulated with a static server, not done on a real account. Browsers: Chromium only (not Safari or Firefox).
