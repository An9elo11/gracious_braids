// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/*import "@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Functions!")*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {

    const { name, email, date, time, duration, hairstyle, image } = await req.json();

    const resend = new Resend(
        Deno.env.get("RESEND_API_KEY")
    );

    const { data, error } = await resend.emails.send({
      from: "Gracious Hair <onboarding@resend.dev>",
      to: [email,"kouakanange@gmail.com"],
      subject: "Confirmation de réservation",
      html: `
        <h2>Réservation confirmée</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Coiffure :</strong> ${hairstyle}</p>
        <p><strong>Date :</strong> ${date}</p>
        <p><strong>Heure :</strong> ${time}</p>
        <p><strong>Durée :</strong> ${duration}</p>
        
        <h3>Votre modèle :</h3>
          <img src="${image}" width="250" style="border-radius:10px"/>
      `
    });

    if (error) {
      throw error;
    }

    return new Response(
        JSON.stringify({ success: true, data }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
    );

  } catch (err) {

    return new Response(
        JSON.stringify({ success: false, error: err.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
    );

  }

});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-booking-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

