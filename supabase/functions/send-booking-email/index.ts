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

  console.log("Function triggered");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    console.log("Body reçu :", body);

    const { name, email, phone, date, time, duration, hairstyle, image } = body;

    const resend = new Resend(
        Deno.env.get("RESEND_API_KEY")
    );

    const { data, error } = await resend.emails.send({
      from: "Gracious Hair <booking@gracious.hair>",
      to: [email],
      bcc: ["kouakanange@gmail.com", "gracioushair07@gmail.com"],
      subject: "Confirmation de réservation",
      html: `
        <h2>Réservation confirmée</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Téléphone :</strong> ${phone}</p>
        <p><strong>Coiffure :</strong> ${hairstyle}</p>
        <p><strong>Date :</strong> ${date}</p>
        <p><strong>Heure :</strong> ${time}</p>
        <p><strong>Durée :</strong> ${duration}</p>
        
        <h3>Votre modèle :</h3>
          <img src="${image}" width="250" style="border-radius:10px"/>
          
          <h2>Politique :</h2>
          <ul>
              <li>Les modèles présentés sont juste des prototypes</li>
              <li>20$ de réservation requise au 438 773 7890</li>
              <li>Vous pouvez m'écrire directement sur WhatsApp si votre modèle n'est pas sur le site</li>
              <li>Le reste du paiement se fait en cash sur place</li>
              <li>Service à domicile, écrivez-moi directement</li>
              <li>Cheveux bien lavés et lissés, sinon 10$ pour les lisser</li>
              <li>5$ de plus pour chaque 10 min de retard</li>
              <li>Appellez 2 jours à l'avance pour annuler</li>
              <li>Enfant et adultes acceptés</li>
          </ul>
      `
    });

    console.log("Resend data:", data);
    console.log("Resend error:", error);

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

