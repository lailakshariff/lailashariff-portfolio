/* Supabase connection for "Leave a Star".
   ---------------------------------------------------------------------------
   This portfolio is a static site with no build step, so there is no process.env
   to read at runtime. The two browser-safe values below are read by
   leave-a-star.js. Both are PUBLIC by design — the publishable (anon) key is
   meant to ship in client code, and your Row Level Security policies
   (SELECT public, INSERT public, no UPDATE, no DELETE) are what protect the data.

   NEVER put the service_role key, the secret key, or the database password here.

   WHERE THE VALUES GO
   • Local / preview: paste them below.
   • Vercel: if you keep this static setup, the same two values live here in the
     committed file (safe for a publishable key). If you later move to Next.js,
     set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in
     Vercel → Settings → Environment Variables and generate this file at build
     time instead of editing it by hand.

   Until both values are filled in, the sky renders normally and simply has no
   saved stars — nothing on the About page breaks. */
window.LS_SUPABASE = {
  url: 'https://xkyhkadjvbplasnsnxot.supabase.co',
  key: 'sb_publishable_VXS_iQZ6ZEdDMMNCW-_PMg_f8Ij06wx',
  table: 'Stars'      // exact table name and casing in your database
};
