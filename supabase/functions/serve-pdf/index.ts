import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pdfId = url.pathname.split("/").pop();
    const filename = url.searchParams.get("filename") || "inspection.pdf";

    if (!pdfId) {
      return new Response(
        JSON.stringify({ error: "PDF ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client with service role key for storage access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the PDF from storage
    console.log(`Attempting to download PDF: ${pdfId}`);
    
    const { data, error } = await supabase.storage
      .from("pdfs")
      .download(pdfId);

    if (error) {
      console.error("Storage error:", error);
      return new Response(
        JSON.stringify({ 
          error: "PDF not found", 
          details: error.message,
          code: 404 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!data) {
      console.error("No data returned from storage");
      return new Response(
        JSON.stringify({ 
          error: "PDF data not available",
          code: 404 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Successfully retrieved PDF: ${pdfId}, size: ${data.size} bytes`);

    // Return the PDF with proper headers for download
    return new Response(data, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
        "Content-Length": data.size.toString(),
      },
    });

  } catch (error) {
    console.error("Error in serve-pdf function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});