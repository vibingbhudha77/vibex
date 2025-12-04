# Festic + Vibex Unified

A dual-layer campus super-app combining university event management (Festic) with real-world spontaneous meetups (Vibex).

## 🎯 Overview

**Festic + Vibex** is a comprehensive platform for campus life at IIT Gandhinagar, featuring:

- **🎉 Vibex Layer (Micro)**: Map-based spontaneous meetups - "The Big 4"
  - 🎉 Vibe: Social hangouts
  - 🙋 Seek: Ask for help
  - 🍪 Cookie: Offer skills
  - 🤝 Borrow: Item exchange

- **🎪 Festic Layer (Macro)**: University-wide events
  - Event management and ticketing
  - Vendor marketplace
  - Team collaboration tools

- **🍪 Cookie Score 2.0**: LeetCode-inspired ELO rating system
  - 6 tiers: Newbie → Grandmaster
  - 8 anti-gaming mechanisms
  - Real-world rewards via Cookie Store

- **📍 Hyper-Local Ad Engine**: Google Maps-style advertising
  - Glowing pins for local businesses
  - Flash deals with push notifications
  - Dynamic pricing based on location and time

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Maps**: Leaflet.js (OpenStreetMap)
- **Hosting**: Vercel (frontend) + Supabase (backend)

## 📦 Project Structure

```
festic-vibex-unified/
├── components/
│   ├── auth/          # Login, SignUp
│   ├── map/           # MapView with Leaflet
│   ├── sessions/      # Vibex session components
│   ├── events/        # Festic event components
│   ├── profile/       # Profile with Cookie Score dashboard
│   └── social/        # Friends, tags, DMs
├── lib/
│   ├── supabaseClient.ts    # Supabase initialization
│   ├── supabaseService.ts   # Database operations
│   ├── cookieScore.ts       # ELO algorithm
│   └── campusConfig.ts      # Campus zones & geo-fencing
└── types.ts           # TypeScript interfaces
```

## 🗄️ Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `schema.sql`
3. Copy `.env.local.example` to `.env.local` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 🌐 Deployment

### Vercel Deployment
1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables (Supabase URL & Key)
4. Deploy!

## 🔑 Key Features

### Cookie Score 2.0
- **ELO Rating System**: Dynamic rating based on helpfulness
- **Anti-Gaming**: 8 mechanisms including diminishing returns, skill-specific tracking, session completion checks
- **Tier System**: 6 tiers from Newbie (0-1199) to Grandmaster (2200+)
- **Cookie Store**: Redeem points for real rewards (coffee, event access, certificates)

### Hyper-Local Ads
- **Glowing Pins**: Promoted map markers for local businesses
- **Dynamic Pricing**: ₹49-199/day based on zone (gate, hostel, academic, peripheral)
- **Event Surge**: 1.5x-3x multiplier during fests
- **Flash Deals**: Push notifications to users within radius

### Safety Features
- Email verification (@iitgn.ac.in)
- Geo-fencing for campus boundary
- Walk With Me: Live location sharing
- Content moderation and reporting

## 📱 The "Big 4" Session Types

All Vibex sessions are **real-world, in-person meetups**:

| Type | Icon | Example |
|------|------|---------|
| Vibe | 🎉 | "Chess at sports complex NOW" |
| Seek | 🙋 | "Stuck on calculus, library 2nd floor" |
| Cookie | 🍪 | "Teaching Python basics, 30min" |
| Borrow | 🤝 | "Need umbrella, Hostel 3 lobby" |

## 🎨 Design Theme

Premium green/violet aesthetic:
- **Vibex**: Violet gradient (#8b5cf6 → #7c3aed)
- **Festic**: Green gradient (#10b981 → #059669)

## 📄 License

Proprietary - IIT Gandhinagar Campus Project

## 👥 Team

Built for IIT Gandhinagar by Yash Kodam

---

**Version**: 1.0.0  
**Last Updated**: November 2025
