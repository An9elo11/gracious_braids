const SUPABASE_URL = "https://bjrlueygwqtimewzbzid.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcmx1ZXlnd3F0aW1ld3piemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTMzNTUsImV4cCI6MjA4NTg2OTM1NX0.9kX530Cc1GTHzRRO_I2ckHMCwA9uLj7WMHETpnaKCek";

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
