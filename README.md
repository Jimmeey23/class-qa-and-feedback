# Physique 57 Assessment Hub

One Node.js/Supabase project containing the PowerCycle and FIT Lab trainer assessment experiences, plus the Training Quality Assessment and staff Class Experience Feedback forms.

## Setup

1. Run `supabase/schema.sql` in the target Supabase SQL editor.
2. Copy `.env.example` to `.env` and add the server-only service role key.
3. Run `npm install`, `npm run build`, then `npm start`.

The landing page is served at `/`. The four form routes are:

- PowerCycle: `/power-cycle/`
- FIT Lab: `/fit-lab/`
- Training Quality Assessment: `/training-quality/`
- Class Experience Feedback: `/class-experience/`

The health check is available at `/api/health`.
