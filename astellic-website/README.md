# Astellic Website

A professional Next.js website for **Astellic** — Research · Advisory · Implementation.

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** for utilities
- **Google Fonts**: Cormorant Garamond (display) + Jost (body)
- **Vercel** for free hosting

---

## Project Structure

```
astellic-website/
├── app/
│   ├── layout.js         # Root layout with metadata
│   ├── page.js           # Main page (assembles all sections)
│   └── globals.css       # Global styles, CSS variables, animations
├── components/
│   ├── Navbar.js         # Sticky nav with scroll effect + mobile menu
│   ├── Hero.js           # Hero with animated particle canvas
│   ├── About.js          # Company overview + Vision/Mission cards
│   ├── Approach.js       # How we work + Professional Trust
│   ├── Expertise.js      # 4 thematic areas (hover effects)
│   ├── Delivery.js       # 6-step value delivery system
│   ├── ValueProp.js      # 4 pillars + positioning table
│   └── Contact.js        # Contact section + footer
├── public/               # Static assets (add favicon.ico here)
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── vercel.json
```

---

## Brand Colours

| Name            | Hex       | Usage                          |
|-----------------|-----------|--------------------------------|
| Background Blue | `#041232` | Primary background             |
| Blue            | `#0B76A0` | Links, accents, interactive    |
| Gold Dark       | `#CC9B00` | Secondary accent               |
| Gold Bright     | `#FFC000` | Primary gold accent, CTAs      |
| Cream           | `#F9F1DC` | Light section backgrounds      |
| Green           | `#3B7D23` | Climate/sustainability accent  |
| Text Gray       | `#A6A6A6` | Muted text, labels             |

---

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploy to Vercel (Free)

### Option A: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from the project folder:**
   ```bash
   cd "C:\Projects\Astellic Website"
   vercel
   ```
   Follow the prompts — select defaults for everything. Vercel will detect Next.js automatically.

4. **For production deployment:**
   ```bash
   vercel --prod
   ```

### Option B: Deploy via GitHub + Vercel Dashboard

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Astellic website"
   git remote add origin https://github.com/YOUR_USERNAME/astellic-website.git
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in (free account)

3. Click **"Add New Project"** → Import your GitHub repo

4. Vercel auto-detects Next.js — no configuration needed

5. Click **Deploy** — your site will be live at `astellic-website.vercel.app`

### Custom Domain

Once deployed, go to your project settings on Vercel → **Domains** → Add `www.astellic.com`.

---

## Customisation

### Adding a Favicon

Add your favicon as `public/favicon.ico` (recommended: 32×32px).

### Updating Content

All content is in the component files under `/components/`. Each file is self-contained and easy to edit.

### Adding a Contact Form

To make the contact form functional, you can use:
- **[Formspree](https://formspree.io)** — free tier, no backend needed
- **[EmailJS](https://www.emailjs.com)** — send emails from JS

Replace the `mailto:` link in `Contact.js` with a form and submit to your chosen service.

---

## Build for Production

```bash
npm run build
npm start
```

---

Built with ❤️ for Astellic — Malawi / Pan-African
