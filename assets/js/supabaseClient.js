const SUPABASE_URL = "https://bjrlueygwqtimewzbzid.supabase.co";
const SUPABASE_KEY = "sb_publishable_5GmlGK-kxaurkNzqXyHyEw_a_9Jq7mk";

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
