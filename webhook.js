// ── Supabase Database Helper ──
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Get user by email ──
async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ── Get user by ID ──
async function getUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// ── Create new user ──
async function createUser({ email, name, password_hash }) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      name,
      password_hash,
      subscription_status: 'inactive',
      plan: null,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Update subscription after payment ──
async function activateSubscription({ email, plan, lemon_order_id, lemon_customer_id, subscription_id }) {
  const now = new Date();
  const endDate = new Date(now);

  if (plan === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (plan === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      subscription_status: 'active',
      plan,
      subscription_start: now.toISOString(),
      subscription_end: endDate.toISOString(),
      lemon_order_id,
      lemon_customer_id,
      lemon_subscription_id: subscription_id,
      updated_at: new Date().toISOString()
    })
    .eq('email', email.toLowerCase())
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Cancel / expire subscription ──
async function cancelSubscription(email) {
  const { data, error } = await supabase
    .from('users')
    .update({
      subscription_status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('email', email.toLowerCase())
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Check if subscription is active ──
function isSubscriptionActive(user) {
  if (!user) return false;
  if (user.subscription_status !== 'active') return false;
  if (!user.subscription_end) return false;
  return new Date(user.subscription_end) > new Date();
}

module.exports = {
  supabase,
  getUserByEmail,
  getUserById,
  createUser,
  activateSubscription,
  cancelSubscription,
  isSubscriptionActive
};
