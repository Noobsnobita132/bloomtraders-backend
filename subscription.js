# ══════════════════════════════════════════
# BloomTraders Backend — Environment Variables
# ══════════════════════════════════════════
# Copy this file to .env and fill in your values

# Server
PORT=3000
NODE_ENV=production

# JWT Secret — apna koi strong random string likho
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string-min-32-chars

# Supabase (supabase.com se milega)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# Lemon Squeezy (app.lemonsqueezy.com se milega)
LEMONSQUEEZY_API_KEY=your-lemon-squeezy-api-key
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-signing-secret
LEMONSQUEEZY_STORE_ID=your-store-id

# Product/Variant IDs (Lemon Squeezy dashboard se copy karo)
MONTHLY_VARIANT_ID=your-monthly-plan-variant-id
# Yearly plan nahi hai — monthly only

# Frontend URL (jahan aap ki app host ho)
FRONTEND_URL=https://your-bloomtraders-domain.com
