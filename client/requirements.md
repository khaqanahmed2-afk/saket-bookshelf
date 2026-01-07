## Packages
framer-motion | Complex animations and page transitions
@supabase/supabase-js | Authentication and data fetching
jspdf | Generating PDF bills on the client side
jspdf-autotable | Table support for PDF generation
recharts | Simple charts for dashboard summary

## Notes
Integration with Supabase is required.
The backend handles the Tally XML/Excel upload via /api/admin/upload-tally.
Dashboard data is fetched directly via Supabase client to leverage RLS.
